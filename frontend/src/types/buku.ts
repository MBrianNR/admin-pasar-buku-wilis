/**
 * Definisi tipe data dan konstanta domain Katalog Buku
 */

export interface BukuItem {
  id: number;
  j: string;
  p: string;
  c: string;
  k: string;
  st: number;
  cover?: string;
  cover_file_key?: string;
  cover_url?: string;
}

export const BUKU_CATEGORIES: string[] = [
  'Buku Pelajaran',
  'Novel & Sastra',
  'Buku Langka & Antik',
  'Agama & Kitab',
  'Komik'
];
