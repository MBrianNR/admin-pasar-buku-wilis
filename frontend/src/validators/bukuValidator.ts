import { SPECIALIZATIONS } from '@/lib/data';
import { BukuItem, KiosItem } from '@/types';
import { ValidationResult } from './authValidator';

export interface BukuInputData {
  j?: string;
  p?: string;
  c?: string;
  k?: string;
  st?: number | string;
  cover?: string;
  [key: string]: any;
}

export interface BukuValidationOptions {
  existingKiosList?: KiosItem[];
}

/**
 * Validasi form katalog buku
 */
export function validateBukuInput(
  data: BukuInputData,
  { existingKiosList = [] }: BukuValidationOptions = {}
): ValidationResult {
  const errors: Record<string, string> = {};

  const judul = (data.j || '').trim();
  if (!judul) {
    errors.j = 'Judul buku wajib diisi.';
  } else if (judul.length < 2) {
    errors.j = 'Judul buku minimal 2 karakter.';
  } else if (judul.length > 200) {
    errors.j = 'Judul buku maksimal 200 karakter.';
  }

  const penulis = (data.p || '').trim();
  if (!penulis) {
    errors.p = 'Nama penulis wajib diisi.';
  } else if (penulis.length < 2) {
    errors.p = 'Nama penulis minimal 2 karakter.';
  } else if (penulis.length > 100) {
    errors.p = 'Nama penulis maksimal 100 karakter.';
  }

  if (data.c && !SPECIALIZATIONS.includes(data.c)) {
    errors.c = 'Kategori spesialisasi tidak valid.';
  }

  if (!data.k) {
    errors.k = 'Kios penempatan wajib dipilih.';
  } else if (existingKiosList.length > 0 && !existingKiosList.some(k => k.id === data.k)) {
    errors.k = 'Kios yang dipilih tidak terdaftar.';
  }

  const stokNum = Number(data.st);
  if (isNaN(stokNum) || stokNum < 0) {
    errors.st = 'Jumlah stok tidak boleh negatif.';
  }

  const isValid = Object.keys(errors).length === 0;
  const message = isValid ? '' : Object.values(errors)[0];

  return { isValid, errors, message };
}

