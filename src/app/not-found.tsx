'use client';

import { useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Search } from 'lucide-react';

export default function NotFound() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Fade + slide-up animation on mount
    gsap.fromTo(
      '.gsap-animate',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
    );
  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      className="min-h-[80vh] flex flex-col items-center justify-center bg-background px-4 text-center"
    >
      <div className="max-w-md w-full space-y-6">
        <div className="gsap-animate flex justify-center">
          <div className="rounded-full bg-secondary/10 p-6 text-secondary border border-secondary/20">
            <Search className="h-12 w-12" />
          </div>
        </div>
        
        <h1 className="gsap-animate text-6xl font-extrabold text-foreground tracking-tight">
          404
        </h1>
        
        <h2 className="gsap-animate text-2xl font-bold text-foreground">
          This recipe wandered off the menu
        </h2>
        
        <p className="gsap-animate text-foreground-muted">
          We could not find the page you were looking for. It might have been deleted, renamed, or perhaps it never existed in our cookbook.
        </p>
        
        <div className="gsap-animate pt-4 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-primary hover:bg-primary/95 text-white font-bold rounded-lg shadow-sm hover:shadow-md transition-all duration-300 text-sm"
          >
            Back to Home
          </Link>
          <Link
            href="/explore"
            className="px-6 py-3 bg-surface hover:bg-background border border-border text-foreground font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-300 text-sm"
          >
            Explore Recipes
          </Link>
        </div>
      </div>
    </div>
  );
}
