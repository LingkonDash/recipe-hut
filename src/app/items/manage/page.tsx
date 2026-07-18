import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from '@/lib/session';
import { ManageRecipesClient } from '@/components/recipes/manage-recipes-client';

export const metadata: Metadata = {
  title: 'Manage Recipes | Recipe Hut',
  description: 'Manage and organize your personal recipe collection.',
};

export default async function ManageRecipesPage() {
  const session = await getServerSession();
  
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[var(--background)] py-10 sm:py-14">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">
              My Recipes
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              Manage your personal collection of culinary creations.
            </p>
          </div>
          
          <Link
            href="/items/add"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors text-sm shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Add New Recipe
          </Link>
        </div>

        {/* Content */}
        <ManageRecipesClient />
      </div>
    </div>
  );
}
