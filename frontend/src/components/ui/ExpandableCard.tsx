'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card } from './Card';

export interface ExpandableCardProps {
  /** Main title / identifier */
  title: React.ReactNode;
  /** Subtitle or secondary meta text */
  subtitle?: React.ReactNode;
  /** Optional icon displayed in a rounded badge on the left */
  icon?: React.ReactNode;
  /** Right side metric or price highlight */
  highlight?: React.ReactNode;
  /** Subtext under the right side highlight */
  highlightSubtext?: React.ReactNode;
  /** Action buttons displayed in the collapsed header (e.g., download button) */
  headerActions?: React.ReactNode;
  /** Status badge or tags */
  badge?: React.ReactNode;
  /** Children content revealed when expanded */
  children: React.ReactNode;
  /** Initial expanded state */
  defaultExpanded?: boolean;
  /** Controlled expanded state */
  isExpanded?: boolean;
  /** Callback when expanded state changes */
  onToggle?: (expanded: boolean) => void;
  /** Additional CSS class names */
  className?: string;
}

export function ExpandableCard({
  title,
  subtitle,
  icon,
  highlight,
  highlightSubtext,
  headerActions,
  badge,
  children,
  defaultExpanded = false,
  isExpanded: controlledExpanded,
  onToggle,
  className = '',
}: ExpandableCardProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  const handleToggle = () => {
    const nextState = !isExpanded;
    if (controlledExpanded === undefined) {
      setInternalExpanded(nextState);
    }
    onToggle?.(nextState);
  };

  return (
    <Card className={`p-5 hover:border-slate-300 transition-all border-slate-200 bg-white shadow-sm ${className}`}>
      {/* ── Collapsed Header Row ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          {icon && (
            <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
              {icon}
            </div>
          )}
          <div className="space-y-0.5">
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-bold text-slate-900 tracking-tight">{title}</span>
              {badge}
            </div>
            {subtitle && (
              <div className="text-xs text-slate-500 flex items-center gap-3">
                {subtitle}
              </div>
            )}
          </div>
        </div>

        {/* ── Highlight & Action Bar ── */}
        <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
          {(highlight || highlightSubtext) && (
            <div className="text-left sm:text-right">
              {highlight && <div className="text-lg font-black text-slate-900 leading-none">{highlight}</div>}
              {highlightSubtext && <div className="text-[10px] font-semibold text-slate-400 mt-1">{highlightSubtext}</div>}
            </div>
          )}

          <div className="flex items-center gap-2">
            {headerActions}
            <button
              type="button"
              onClick={handleToggle}
              className={`h-8 px-2.5 rounded-md border text-xs font-semibold flex items-center gap-1 transition-all ${
                isExpanded
                  ? 'bg-slate-100 border-slate-300 text-slate-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              aria-label="Toggle card details"
            >
              <span>{isExpanded ? 'Hide' : 'Details'}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Expandable Body ── */}
      {isExpanded && (
        <div className="mt-5 pt-4 border-t border-slate-100 animate-in fade-in duration-200 space-y-4">
          {children}
        </div>
      )}
    </Card>
  );
}
