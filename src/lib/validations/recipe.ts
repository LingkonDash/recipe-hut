import { z } from 'zod';

export const recipeSchema = z.object({
  title: z.string().min(1),
  shortDescription: z.string().min(1),
  fullDescription: z.string().min(1),
  ingredients: z.array(z.string().min(1)).min(1),
  steps: z.array(z.string().min(1)).min(1),
  imageUrl: z.string().url().optional(),
  category: z.string().min(1),
  cuisine: z.string().min(1),
  prepTimeMinutes: z.number().min(0),
  cookTimeMinutes: z.number().min(0),
  servings: z.number().min(1),
  calories: z.number().min(0),
  protein: z.number().min(0),
  carbs: z.number().min(0),
  fat: z.number().min(0),
  rating: z.number().min(0).max(5),
  priority: z.number(),
  createdBy: z.string().min(1),
  createdAt: z.date(),
});

export type RecipeInput = z.infer<typeof recipeSchema>;
