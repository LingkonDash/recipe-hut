"use client";

import { Suspense, useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { RecipeCard } from "@/components/ui/recipe-card";
import { RecipeCardSkeleton } from "@/components/ui/recipe-card-skeleton";
import { Recipe } from "@/types/recipe";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

function ExploreContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL state
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "";
  const initialCuisine = searchParams.get("cuisine") || "";
  const initialSort = searchParams.get("sort") || "newest";

  // Local state
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [cuisine, setCuisine] = useState(initialCuisine);
  const [sort, setSort] = useState(initialSort);
  
  // Data state
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters data
  const [categories, setCategories] = useState<string[]>([]);
  const [cuisines, setCuisines] = useState<string[]>([]);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Controls animation (only on mount)
    gsap.fromTo(
      ".gsap-explore-control",
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: "power2.out" }
    );
  }, { scope: containerRef }); // No dependencies, runs once

  useGSAP(() => {
    // Recipe cards animation (re-runs when recipes change)
    if (!isLoading && recipes.length > 0) {
      gsap.fromTo(
        ".gsap-explore-card",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: "power2.out" }
      );
    }
  }, { dependencies: [isLoading, recipes], scope: containerRef });

  // Fetch filters once
  useEffect(() => {
    async function fetchFilters() {
      try {
        const res = await fetch("/api/recipes/filters");
        const data = await res.json();
        if (data.categories) setCategories(data.categories);
        if (data.cuisines) setCuisines(data.cuisines);
      } catch (err) {
        console.error("Error fetching filters:", err);
      }
    }
    fetchFilters();
  }, []);

  const updateUrlParams = useCallback((params: Record<string, string>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    // Update or remove params
    Object.entries(params).forEach(([key, value]) => {
      if (!value) {
        current.delete(key);
      } else {
        current.set(key, value);
      }
    });

    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`${pathname}${query}`, { scroll: false });
  }, [pathname, router, searchParams]);

  // Sync state to URL and Fetch Recipes
  useEffect(() => {
    // We update local state in case the URL was changed from outside (like back/forward buttons)
    setSearch(searchParams.get("search") || "");
    setCategory(searchParams.get("category") || "");
    setCuisine(searchParams.get("cuisine") || "");
    setSort(searchParams.get("sort") || "newest");

    const fetchRecipes = async () => {
      setIsLoading(true);
      try {
        const urlParams = new URLSearchParams(searchParams.toString());
        if (!urlParams.has("limit")) urlParams.set("limit", "12");
        
        const res = await fetch(`/api/recipes?${urlParams.toString()}`);
        const data = await res.json();
        
        if (data.recipes) {
          setRecipes(data.recipes);
          setTotalPages(data.totalPages || 1);
        }
      } catch (err) {
        console.error("Error fetching recipes:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, [searchParams]);

  // Handle Search Input (Debounced)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val); // Update local instantly for fast UI
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      updateUrlParams({ search: val, page: "1" });
    }, 400);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCategory(val);
    updateUrlParams({ category: val, page: "1" });
  };

  const handleCuisineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCuisine(val);
    updateUrlParams({ cuisine: val, page: "1" });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSort(val);
    updateUrlParams({ sort: val, page: "1" });
  };

  const handlePageChange = (newPage: number) => {
    updateUrlParams({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  return (
    <div ref={containerRef} className="container py-12 md:py-16 mx-auto px-4 min-h-[80vh]">
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
          Explore Recipes
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Discover your next favorite meal. Filter by category, cuisine, and more to find the perfect recipe.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm mb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 gsap-explore-control">
            <label htmlFor="search" className="block text-sm font-medium text-foreground mb-1">Search</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input
                id="search"
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search recipes..."
                className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground"
              />
            </div>
          </div>
          
          <div className="md:col-span-1 gsap-explore-control">
            <label htmlFor="category" className="block text-sm font-medium text-foreground mb-1">Category</label>
            <div className="relative">
              <select
                id="category"
                value={category}
                onChange={handleCategoryChange}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none text-foreground"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500">
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>

          <div className="md:col-span-1 gsap-explore-control">
            <label htmlFor="cuisine" className="block text-sm font-medium text-foreground mb-1">Cuisine</label>
            <div className="relative">
              <select
                id="cuisine"
                value={cuisine}
                onChange={handleCuisineChange}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none text-foreground"
              >
                <option value="">All Cuisines</option>
                {cuisines.map(cui => (
                  <option key={cui} value={cui}>{cui}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500">
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>

          <div className="md:col-span-1 gsap-explore-control">
            <label htmlFor="sort" className="block text-sm font-medium text-foreground mb-1">Sort By</label>
            <div className="relative">
              <select
                id="sort"
                value={sort}
                onChange={handleSortChange}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none text-foreground"
              >
                <option value="newest">Newest</option>
                <option value="rating">Highest Rated</option>
                <option value="calories">Lowest Calories</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500">
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <RecipeCardSkeleton key={i} />
            ))}
          </div>
        ) : recipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recipes.map(recipe => (
              <div key={recipe._id} className="gsap-explore-card h-full">
                <RecipeCard recipe={recipe} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <svg className="mx-auto h-12 w-12 text-zinc-400 mb-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="m9 9 4 4"/><path d="m13 9-4 4"/></svg>
            <h3 className="text-lg font-medium text-foreground mb-1">No recipes found</h3>
            <p className="text-zinc-500 dark:text-zinc-400">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <button
              onClick={() => {
                updateUrlParams({ search: "", category: "", cuisine: "", sort: "newest", page: "1" });
              }}
              className="mt-6 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-foreground font-medium rounded-lg transition-colors text-sm"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12 pb-8">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-zinc-800 text-foreground transition-colors"
          >
            Previous
          </button>
          
          <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] sm:max-w-none">
            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1;
              const isCurrent = page === currentPage;
              
              // Simple pagination logic for many pages
              if (
                totalPages > 7 && 
                page !== 1 && 
                page !== totalPages && 
                Math.abs(page - currentPage) > 1
              ) {
                if (page === 2 || page === totalPages - 1) {
                  return <span key={page} className="px-1 text-zinc-500">...</span>;
                }
                return null;
              }

              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors flex-shrink-0 ${
                    isCurrent 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-foreground'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-zinc-800 text-foreground transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="container py-12 md:py-16 mx-auto px-4">
        <div className="animate-pulse space-y-8">
          <div className="h-12 w-64 bg-zinc-200 dark:bg-zinc-800 rounded mx-auto mb-4"></div>
          <div className="h-4 w-96 bg-zinc-200 dark:bg-zinc-800 rounded mx-auto"></div>
          
          <div className="h-24 w-full bg-zinc-200 dark:bg-zinc-800 rounded-2xl mt-10"></div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
             {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-80 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
             ))}
          </div>
        </div>
      </div>
    }>
      <ExploreContent />
    </Suspense>
  );
}
