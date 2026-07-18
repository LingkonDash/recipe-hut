'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Recipe } from '@/types/recipe';

export function ManageRecipesClient() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Delete modal state
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);

  const fetchRecipes = async () => {
    try {
      const res = await fetch('/api/recipes/mine');
      if (!res.ok) {
        throw new Error('Failed to fetch recipes');
      }
      const data = await res.json();
      setRecipes(data);
    } catch (err) {
      console.error(err);
      setError('Could not load your recipes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const confirmDelete = async () => {
    if (!recipeToDelete) return;
    
    setIsDeleting(recipeToDelete._id);
    try {
      const res = await fetch(`/api/recipes/${recipeToDelete._id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        throw new Error('Failed to delete recipe');
      }
      
      // Update local state to remove the deleted recipe
      setRecipes((prev) => prev.filter((r) => r._id !== recipeToDelete._id));
      setRecipeToDelete(null);
    } catch (err) {
      console.error(err);
      alert('Failed to delete recipe. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm animate-pulse">
            <div className="h-40 w-full bg-zinc-200 dark:bg-zinc-800"></div>
            <div className="p-4 space-y-4">
              <div className="h-4 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="h-6 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="h-8 w-full bg-zinc-200 dark:bg-zinc-800 rounded flex gap-2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg border border-red-100 dark:border-red-800/50">
        {error}
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
        <svg className="mx-auto h-12 w-12 text-zinc-400 mb-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
        <h3 className="text-lg font-medium text-foreground mb-2">No recipes yet</h3>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mb-6">
          You haven&apos;t added any recipes to your collection yet. Start sharing your culinary creations!
        </p>
        <Link
          href="/items/add"
          className="inline-flex items-center justify-center px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors"
        >
          Add Your First Recipe
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Mobile view: Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-6">
        {recipes.map((recipe) => (
          <div key={recipe._id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
            <div className="relative h-40 w-full bg-zinc-100 dark:bg-zinc-800">
              {recipe.imageUrl ? (
                <Image
                  src={recipe.imageUrl}
                  alt={recipe.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-zinc-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>
                </div>
              )}
              <div className="absolute top-2 right-2 bg-white/90 dark:bg-black/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-primary flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                {recipe.rating.toFixed(1)}
              </div>
            </div>
            <div className="p-4 flex-grow flex flex-col">
              <span className="text-xs font-medium text-secondary uppercase tracking-wider mb-1">
                {recipe.category}
              </span>
              <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-1">{recipe.title}</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 flex-grow">
                Added {new Date(recipe.createdAt).toLocaleDateString()}
              </p>
              <div className="flex items-center gap-2 mt-auto">
                <Link
                  href={`/recipes/${recipe._id}`}
                  className="flex-1 text-center py-2 px-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-foreground font-medium rounded-lg transition-colors text-sm"
                >
                  View
                </Link>
                <button
                  onClick={() => setRecipeToDelete(recipe)}
                  className="flex-1 text-center py-2 px-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-medium rounded-lg transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop view: Table */}
      <div className="hidden lg:block overflow-x-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <th className="py-4 px-6 font-medium text-sm text-zinc-500 dark:text-zinc-400 w-[45%]">Recipe</th>
              <th className="py-4 px-6 font-medium text-sm text-zinc-500 dark:text-zinc-400">Category</th>
              <th className="py-4 px-6 font-medium text-sm text-zinc-500 dark:text-zinc-400">Rating</th>
              <th className="py-4 px-6 font-medium text-sm text-zinc-500 dark:text-zinc-400">Added Date</th>
              <th className="py-4 px-6 font-medium text-sm text-zinc-500 dark:text-zinc-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {recipes.map((recipe) => (
              <tr key={recipe._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-16 rounded overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
                      {recipe.imageUrl ? (
                        <Image src={recipe.imageUrl} alt={recipe.title} fill className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-zinc-400">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/></svg>
                        </div>
                      )}
                    </div>
                    <span className="font-semibold text-foreground line-clamp-1">{recipe.title}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-sm text-zinc-600 dark:text-zinc-300">
                  <span className="inline-block px-2 py-1 bg-secondary/10 text-secondary rounded text-xs font-medium">
                    {recipe.category}
                  </span>
                </td>
                <td className="py-4 px-6 text-sm">
                  <div className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="var(--accent)" stroke="var(--accent)" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    {recipe.rating.toFixed(1)}
                  </div>
                </td>
                <td className="py-4 px-6 text-sm text-zinc-500 dark:text-zinc-400">
                  {new Date(recipe.createdAt).toLocaleDateString()}
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/recipes/${recipe._id}`}
                      className="p-2 text-zinc-500 hover:text-primary transition-colors"
                      aria-label="View"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    </Link>
                    <button
                      onClick={() => setRecipeToDelete(recipe)}
                      className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                      aria-label="Delete"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {recipeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-foreground mb-2">Delete Recipe?</h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              Are you sure you want to delete &quot;<span className="font-semibold text-foreground">{recipeToDelete.title}</span>&quot;? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setRecipeToDelete(null)}
                disabled={isDeleting === recipeToDelete._id}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-foreground font-medium rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting === recipeToDelete._id}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors text-sm flex items-center justify-center min-w-[80px]"
              >
                {isDeleting === recipeToDelete._id ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
