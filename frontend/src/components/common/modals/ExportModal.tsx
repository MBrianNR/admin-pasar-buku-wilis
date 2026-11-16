'use client';

import React, { useRef } from 'react';
import { useApp } from '@/hooks/useApp';
import { ModalShell, CloseButton } from './InfoModal';

export interface ExportModalProps {
  csv?: string;
  onClose: () => void;
}

export function ExportModal({ csv = '', onClose }: ExportModalProps) {
  const { toast } = useApp();
  const ref = useRef<HTMLTextAreaElement | null>(null);

  const copy = () => {
    const t = ref.current;
    if (!t) return;
    t.select();
    try {
      navigator.clipboard.writeText(t.value);
    } catch {
      document.execCommand('copy');
    }
    toast('CSV disalin ke clipboard');
  };

  return (
    <ModalShell onClose={onClose}>
      <div className="mh">
        <h3>Ekspor Data Kios</h3>
        <CloseButton onClose={onClose} />
      </div>
      <div className="mb">
        <div>
          <textarea
            ref={ref}
            id="csv"
            rows={8}
            readOnly
            className="mono"
            style={{ fontSize: 12, width: '100%' }}
            value={csv}
          />
        </div>
      </div>
      <div className="mf">
        <button className="btn o" onClick={onClose}>
          Tutup
        </button>
        <button className="btn" onClick={copy}>
          Salin CSV
        </button>
      </div>
    </ModalShell>
  );
}

export default ExportModal;

