import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { Recipe } from '@/types/recipe';
import { Document, Filter } from 'mongodb';
import { getServerSession } from '@/lib/session';
import { z } from 'zod';

// Subset of recipeSchema for user-submitted data (server sets createdBy, createdAt, rating)
const createRecipeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  shortDescription: z.string().min(1, 'Short description is required'),
  fullDescription: z.string().min(1, 'Full description is required'),
  ingredients: z.array(z.string().min(1)).min(1, 'At least one ingredient is required'),
  steps: z.array(z.string().min(1)).min(1, 'At least one step is required'),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  category: z.string().min(1, 'Category is required'),
  cuisine: z.string().min(1, 'Cuisine is required'),
  prepTimeMinutes: z.number().min(0, 'Prep time must be 0 or more'),
  cookTimeMinutes: z.number().min(0, 'Cook time must be 0 or more'),
  servings: z.number().min(1, 'Servings must be at least 1'),
  calories: z.number().min(0, 'Calories must be 0 or more'),
  protein: z.number().min(0, 'Protein must be 0 or more'),
  carbs: z.number().min(0, 'Carbs must be 0 or more'),
  fat: z.number().min(0, 'Fat must be 0 or more'),
  priority: z.number().min(1).max(3), // 1=Easy, 2=Medium, 3=Hard
});

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

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse & validate body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = createRecipeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const data = parsed.data;

    // Sanitise imageUrl — treat empty string as absent
    const imageUrl = data.imageUrl && data.imageUrl.trim() !== '' ? data.imageUrl : undefined;

    const { db } = await getDb();
    const collection = db.collection('recipes');

    const doc = {
      ...data,
      imageUrl,
      rating: 0,
      createdBy: session.user.id,
      createdAt: new Date(),
    };

    const result = await collection.insertOne(doc);

    return NextResponse.json(
      { ...doc, _id: result.insertedId.toString() },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create recipe:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
