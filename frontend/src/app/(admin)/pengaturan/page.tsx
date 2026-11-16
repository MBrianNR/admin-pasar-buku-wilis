'use client';

import React from 'react';
import PengaturanForm from '@/components/pengaturan/PengaturanForm';

export default function Pengaturan() {
  return (
    <>
      <div>
        <h2 style={{ fontSize: 28, fontWeight: 800 }}>Pengaturan Website</h2>
        <p style={{ color: 'var(--mut)' }}>
          Kelola informasi dasar dan pengumuman umum website Pasar Buku Wilis.
        </p>
      </div>

      <PengaturanForm />
    </>
  );
}

