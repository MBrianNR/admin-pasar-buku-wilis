'use client';

import { useApp } from './useApp';
import { slotIds } from '@/lib/utils';
import { KiosItem } from '@/types';

export interface UseDenahReturn {
  tab: string;
  setTab: (tab: string) => void;
  selected: string;
  setSel: (sel: string) => void;
  rows: string[];
  ids: string[];
  kiosInView: KiosItem[];
  openCount: number;
  emptyCount: number;
  currentKios: KiosItem | undefined;
  allKios: KiosItem[];
  lastUpdate: string;
  openKiosForm: (kios?: KiosItem | null, pre?: string) => void;
  openProfileCatalog: (id: string) => void;
  updateDenah: () => void;
}

/**
 * Custom hook untuk denah pasar
 */
export function useDenah(): UseDenahReturn {
  const { data, tab, setTab, selected, setSel, openKiosForm, openProfileCatalog, updateDenah } = useApp();

  const rows = tab === 'A' ? ['A', 'B'] : tab === 'B' ? ['B', 'C'] : ['C'];
  const ids = rows.flatMap(slotIds);
  const kiosInView = ids.map(i => data.kios.find(k => k.id === i)).filter(Boolean) as KiosItem[];

  const openCount = kiosInView.filter(k => k.s === 'buka').length;
  const emptyCount = ids.length - kiosInView.length;
  const currentKios = data.kios.find(x => x.id === selected);

  return {
    tab,
    setTab,
    selected,
    setSel,
    rows,
    ids,
    kiosInView,
    openCount,
    emptyCount,
    currentKios,
    allKios: data.kios,
    lastUpdate: data.upd,
    openKiosForm,
    openProfileCatalog,
    updateDenah
  };
}

export default useDenah;

