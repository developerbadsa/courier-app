import React from 'react';
import {
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Package,
  ArrowRight,
  RotateCcw,
  Ban,
  DollarSign,
  AlertTriangle,
  Circle,
  Loader2,
  MapPin,
  BoxSelect,
  ShieldCheck,
} from 'lucide-react';

export type ShipmentStatusType =
  | 'PENDING'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'FAILED'
  | 'CANCELLED'
  | 'RETURNED'
  | 'PAID'
  | 'UNPAID'
  | 'ASSIGNED'
  | 'COMPLETED'
  | 'ACTIVE'
  | 'ON_DUTY'
  | 'OFF_DUTY';

interface StatusBadgeProps {
  status: ShipmentStatusType | string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  /** Show a subtle pulse animation on active/dynamic statuses */
  pulse?: boolean;
}

/* ─────────────────────────────────────────────────────────────────
 *  Status configuration — each status gets a unique visual identity
 * ───────────────────────────────────────────────────────────────── */
const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    /** Solid background color */
    bg: string;
    /** Text color */
    text: string;
    /** Left accent bar color */
    accent: string;
    /** Icon component */
    icon: React.ComponentType<{ className?: string }>;
    /** Whether to show a subtle pulse */
    pulse: boolean;
  }
> = {
  PENDING: {
    label: 'Pending',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    accent: 'bg-amber-400',
    icon: Clock,
    pulse: true,
  },
  ASSIGNED: {
    label: 'Assigned',
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    accent: 'bg-cyan-400',
    icon: BoxSelect,
    pulse: false,
  },
  PICKED_UP: {
    label: 'Picked Up',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    accent: 'bg-indigo-400',
    icon: Package,
    pulse: false,
  },
  IN_TRANSIT: {
    label: 'In Transit',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    accent: 'bg-blue-500',
    icon: Truck,
    pulse: true,
  },
  OUT_FOR_DELIVERY: {
    label: 'Out for Delivery',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    accent: 'bg-sky-500',
    icon: MapPin,
    pulse: true,
  },
  DELIVERED: {
    label: 'Delivered',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    accent: 'bg-emerald-500',
    icon: CheckCircle2,
    pulse: false,
  },
  COMPLETED: {
    label: 'Completed',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    accent: 'bg-emerald-500',
    icon: CheckCircle2,
    pulse: false,
  },
  FAILED: {
    label: 'Failed',
    bg: 'bg-red-50',
    text: 'text-red-700',
    accent: 'bg-red-500',
    icon: XCircle,
    pulse: false,
  },
  CANCELLED: {
    label: 'Cancelled',
    bg: 'bg-slate-100',
    text: 'text-slate-500',
    accent: 'bg-slate-400',
    icon: Ban,
    pulse: false,
  },
  RETURNED: {
    label: 'Returned',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    accent: 'bg-purple-400',
    icon: RotateCcw,
    pulse: false,
  },
  PAID: {
    label: 'Paid',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    accent: 'bg-emerald-500',
    icon: ShieldCheck,
    pulse: false,
  },
  UNPAID: {
    label: 'Unpaid',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    accent: 'bg-amber-400',
    icon: AlertTriangle,
    pulse: true,
  },
  ACTIVE: {
    label: 'Active',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    accent: 'bg-emerald-500',
    icon: Circle,
    pulse: true,
  },
  ON_DUTY: {
    label: 'On Duty',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    accent: 'bg-emerald-500',
    icon: CheckCircle2,
    pulse: false,
  },
  OFF_DUTY: {
    label: 'Off Duty',
    bg: 'bg-slate-100',
    text: 'text-slate-500',
    accent: 'bg-slate-400',
    icon: Circle,
    pulse: false,
  },
};

const DEFAULT_CONFIG = {
  label: 'Unknown',
  bg: 'bg-slate-50',
  text: 'text-slate-600',
  accent: 'bg-slate-400',
  icon: Circle,
  pulse: false,
};

/* ─────────────────────────────────────────────────────────────────
 *  Size configurations
 * ───────────────────────────────────────────────────────────────── */
const SIZE_CONFIG = {
  xs: {
    wrapper: 'px-1.5 py-[3px] gap-1',
    icon: 'w-2.5 h-2.5',
    text: 'text-[10px] leading-none',
    bar: 'w-[2px] h-2.5',
  },
  sm: {
    wrapper: 'px-2 py-[3px] gap-1.5',
    icon: 'w-3 h-3',
    text: 'text-[11px] leading-none',
    bar: 'w-[2px] h-3',
  },
  md: {
    wrapper: 'px-2.5 py-1 gap-1.5',
    icon: 'w-3.5 h-3.5',
    text: 'text-xs leading-none',
    bar: 'w-[2px] h-3.5',
  },
};

/* ─────────────────────────────────────────────────────────────────
 *  StatusBadge Component
 * ───────────────────────────────────────────────────────────────── */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'sm',
  className = '',
  pulse,
}) => {
  const normalizedKey = status.toUpperCase().replace(/[\s-]+/g, '_');
  const config = STATUS_CONFIG[normalizedKey] ?? {
    ...DEFAULT_CONFIG,
    label: status,
  };
  const sizeConfig = SIZE_CONFIG[size];
  const shouldPulse = pulse ?? config.pulse;
  const Icon = config.icon;

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded
        ${config.bg} ${config.text}
        ${sizeConfig.wrapper}
        ${className}
      `}
    >
      {/* Left accent bar */}
      <span
        className={`
          ${sizeConfig.bar} rounded-full shrink-0
          ${config.accent}
          ${shouldPulse ? 'animate-pulse' : ''}
        `}
      />

      {/* Icon */}
      <Icon className={`${sizeConfig.icon} shrink-0 opacity-70`} />

      {/* Label */}
      <span className={`${sizeConfig.text} font-semibold whitespace-nowrap`}>
        {config.label}
      </span>
    </span>
  );
};
