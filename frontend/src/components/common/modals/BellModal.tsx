'use client';

import React from 'react';
import { useApp } from '@/hooks/useApp';
import { InfoModal } from './InfoModal';

export interface BellModalProps {
  onClose: () => void;
}

export function BellModal({ onClose }: BellModalProps) {
  const { data, goTo } = useApp();
  const pending = data.kios.filter(k => k.s === 'pending').length;

  return (
    <InfoModal title="Notifikasi" onClose={onClose}>
      <p>
        • {pending} kios menunggu verifikasi —{' '}
        <a className="ln" onClick={() => goTo('toko', 'pending')}>
          Tinjau
        </a>
      </p>
      <p style={{ marginTop: 8 }}>
        • {data.post.length} postingan forum perlu moderasi —{' '}
        <a className="ln" onClick={() => goTo('moderasi')}>
          Tinjau
        </a>
      </p>
    </InfoModal>
  );
}

export default BellModal;

