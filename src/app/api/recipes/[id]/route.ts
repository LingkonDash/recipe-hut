import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { Recipe } from '@/types/recipe';
import { getServerSession } from '@/lib/session';
import { z } from 'zod';

const recipeUpdateSchema = z.object({
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid recipe ID' }, { status: 400 });
    }
    
    const { db } = await getDb();
    const recipe = await db.collection('recipes').findOne({ _id: new ObjectId(id) }) as unknown as Recipe;
    
    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }
    
    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Failed to fetch recipe:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid recipe ID' }, { status: 400 });
    }

    const { db } = await getDb();
    const collection = db.collection('recipes');

    const recipe = await collection.findOne({ _id: new ObjectId(id) });
    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    if (recipe.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = recipeUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const data = parsed.data;
    // Sanitise imageUrl — treat empty string as absent
    const imageUrl = data.imageUrl && data.imageUrl.trim() !== '' ? data.imageUrl : undefined;

    const updateDoc = {
      $set: {
        title: data.title,
        shortDescription: data.shortDescription,
        fullDescription: data.fullDescription,
        ingredients: data.ingredients,
        steps: data.steps,
        category: data.category,
        cuisine: data.cuisine,
        prepTimeMinutes: data.prepTimeMinutes,
        cookTimeMinutes: data.cookTimeMinutes,
        servings: data.servings,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        priority: data.priority,
        imageUrl: imageUrl,
      }
    };

    await collection.updateOne({ _id: new ObjectId(id) }, updateDoc);
    
    const updatedRecipe = await collection.findOne({ _id: new ObjectId(id) });
    return NextResponse.json(updatedRecipe);
  } catch (error) {
    console.error('Failed to update recipe:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid recipe ID' }, { status: 400 });
    }

    const { db } = await getDb();
    const recipe = await db.collection('recipes').findOne({ _id: new ObjectId(id) });
    
    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    if (recipe.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.collection('recipes').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete recipe:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
