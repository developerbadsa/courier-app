import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { I18nProvider } from '@/contexts/I18nContext';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'Shohnaat Logistics — Fast, Reliable Courier & Parcel Delivery',
    template: '%s | Shohnaat Logistics',
  },
  description: 'Doorstep merchant pickup, nationwide delivery, live tracking, and automated COD settlements — all in one logistics platform.',
  keywords: ['courier', 'delivery', 'logistics', 'parcel', 'COD', 'tracking', 'shipping', 'same-day delivery'],
  authors: [{ name: 'Shohnaat Logistics' }],
  creator: 'Shohnaat Logistics',
  metadataBase: new URL('https://shohnaat.rahimbadsa.me'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Shohnaat Logistics',
    title: 'Shohnaat Logistics — Fast, Reliable Courier & Parcel Delivery',
    description: 'Doorstep merchant pickup, nationwide delivery, live tracking, and automated COD settlements.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Shohnaat Logistics' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shohnaat Logistics',
    description: 'Fast, Reliable Courier & Parcel Delivery',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Shohnaat Rider" />
      </head>
      <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-900 antialiased font-sans`}>
        <ErrorBoundary><I18nProvider>{children}</I18nProvider></ErrorBoundary>
      </body>
    </html>
  );
}
