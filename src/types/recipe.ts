export interface Recipe {
  _id: string; // Typically ObjectId stringified
  title: string;
  shortDescription: string;
  fullDescription: string;
  ingredients: string[];
  steps: string[];
  imageUrl?: string;
  category: string;
  cuisine: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  rating: number;
  priority: number;
  createdBy: string;
  createdAt: Date;
}
