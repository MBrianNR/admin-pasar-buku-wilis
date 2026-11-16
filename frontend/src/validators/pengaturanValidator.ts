import { isEmail } from '@/lib/utils';
import { PengaturanItem } from '@/types';
import { ValidationResult } from './authValidator';

export interface PengaturanInputData {
  nama?: string;
  head?: string;
  desc?: string;
  wa?: string;
  em?: string;
  [key: string]: any;
}

/**
 * Validasi form pengaturan portal website
 */
export function validatePengaturanInput(data: PengaturanInputData): ValidationResult {
  const errors: Record<string, string> = {};

  const nama = (data.nama || '').trim();
  if (!nama) {
    errors.nama = 'Nama website wajib diisi.';
  } else if (nama.length < 3) {
    errors.nama = 'Nama website minimal 3 karakter.';
  } else if (nama.length > 100) {
    errors.nama = 'Nama website maksimal 100 karakter.';
  }

  const head = (data.head || '').trim();
  if (!head) {
    errors.head = 'Headline website wajib diisi.';
  } else if (head.length < 5) {
    errors.head = 'Headline minimal 5 karakter.';
  } else if (head.length > 150) {
    errors.head = 'Headline maksimal 150 karakter.';
  }

  if (data.desc && data.desc.length > 160) {
    errors.desc = 'Deskripsi meta maksimal 160 karakter.';
  }

  if (data.wa) {
    const digits = data.wa.replace(/\D/g, '');
    if (digits.length < 9) {
      errors.wa = 'Nomor WhatsApp layanan informasi tidak valid.';
    }
  }

  if (data.em && data.em.trim()) {
    if (!isEmail(data.em.trim())) {
      errors.em = 'Format email resmi tidak valid.';
    }
  }

  const isValid = Object.keys(errors).length === 0;
  const message = isValid ? '' : Object.values(errors)[0];

  return { isValid, errors, message };
}

