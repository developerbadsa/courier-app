import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f5ff',
          100: '#e0ebff',
          200: '#c7d9fe',
          300: '#9ebffe',
          400: '#6d99fb',
          500: '#4871f7',
          600: '#2d4eed',
          700: '#2339d9',
          800: '#1e30af',
          900: '#1e2d8a',
          950: '#0f172a', // Deep Navy
        },
      },
    },
  },
  plugins: [],
};

export default config;
