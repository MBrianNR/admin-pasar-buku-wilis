import React, { ReactNode } from 'react';
import { JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import type { Metadata, Viewport } from 'next';

// Urutan penting: token & komponen Figma dulu, lalu tambahan interaksi
import '../css/style.css';
import '../css/app.css';

// Font di-hosting sendiri oleh Next.js (menggantikan <link> Google Fonts di index.html).
// Nama CSS variable-nya dipakai di css/style.css (--font-jakarta dan --font-mono).
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap'
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-mono',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Admin Pasar Buku Wilis'
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
};

export interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="id" className={`${jakarta.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}

