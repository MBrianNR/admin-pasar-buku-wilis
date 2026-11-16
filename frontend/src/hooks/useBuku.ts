'use client';

import { useMemo } from 'react';
import { useApp } from './useApp';
import { BukuItem } from '@/types';

export interface UseBukuReturn {
  bukuList: BukuItem[];
  filteredBuku: BukuItem[];
  totalJudul: number;
  totalStok: number;
  connectedKiosCount: number;
  kiosName: (id: string) => string;
  openBukuForm: (buku?: BukuItem | null) => void;
  saveBuku: (values: any, editId?: number | string) => void;
  deleteBuku: (id: number | string) => void;
}

/**
 * Custom hook untuk katalog buku
 */
export function useBuku(): UseBukuReturn {
  const { data, query, kiosName, openBukuForm, deleteBuku, saveBuku } = useApp();

  const q = query.toLowerCase();
  const filteredBuku = useMemo(() => {
    return data.buku.filter(
      b => !q || (b.j + b.p + b.c + b.k + kiosName(b.k)).toLowerCase().includes(q)
    );
  }, [data.buku, q, kiosName]);

  const totalJudul = data.buku.length;
  const totalStok = useMemo(() => data.buku.reduce((acc, b) => acc + (b.st || 0), 0), [data.buku]);
  const connectedKiosCount = useMemo(() => new Set(data.buku.map(b => b.k)).size, [data.buku]);

  return {
    bukuList: data.buku,
    filteredBuku,
    totalJudul,
    totalStok,
    connectedKiosCount,
    kiosName,
    openBukuForm,
    saveBuku,
    deleteBuku
  };
}

export default useBuku;

