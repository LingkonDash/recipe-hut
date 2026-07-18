import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getServerSession } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await getDb();
    const recipes = await db.collection('recipes')
      .find({ createdBy: session.user.id })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(recipes);
  } catch (error) {
    console.error('Failed to fetch user recipes:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
