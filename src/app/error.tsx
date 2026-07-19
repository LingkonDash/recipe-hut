'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { AlertCircle } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('NextJS Error Boundary caught:', error);
  }, [error]);

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
          <div className="rounded-full bg-red-500/10 p-6 text-red-500 border border-red-500/20">
            <AlertCircle className="h-12 w-12" />
          </div>
        </div>
        
        <h1 className="gsap-animate text-3xl font-extrabold text-foreground tracking-tight">
          Something went wrong!
        </h1>
        
        <p className="gsap-animate text-foreground-muted">
          We encountered an unexpected error while preparing this page. Do not worry, our kitchen staff has been notified.
        </p>
        
        <div className="gsap-animate pt-4 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-primary hover:bg-primary/95 text-white font-bold rounded-lg shadow-sm hover:shadow-md transition-all duration-300 text-sm focus:outline-none"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-surface hover:bg-background border border-border text-foreground font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-300 text-sm"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
