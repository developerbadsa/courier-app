/**
 * ============================================================
 * SHOHNAAT LOGISTICS — CENTRAL DESIGN SYSTEM & COLOR PALETTE
 * Single Source of Truth for Colors, Typography, and Tokens
 * ============================================================
 */

export const THEME_COLORS = {
  // 1. Primary Colors
  primary: {
    DEFAULT: '#2563EB', // Primary Blue: Buttons, links, active states
    dark: '#1E40AF',    // Primary Dark: Hover states
    light: '#DBEAFE',   // Primary Light: Backgrounds, badges
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#2563EB',
    600: '#1D4ED8',
    700: '#1E40AF',
    800: '#1E3A8A',
    900: '#172554',
  },

  // 2. Neutral Colors
  neutral: {
    darkNavy: '#0F172A', // Dark Navy: Sidebar, headers, title branding
    slate700: '#334155', // Slate 700: Body text, form labels
    slate500: '#64748B', // Slate 500: Secondary text, subtitles
    slate200: '#E2E8F0', // Slate 200: Borders, dividers
    slate50: '#F8FAFC',  // Slate 50: Page background
  },

  // 3. Status Colors
  status: {
    delivered: '#16A34A', // Green: Delivered, Success
    success: '#16A34A',
    inTransit: '#2563EB', // Blue: In Transit
    transit: '#2563EB',
    pending: '#F59E0B',   // Amber: Pending, Warning
    warning: '#F59E0B',
    failed: '#EF4444',    // Red: Failed, Error
    error: '#EF4444',
    cancelled: '#9CA3AF', // Gray: Cancelled, Inactive
    gray: '#9CA3AF',
  },

  // 4. Accent Colors
  accent: {
    purple: '#8B5CF6',    // Premium, Developer API
    teal: '#14B8A6',      // Financial, COD Calculations
  },

  // 5. Surface & UI Elements
  surface: {
    pageBg: '#F4F7FB',     // Soft ambient page background
    cardBg: '#FFFFFF',     // Clean floating card
    inputBg: '#F0F5FF',    // Soft ice-blue input tint (Figma matched)
    inputBorder: '#E0EAFF',// Soft input border
    divider: '#E2E8F0',    // Clean divider
  },
} as const;

export type ThemeColors = typeof THEME_COLORS;

// Helper mappings for statuses
export const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  DELIVERED: {
    bg: 'bg-emerald-50 text-[#16A34A]',
    text: 'text-[#16A34A]',
    border: 'border-emerald-200',
    label: 'Delivered',
  },
  IN_TRANSIT: {
    bg: 'bg-blue-50 text-[#2563EB]',
    text: 'text-[#2563EB]',
    border: 'border-blue-200',
    label: 'In Transit',
  },
  PENDING: {
    bg: 'bg-amber-50 text-[#F59E0B]',
    text: 'text-[#F59E0B]',
    border: 'border-amber-200',
    label: 'Pending',
  },
  FAILED: {
    bg: 'bg-rose-50 text-[#EF4444]',
    text: 'text-[#EF4444]',
    border: 'border-rose-200',
    label: 'Failed',
  },
  CANCELLED: {
    bg: 'bg-slate-100 text-[#9CA3AF]',
    text: 'text-[#9CA3AF]',
    border: 'border-slate-200',
    label: 'Cancelled',
  },
};
