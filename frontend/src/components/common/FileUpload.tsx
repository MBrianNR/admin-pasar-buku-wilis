'use client';

import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';

export interface FileUploadProps {
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  value?: string | null;
  onChange: (fileDataUrl: string | null, file?: File | null) => void;
  error?: string;
  helperText?: string;
  className?: string;
  id?: string;
}

/**
 * Format bytes to human readable format (KB or MB)
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function FileUpload({
  label = 'Unggah File',
  accept = 'image/png, image/jpeg, image/jpg, image/webp',
  maxSizeMB = 2,
  value,
  onChange,
  error: externalError,
  helperText,
  className = '',
  id
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [internalError, setInternalError] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const validateAndProcessFile = (file: File) => {
    setInternalError('');

    // Validasi 1: Batas ukuran file
    if (file.size > maxSizeBytes) {
      const actualSize = formatFileSize(file.size);
      const errMsg = `Ukuran file melebihi batas maksimal ${maxSizeMB} MB (Ukuran file: ${actualSize}).`;
      setInternalError(errMsg);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validasi 2: Format file / MIME type
    if (accept && accept !== '*') {
      const acceptedTypes = accept.split(',').map(t => t.trim().toLowerCase());
      const fileType = file.type.toLowerCase();
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();

      const isMatch = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          const mainType = type.split('/')[0];
          return fileType.startsWith(mainType + '/');
        }
        return type === fileType || type === fileExt;
      });

      if (!isMatch) {
        setInternalError(`Format file tidak sesuai! Format yang diizinkan: ${accept}.`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
    }

    // Baca file sebagai data URL (Base64)
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFileName(file.name);
      setFileSize(file.size);
      onChange(result, file);
    };
    reader.onerror = () => {
      setInternalError('Gagal membaca file. Silakan coba kembali.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFileName('');
    setFileSize(null);
    setInternalError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    onChange(null, null);
  };

  const errorMessage = internalError || externalError;
  const hasPreview = Boolean(value);

  return (
    <div className={`file-upload-wrap ${className}`}>
      {label && <label className="lbl fl">{label}</label>}

      {hasPreview ? (
        <div className="file-preview-card">
          {value?.startsWith('data:image') || value?.startsWith('http') || value?.startsWith('/') ? (
            <img src={value} alt="Preview" className="file-preview-thumb" />
          ) : (
            <div className="file-preview-thumb-placeholder">📄</div>
          )}
          <div className="file-preview-info">
            <div className="file-preview-name">{fileName || 'File Berhasil Dipilih'}</div>
            <div className="file-preview-size">
              {fileSize ? formatFileSize(fileSize) : 'Tersimpan'} • Maks. {maxSizeMB} MB
            </div>
          </div>
          <button
            type="button"
            className="file-remove-btn"
            onClick={handleRemove}
            title="Hapus file"
          >
            Hapus / Ganti
          </button>
        </div>
      ) : (
        <div
          className={`file-dropzone ${isDragging ? 'dragging' : ''} ${errorMessage ? 'has-error' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
        >
          <div className="file-upload-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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

      <input
        ref={fileInputRef}
        id={id}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {errorMessage && (
        <div className="file-upload-error">
          <span>⚠️ {errorMessage}</span>
        </div>
      )}
    </div>
  );
}

