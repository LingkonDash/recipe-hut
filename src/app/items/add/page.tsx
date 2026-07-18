import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from '@/lib/session';
import { AddRecipeForm } from '@/components/recipes/add-recipe-form';

export const metadata: Metadata = {
  title: 'Add Recipe | Recipe Hut',
  description: 'Share your favourite recipe with the Recipe Hut community.',
};

export default async function AddRecipePage() {
  // ── Server-side auth guard ──────────────────────────────────────
  const session = await getServerSession();
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* ── Page header ───────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-br from-[var(--primary)]/5 via-[var(--accent)]/5 to-[var(--secondary)]/5">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-6">
            <Link href="/" className="hover:text-[var(--primary)] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/items/manage" className="hover:text-[var(--primary)] transition-colors">My Recipes</Link>
            <span>/</span>
            <span className="text-[var(--foreground)] font-medium">Add Recipe</span>
          </nav>

          <div className="flex items-start gap-5">
            {/* Icon */}
            <div className="hidden sm:flex flex-shrink-0 w-14 h-14 rounded-2xl bg-[var(--primary)]/10 items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] leading-tight">
                Add a New Recipe
              </h1>
              <p className="mt-2 text-zinc-500 dark:text-zinc-400 text-base max-w-xl">
                Share your culinary creation with the Recipe Hut community. Fill in all the
                details below and your recipe will be published instantly.
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--secondary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>
                  Publishing as{' '}
                  <span className="font-semibold text-[var(--foreground)]">
                    {session.user.name ?? session.user.email}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 -right-16 w-80 h-80 rounded-full bg-[var(--primary)]/6 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-1/3 w-56 h-56 rounded-full bg-[var(--accent)]/8 blur-3xl"
        />
      </div>

      {/* ── Form ──────────────────────────────────────────────── */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
        <AddRecipeForm />
      </div>
    </div>
  );
}
