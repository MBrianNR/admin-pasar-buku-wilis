import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="card" style={{ padding: 40, textAlign: 'center', margin: 'auto' }}>
      <h2>Halaman tidak ditemukan</h2>
      <p style={{ color: 'var(--mut)', margin: '8px 0 18px' }}>
        Alamat yang Anda buka tidak ada di Admin Portal.
      </p>
      <Link className="btn" href="/dashboard" style={{ display: 'inline-block' }}>
        Kembali ke Dashboard
      </Link>
    </div>
  );
}

