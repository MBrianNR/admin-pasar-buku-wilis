'use client';

import React from 'react';
import { useApp } from '@/hooks/useApp';
import { ConfirmModal } from './modals/InfoModal';
import { ProfileModal } from './modals/ProfileModal';
import { BellModal } from './modals/BellModal';
import { ExportModal } from './modals/ExportModal';
import { KiosDetailModal } from '@/components/toko/KiosDetailModal';
import { KiosFormModal } from '@/components/toko/KiosFormModal';
import { BukuFormModal } from '@/components/katalog/BukuFormModal';

export default function ModalRoot() {
  const { modal, closeModal } = useApp();
  if (!modal) return null;

  switch (modal.type) {
    case 'confirm':
      return (
        <ConfirmModal
          message={modal.message}
          label={modal.label}
          onConfirm={modal.onConfirm}
          onClose={closeModal}
        />
      );
    case 'profile':
      return <ProfileModal onClose={closeModal} />;
    case 'bell':
      return <BellModal onClose={closeModal} />;
    case 'detail':
      return <KiosDetailModal id={modal.id!} onClose={closeModal} />;
    case 'export':
      return <ExportModal csv={modal.csv} onClose={closeModal} />;
    case 'kios':
      return (
        <KiosFormModal
          key={modal.kios ? modal.kios.id : `new-${modal.pre}`}
          kios={modal.kios}
          pre={modal.pre}
          onClose={closeModal}
        />
      );
    case 'buku':
      return (
        <BukuFormModal
          key={modal.buku ? modal.buku.id : 'new'}
          buku={modal.buku}
          onClose={closeModal}
        />
      );
    default:
      return null;
  }
}

