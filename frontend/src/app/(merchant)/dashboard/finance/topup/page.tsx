'use client';

import React, { useState } from 'react';
import {
  Wallet, CreditCard, ArrowLeft, DollarSign, CheckCircle, Shield,
  ExternalLink, AlertTriangle, Zap, Banknote,
} from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout';
import { Button, Card, Input, Badge } from '@/components/ui';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
type PaymentMethod = 'stripe' | 'paypal' | 'sandbox';

interface TopUpResult {
  success: boolean;
  transactionId: string;
  amount: number;
  method: PaymentMethod;
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
export default function TopUpPage() {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('sandbox');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TopUpResult | null>(null);

  const presetAmounts = [25, 50, 100, 250, 500, 1000];

  const handleTopUp = async () => {
    const value = parseFloat(amount);
    if (!value || value < 1) return;

    setLoading(true);

    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));

    if (method === 'sandbox') {
      // Sandbox: instant credit
      setResult({
        success: true,
        transactionId: `sbx_${Date.now().toString(36)}`,
        amount: value,
        method: 'sandbox',
      });
    } else if (method === 'stripe') {
      // In production: would redirect to Stripe Checkout
      setResult({
        success: true,
        transactionId: `pi_sandbox_${Date.now().toString(36)}`,
        amount: value,
        method: 'stripe',
      });
    } else {
      // In production: would redirect to PayPal
      setResult({
        success: true,
        transactionId: `PAYID-sandbox-${Date.now().toString(36)}`,
        amount: value,
        method: 'paypal',
      });
    }

    setLoading(false);
  };

  // Success screen
  if (result) {
    return (
      <DashboardLayout role="merchant" title="Payment Complete" subtitle="Your wallet has been credited">
        <Card className="p-8 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Wallet Top-Up Successful</h2>
          <div className="text-3xl font-bold text-emerald-600 mt-2">${result.amount.toFixed(2)}</div>
          <div className="text-xs text-slate-500 mt-1">USD credited to your wallet</div>
          <div className="mt-4 p-3 bg-slate-50 rounded border border-slate-200 text-left">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">Transaction ID</span>
              <span className="font-mono font-semibold text-slate-800">{result.transactionId}</span>
            </div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">Method</span>
              <span className="font-semibold text-slate-800 uppercase">{result.method}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Status</span>
              <span className="font-semibold text-emerald-600">Completed</span>
            </div>
          </div>
          <div className="flex gap-3 mt-6 justify-center">
            <Link href="/dashboard/finance">
              <Button variant="outline" size="sm">View Ledger</Button>
            </Link>
            <Button variant="primary" size="sm" onClick={() => { setResult(null); setAmount(''); }}>
              Top Up Again
            </Button>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="merchant" title="Top Up Wallet" subtitle="Add funds for prepaid shipping or settle outstanding balances">
      <div className="mb-2">
        <Link href="/dashboard/finance" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Back to Finance
        </Link>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Payment Method Selection */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3">Payment Method</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: 'sandbox', label: 'Test Mode', icon: Zap, desc: 'Instant (sandbox)', badge: 'TEST' },
              { key: 'stripe', label: 'Credit Card', icon: CreditCard, desc: 'Visa, Mastercard, AMEX', badge: 'STRIPE' },
              { key: 'paypal', label: 'PayPal', icon: Banknote, desc: 'Pay with PayPal', badge: 'PAYPAL' },
            ].map(({ key, label, icon: Icon, desc, badge }) => (
              <button
                key={key}
                onClick={() => setMethod(key as PaymentMethod)}
                className={`p-4 rounded border-2 text-left transition-all ${
                  method === key
                    ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600/10'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-5 h-5 ${method === key ? 'text-blue-600' : 'text-slate-400'}`} />
                  <Badge variant={method === key ? 'blue' : 'default'} size="sm">{badge}</Badge>
                </div>
                <div className={`text-xs font-bold ${method === key ? 'text-blue-700' : 'text-slate-800'}`}>{label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3">Amount (USD)</h3>
          <Input
            type="number"
            placeholder="Enter amount..."
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            leftIcon={<DollarSign className="w-4 h-4" />}
            className="text-lg font-bold"
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {presetAmounts.map((preset) => (
              <button
                key={preset}
                onClick={() => setAmount(String(preset))}
                className={`px-4 py-2 text-xs font-semibold rounded border transition-colors ${
                  amount === String(preset)
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                ${preset}
              </button>
            ))}
          </div>
        </div>

        {/* Sandbox Notice */}
        {method === 'sandbox' && (
          <div className="p-4 bg-amber-50 rounded border border-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-amber-700">Sandbox / Test Mode</div>
              <div className="text-[11px] text-amber-600 mt-0.5">
                No real payment will be processed. Funds are credited instantly for testing purposes. Use test mode to verify your financial ledger before going live.
              </div>
            </div>
          </div>
        )}

        {/* Security Notice */}
        {method !== 'sandbox' && (
          <div className="p-4 bg-slate-50 rounded border border-slate-200 flex items-start gap-3">
            <Shield className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-slate-700">Secure Payment</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Payments are processed through {method === 'stripe' ? 'Stripe' : 'PayPal'} with industry-standard encryption. We never store your card details.
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={loading}
          disabled={!amount || parseFloat(amount) < 1}
          onClick={handleTopUp}
          leftIcon={<Wallet className="w-4 h-4" />}
        >
          {method === 'sandbox'
            ? `Test Top-Up $${amount || '0'}`
            : `Pay $${amount || '0'} via ${method === 'stripe' ? 'Stripe' : 'PayPal'}`}
        </Button>

        {/* Payment Provider Logos */}
        <div className="flex items-center justify-center gap-6 pt-2">
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Powered by</span>
          <span className="text-xs font-bold text-slate-400">Stripe</span>
          <span className="text-xs font-bold text-slate-400">PayPal</span>
        </div>
      </div>
    </DashboardLayout>
  );
}
