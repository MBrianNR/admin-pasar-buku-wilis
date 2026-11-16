import React, { ReactNode } from 'react';
import AppProvider from '@/context/AppProvider';

export interface AdminLayoutProps {
  children: ReactNode;
}

// Semua halaman admin berbagi satu AppProvider: sidebar, header, footer, modal, dan state
// tetap hidup saat pindah halaman. (Nama folder "(admin)" tidak muncul di URL.)
export default function AdminLayout({ children }: AdminLayoutProps) {
  return <AppProvider>{children}</AppProvider>;
}

