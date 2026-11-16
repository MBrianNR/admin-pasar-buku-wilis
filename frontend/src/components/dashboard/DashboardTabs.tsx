'use client';

import React from 'react';

export interface DashboardTabsProps {
  pendingCount: number;
  onNavigate: (route: string) => void;
}

export default function DashboardTabs({ pendingCount, onNavigate }: DashboardTabsProps) {
  return (
    <div className="tabs">
      <button className="on">
        Daftar & Verifikasi Kios{' '}
        <span className="pill" style={{ background: '#e0f2fe', color: 'var(--p)' }}>
          {pendingCount} Kios Pending
        </span>
      </button>
      <button onClick={() => onNavigate('denah')}>Denah Lorong Tematik (Map)</button>
      <button onClick={() => onNavigate('katalog')}>Koleksi Buku Unggulan</button>
      <button onClick={() => onNavigate('moderasi')}>Moderasi Forum Pencarian</button>
    </div>
  );
}

