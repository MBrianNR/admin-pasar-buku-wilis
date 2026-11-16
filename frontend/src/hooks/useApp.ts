'use client';

import { useContext } from 'react';
import { AppContext, AppContextValue } from '@/context/AppContext';

/**
 * Custom hook untuk mengakses state dan aksi global dari AppContext
 */
export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp harus digunakan di dalam AppProvider');
  }
  return context;
}

export default useApp;

