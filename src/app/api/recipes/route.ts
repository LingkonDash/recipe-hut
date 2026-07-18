import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { Recipe } from '@/types/recipe';
import { Document, Filter } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const cuisine = searchParams.get('cuisine');
    const sort = searchParams.get('sort');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    
    const query: Filter<Document> = {};
    
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    
    if (category) {
      query.category = category;
    }
    
    if (cuisine) {
      query.cuisine = cuisine;
    }
    
    let sortOption: any = { createdAt: -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    if (sort === 'calories') sortOption = { calories: 1 };
    
    const skip = (page - 1) * limit;
    
    const { db } = await getDb();
    const collection = db.collection('recipes');
    
    const total = await collection.countDocuments(query);
    const recipes = await collection.find(query).sort(sortOption).skip(skip).limit(limit).toArray() as unknown as Recipe[];
    
    const totalPages = Math.ceil(total / limit) || 1;
    
    return NextResponse.json({
      recipes,
      total,
      page,
      totalPages
    });
  } catch (error) {
    console.error('Failed to fetch recipes:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
