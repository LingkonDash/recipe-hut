"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { useState, useEffect, useRef } from "react";
import { UserAvatar } from "@/components/ui/user-avatar";

export function Navbar() {
  const { data: session, isPending } = useSession();
  const pathname = usePathname();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    await signOut();
    window.location.href = "/";
  };

  const isActive = (path: string) => pathname === path;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // userInitial is derived inside UserAvatar — no need to compute it here

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="inline-block font-bold text-xl text-primary">
              Recipe Hut
            </span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/") ? "text-primary font-semibold" : "text-foreground-muted"
              }`}
            >
              Home
            </Link>
            <Link
              href="/explore"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/explore") ? "text-primary font-semibold" : "text-foreground-muted"
              }`}
            >
              Explore
            </Link>
            <Link
              href="/pantry"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/pantry") ? "text-primary font-semibold" : "text-foreground-muted"
              }`}
            >
              Pantry
            </Link>
            <Link
              href="/about"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/about") ? "text-primary font-semibold" : "text-foreground-muted"
              }`}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/contact") ? "text-primary font-semibold" : "text-foreground-muted"
              }`}
            >
              Contact
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Desktop auth area */}
          <div className="hidden md:flex items-center gap-4">
            {!isPending && !session ? (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-primary text-background px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Register
                </Link>
              </>
            ) : !isPending && session ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 rounded-full transition-all hover:ring-2 hover:ring-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  aria-label="User menu"
                  aria-expanded={isDropdownOpen}
                  id="user-menu-button"
                >
                  <UserAvatar
                    name={session.user?.name}
                    email={session.user?.email}
                    image={session.user?.image}
                    size={36}
                  />
                  {/* Chevron */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`text-foreground-muted transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* Desktop dropdown */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-surface shadow-lg py-1 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-medium text-foreground truncate">
                        {session.user?.name || "User"}
                      </p>
                      <p className="text-xs text-foreground-muted truncate mt-0.5">
                        {session.user?.email}
                      </p>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <Link
                        href="/items/add"
                        onClick={() => setIsDropdownOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                          isActive("/items/add")
                            ? "text-primary bg-background font-semibold"
                            : "text-foreground hover:bg-background"
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isActive("/items/add") ? "text-primary" : "text-foreground-muted"}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        Add Recipe
                      </Link>
                      <Link
                        href="/items/manage"
                        onClick={() => setIsDropdownOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                          isActive("/items/manage")
                            ? "text-primary bg-background font-semibold"
                            : "text-foreground hover:bg-background"
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isActive("/items/manage") ? "text-primary" : "text-foreground-muted"}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        Manage Recipes
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                          isActive("/profile")
                            ? "text-primary bg-background font-semibold"
                            : "text-foreground hover:bg-background"
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isActive("/profile") ? "text-primary" : "text-foreground-muted"}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        Profile
                      </Link>
                    </div>

                    {/* Divider + Sign Out */}
                    <div className="border-t border-border pt-1">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-primary hover:bg-background transition-colors text-left"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-20 h-8 rounded-md bg-border animate-pulse"></div>
            )}
          </div>

          {/* Mobile hamburger button */}
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
              {isMobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border p-4 bg-background">
          <nav className="flex flex-col gap-4">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/") ? "text-primary font-semibold" : "text-foreground-muted"
              }`}
            >
              Home
            </Link>
            <Link
              href="/explore"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/explore") ? "text-primary font-semibold" : "text-foreground-muted"
              }`}
            >
              Explore
            </Link>
            <Link
              href="/pantry"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/pantry") ? "text-primary font-semibold" : "text-foreground-muted"
              }`}
            >
              Pantry
            </Link>
            <Link
              href="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/about") ? "text-primary font-semibold" : "text-foreground-muted"
              }`}
            >
              About
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/contact") ? "text-primary font-semibold" : "text-foreground-muted"
              }`}
            >
              Contact
            </Link>

            <div className="h-px bg-border my-2" />

            {!isPending && !session ? (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm font-medium text-center p-2 rounded-md border border-border"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-primary text-background text-sm font-medium text-center p-2 rounded-md"
                >
                  Register
                </Link>
              </div>
            ) : !isPending && session ? (
              <div className="flex flex-col gap-1">
                {/* User info */}
                <div className="flex items-center gap-3 px-1 py-2 mb-2">
                  <UserAvatar
                    name={session.user?.name}
                    email={session.user?.email}
                    image={session.user?.image}
                    size={36}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {session.user?.name || "User"}
                    </p>
                    <p className="text-xs text-foreground-muted truncate">
                      {session.user?.email}
                    </p>
                  </div>
                </div>

                <Link
                  href="/items/add"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-2 py-2.5 text-sm font-medium transition-colors rounded-md ${
                    isActive("/items/add")
                      ? "text-primary bg-surface font-semibold"
                      : "text-foreground hover:bg-surface"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isActive("/items/add") ? "text-primary" : "text-foreground-muted"}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  Add Recipe
                </Link>
                <Link
                  href="/items/manage"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-2 py-2.5 text-sm font-medium transition-colors rounded-md ${
                    isActive("/items/manage")
                      ? "text-primary bg-surface font-semibold"
                      : "text-foreground hover:bg-surface"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isActive("/items/manage") ? "text-primary" : "text-foreground-muted"}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  Manage Recipes
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-2 py-2.5 text-sm font-medium transition-colors rounded-md ${
                    isActive("/profile")
                      ? "text-primary bg-surface font-semibold"
                      : "text-foreground hover:bg-surface"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isActive("/profile") ? "text-primary" : "text-foreground-muted"}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  Profile
                </Link>

                <div className="h-px bg-border my-1" />

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-2 py-2.5 text-sm font-medium text-primary hover:bg-surface transition-colors text-left rounded-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                  Sign Out
                </button>
              </div>
            ) : null}
          </nav>
        </div>
      )}
    </header>
  );
}
