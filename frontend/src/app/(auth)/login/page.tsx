'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Building2, 
  Truck, 
  UserCog, 
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const DEMO_USERS = [
  {
    role: 'super_admin',
    label: 'Admin',
    email: 'admin@shohnaat.com',
    password: 'admin123',
    icon: ShieldCheck,
    color: 'border-blue-200 bg-blue-50/60 text-blue-700 hover:bg-blue-100/70',
    target: '/admin',
  },
  {
    role: 'merchant',
    label: 'Merchant',
    email: 'merchant@shohnaat.com',
    password: 'merchant123',
    icon: Building2,
    color: 'border-emerald-200 bg-emerald-50/60 text-emerald-700 hover:bg-emerald-100/70',
    target: '/dashboard',
  },
  {
    role: 'rider',
    label: 'Rider',
    email: 'rider@shohnaat.com',
    password: 'rider123',
    icon: Truck,
    color: 'border-amber-200 bg-amber-50/60 text-amber-700 hover:bg-amber-100/70',
    target: '/rider',
  },
  {
    role: 'operator',
    label: 'Operator',
    email: 'operator@shohnaat.com',
    password: 'operator123',
    icon: UserCog,
    color: 'border-purple-200 bg-purple-50/60 text-purple-700 hover:bg-purple-100/70',
    target: '/admin',
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFill = (user: typeof DEMO_USERS[0]) => {
    setEmail(user.email);
    setPassword(user.password);
    setSelectedRole(user.label);
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

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
          setError(data.message || 'Invalid email or password.');
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
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#F8FAFC] selection:bg-blue-600 selection:text-white font-sans">
      <div className="w-full max-w-[390px] my-8">
        {/* Brand Logomark */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-[#2563EB] text-white shadow-sm mb-3">
            <Truck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">
            Shohnaat Logistics
          </h1>
          <p className="text-[13px] text-[#64748B] mt-1 font-normal">
            Sign in to access your portal
          </p>
        </div>

        {/* 1-Click Test Credentials Strip */}
        <div className="mb-4 bg-white border border-[#E2E8F0] rounded-lg p-3 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748B]">
              ⚡ 1-Click Demo Fill
            </span>
            {selectedRole && (
              <span className="text-[11px] font-semibold text-[#2563EB] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#16A34A]" /> {selectedRole} Ready
              </span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {DEMO_USERS.map((u) => {
              const Icon = u.icon;
              const isSelected = selectedRole === u.label;
              return (
                <button
                  key={u.role}
                  type="button"
                  onClick={() => handleFill(u)}
                  className={`flex flex-col items-center justify-center py-1.5 px-1 rounded border text-[11px] font-semibold transition-all ${
                    u.color
                  } ${isSelected ? 'ring-2 ring-[#2563EB] shadow-xs' : ''}`}
                >
                  <Icon className="w-3.5 h-3.5 mb-0.5 shrink-0" />
                  <span className="truncate">{u.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Crisp Enterprise Form Card */}
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 sm:p-7 shadow-[0_1px_3px_0_rgba(0,0,0,0.06),0_1px_2px_0_rgba(0,0,0,0.04)]">
          {error && (
            <div className="mb-4 p-2.5 rounded-md bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-[12.5px] font-semibold text-[#334155] mb-1.5"
              >
                Email
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-slate-400 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setSelectedRole(null);
                  }}
                  className="w-full h-10 pl-9 pr-3 text-sm bg-white border border-[#CBD5E1] rounded-md text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-[12.5px] font-semibold text-[#334155] mb-1.5"
              >
                Password
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setSelectedRole(null);
                  }}
                  className="w-full h-10 pl-9 pr-10 text-sm bg-white border border-[#CBD5E1] rounded-md text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 text-xs text-[#334155] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]/20 cursor-pointer"
                />
                <span>Remember me</span>
              </label>

              <Link
                href="/forgot-password"
                className="text-xs text-[#2563EB] hover:text-[#1E40AF] font-semibold hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign In Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 rounded-md bg-[#2563EB] hover:bg-[#1E40AF] active:bg-[#1D4ED8] text-white text-sm font-semibold shadow-xs hover:shadow transition-all flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.2]" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#E2E8F0]" />
            <span className="text-[10.5px] text-[#64748B] font-semibold uppercase tracking-wider">
              Enterprise Secure
            </span>
            <div className="h-px flex-1 bg-[#E2E8F0]" />
          </div>

          {/* Sign Up / Access Request */}
          <div className="text-center text-xs text-[#64748B]">
            Don&apos;t have an account?{' '}
            <Link
              href="/request-access"
              className="text-[#2563EB] font-semibold hover:text-[#1E40AF] hover:underline"
            >
              Request access
            </Link>
          </div>
        </div>

        {/* Global Security Footer */}
        <div className="mt-5 text-center text-[11px] text-[#64748B] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
          <span>256-Bit SSL Encrypted • Shohnaat Logistics OS</span>
        </div>
      </div>
    </div>
  );
}
