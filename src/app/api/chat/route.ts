import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

const systemPrompt = `You are a helpful culinary AI assistant for "Recipe Hut".
Your expertise is strictly limited to cooking, recipes, ingredient substitutions, cooking techniques, times, nutrition, and helping users find recipes or navigate the site.
If the user asks about anything unrelated to food, cooking, or Recipe Hut, politely decline to answer and redirect the conversation back to culinary topics.
Do not break character.

At the very end of your response, you MUST provide 2-3 short, natural follow-up questions the user might reasonably ask next, based on your answer.
Output these questions as a JSON array of strings enclosed in <followups> XML tags.
Example:
<followups>["What can I substitute for eggs?", "Show me a quicker version"]</followups>`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const latestMessage = messages[messages.length - 1]?.content || '';
    
    // Extract words longer than 3 chars for keyword search
    const words = latestMessage
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w: string) => w.length > 3);

    let recipeContext = '';
    let matchedRecipes: any[] = [];

    if (words.length > 0) {
      const { db } = await getDb();
      const collection = db.collection('recipes');

      const regexPatterns = words.map((w: string) => new RegExp(w, 'i'));
      
      const query = {
        $or: [
          { title: { $in: regexPatterns } },
          { category: { $in: regexPatterns } },
          { cuisine: { $in: regexPatterns } }
        ]
      };

      const results = await collection.find(query).limit(3).toArray();
      
      matchedRecipes = results.map(r => ({
        id: r._id.toString(),
        title: r.title,
        shortDescription: r.shortDescription
      }));

      if (matchedRecipes.length > 0) {
        recipeContext = `\n\nHere are some relevant recipes from the Recipe Hut database that you can suggest to the user:\n` + 
          matchedRecipes.map(r => `- ${r.title} (ID: ${r.id}): ${r.shortDescription}`).join('\n');
      }
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt + recipeContext },
        ...messages
      ],
      model: 'llama-3.3-70b-versatile',
      stream: true,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let buffer = '';
          let inFollowups = false;
          let followupsJson = '';
          const marker = '<followups>';
          const endMarker = '</followups>';

          for await (const chunk of chatCompletion) {
            const text = chunk.choices[0]?.delta?.content || '';
            if (text) {
              if (inFollowups) {
                followupsJson += text;
              } else {
                buffer += text;
                const markerIndex = buffer.indexOf(marker);
                if (markerIndex !== -1) {
                  inFollowups = true;
                  const beforeMarker = buffer.substring(0, markerIndex);
                  if (beforeMarker) {
                    controller.enqueue(encoder.encode(beforeMarker));
                  }
                  followupsJson = buffer.substring(markerIndex + marker.length);
                  buffer = '';
                } else {
                  // Emit safe portion of the buffer to avoid cutting the marker if split across chunks
                  const safeLen = Math.max(0, buffer.length - (marker.length - 1));
                  if (safeLen > 0) {
                    controller.enqueue(encoder.encode(buffer.substring(0, safeLen)));
                    buffer = buffer.substring(safeLen);
                  }
                }
              }
            }
          }
          
          if (!inFollowups && buffer.length > 0) {
            controller.enqueue(encoder.encode(buffer));
          }

          if (matchedRecipes.length > 0) {
            controller.enqueue(encoder.encode(`\n__RECIPES__:${JSON.stringify(matchedRecipes)}`));
          }

          if (inFollowups) {
            const cleanJson = followupsJson.replace(endMarker, '').trim();
            if (cleanJson) {
              controller.enqueue(encoder.encode(`\n__FOLLOWUPS__:${cleanJson}`));
            }
          }
        } catch (err) {
          console.error('Streaming error:', err);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      }
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
