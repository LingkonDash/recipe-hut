import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'About Us | Recipe Hut',
  description: 'Learn about Recipe Hut, our mission, and what makes our platform the best place to discover, cook, and share recipes.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* ── Hero Section ── */}
      <div className="relative overflow-hidden border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-br from-[var(--primary)]/5 via-[var(--accent)]/5 to-[var(--secondary)]/5 py-16 sm:py-24">
        <div className="container mx-auto px-4 max-w-5xl text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[var(--foreground)] mb-6 tracking-tight">
            Our Mission
          </h1>
          <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto leading-relaxed">
            At Recipe Hut, we believe that cooking should be an inspiring and accessible experience for everyone. Our goal is to help people discover, cook, and share incredible recipes while promoting a deeper understanding of nutrition through smart tracking and AI assistance.
          </p>
        </div>
        
        {/* Decorative blobs */}
        <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[var(--primary)]/5 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[var(--accent)]/10 blur-3xl" />
      </div>

      {/* ── What Makes Us Different ── */}
      <div className="py-20 sm:py-28 container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4">
            What Makes Us Different
          </h2>
          <div className="w-24 h-1.5 bg-[var(--accent)] mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Feature 1 */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-3">AI Recipe Assistant</h3>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Stuck on a step or missing an ingredient? Our AI-powered assistant is here to offer real-time substitutions, cooking tips, and flavor pairing suggestions to ensure your dish turns out perfectly every time.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-[var(--secondary)]/10 text-[var(--secondary)] rounded-xl flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><rect width="4" height="7" x="7" y="10" rx="1"/><rect width="4" height="12" x="15" y="5" rx="1"/></svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-3">Nutrition Tracking</h3>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              We go beyond just the ingredients. Every recipe comes with detailed nutritional breakdowns and interactive charts, empowering you to make informed decisions that align with your health and dietary goals.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-[var(--accent)]/10 text-[var(--accent)] rounded-xl flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-3">Community-Driven</h3>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              The heart of Recipe Hut is our vibrant community of home cooks and professional chefs. Share your family secrets, discover unique cultural dishes, and connect over the universal language of food.
            </p>
          </div>
        </div>
      </div>

      {/* ── Narrative Section ── */}
      <div className="bg-zinc-50 dark:bg-zinc-900/50 py-20 border-y border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[var(--foreground)] mb-6">How It Started</h2>
              <div className="space-y-4 text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                <p>
                  Recipe Hut began in a small, messy kitchen when a group of friends realized that finding reliable, well-tested recipes was harder than it should be. The internet was full of endless scrolling, pop-up ads, and life stories before you could even get to the ingredients list.
                </p>
                <p>
                  We wanted to build something better. A platform where the food takes center stage, where nutritional transparency is a standard, and where modern technology like AI is thoughtfully integrated to genuinely assist the cooking process rather than complicate it.
                </p>
                <p>
                  Today, Recipe Hut is a growing community. Whether you are a beginner looking to boil your first egg or an expert crafting a complex soufflé, you belong here.
                </p>
              </div>
              <div className="mt-8">
                <Link 
                  href="/explore" 
                  className="inline-flex items-center justify-center px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white font-semibold rounded-xl transition-colors shadow-sm"
                >
                  Explore Recipes
                </Link>
              </div>
            </div>
            
            {/* Visual element instead of a static image to keep it dynamic and theme-aligned */}
            <div className="relative h-[400px] w-full rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-200 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 shadow-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
               <div className="absolute inset-0 opacity-20 dark:opacity-40 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiM5OTkiLz48L3N2Zz4=')] bg-[length:20px_20px]"></div>
               <div className="relative z-10 p-8 text-center bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
                 <svg className="mx-auto w-16 h-16 text-[var(--primary)] mb-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                 <h3 className="text-2xl font-bold text-[var(--foreground)]">Cook with passion.</h3>
                 <p className="text-zinc-600 dark:text-zinc-400 mt-2">Share with love.</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
