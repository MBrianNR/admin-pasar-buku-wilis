import { apiRequest, apiUpload } from './api';

/** Folder tujuan di cloud storage (dikirim ke backend sebagai prefix key). */
export type UploadFolder = 'buku' | 'kios' | 'pengaturan' | 'denah' | 'forum';

/** Hasil upload dari backend: URL publik + key untuk hapus/ganti file. */
export interface UploadedFile {
  url: string;
  file_key: string;
  mime_type?: string;
  size?: number;
}

export const UPLOAD_LIMITS = {
  maxSizeBytes: 2 * 1024 * 1024,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
} as const;

/**
 * Validasi file di sisi client sebelum dikirim. Mengembalikan pesan error, atau null jika valid.
 * (Backend tetap harus memvalidasi ulang.)
 */
export function validateImage(file: File): string | null {
  if (!(UPLOAD_LIMITS.allowedTypes as readonly string[]).includes(file.type)) {
    return 'Format file harus JPG, PNG, atau WebP.';
  }
  if (file.size > UPLOAD_LIMITS.maxSizeBytes) {
    return `Ukuran file maksimal ${UPLOAD_LIMITS.maxSizeBytes / (1024 * 1024)} MB.`;
  }
  return null;
}

/**
 * Ubah hasil upload jadi pasangan field `<prefix>_url` dan `<prefix>_file_key`
 * (pola yang sama dengan cover_url / cover_file_key di bukuService).
 */
export function toStorageFields<P extends string>(prefix: P, file: UploadedFile) {
  return {
    [`${prefix}_url`]: file.url,
    [`${prefix}_file_key`]: file.file_key
  } as Record<`${P}_url` | `${P}_file_key`, string>;
}

export const uploadService = {
  /**
   * Upload gambar ke cloud storage lewat backend (POST /api/upload, field `file`).
   */
  async uploadImage(file: File, folder: UploadFolder): Promise<UploadedFile> {
    const invalid = validateImage(file);
    if (invalid) throw new Error(invalid);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    return apiUpload<UploadedFile>('/api/upload', formData);
  },

  /**
   * Hapus file dari cloud storage berdasarkan file_key.
   */
  async remove(fileKey: string): Promise<void> {
    if (!fileKey) return;
    await apiRequest(`/api/upload?key=${encodeURIComponent(fileKey)}`, { method: 'DELETE' });
  },

  /**
   * Hapus file tanpa melempar error (untuk pembersihan file lama / rollback).
   */
  async removeQuietly(fileKey?: string | null): Promise<void> {
    if (!fileKey) return;
    try {
      await this.remove(fileKey);
    } catch {
      // abaikan: file yatim lebih baik daripada gagal menyimpan data
    }
  }
};
