import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getServerSession } from '@/lib/session';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RecipeDoc {
  _id: { toString(): string };
  title: string;
  shortDescription: string;
  imageUrl?: string;
  ingredients: string[];
  calories: number;
  category: string;
  cuisine: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  rating: number;
}

interface RankedRecipe {
  recipeId: string;
  title: string;
  imageUrl: string;
  shortDescription: string;
  calories: number;
  matchPercentage: number;
  missingIngredients: string[];
  category: string;
  cuisine: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  rating: number;
}

interface Substitution {
  ingredient: string;
  suggestion: string;
}

interface GeminiRecipeResult {
  recipeId: string;
  substitutions: Substitution[];
  reasoning: string;
}

interface MatchResult extends RankedRecipe {
  substitutions: Substitution[];
  reasoning: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Normalise an ingredient string for fuzzy comparison. */
function normalise(s: string): string {
  return s.toLowerCase().trim();
}

/**
 * Check whether a pantry ingredient satisfies a recipe ingredient requirement.
 * Considers it a match if the pantry token appears anywhere in the recipe
 * ingredient string or vice-versa (handles cases like "olive oil" vs "extra
 * virgin olive oil").
 */
function isIngredientPresent(recipeIngredient: string, pantrySet: Set<string>): boolean {
  const recipeNorm = normalise(recipeIngredient);
  if (pantrySet.has(recipeNorm)) return true;
  for (const pantryItem of pantrySet) {
    if (recipeNorm.includes(pantryItem) || pantryItem.includes(recipeNorm)) {
      return true;
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// POST /api/pantry-agent
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  // 0. Auth gate
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Please log in to use this feature.' },
      { status: 401 }
    );
  }

  // 1. Parse & validate request body
  let ingredients: string[];
  try {
    const body = await request.json();
    if (!Array.isArray(body.ingredients) || body.ingredients.length === 0) {
      return NextResponse.json(
        { error: 'ingredients must be a non-empty array of strings' },
        { status: 400 }
      );
    }
    ingredients = body.ingredients.map((i: unknown) => String(i));
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Build a normalised set of pantry ingredients for O(1) lookups
  const pantrySet = new Set(ingredients.map(normalise));

  // 2. Fetch all recipes from the database (only the fields we need)
  const { db } = await getDb();
  const collection = db.collection('recipes');

  const recipeDocs = await collection
    .find(
      {},
      {
        projection: {
          _id: 1,
          title: 1,
          shortDescription: 1,
          imageUrl: 1,
          ingredients: 1,
          calories: 1,
          category: 1,
          cuisine: 1,
          prepTimeMinutes: 1,
          cookTimeMinutes: 1,
          rating: 1,
        },
      }
    )
    .toArray() as unknown as RecipeDoc[];

  // 3. Rank recipes by pantry match (pure in-code logic, no LLM)
  const ranked: RankedRecipe[] = [];

  for (const recipe of recipeDocs) {
    const recipeIngredients: string[] = Array.isArray(recipe.ingredients)
      ? recipe.ingredients
      : [];

    if (recipeIngredients.length === 0) continue;

    const missing: string[] = [];
    let presentCount = 0;

    for (const ing of recipeIngredients) {
      if (isIngredientPresent(ing, pantrySet)) {
        presentCount++;
      } else {
        missing.push(ing);
      }
    }

    const matchPercentage = Math.round((presentCount / recipeIngredients.length) * 100);

    if (matchPercentage === 0) continue;

    ranked.push({
      recipeId: recipe._id.toString(),
      title: recipe.title,
      imageUrl: recipe.imageUrl ?? '',
      shortDescription: recipe.shortDescription ?? '',
      calories: recipe.calories ?? 0,
      matchPercentage,
      missingIngredients: missing,
      category: recipe.category ?? '',
      cuisine: recipe.cuisine ?? '',
      prepTimeMinutes: recipe.prepTimeMinutes ?? 0,
      cookTimeMinutes: recipe.cookTimeMinutes ?? 0,
      rating: recipe.rating ?? 0,
    });
  }

  // Sort by match percentage descending, take top 3 (only the AI-treated results)
  ranked.sort((a, b) => b.matchPercentage - a.matchPercentage);
  const top3 = ranked.slice(0, 3);

  // 4. Single Gemini call: substitutions + reasoning blurbs + opening message + comparison summary

  const substitutionMap = new Map<string, Substitution[]>();
  const reasoningMap = new Map<string, string>();
  let openingMessage = '';
  let bestPickRecipeId = '';
  let comparisonSummary = '';

  if (top3.length > 0) {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const pantryList = ingredients.join(', ');

      const recipeDescriptions = top3
        .map(
          (r) =>
            `Recipe ID: "${r.recipeId}"\nTitle: "${r.title}"\nIngredients the user already has: ${
              r.missingIngredients.length < r.calories
                ? ingredients.filter((ing) => !r.missingIngredients.map(normalise).includes(normalise(ing))).join(', ') || 'none listed'
                : 'see match percentage'
            }\nMissing ingredients: ${r.missingIngredients.length > 0 ? r.missingIngredients.join(', ') : 'none — perfect match!'}`
        )
        .join('\n\n');

      const prompt = `You are a warm, knowledgeable culinary assistant helping a home cook figure out what to make.

The user has these ingredients in their pantry: ${pantryList}

Here are the top recipe matches found for them:
${recipeDescriptions}

Please respond with a single JSON object (no markdown fences) with this exact shape:
{
  "openingMessage": "<2-3 sentences: first briefly summarize what the pantry ingredients allow for, then explicitly call out which single recipe is the 'best pick' by name and explain why (e.g. quickest, uses the most on-hand ingredients, or healthiest), and mention that a couple others are close behind if they want something different. Example: 'You\\'ve got the makings of a solid dinner tonight. Given what\\'s on hand, Quick Chicken Pasta is your best bet — it uses almost everything you listed and comes together in under 30 minutes. A couple others are close behind if you\\'re in the mood for something different.'>",
  "bestPickRecipeId": "<the recipeId of the recipe chosen as the 'best pick'>",
  "comparisonSummary": "<2-4 sentences discussing all three top matches together as a set — compare why these three specifically stood out given the user's exact pantry. Touch on things like: which is fastest, which uses the most of what they already have, which is the safest bet if they don't want to buy anything extra, and how they differ in flavor or cooking style. This is NOT per-recipe reasoning — it's a single paragraph-style overview of how the three options relate to each other and the user's situation.>",
  "recipes": [
    {
      "recipeId": "<recipe id>",
      "reasoning": "<1-2 sentences specifically explaining why this recipe is a great fit given their exact ingredients — mention which ingredients they already have and why it works>",
      "substitutions": [
        { "ingredient": "<missing ingredient>", "suggestion": "<concise substitution, or 'no good substitute, worth buying' if none>" }
      ]
    }
  ]
}

Rules:
- openingMessage must be 2-3 sentences, conversational, warm, and explicitly name the best pick recipe and why it is chosen.
- bestPickRecipeId must match one of the top 3 recipe IDs provided above.
- comparisonSummary must be 2-4 sentences comparing the three recipes as a group; do not just repeat per-recipe reasoning.
- reasoning must name specific ingredients from the user's pantry; 1-2 sentences max
- substitutions: if a recipe has NO missing ingredients, return an empty array []
- If a reasonable substitute exists give it concisely; otherwise say exactly: "no good substitute, worth buying"
- Respond ONLY with the JSON object — no markdown, no code fences, nothing else`;

      const result = await model.generateContent(prompt);
      const rawText = result.response.text().trim();

      const jsonText = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();

      const parsed = JSON.parse(jsonText) as Record<string, any>;

      openingMessage = parsed.openingMessage ?? parsed.openingmessage ?? '';
      bestPickRecipeId = parsed.bestPickRecipeId ?? parsed.bestpickrecipeid ?? parsed.bestPickRecipeID ?? '';
      
      // Robust case-insensitive comparison summary lookup
      const compKey = Object.keys(parsed).find(k => k.toLowerCase().includes('comparison'));
      comparisonSummary = compKey ? parsed[compKey] : '';

      for (const item of parsed.recipes ?? parsed.recipeMatches ?? []) {
        if (item.recipeId) {
          substitutionMap.set(item.recipeId, item.substitutions ?? []);
          reasoningMap.set(item.recipeId, item.reasoning ?? '');
        }
      }

      if (!comparisonSummary && top3.length > 0) {
        const matchNames = top3.map((r, i) => `"${r.title}" (#${i + 1}, ${r.matchPercentage}% match)`).join(', ');
        comparisonSummary = `Comparing these options: ${matchNames}. The best pick is marked on the card above. You can view the preparation details or substitution recommendations for each recipe.`;
      }
    } catch (geminiError) {
      // Non-fatal: log and continue
      console.error('Gemini call failed:', geminiError);
    }
  }

  // Fallback if Gemini call failed entirely
  if (!comparisonSummary && top3.length > 0) {
    const matchNames = top3.map((r, i) => `"${r.title}" (#${i + 1}, ${r.matchPercentage}% match)`).join(', ');
    comparisonSummary = `Comparing these options: ${matchNames}. The best pick is marked on the card above. You can view the preparation details or substitution recommendations for each recipe.`;
  }

  // 5. Assemble final response
  const matches: MatchResult[] = top3.map((recipe) => ({
    ...recipe,
    substitutions: substitutionMap.get(recipe.recipeId) ?? [],
    reasoning: reasoningMap.get(recipe.recipeId) ?? '',
  }));

  return NextResponse.json({ openingMessage, bestPickRecipeId, comparisonSummary, matches });
}
