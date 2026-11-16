'use client';

import { createContext, useContext, RefObject } from 'react';
import { AppState, BukuItem, KiosItem, PengaturanItem } from '@/types';

export interface ModalState {
  type: string;
  message?: string;
  onConfirm?: () => void;
  label?: string;
  kios?: KiosItem | null;
  pre?: string;
  id?: string;
  buku?: BukuItem | null;
  csv?: string;
  [key: string]: any;
}

export interface AppContextValue {
  data: AppState;
  route: string;
  query: string;
  filter: string;
  block: string;
  page: number;
  tab: string;
  selected: string;
  filteredKios: KiosItem[];
  searchRef: RefObject<HTMLInputElement | null>;
  toastMsg: string;
  modal: ModalState | null;
  kiosName: (id: string) => string;
  setPage: (page: number) => void;
  setTab: (tab: string) => void;
  setSel: (selected: string) => void;
  changeQuery: (query: string) => void;
  changeFilter: (filter: string) => void;
  changeBlock: (block: string) => void;
  goTo: (route: string, nextFilter?: string, keepQuery?: boolean) => void;
  toast: (msg: string) => void;
  closeModal: () => void;
  openKiosForm: (kios?: KiosItem | null, pre?: string) => void;
  openKiosDetail: (id: string) => void;
  openBukuForm: (buku?: BukuItem | null) => void;
  openProfile: () => void;
  openBell: () => void;
  openExport: () => void;
  confirmLogout: () => void;
  approveKios: (id: string) => void;
  saveKios: (values: any, editId?: string) => void;
  deleteKios: (id: string) => void;
  saveBuku: (values: any, editId?: number | string) => void;
  deleteBuku: (id: number | string) => void;
  updateDenah: () => void;
  openProfileCatalog: (id: string) => void;
  approvePost: (id: number | string) => void;
  deletePost: (id: number | string) => void;
  saveSettings: (settings: PengaturanItem) => void;
  headerActions: Record<string, () => void>;
}

export const AppContext = createContext<AppContextValue | null>(null);

export const useApp = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

