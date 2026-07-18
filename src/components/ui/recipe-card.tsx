import Image from "next/image";
import Link from "next/link";
import { Recipe } from "@/types/recipe";

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  // Use a placeholder if no image is available
  const imageUrl = recipe.imageUrl || "/placeholder-recipe.jpg";

  return (
    <div className="group flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/recipes/${recipe._id}`} className="relative h-48 w-full overflow-hidden block bg-zinc-100 dark:bg-zinc-800">
        {recipe.imageUrl ? (
          <Image
            src={imageUrl}
            alt={recipe.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white/90 dark:bg-black/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-primary flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          {recipe.rating.toFixed(1)}
        </div>
      </Link>
      
      <div className="flex flex-col flex-grow p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-secondary uppercase tracking-wider">
            {recipe.category}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {recipe.cuisine}
          </span>
        </div>
        
        <Link href={`/recipes/${recipe._id}`} className="hover:text-primary transition-colors">
          <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-1">{recipe.title}</h3>
        </Link>
        
        <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-4 flex-grow">
          {recipe.shortDescription}
        </p>
        
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-4">
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>{recipe.prepTimeMinutes + recipe.cookTimeMinutes} min</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-md font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
            <span>{recipe.calories} cal</span>
          </div>
        </div>
        
        <Link 
          href={`/recipes/${recipe._id}`}
          className="w-full text-center py-2 px-4 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium rounded-lg transition-colors text-sm"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
