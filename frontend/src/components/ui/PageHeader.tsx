import React from 'react';
import { Plus } from 'lucide-react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actionLabel,
  onAction,
  actionIcon = <Plus className="w-4 h-4 stroke-[2.5]" />,
  children,
  className = '',
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${className}`}>
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm font-normal text-slate-500 mt-1">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {children}

        {actionLabel && (
          <button
            onClick={onAction}
            className="inline-flex items-center justify-center gap-2 bg-[#1D68F2] hover:bg-blue-700 text-white text-sm font-semibold px-4.5 py-2.5 rounded shadow-sm shadow-blue-600/20 transition-all active:scale-98 cursor-pointer shrink-0"
          >
            {actionIcon}
            <span>{actionLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
};
