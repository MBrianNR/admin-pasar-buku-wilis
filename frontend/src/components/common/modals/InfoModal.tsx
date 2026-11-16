'use client';

import React, { ReactNode } from 'react';

export interface ModalShellProps {
  onClose: () => void;
  children: ReactNode;
}

/**
 * Komponen pembungkus latar belakang modal (overlay)
 */
export function ModalShell({ onClose, children }: ModalShellProps) {
  return (
    <div className="ov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="md">{children}</div>
    </div>
  );
}

export interface CloseButtonProps {
  onClose: () => void;
}

/**
 * Tombol silang tutup modal
 */
export const CloseButton = ({ onClose }: CloseButtonProps) => (
  <button className="x" onClick={onClose} aria-label="Tutup modal">
    ×
  </button>
);

export interface InfoModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Kerangka modal info generik
 */
export function InfoModal({ title, onClose, children }: InfoModalProps) {
  return (
    <ModalShell onClose={onClose}>
      <div className="mh">
        <h3>{title}</h3>
        <CloseButton onClose={onClose} />
      </div>
      <div className="mb">
        <div>{children}</div>
      </div>
      <div className="mf">
        <span></span>
        <button className="btn" onClick={onClose}>
          Tutup
        </button>
      </div>
    </ModalShell>
  );
}

export interface ConfirmModalProps {
  message?: string;
  label?: string;
  onConfirm?: () => void;
  onClose: () => void;
}

/**
 * Modal konfirmasi aksi
 */
export function ConfirmModal({ message, label = 'Ya, Lanjutkan', onConfirm, onClose }: ConfirmModalProps) {
  return (
    <ModalShell onClose={onClose}>
      <div className="mh">
        <div>
          <h3>Konfirmasi</h3>
          <p>{message}</p>
        </div>
        <CloseButton onClose={onClose} />
      </div>
      <div className="mf">
        <button className="btn o" onClick={onClose}>
          Batal
        </button>
        <button
          className="btn d"
          onClick={() => {
            onClose();
            onConfirm?.();
          }}
        >
          {label}
        </button>
      </div>
    </ModalShell>
  );
}

