'use client';

import React from 'react';
import { useApp } from '@/hooks/useApp';
import { STATUS } from '@/lib/data';
import { InfoModal } from '@/components/common/modals/InfoModal';

export interface KiosDetailModalProps {
  id: string;
  onClose: () => void;
}

export function KiosDetailModal({ id, onClose }: KiosDetailModalProps) {
  const { data } = useApp();
  const k = data.kios.find(x => x.id === id);
  if (!k) return null;

  return (
    <InfoModal title={k.n} onClose={onClose}>
      <p className="lbl">Blok &amp; Nomor</p>
      <p>{k.id}</p>
      <p className="lbl" style={{ marginTop: 8 }}>
        Pemilik
      </p>
      <p>{k.o}</p>
      <p className="lbl" style={{ marginTop: 8 }}>
        WhatsApp
      </p>
      <p className="mono">{k.wa}</p>
      <p className="lbl" style={{ marginTop: 8 }}>
        Spesialisasi
      </p>
      <p>{k.sp.join(', ') || '-'}</p>
      <p className="lbl" style={{ marginTop: 8 }}>
        Status
      </p>
      <p>
        {STATUS[k.s]?.[1] || k.s} · {k.k.toLocaleString('id-ID')} judul · terdaftar {k.t}
      </p>
    </InfoModal>
  );
}

export default KiosDetailModal;

