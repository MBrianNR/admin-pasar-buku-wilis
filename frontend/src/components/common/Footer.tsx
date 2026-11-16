'use client';

import React from 'react';
import { useApp } from '@/hooks/useApp';

export default function Footer() {
  const { data } = useApp();
  const { nama, wa, em } = data.set;

  return (
    <footer id="ft">
      <div>
        © 2026 <b>{nama}</b>. Cagar Budaya &amp; Literasi Kota Malang.
      </div>
      <div>
        <span>WA {wa}</span>
        <span>{em}</span>
      </div>
    </footer>
  );
}

