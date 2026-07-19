'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from '@/lib/auth-client';

import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    // Seed demo user on mount
    fetch('/api/auth/demo-seed', { method: 'POST' }).catch(console.error);
  }, []);

  const validate = () => {
    if (!email || !password) return 'All fields are required.';
    if (!/^\S+@\S+\.\S+$/.test(email)) return 'Please enter a valid email address.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    const { error: signInError } = await signIn.email({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message || 'Failed to sign in. Please check your credentials.');
      setLoading(false);
    } else {
      window.location.href = '/';
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    await signIn.social({
      provider: 'google',
      callbackURL: '/',
    });
  };

  const handleDemoAccount = () => {
    setEmail('demo@recipehut.com');
    setPassword('Demo1234!');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-surface p-8 rounded-xl shadow-sm border border-border">
        <div>
          <h2 className="mt-2 text-center text-3xl font-bold text-foreground">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-border bg-transparent text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-3 pr-10 py-2 border border-border bg-transparent text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-foreground-muted hover:text-foreground transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleDemoAccount}
              className="text-sm font-medium text-accent hover:text-accent/80 transition-colors"
            >
              Try Demo Account
            </button>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-surface text-foreground-muted">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading}
              className="w-full flex justify-center py-2 px-4 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-surface hover:bg-background focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
            >
              {googleLoading ? 'Redirecting...' : 'Google'}
            </button>
          </div>
        </div>

        <div className="text-center text-sm">
          <span className="text-foreground-muted">New here? </span>
          <Link href="/register" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
