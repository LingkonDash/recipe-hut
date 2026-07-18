import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Recipe } from "@/types/recipe";
import { RecipeCard } from "@/components/ui/recipe-card";
import { NutritionChart } from "@/components/ui/nutrition-chart";
import { RecipeAnimations } from "@/components/recipe-animations";

/* ─────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────── */

function StarRating({ rating, size = 20 }: { rating: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`Rating: ${rating.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating >= star;
        return (
          <svg
            key={star}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={filled ? "var(--accent)" : "none"}
            stroke="var(--accent)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      })}
    </span>
  );
}

/* ─────────────────────────────────────────────
   Metadata generation
   ───────────────────────────────────────────── */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/recipes/${id}`, { cache: "no-store" });
    if (!res.ok) return { title: "Recipe Not Found | Recipe Hut" };
    const recipe: Recipe = await res.json();
    return {
      title: `${recipe.title} | Recipe Hut`,
      description: recipe.shortDescription,
      openGraph: {
        title: recipe.title,
        description: recipe.shortDescription,
        images: recipe.imageUrl ? [recipe.imageUrl] : [],
      },
    };
  } catch {
    return { title: "Recipe | Recipe Hut" };
  }
}

/* ─────────────────────────────────────────────
   Page Component
   ───────────────────────────────────────────── */

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  /* --- Fetch main recipe --- */
  const recipeRes = await fetch(`${baseUrl}/api/recipes/${id}`, {
    cache: "no-store",
  });

  if (!recipeRes.ok) {
    notFound();
  }

  const recipe: Recipe = await recipeRes.json();

  /* --- Fetch related recipes (same category, exclude self) --- */
  let relatedRecipes: Recipe[] = [];
  try {
    const relatedRes = await fetch(
      `${baseUrl}/api/recipes?category=${encodeURIComponent(recipe.category)}&limit=5`,
      { cache: "no-store" }
    );
    if (relatedRes.ok) {
      const data = await relatedRes.json();
      relatedRecipes = (data.recipes as Recipe[])
        .filter((r) => r._id !== id)
        .slice(0, 4);
    }
  } catch {
    // silently fail — related section will be hidden
  }

  const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* ── HERO / HEADER ─────────────────────────────────── */}
      <section className="relative">
        {/* Image / Placeholder */}
        <div className="gsap-recipe-hero relative w-full h-72 sm:h-96 md:h-[480px] overflow-hidden">
          {recipe.imageUrl ? (
            <Image
              src={recipe.imageUrl}
              alt={recipe.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[var(--primary)]/10 via-[var(--accent)]/10 to-[var(--secondary)]/10">
              <div className="w-24 h-24 rounded-full bg-[var(--primary)]/15 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                  <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
                  <path d="M12 3v6" />
                </svg>
              </div>
              <p className="text-sm font-medium text-[var(--primary)]/70 tracking-wider uppercase">
                No Image Available
              </p>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Breadcrumb */}
          <div className="absolute top-4 left-4 sm:left-8">
            <nav className="flex items-center gap-2 text-white/80 text-sm">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link href="/explore" className="hover:text-white transition-colors">
                Explore
              </Link>
              <span>/</span>
              <span className="text-white font-medium line-clamp-1 max-w-[160px]">
                {recipe.title}
              </span>
            </nav>
          </div>

          {/* Category badge */}
          <div className="absolute top-4 right-4 sm:right-8">
            <span className="bg-[var(--primary)] text-white text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
              {recipe.category}
            </span>
          </div>
        </div>

        {/* Title card that overlaps the image */}
        <div className="gsap-recipe-hero relative z-10 -mt-24 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-6 sm:p-8 border border-zinc-100 dark:border-zinc-800">
            {/* Title + description */}
            <div className="mb-6">
              <h1 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] leading-tight mb-3">
                {recipe.title}
              </h1>
              <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {recipe.shortDescription}
              </p>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap gap-4 sm:gap-6 pt-5 border-t border-zinc-100 dark:border-zinc-800">
              {/* Prep time */}
              <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/15 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide font-semibold text-zinc-400">Prep</div>
                  <div className="font-semibold text-[var(--foreground)]">{recipe.prepTimeMinutes} min</div>
                </div>
              </div>

              {/* Cook time */}
              <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide font-semibold text-zinc-400">Cook</div>
                  <div className="font-semibold text-[var(--foreground)]">{recipe.cookTimeMinutes} min</div>
                </div>
              </div>

              {/* Total time */}
              <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <div className="w-8 h-8 rounded-lg bg-[var(--secondary)]/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide font-semibold text-zinc-400">Total</div>
                  <div className="font-semibold text-[var(--foreground)]">{totalTime} min</div>
                </div>
              </div>

              {/* Servings */}
              <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(59 130 246)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide font-semibold text-zinc-400">Serves</div>
                  <div className="font-semibold text-[var(--foreground)]">{recipe.servings}</div>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="var(--accent)" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide font-semibold text-zinc-400">Rating</div>
                  <div className="font-semibold text-[var(--foreground)]">{recipe.rating.toFixed(1)} / 5</div>
                </div>
              </div>

              {/* Cuisine */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[var(--secondary)]/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide font-semibold text-zinc-400">Cuisine</div>
                  <div className="font-semibold text-[var(--foreground)]">{recipe.cuisine}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ──────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-20 mt-8 space-y-10">

        {/* ── OVERVIEW / DESCRIPTION ─────────────────────── */}
        <section className="gsap-recipe-section bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4 flex items-center gap-3">
            <span className="w-1 h-7 rounded-full bg-[var(--primary)] inline-block" />
            Overview
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base sm:text-lg whitespace-pre-line">
            {recipe.fullDescription}
          </p>
        </section>

        {/* ── INGREDIENTS + STEPS ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ingredients */}
          <section className="gsap-recipe-section lg:col-span-1 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm p-6 sm:p-8 h-fit">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-5 flex items-center gap-3">
              <span className="w-1 h-6 rounded-full bg-[var(--secondary)] inline-block" />
              Ingredients
            </h2>
            <ul className="space-y-2.5">
              {recipe.ingredients.map((ingredient, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300"
                >
                  <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 border-[var(--secondary)] flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-[var(--secondary)]" />
                  </span>
                  {ingredient}
                </li>
              ))}
            </ul>
          </section>

          {/* Instructions */}
          <section className="gsap-recipe-section lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-5 flex items-center gap-3">
              <span className="w-1 h-6 rounded-full bg-[var(--primary)] inline-block" />
              Instructions
            </h2>
            <ol className="space-y-5">
              {recipe.steps.map((step, idx) => (
                <li key={idx} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--primary)] text-white text-sm font-bold flex items-center justify-center shadow-sm">
                    {idx + 1}
                  </div>
                  <p className="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed pt-1">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* ── NUTRITION FACTS ───────────────────────────────── */}
        <section className="gsap-recipe-section bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-3">
            <span className="w-1 h-7 rounded-full bg-[var(--accent)] inline-block" />
            Nutrition Facts
            <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400 ml-1">
              (per serving)
            </span>
          </h2>
          <NutritionChart 
            calories={recipe.calories} 
            protein={recipe.protein} 
            carbs={recipe.carbs} 
            fat={recipe.fat} 
          />
        </section>

        {/* ── REVIEWS / RATINGS ────────────────────────────── */}
        {/*
          ⚠️  REVIEWS ARE COSMETIC / COMING SOON
          To make reviews functional, you will need:
            1. A "reviews" MongoDB collection with schema:
               { recipeId, userId, userName, rating (1-5), comment, createdAt }
            2. GET /api/recipes/[id]/reviews   — fetch paginated reviews
            3. POST /api/recipes/[id]/reviews  — submit a review (auth required)
            4. Convert this section to a Client Component with form state management
            5. Update the Recipe.rating field via aggregation on new review writes
        */}
        <section className="gsap-recipe-section bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-3">
            <span className="w-1 h-7 rounded-full bg-[var(--primary)] inline-block" />
            Reviews &amp; Ratings
          </h2>

          {/* Current aggregate rating */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-8 border-b border-zinc-100 dark:border-zinc-800 mb-8">
            <div className="text-center sm:border-r sm:border-zinc-200 sm:dark:border-zinc-700 sm:pr-8">
              <div className="text-6xl font-black text-[var(--foreground)]">
                {recipe.rating.toFixed(1)}
              </div>
              <div className="mt-2 flex justify-center">
                <StarRating rating={recipe.rating} size={22} />
              </div>
              <div className="text-xs text-zinc-500 mt-1.5">out of 5</div>
            </div>
            <div className="flex-1">
              {/* Decorative distribution bars based on rating */}
              {[5, 4, 3, 2, 1].map((star) => {
                const r = Math.round(recipe.rating);
                const pct =
                  star === r
                    ? 68
                    : star === r - 1
                    ? 20
                    : star === r + 1
                    ? 8
                    : 4;
                return (
                  <div key={star} className="flex items-center gap-3 mb-1.5">
                    <span className="text-xs text-zinc-500 w-3 text-right">{star}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--accent)" stroke="var(--accent)" strokeWidth="1.5">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent)] rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-zinc-400 w-6 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center py-6 mb-8">
            <div className="w-16 h-16 rounded-full bg-[var(--accent)]/10 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">
              Be the first to review this recipe!
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Share your experience and help others discover great food.
            </p>
          </div>

          {/* Frozen form with coming-soon overlay */}
          <div className="relative">
            <div className="absolute inset-0 z-10 rounded-xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-[var(--foreground)] text-[var(--background)] text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
                Reviews coming soon
              </span>
            </div>
            <div className="space-y-4 opacity-60 pointer-events-none select-none">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Your Rating
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className="p-1">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Your Name
                </label>
                <input
                  readOnly
                  type="text"
                  placeholder="Jane Doe"
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-[var(--foreground)] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Your Review
                </label>
                <textarea
                  readOnly
                  rows={4}
                  placeholder="Tell us what you thought about this recipe..."
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-[var(--foreground)] focus:outline-none resize-none"
                />
              </div>
              <button
                type="button"
                className="px-6 py-2.5 bg-[var(--primary)] text-white rounded-lg font-semibold text-sm cursor-not-allowed opacity-70"
              >
                Submit Review
              </button>
            </div>
          </div>
        </section>

        {/* ── RELATED RECIPES ──────────────────────────────── */}
        {relatedRecipes.length > 0 && (
          <section className="gsap-recipe-section">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-3">
              <span className="w-1 h-7 rounded-full bg-[var(--secondary)] inline-block" />
              More {recipe.category} Recipes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedRecipes.map((related) => (
                <div key={related._id} className="gsap-recipe-card h-full">
                  <RecipeCard recipe={related} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
      
      <RecipeAnimations />
    </div>
  );
}
