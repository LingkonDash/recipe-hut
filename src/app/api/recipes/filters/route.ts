import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const { db } = await getDb();
    const collection = db.collection('recipes');

    const categories = await collection.distinct('category');
    const cuisines = await collection.distinct('cuisine');

    return NextResponse.json({
      categories: categories.filter(Boolean).sort(),
      cuisines: cuisines.filter(Boolean).sort(),
    });
  } catch (error) {
    console.error('Failed to fetch filters:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
