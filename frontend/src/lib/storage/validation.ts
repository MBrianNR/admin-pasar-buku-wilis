import path from 'path';

/**
 * Daftar putih (Allowlist) tipe MIME dan ekstensi yang diizinkan di Pasar Buku Wilis.
 * Mencegah pengunggahan berkas executable berbahaya (misal: .php, .exe, .html, .svg yang memuat skrip XSS).
 */
export const ALLOWED_MIME_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
} as const;

export type AllowedMimeType = keyof typeof ALLOWED_MIME_TYPES;

// Batas ukuran maksimal file: 5 MB untuk foto cover buku/katalog
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedExt?: string;
}

/**
 * Validasi ketat di sisi server terhadap metadata file sebelum presigned URL diterbitkan.
 */
export function validateFileMetadata(
  mimeType: string,
  filename: string,
  sizeBytes: number
): { validExt: string } {
  if (typeof sizeBytes !== 'number' || sizeBytes <= 0) {
    throw new Error('Ukuran file tidak valid (file kosong atau bernilai negatif).');
  }

  if (sizeBytes > MAX_FILE_SIZE_BYTES) {
    const maxMb = MAX_FILE_SIZE_BYTES / (1024 * 1024);
    const actualMb = (sizeBytes / (1024 * 1024)).toFixed(2);
    throw new Error(`Ukuran file (${actualMb} MB) melebihi batas maksimal yang diizinkan (${maxMb} MB).`);
  }

  const normalizedMime = (mimeType || '').trim().toLowerCase();
  if (!Object.prototype.hasOwnProperty.call(ALLOWED_MIME_TYPES, normalizedMime)) {
    throw new Error(
      `Format MIME "${mimeType}" tidak diizinkan. Hanya menerima gambar (JPG, PNG, WEBP) dan dokumen PDF.`
    );
  }

  const ext = path.extname(filename || '').toLowerCase();
  const allowedExtensions = ALLOWED_MIME_TYPES[normalizedMime as AllowedMimeType];

  if (!ext || !(allowedExtensions as readonly string[]).includes(ext)) {
    throw new Error(
      `Ekstensi file "${ext}" tidak sesuai dengan tipe MIME "${mimeType}". Upaya MIME spoofing terdeteksi.`
    );
  }

  return { validExt: ext };
}

/**
 * Menghasilkan Storage Key yang aman dan unik:
 * Format: uploads/{userId}/{uuid}.{ext}
 * 
 * - Mensterilkan userId untuk membasmi potensi serangan Path Traversal (e.g. "../../etc/passwd").
 * - Menggunakan randomUUID untuk mencegah bentrok nama file dan pengintaian (*enumeration attack*).
 */
export function generateSafeStorageKey(userId: string, ext: string): string {
  const sanitizedUserId = (userId || 'anonymous')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 64) || 'user';
  
  const uniqueId = crypto.randomUUID();
  const cleanExt = ext.startsWith('.') ? ext : `.${ext}`;

  return `uploads/${sanitizedUserId}/${uniqueId}${cleanExt}`;
}
