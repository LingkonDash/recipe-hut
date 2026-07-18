import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { db } = await getDb();
    const user = await db.collection('user').findOne({ email: 'demo@recipehut.com' });
    
    if (!user) {
      // Create user via Better Auth's server API
      // Creating a pseudo-request to simulate a valid request body for the API
      const body = {
        email: 'demo@recipehut.com',
        password: 'Demo1234!',
        name: 'Demo User',
      };
      
      const req = new Request('http://localhost:3000/api/auth/sign-up/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      await auth.handler(req);
      return NextResponse.json({ success: true, created: true });
    }
    
    return NextResponse.json({ success: true, created: false });
  } catch (error) {
    console.error('Demo seed error:', error);
    return NextResponse.json({ success: false, error: 'Failed to seed demo user' }, { status: 500 });
  }
}
