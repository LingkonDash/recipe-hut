"use client";

import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { useSession, signOut } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { data: session, isPending } = useSession();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-[var(--background)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="inline-block font-bold text-xl text-[var(--primary)]">
              Recipe Hut
            </span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-[var(--primary)]"
            >
              Home
            </Link>
            <Link
              href="/explore"
              className="text-sm font-medium transition-colors hover:text-[var(--primary)] text-muted-foreground"
            >
              Explore
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium transition-colors hover:text-[var(--primary)] text-muted-foreground"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium transition-colors hover:text-[var(--primary)] text-muted-foreground"
            >
              Contact
            </Link>
            {session && (
              <>
                <Link
                  href="/add-recipe"
                  className="text-sm font-medium transition-colors hover:text-[var(--primary)] text-muted-foreground"
                >
                  Add Recipe
                </Link>
                <Link
                  href="/manage-recipes"
                  className="text-sm font-medium transition-colors hover:text-[var(--primary)] text-muted-foreground"
                >
                  Manage Recipes
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          <div className="hidden md:flex items-center gap-4">
            {!isPending && !session ? (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium hover:text-[var(--primary)] transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-[var(--primary)] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors"
                >
                  Register
                </Link>
              </>
            ) : !isPending && session ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold">
                    {session.user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="text-sm font-medium">{session.user?.name}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="w-20 h-8 rounded-md bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
            )}
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t p-4 bg-[var(--background)]">
          <nav className="flex flex-col gap-4">
            <Link href="/" className="text-sm font-medium">
              Home
            </Link>
            <Link href="/explore" className="text-sm font-medium">
              Explore
            </Link>
            <Link href="/about" className="text-sm font-medium">
              About
            </Link>
            <Link href="/contact" className="text-sm font-medium">
              Contact
            </Link>
            
            {session && (
              <>
                <Link href="/add-recipe" className="text-sm font-medium">
                  Add Recipe
                </Link>
                <Link href="/manage-recipes" className="text-sm font-medium">
                  Manage Recipes
                </Link>
              </>
            )}

            <div className="h-px bg-neutral-200 dark:bg-neutral-800 my-2" />
            
            {!isPending && !session ? (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  className="text-sm font-medium text-center p-2 rounded-md border"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-[var(--primary)] text-white text-sm font-medium text-center p-2 rounded-md"
                >
                  Register
                </Link>
              </div>
            ) : !isPending && session ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold">
                    {session.user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="text-sm font-medium">{session.user?.name}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-sm font-medium text-red-500 text-left"
                >
                  Logout
                </button>
              </div>
            ) : null}
          </nav>
        </div>
      )}
    </header>
  );
}
