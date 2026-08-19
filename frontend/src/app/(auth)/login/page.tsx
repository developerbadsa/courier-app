'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Card, Input, Button, Checkbox } from '@/components/ui';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login redirect for demo
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 600);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#F4F7FB] selection:bg-primary-light selection:text-primary-dark relative">
      {/* Subtle background ambient mesh glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(219,234,254,0.45),rgba(244,247,251,1))] pointer-events-none" />

      {/* Floating Card with top-right ambient glow */}
      <Card withGlow className="w-full max-w-[400px] z-10">
        {/* Brand Header */}
        <div className="text-center">
          <h1 className="text-[13px] font-bold tracking-[0.18em] text-[#0F172A] uppercase font-sans">
            SHOHNAAT
          </h1>
          <p className="text-[13.5px] text-[#64748B] font-normal mt-1.5">
            Sign in to your account
          </p>
        </div>

        {/* Form Elements */}
        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <Input
            label="Email"
            type="email"
            required
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4 stroke-[1.75]" />}
          />

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4 stroke-[1.75]" />}
            rightAction={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 stroke-[1.75]" />
                ) : (
                  <Eye className="w-4 h-4 stroke-[1.75]" />
                )}
              </button>
            }
          />

          {/* Options Row */}
          <div className="flex items-center justify-between pt-1">
            <Checkbox
              label="Remember me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />

            <Link
              href="/forgot-password"
              className="text-[13px] text-[#2563EB] hover:text-[#1E40AF] font-medium transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Sign In Action */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full"
            >
              Sign In
            </Button>
          </div>
        </form>

        {/* Divider */}
        <div className="my-6 h-px w-full bg-[#E2E8F0]" />

        {/* Footer */}
        <div className="text-center text-[13px] text-[#64748B]">
          Don&apos;t have an account?{' '}
          <Link
            href="/request-access"
            className="text-[#2563EB] font-medium hover:text-[#1E40AF] transition-colors hover:underline"
          >
            Request access
          </Link>
        </div>
      </Card>
    </div>
  );
}
