'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  handleGoBack = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded border border-slate-200 shadow-sm p-8 text-center">
            <div className="w-14 h-14 rounded bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 mb-2">Something went wrong</h1>
            <p className="text-[13px] text-slate-500 mb-6 leading-relaxed">
              An unexpected error occurred. Please try again or return to the homepage.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-slate-50 rounded border border-slate-200 text-left">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Error Details
                </div>
                <code className="text-[12px] text-red-600 break-all block font-mono">
                  {this.state.error.message}
                </code>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-[11px] text-slate-500 cursor-pointer hover:text-slate-700">
                      Stack Trace
                    </summary>
                    <pre className="text-[10px] text-slate-500 mt-1 overflow-auto max-h-32 font-mono whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleGoBack}
                className="flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Go Back
              </button>
              <button
                onClick={this.handleRetry}
                className="flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-white bg-primary rounded hover:bg-primary-hover transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/* ── Inline Error Fallback (for sections) ── */
export const SectionError: React.FC<{ message?: string; onRetry?: () => void }> = ({
  message = 'Failed to load this section.',
  onRetry,
}) => (
  <div className="p-8 text-center bg-white rounded border border-slate-200">
    <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
    <p className="text-[13px] text-slate-500 mb-4">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold text-primary bg-primary/5 border border-primary/20 rounded hover:bg-primary/10 transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" /> Retry
      </button>
    )}
  </div>
);

/* ── Empty State Component ── */
export const EmptyState: React.FC<{
  icon?: React.ComponentType<{ className?: string }>;
  title?: string;
  message?: string;
  action?: React.ReactNode;
}> = ({
  icon: Icon,
  title = 'No data found',
  message = 'There are no records to display.',
  action,
}) => (
  <div className="py-16 text-center">
    {Icon && (
      <div className="w-12 h-12 rounded bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-3">
        <Icon className="w-6 h-6 text-slate-300" />
      </div>
    )}
    <p className="text-[13px] font-medium text-slate-500">{title}</p>
    <p className="text-[12px] text-slate-400 mt-1">{message}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);

/* ── Loading Skeleton ── */
export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-3 animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4">
        <div className="w-8 h-8 rounded bg-slate-100" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-slate-100 rounded w-1/3" />
          <div className="h-2.5 bg-slate-50 rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);
