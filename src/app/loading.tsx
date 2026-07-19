'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ChefHat } from 'lucide-react';

export default function Loading() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Fade and scale in on mount
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }
    );
  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
    >
      <div className="flex flex-col items-center gap-4">
        {/* Pulsing icon using primary color */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping h-16 w-16" />
          <div className="relative rounded-full bg-primary/10 p-4 border border-primary/20">
            <ChefHat className="h-8 w-8 text-primary animate-pulse" />
          </div>
        </div>
        <p className="text-sm font-medium text-foreground-muted tracking-wider animate-pulse">
          Preparing delicious things...
        </p>
      </div>
    </div>
  );
}
