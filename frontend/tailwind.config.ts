import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        // Shohnaat Logistics Master Color Palette
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
        navy: {
          DEFAULT: '#0F172A', // Dark Navy: Sidebar, headers, brand title
          900: '#0F172A',
          950: '#080D1A',
        },
        slate: {
          50: '#F8FAFC',      // Page background
          100: '#F1F5F9',     // Soft tinted input background / cards
          200: '#E2E8F0',     // Borders, dividers
          300: '#CBD5E1',     // Checkbox borders, disabled states
          400: '#94A3B8',     // Placeholders, muted icons
          500: '#64748B',     // Secondary text, subheadings
          600: '#475569',     // Form labels, body secondary
          700: '#334155',     // Body text, active labels
          800: '#1E293B',     // Dark borders / elements
          900: '#0F172A',     // Dark navy text / containers
        },
        status: {
          success: '#16A34A', // Delivered, Success
          transit: '#2563EB', // In Transit
          warning: '#F59E0B', // Pending, Warning
          error: '#EF4444',   // Failed, Error
          gray: '#9CA3AF',    // Cancelled
        },
        accent: {
          purple: '#8B5CF6',  // Premium, API
          teal: '#14B8A6',    // Financial, COD
        },
        brand: {
          input: '#F0F5FF',   // Soft ice-blue input tint from Figma
          'input-border': '#E0EAFF',
        },
      },
      boxShadow: {
        'card-soft': '0 20px 40px -15px rgba(15, 23, 42, 0.07), 0 0 1px 1px rgba(15, 23, 42, 0.03)',
        'card-hover': '0 25px 50px -12px rgba(15, 23, 42, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
