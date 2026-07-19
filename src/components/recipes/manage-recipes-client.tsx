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
          <div key={i} className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm animate-pulse">
            <div className="h-40 w-full bg-border"></div>
            <div className="p-4 space-y-4">
              <div className="h-4 w-1/3 bg-border rounded"></div>
              <div className="h-6 w-3/4 bg-border rounded"></div>
              <div className="h-8 w-full bg-border rounded flex gap-2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-16 bg-surface border border-border rounded-2xl shadow-sm">
        <svg className="mx-auto h-12 w-12 text-foreground-muted mb-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
        <h3 className="text-lg font-medium text-foreground mb-2">No recipes yet</h3>
        <p className="text-foreground-muted max-w-sm mx-auto mb-6">
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
          <div key={recipe._id} className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm flex flex-col">
            <div className="relative h-40 w-full bg-border/50">
              {recipe.imageUrl ? (
                <Image
                  src={recipe.imageUrl}
                  alt={recipe.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-foreground-muted">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>
                </div>
              )}
              <div className="absolute top-2 right-2 bg-surface/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-primary flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                {recipe.rating.toFixed(1)}
              </div>
            </div>
            <div className="p-4 flex-grow flex flex-col">
              <span className="text-xs font-medium text-secondary uppercase tracking-wider mb-1">
                {recipe.category}
              </span>
              <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-1">{recipe.title}</h3>
              <p className="text-xs text-foreground-muted mb-4 flex-grow">
                Added {new Date(recipe.createdAt).toLocaleDateString()}
              </p>
              <div className="flex items-center gap-2 mt-auto">
                <Link
                  href={`/recipes/${recipe._id}`}
                  className="flex-1 text-center py-2 px-1.5 text-primary border border-primary/30 hover:bg-primary/10 font-medium rounded-lg transition-colors text-xs"
                >
                  View
                </Link>
                <Link
                  href={`/items/edit/${recipe._id}`}
                  className="flex-1 text-center py-2 px-1.5 text-zinc-700 dark:text-zinc-300 border border-border hover:bg-background font-medium rounded-lg transition-colors text-xs"
                >
                  Edit
                </Link>
                <button
                  onClick={() => setRecipeToDelete(recipe)}
                  className="flex-1 text-center py-2 px-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-colors text-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop view: Table */}
      <div className="hidden lg:block overflow-x-auto bg-surface border border-border rounded-xl shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-background/50">
              <th className="py-4 px-6 font-medium text-sm text-foreground-muted w-[45%]">Recipe</th>
              <th className="py-4 px-6 font-medium text-sm text-foreground-muted">Category</th>
              <th className="py-4 px-6 font-medium text-sm text-foreground-muted">Rating</th>
              <th className="py-4 px-6 font-medium text-sm text-foreground-muted">Added Date</th>
              <th className="py-4 px-6 font-medium text-sm text-foreground-muted text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {recipes.map((recipe) => (
              <tr key={recipe._id} className="hover:bg-background/60 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-16 rounded overflow-hidden bg-border/50 flex-shrink-0">
                      {recipe.imageUrl ? (
                        <Image src={recipe.imageUrl} alt={recipe.title} fill className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-foreground-muted">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/></svg>
                        </div>
                      )}
                    </div>
                    <span className="font-semibold text-foreground line-clamp-1">{recipe.title}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-sm text-foreground-muted">
                  <span className="inline-block px-2 py-1 bg-secondary/10 text-secondary rounded text-xs font-medium">
                    {recipe.category}
                  </span>
                </td>
                <td className="py-4 px-6 text-sm">
                  <div className="flex items-center gap-1 text-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="var(--accent)" stroke="var(--accent)" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    {recipe.rating.toFixed(1)}
                  </div>
                </td>
                <td className="py-4 px-6 text-sm text-foreground-muted">
                  {new Date(recipe.createdAt).toLocaleDateString()}
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/recipes/${recipe._id}`}
                      className="p-2 text-foreground-muted hover:text-primary transition-colors"
                      aria-label="View"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    </Link>
                    <Link
                      href={`/items/edit/${recipe._id}`}
                      className="p-2 text-foreground-muted hover:text-primary transition-colors"
                      aria-label="Edit"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                    </Link>
                    <button
                      onClick={() => setRecipeToDelete(recipe)}
                      className="p-2 text-foreground-muted hover:text-red-500 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-foreground/30 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-foreground mb-2">Delete Recipe?</h3>
            <p className="text-foreground-muted mb-6">
              Are you sure you want to delete &quot;<span className="font-semibold text-foreground">{recipeToDelete.title}</span>&quot;? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setRecipeToDelete(null)}
                disabled={isDeleting === recipeToDelete._id}
                className="px-4 py-2 bg-background hover:bg-border text-foreground font-medium rounded-lg transition-colors text-sm border border-border"
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
