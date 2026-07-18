import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters long'),
});

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    // Flag: No email service wired up yet. Needs an email provider like Resend to actually send emails.
    // For now, just logging it server-side.
    console.log('--- NEW CONTACT MESSAGE ---');
    console.log(`Name: ${parsed.data.name}`);
    console.log(`Email: ${parsed.data.email}`);
    console.log(`Subject: ${parsed.data.subject}`);
    console.log(`Message:\n${parsed.data.message}`);
    console.log('---------------------------');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    return NextResponse.json({ success: true, message: 'Message sent successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Contact handler error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
