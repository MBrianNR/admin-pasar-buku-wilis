'use client';

import { useState, useRef, useCallback } from 'react';
import { upload } from '@vercel/blob/client';
import { getToken } from '@/lib/auth';

export interface UploadProgress {
  percentage: number;
  loaded: number;
  total: number;
}

export interface DirectUploadResult {
  fileId: string;
  fileKey: string;
  publicUrl: string;
  isDevMode: boolean;
}

export function useDirectUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({ percentage: 0, loaded: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const abortUpload = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsUploading(false);
    setProgress({ percentage: 0, loaded: 0, total: 0 });
    setError('Pengunggahan dibatalkan oleh pengguna.');
  }, []);

  const uploadFile = useCallback(
    async (
      file: File,
      entityType: 'buku_cover' | 'kios_logo' | 'dokumen' = 'buku_cover',
    ): Promise<DirectUploadResult> => {
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      setIsUploading(true);
      setError(null);
      setProgress({ percentage: 0, loaded: 0, total: file.size });

      try {
        const token = getToken();
        if (!token) throw new Error('Sesi admin tidak ditemukan. Silakan login kembali.');
        const blob = await upload(file.name, file, {
          access: 'public',
          handleUploadUrl: '/api/upload',
          headers: { Authorization: `Bearer ${token}` },
          contentType: file.type || 'application/octet-stream',
          clientPayload: JSON.stringify({
            filename: file.name,
            mimeType: file.type || 'image/jpeg',
            sizeBytes: file.size,
            entityType,
          }),
          abortSignal: abortController.signal,
          onUploadProgress: ({ loaded, total, percentage }) => {
            setProgress({ percentage, loaded, total });
          },
        });
        return {
          fileId: blob.pathname,
          fileKey: blob.pathname,
          publicUrl: blob.url,
          isDevMode: false,
        };
      } catch (err) {
        if (!abortController.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat upload.');
        }
        throw err;
      } finally {
        if (abortControllerRef.current === abortController) abortControllerRef.current = null;
        setIsUploading(false);
      }
    },
    [],
  );

  return { uploadFile, abortUpload, isUploading, progress, error, setError };
}
