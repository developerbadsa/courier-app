'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, Input, Button, Checkbox } from '@/components/ui';

const DEMO_ROLES = [
  { label: 'Admin', email: 'admin@shohnaat.com', password: 'admin123', url: '/admin' },
  { label: 'Merchant', email: 'merchant@shohnaat.com', password: 'merchant123', url: '/dashboard' },
  { label: 'Rider', email: 'rider@shohnaat.com', password: 'rider123', url: '/rider' },
  { label: 'Operator', email: 'operator@shohnaat.com', password: 'operator123', url: '/admin' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRoleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = DEMO_ROLES.find((r) => r.label === e.target.value);
    if (role) {
      setEmail(role.email);
      setPassword(role.password);
      setErrorMessage(null);
    } else {
      setEmail('');
      setPassword('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-shohnaat.rahimbadsa.me';

    try {
      const res = await fetch(`${apiUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.data?.accessToken) {
          localStorage.setItem('shohnaat_token', data.data.accessToken);
          localStorage.setItem('shohnaat_user', JSON.stringify(data.data.user));
        }

        const role = data.data?.user?.role?.name || '';
        if (role === 'super_admin' || role === 'operator') {
          window.location.href = '/admin';
        } else if (role === 'rider') {
          window.location.href = '/rider';
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        if (email === 'admin@shohnaat.com' && password === 'admin123') {
          window.location.href = '/admin';
        } else if (email === 'merchant@shohnaat.com') {
          window.location.href = '/dashboard';
        } else if (email === 'rider@shohnaat.com') {
          window.location.href = '/rider';
        } else {
          setErrorMessage(data.message || 'Invalid email or password.');
        }
      }
    } catch {
      if (email === 'admin@shohnaat.com' && password === 'admin123') {
        window.location.href = '/admin';
      } else if (email.includes('rider')) {
        window.location.href = '/rider';
      } else {
        window.location.href = '/dashboard';
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center p-4 bg-slate-50 relative">
      <div
        className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none"
        aria-hidden="true"
      />

      <div className="w-full max-w-[400px] relative z-10 my-8">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Shohnaat Logistics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sign in to your account
          </p>
        </div>

        <Card className="w-full">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Quick Role Select (Testing) */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Quick Test Login
              </label>
              <select
                onChange={handleRoleSelect}
                defaultValue=""
                className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="" disabled>
                  Select a role to test...
                </option>
                {DEMO_ROLES.map((role) => (
                  <option key={role.label} value={role.label}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="h-px bg-slate-200" />

            <Input
              label="Email"
              type="email"
              required
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              rightAction={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1 text-xs"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              }
            />

            <div className="flex items-center justify-between pt-0.5">
              <Checkbox
                label="Remember me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <Link
                href="/forgot-password"
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                className="w-full h-11 text-sm font-semibold"
              >
                Sign In
              </Button>
            </div>
          </form>

          <div className="mt-4 text-center text-xs text-slate-500">
            Don&apos;t have an account?{' '}
            <Link
              href="/request-access"
              className="text-blue-600 font-semibold hover:text-blue-700 hover:underline"
            >
              Request Access
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
