/**
 * Definisi tipe data dan konstanta domain Kios Pasar Buku Wilis
 */

export type KiosStatus = 'buka' | 'pending' | 'tutup';

export type KiosBlok = 'A' | 'B' | 'C' | string;

export interface KiosItem {
  id: string;
  n: string;
  o: string;
  wa: string;
  em?: string;
  sp: string[];
  s: KiosStatus;
  k: number;
  t: string;
  foto?: string;
}

export const KIOS_STATUSES = {
  BUKA: 'buka' as const,
  PENDING: 'pending' as const,
  TUTUP: 'tutup' as const
};

export const KIOS_BLOCKS: string[] = ['A', 'B', 'C'];
