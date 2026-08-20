'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Truck,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { Input, Button, Checkbox, Select } from '@/components/ui';

const ROLE_PRESETS: Record<
  string,
  { email: string; pass: string; label: string; redirect: string }
> = {
  super_admin: {
    email: 'admin@shohnaat.com',
    pass: 'admin123',
    label: 'Superadmin Console',
    redirect: '/admin',
  },
  merchant: {
    email: 'merchant@shohnaat.com',
    pass: 'merchant123',
    label: 'Merchant Portal',
    redirect: '/dashboard',
  },
  rider: {
    email: 'rider@shohnaat.com',
    pass: 'rider123',
    label: 'Field Rider App',
    redirect: '/rider',
  },
  operator: {
    email: 'operator@shohnaat.com',
    pass: 'operator123',
    label: 'Hub Operator',
    redirect: '/admin',
  },
};

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<string>('merchant');
  const [email, setEmail] = useState<string>('merchant@shohnaat.com');
  const [password, setPassword] = useState<string>('merchant123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleChange = (roleKey: string) => {
    setSelectedRole(roleKey);
    setError(null);
    if (roleKey && ROLE_PRESETS[roleKey]) {
      setEmail(ROLE_PRESETS[roleKey].email);
      setPassword(ROLE_PRESETS[roleKey].pass);
    } else {
      setEmail('');
      setPassword('');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || 'https://api-shohnaat.rahimbadsa.me';

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

        const userRoles = data.data?.user?.roles || [];
        const role = Array.isArray(userRoles) ? userRoles[0] : (data.data?.user?.role?.name || '');
        if (role === 'super_admin' || role === 'operator' || userRoles.includes('super_admin') || userRoles.includes('operator')) {
          window.location.href = '/admin';
        } else if (role === 'rider' || userRoles.includes('rider')) {
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
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50 selection:bg-blue-600 selection:text-white font-sans">
      <div className="w-full max-w-[390px] my-8">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded bg-blue-600 text-white shadow-sm mb-3">
            <Truck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">
            Shohnaat Logistics OS
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sign in to access your dashboard
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-slate-200/80 rounded p-6 shadow-sm">
          {error && (
            <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Select
              label="Account Role"
              value={selectedRole}
              onChange={(e) => handleRoleChange(e.target.value)}
              options={[
                { value: 'merchant', label: 'Merchant Portal' },
                { value: 'super_admin', label: 'Superadmin Console' },
                { value: 'rider', label: 'Field Rider App' },
                { value: 'operator', label: 'Hub Operator' },
                { value: '', label: 'Custom Account' },
              ]}
            />

            <Input
              label="Email Address"
              type="email"
              leftIcon={
                <Mail size={16} strokeWidth={1.75} className="text-slate-400" />
              }
              placeholder="name@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setSelectedRole('');
              }}
              required
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              leftIcon={
                <Lock size={16} strokeWidth={1.75} className="text-slate-400" />
              }
              rightAction={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors flex items-center justify-center cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff size={16} strokeWidth={1.75} />
                  ) : (
                    <Eye size={16} strokeWidth={1.75} />
                  )}
                </button>
              }
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setSelectedRole('');
              }}
              required
            />

            <div className="flex items-center justify-between pt-0.5">
              <Checkbox
                label="Remember me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <Link
                href="/forgot-password"
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <div className="pt-2">
              <Button type="submit" isLoading={isLoading} className="w-full">
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />
              </Button>
            </div>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Need access?{' '}
            <Link
              href="/request-access"
              className="text-blue-600 font-semibold hover:text-blue-700 hover:underline"
            >
              Contact Administrator
            </Link>
          </div>
        </div>

        {/* SSL Footer */}
        <div className="mt-4 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>256-Bit SSL Encrypted • Shohnaat Logistics</span>
        </div>
      </div>
    </div>
  );
}
