import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AdminAuthProvider } from '@/context/AdminAuthContext';
import LayoutWrapper from '@/components/LayoutWrapper';
import { Toaster } from 'sonner';
import ThemeEffectWrapper from '@/components/ThemeEffectWrapper';
import OrganizationSchema from '@/components/seo/OrganizationSchema';
import { Suspense } from 'react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: {
    default: 'Signature Computers | Premium Tech Store',
    template: '%s | Signature Computers',
  },
  description: 'Your ultimate destination for premium laptops, desktops, and accessories. Experience top-tier technology with Signature Computers.',
  keywords: ['laptops', 'desktops', 'computer accessories', 'gaming laptops', 'premium tech', 'Signature Computers', 'tech store India'],
  authors: [{ name: 'Signature Computers' }],
  creator: 'Signature Computers',
  publisher: 'Signature Computers',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: '/',
    title: 'Signature Computers | Premium Tech Store',
    description: 'Your ultimate destination for premium laptops, desktops, and accessories.',
    siteName: 'Signature Computers',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Signature Computers - Premium Tech Store',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Signature Computers | Premium Tech Store',
    description: 'Your ultimate destination for premium laptops, desktops, and accessories.',
    images: ['/twitter-image.jpg'], // Fallback to OG image if this specific one doesn't exist
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        <AdminAuthProvider>
          <OrganizationSchema />
          <ThemeEffectWrapper />
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </AdminAuthProvider>
        <Toaster position="bottom-center" richColors expand={true} />
      </body>
    </html>
  );
}
