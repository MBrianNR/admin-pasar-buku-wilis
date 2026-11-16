'use client';

import { useMemo } from 'react';
import { useApp } from './useApp';
import { KiosItem } from '@/types';

export interface UseKiosReturn {
  kiosList: KiosItem[];
  filteredKios: KiosItem[];
  filter: string;
  block: string;
  query: string;
  total: number;
  activeCount: number;
  pendingCount: number;
  tutupCount: number;
  changeFilter: (filter: string) => void;
  changeBlock: (block: string) => void;
  changeQuery: (query: string) => void;
  openKiosForm: (kios?: KiosItem | null, pre?: string) => void;
  openKiosDetail: (id: string) => void;
  approveKios: (id: string) => void;
  saveKios: (values: any, editId?: string) => void;
  deleteKios: (id: string) => void;
  openExport: () => void;
}

/**
 * Custom hook untuk data dan aksi seputar Kios
 */
export function useKios(): UseKiosReturn {
  const {
    data,
    filteredKios,
    filter,
    block,
    query,
    changeFilter,
    changeBlock,
    changeQuery,
    openKiosForm,
    openKiosDetail,
    approveKios,
    saveKios,
    deleteKios,
    openExport
  } = useApp();

  const total = data.kios.length;
  const activeCount = useMemo(() => data.kios.filter(k => k.s === 'buka').length, [data.kios]);
  const pendingCount = useMemo(() => data.kios.filter(k => k.s === 'pending').length, [data.kios]);
  const tutupCount = useMemo(() => data.kios.filter(k => k.s === 'tutup').length, [data.kios]);

  return {
    kiosList: data.kios,
    filteredKios,
    filter,
    block,
    query,
    total,
    activeCount,
    pendingCount,
    tutupCount,
    changeFilter,
    changeBlock,
    changeQuery,
    openKiosForm,
    openKiosDetail,
    approveKios,
    saveKios,
    deleteKios,
    openExport
  };
}

export default useKios;

