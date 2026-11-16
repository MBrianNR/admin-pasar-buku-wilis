/**
 * Definisi tipe data dan status Forum Moderasi
 */

export type ForumPostStatus = 'pending' | 'laporan' | 'disetujui';

export interface ForumPostItem {
  id: number;
  u: string;
  j: string;
  i: string;
  s: ForumPostStatus;
  w: string;
}

export const FORUM_STATUSES = {
  PENDING: 'pending' as const,
  LAPORAN: 'laporan' as const,
  DISETUJUI: 'disetujui' as const
};

