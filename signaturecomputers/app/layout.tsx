import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AdminAuthProvider } from '@/context/AdminAuthContext';
import LayoutWrapper from '@/components/LayoutWrapper';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Signature Computers | Premium Tech Store',
  description: 'Your ultimate destination for premium laptops, desktops, and accessories.',
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
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </AdminAuthProvider>
      </body>
    </html>
  );
}
