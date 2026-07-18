import type { Metadata } from 'next';
import { ContactForm } from '@/components/ui/contact-form';

export const metadata: Metadata = {
  title: 'Contact Us | Recipe Hut',
  description: 'Get in touch with the Recipe Hut team for support, feedback, or inquiries.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* ── Page Header ── */}
      <div className="bg-zinc-50 dark:bg-zinc-900/50 py-16 border-b border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--foreground)] mb-4">Contact Us</h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Have a question, feedback, or just want to say hello? We&apos;d love to hear from you. Fill out the form below and we&apos;ll get back to you as soon as possible.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info Block */}
          <div className="lg:col-span-1 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">Get in Touch</h2>
              <div className="space-y-6">
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider mb-1">Email</h3>
                    <p className="text-zinc-600 dark:text-zinc-400">support@recipehut.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[var(--secondary)]/10 text-[var(--secondary)] rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider mb-1">Hours</h3>
                    <p className="text-zinc-600 dark:text-zinc-400">Support available Mon-Fri<br/>9:00 AM - 6:00 PM (EST)</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[var(--accent)]/10 text-[var(--accent)] rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider mb-1">Location</h3>
                    <p className="text-zinc-600 dark:text-zinc-400">San Francisco, CA<br/>United States</p>
                  </div>
                </div>

              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider mb-4">Follow Us</h3>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-zinc-100 hover:bg-[var(--primary)] hover:text-white dark:bg-zinc-800 text-zinc-500 rounded-full flex items-center justify-center transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-zinc-100 hover:bg-[var(--primary)] hover:text-white dark:bg-zinc-800 text-zinc-500 rounded-full flex items-center justify-center transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-zinc-100 hover:bg-[var(--primary)] hover:text-white dark:bg-zinc-800 text-zinc-500 rounded-full flex items-center justify-center transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">Send us a Message</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
