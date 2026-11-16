'use client';

import React, { useState, useRef, ChangeEvent, DragEvent, useEffect } from 'react';
import { useDirectUpload } from '@/hooks/useDirectUpload';

export interface CloudFileUploadProps {
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  entityType?: 'buku_cover' | 'kios_logo' | 'dokumen';
  /** URL yang bisa ditampilkan langsung: URL Blob publik atau data URL lama. */
  value?: string | null;
  /** Storage key: uploads/{userId}/{uuid}.ext */
  fileKey?: string | null;
  onChange: (fileKey: string | null, publicUrl: string | null) => void;
  error?: string;
  helperText?: string;
  className?: string;
  id?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function isDisplayableImage(url: string | null | undefined): boolean {
  if (!url) return false;
  return (
    url.startsWith('data:image') ||
    url.startsWith('blob:') ||
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(url)
  );
}

export default function CloudFileUpload({
  label = 'Sampul Buku / File',
  accept = 'image/png, image/jpeg, image/jpg, image/webp',
  maxSizeMB = 5,
  entityType = 'buku_cover',
  value,
  fileKey,
  onChange,
  error: externalError,
  helperText,
  className = '',
  id,
}: CloudFileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [internalError, setInternalError] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [currentKey, setCurrentKey] = useState<string | null>(fileKey || null);

  // displayUrl: URL yang benar-benar ditampilkan di <img> — bisa data URL, blob, atau http
  // Diinisialisasi dari prop value (misalnya saat edit buku yang sudah punya cover)
  const [displayUrl, setDisplayUrl] = useState<string | null>(value || null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { uploadFile, abortUpload, isUploading, progress, error: uploadError } = useDirectUpload();

  // Sinkronisasi props dari parent ketika modal dibuka untuk edit buku yang sudah ada
  useEffect(() => {
    if (value) {
      setDisplayUrl(value);
    }
    if (fileKey) {
      setCurrentKey(fileKey);
    }
    if (!value && !fileKey) {
      setDisplayUrl(null);
      setCurrentKey(null);
    }
  }, [value, fileKey]);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const validateAndUpload = async (file: File) => {
    setInternalError('');

    // Validasi ukuran file di client
    if (file.size > maxSizeBytes) {
      setInternalError(`Ukuran file melebihi batas ${maxSizeMB} MB (Ukuran: ${formatFileSize(file.size)}).`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validasi tipe MIME di client
    if (accept && accept !== '*') {
      const acceptedTypes = accept.split(',').map((t) => t.trim().toLowerCase());
      const fileType = file.type.toLowerCase();
      const fileExt = '.' + (file.name.split('.').pop()?.toLowerCase() || '');
      const isMatch = acceptedTypes.some((type) => {
        if (type.endsWith('/*')) return fileType.startsWith(type.split('/')[0] + '/');
        return type === fileType || type === fileExt;
      });
      if (!isMatch) {
        setInternalError(`Format tidak diizinkan. Format yang diterima: ${accept}`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
    }

    // Set info file untuk tampilan
    setFileName(file.name);
    setFileSize(file.size);

    // Tampilkan blob URL sementara selama upload berlangsung
    const blobUrl = URL.createObjectURL(file);
    setDisplayUrl(blobUrl);

    try {
      const result = await uploadFile(file, entityType);

      // Setelah upload selesai:
      // - Di mode dev: result.publicUrl adalah Data URL (base64) — persisten, bisa disimpan di localStorage
      // URL publik Blob ditampilkan, sementara pathname disimpan sebagai file key.
      setCurrentKey(result.fileKey);

      // Ganti blob URL sementara dengan publicUrl yang persisten
      URL.revokeObjectURL(blobUrl);
      setDisplayUrl(result.publicUrl);

      // Kirim ke parent: fileKey untuk disimpan ke DB, publicUrl untuk ditampilkan
      onChange(result.fileKey, result.publicUrl);

    } catch {
      // Upload gagal — bersihkan dan kembalikan ke kondisi sebelumnya
      URL.revokeObjectURL(blobUrl);
      setDisplayUrl(value || null);
      setFileName('');
      setFileSize(null);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndUpload(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndUpload(file);
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUploading) abortUpload();

    // Blob dihapus setelah perubahan buku tersimpan di API. Menghapus di sini
    // bisa membuat cover buku lama hilang saat pengguna membatalkan modal edit.
    setFileName('');
    setFileSize(null);
    setDisplayUrl(null);
    setCurrentKey(null);
    setInternalError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    onChange(null, null);
  };

  const activeError = internalError || uploadError || externalError;
  const hasPreview = Boolean(displayUrl);

  return (
    <div className={`file-upload-wrap ${className}`}>
      {label && <label className="lbl fl">{label}</label>}

      {hasPreview ? (
        <div className="file-preview-card">
          {isDisplayableImage(displayUrl) ? (
            <img
              src={displayUrl!}
              alt="Preview Sampul"
              className="file-preview-thumb"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <div className="file-preview-thumb-placeholder">📄</div>
          )}
          <div className="file-preview-info">
            <div className="file-preview-name">
              {fileName || currentKey?.split('/').pop() || 'File Terunggah'}
            </div>
            <div className="file-preview-size">
              {fileSize
                ? formatFileSize(fileSize)
                : displayUrl?.startsWith('data:')
                ? 'Tersimpan (Dev Mode)'
                : 'Tersimpan di Cloud'}{' '}
              •{' '}
              <span style={{ color: '#059669', fontWeight: 600 }}>
                {currentKey ? 'Tervalidasi' : 'Siap'}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="file-remove-btn"
            onClick={handleRemove}
            disabled={isUploading}
          >
            {isUploading ? 'Batal' : 'Ganti / Hapus'}
          </button>
        </div>
      ) : (
        <div
          className={`file-dropzone ${isDragging ? 'dragging' : ''} ${activeError ? 'has-error' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); }
          }}
        >
          <div className="file-upload-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <div className="file-upload-text">
            <span>Tarik file ke sini, atau </span>
            <b>Pilih File</b>
          </div>
          <div className="file-upload-limit">
            {helperText || `Format: JPG, PNG, WEBP • Batas Maksimal: ${maxSizeMB} MB`}
          </div>
        </div>
      )}

      {/* Progress Bar Real-time */}
      {isUploading && (
        <div className="file-upload-progress-wrap">
          <div className="file-progress-header">
            <span>Memproses file... ({progress.percentage}%)</span>
            <button type="button" className="file-progress-cancel-btn" onClick={abortUpload}>Batal</button>
          </div>
          <div className="file-progress-track">
            <div className="file-progress-fill" style={{ width: `${progress.percentage}%` }} />
          </div>
          <div className="file-progress-stats">
            <span>{formatFileSize(progress.loaded)} terkirim</span>
            <span>dari {formatFileSize(progress.total)}</span>
          </div>
        </div>
      )}

      <input ref={fileInputRef} id={id} type="file" accept={accept} style={{ display: 'none' }} onChange={handleFileChange} />

      {activeError && (
        <div className="file-upload-error">
          <span>⚠️ {activeError}</span>
        </div>
      )}
    </div>
  );
}
