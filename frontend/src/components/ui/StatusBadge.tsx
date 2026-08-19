import React from 'react';
import { STATUS_STYLES } from '../../config/theme';

export type ShipmentStatusType = 'DELIVERED' | 'IN_TRANSIT' | 'PENDING' | 'FAILED' | 'CANCELLED';

export interface StatusBadgeProps {
  status: ShipmentStatusType | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const normalizedKey = status.toUpperCase().replace(/\s+/g, '_');
  const style = STATUS_STYLES[normalizedKey] || {
    bg: 'bg-slate-100 text-[#64748B]',
    border: 'border-slate-200',
    label: status,
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style.bg} ${style.border} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {style.label}
    </span>
  );
};
