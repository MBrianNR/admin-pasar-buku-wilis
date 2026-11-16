import { isEmail } from '../utils/isEmail';
import { KiosItem, KiosStatus } from '../types/kios';
import { ValidationResult } from './authValidator';
import { isValidIndoMobile, normalizePhone } from './phoneValidator';

export interface KiosInputData {
  n?: string;
  b?: string;
  no?: string;
  id?: string;
  o?: string;
  wa?: string;
  em?: string;
  sp?: string[];
  s?: KiosStatus;
  foto?: string;
  [key: string]: any;
}

export interface KiosValidationOptions {
  existingKiosList?: KiosItem[];
  editId?: string;
}

export interface KiosValidationResult extends ValidationResult {
  normalizedId: string;
  normalizedWa: string;
}

/**
 * Normalisasi nomor kios (contoh: "15" dengan blok "A" menjadi "A-15")
 */
export function normalizeKiosId(no?: string, blok: string = 'A'): string {
  if (!no) return '';
  let id = String(no).trim().toUpperCase().replace(/\s+/g, '');
  if (/^\d+$/.test(id)) {
    id = `${blok}-${id.padStart(2, '0')}`;
  }
  return id;
}

/**
 * Validasi form kios
 */
export function validateKiosInput(
  data: KiosInputData,
  { existingKiosList = [], editId = '' }: KiosValidationOptions = {}
): KiosValidationResult {
  const errors: Record<string, string> = {};

  const nama = (data.n || '').trim();
  if (!nama) {
    errors.n = 'Nama toko / kios wajib diisi.';
  } else if (nama.length < 3) {
    errors.n = 'Nama toko minimal 3 karakter.';
  } else if (nama.length > 100) {
    errors.n = 'Nama toko maksimal 100 karakter.';
  }

  const blok = data.b || 'A';
  if (!['A', 'B', 'C'].includes(blok)) {
    errors.b = 'Pilihan blok harus A, B, atau C.';
  }

  const rawNo = data.no !== undefined ? data.no : (data.id || '');
  const id = normalizeKiosId(rawNo, blok);
  if (!id) {
    errors.no = 'Nomor kios wajib diisi.';
  } else if (!/^[A-C]-\d{1,2}$/.test(id)) {
    errors.no = 'Nomor kios tidak valid, contoh: A-15.';
  } else if (existingKiosList.some(k => k.id === id && k.id !== editId)) {
    errors.no = `Nomor kios ${id} sudah dipakai kios lain.`;
  }

  if (data.o && data.o.length > 100) {
    errors.o = 'Nama pemilik maksimal 100 karakter.';
  }

  if (data.wa && data.wa.trim()) {
    if (!isValidIndoMobile(data.wa)) {
      errors.wa = 'Nomor WhatsApp tidak valid. Contoh: 081234567890 atau +6281234567890.';
    }
  }

  if (data.em && data.em.trim()) {
    if (!isEmail(data.em.trim())) {
      errors.em = 'Format alamat email tidak valid.';
    } else if (data.em.trim().length > 100) {
      errors.em = 'Email maksimal 100 karakter.';
    }
  }

  if (data.s && !['buka', 'pending', 'tutup'].includes(data.s)) {
    errors.s = 'Status kios tidak valid.';
  }

  const isValid = Object.keys(errors).length === 0;
  const message = isValid ? '' : Object.values(errors)[0];

  return {
    isValid,
    errors,
    message,
    normalizedId: id,
    normalizedWa: data.wa && data.wa.trim() ? normalizePhone(data.wa) : '',
  };
}