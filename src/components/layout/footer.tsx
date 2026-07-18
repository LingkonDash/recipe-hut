import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[var(--background)] border-t py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="font-bold text-2xl text-[var(--primary)]">
                Recipe Hut
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 opacity-80">
              Discover, share, and savor the best recipes from around the world.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4 text-[var(--secondary)]">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm hover:text-[var(--primary)] transition-colors opacity-80 hover:opacity-100">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/explore" className="text-sm hover:text-[var(--primary)] transition-colors opacity-80 hover:opacity-100">
                  Explore
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm hover:text-[var(--primary)] transition-colors opacity-80 hover:opacity-100">
                  About
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4 text-[var(--secondary)]">
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-sm hover:text-[var(--primary)] transition-colors opacity-80 hover:opacity-100">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm hover:text-[var(--primary)] transition-colors opacity-80 hover:opacity-100">
                  Login / Register
                </Link>
              </li>
              <li className="text-sm opacity-80">
                hello@recipehut.example.com
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4 text-[var(--secondary)]">
              Follow Us
            </h3>
            <div className="flex space-x-4">
              <a href="#" className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center hover:bg-[var(--accent)] hover:text-white transition-colors" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center hover:bg-[var(--accent)] hover:text-white transition-colors" aria-label="Twitter">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center hover:bg-[var(--accent)] hover:text-white transition-colors" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t text-center text-sm opacity-60">
          <p>&copy; {new Date().getFullYear()} Recipe Hut. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
