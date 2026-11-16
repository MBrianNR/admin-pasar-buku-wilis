'use client';

import { useState, useRef, useCallback } from 'react';
import { uploadPresigned } from '@vercel/blob/client';
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
      let uploadPathname = '';
      let uploadPayload = '';

      try {
        const token = getToken();
        if (!token) throw new Error('Sesi admin tidak ditemukan. Silakan login kembali.');

        const readinessResponse = await fetch('/api/upload', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        const readiness = await readinessResponse.json().catch(() => null);
        if (!readinessResponse.ok || !readiness?.success) {
          throw new Error(readiness?.message || 'Konfigurasi upload Vercel Blob belum siap.');
        }
        if (!readiness.userId) throw new Error('Identitas admin tidak ditemukan. Silakan login kembali.');

        uploadPathname = `uploads/${readiness.userId}/${file.name}`;
        uploadPayload = JSON.stringify({
          filename: file.name,
          mimeType: file.type || 'image/jpeg',
          sizeBytes: file.size,
          entityType,
        });

        const blob = await uploadPresigned(uploadPathname, file, {
          access: 'public',
          handleUploadUrl: '/api/upload',
          headers: { Authorization: `Bearer ${token}` },
          contentType: file.type || 'application/octet-stream',
          clientPayload: uploadPayload,
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
          let message = err instanceof Error ? err.message : 'Terjadi kesalahan saat upload.';
          if (message.includes('Failed to retrieve the presigned URL') && uploadPathname) {
            // The SDK intentionally hides non-2xx response bodies. Retry the token request
            // once so the UI can show the server's actionable error instead of its generic one.
            const diagnosticResponse = await fetch('/api/upload', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${getToken() || ''}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                type: 'blob.generate-presigned-url',
                payload: { pathname: uploadPathname, clientPayload: uploadPayload, multipart: false },
              }),
              cache: 'no-store',
            }).catch(() => null);
            if (diagnosticResponse && !diagnosticResponse.ok) {
              const details = await diagnosticResponse.json().catch(() => null);
              if (typeof details?.error === 'string') message = details.error;
            }
          }
          setError(message);
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
