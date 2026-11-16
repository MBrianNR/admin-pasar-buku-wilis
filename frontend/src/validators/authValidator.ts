/**
 * Validasi form kredensial login admin
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  message: string;
}

export function validateLoginInput(username?: string, password?: string): ValidationResult {
  const errors: Record<string, string> = {};

  const u = (username || '').trim();
  if (!u) {
    errors.username = 'Username wajib diisi.';
  } else if (u.length < 3) {
    errors.username = 'Username minimal 3 karakter.';
  } else if (!/^[a-zA-Z0-9_.]{3,50}$/.test(u)) {
    errors.username = 'Username hanya boleh huruf, angka, titik, dan underscore.';
  }

  const p = password || '';
  if (!p) {
    errors.password = 'Password wajib diisi.';
  } else if (p.length < 6) {
    errors.password = 'Password minimal 6 karakter.';
  }

  const isValid = Object.keys(errors).length === 0;
  const message = isValid ? '' : Object.values(errors)[0];

  return { isValid, errors, message };
}

