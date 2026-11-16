'use client';

import React from 'react';
import { InfoModal } from './InfoModal';

export interface ProfileModalProps {
  onClose: () => void;
}

export function ProfileModal({ onClose }: ProfileModalProps) {
  return (
    <InfoModal title="Profil Admin" onClose={onClose}>
      <p>
        <b>Admin Wilis</b>
      </p>
      <p className="mono" style={{ color: 'var(--mut)' }}>
        admin.wilis@malang.go.id
      </p>
      <p style={{ marginTop: 8 }}>Peran: Administrator Portal Pasar Buku Wilis Malang</p>
    </InfoModal>
  );
}

export default ProfileModal;

