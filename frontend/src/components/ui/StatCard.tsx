import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Card } from './Card';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  iconBg?: string;
  change?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
    period?: string;
  };
  subtext?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor = 'text-blue-600',
  iconBg = 'bg-blue-50 border-blue-100',
  change,
  subtext,
  className = '',
}) => {
  return (
    <Card className={`p-5 hover:border-slate-300 transition-colors ${className}`}>
      {/* Top row: Label & Icon */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 tracking-tight">
          {title}
        </span>
        <div
          className={`w-9 h-9 rounded-lg border flex items-center justify-center ${iconBg} ${iconColor} shrink-0`}
        >
          <Icon className="w-4 h-4 stroke-[2]" />
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="mt-3">
        <div className="text-2xl font-bold text-slate-900 tracking-tight">
          {value}
        </div>
      </div>

      {/* Bottom row: Trend pill or Subtext */}
      <div className="mt-3 flex items-center gap-2 text-xs">
        {change && (
          <span
            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-semibold text-[11px] ${
              change.isNeutral
                ? 'bg-slate-100 text-slate-600'
                : change.isPositive
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {change.isNeutral ? (
              <Minus className="w-3 h-3" />
            ) : change.isPositive ? (
              <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
            ) : (
              <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
            )}
            {change.value}
          </span>
        )}

        {change?.period ? (
          <span className="text-slate-400 text-[11px]">{change.period}</span>
        ) : subtext ? (
          <span className="text-slate-500 text-[11px] truncate">{subtext}</span>
        ) : null}
      </div>
    </Card>
  );
};
