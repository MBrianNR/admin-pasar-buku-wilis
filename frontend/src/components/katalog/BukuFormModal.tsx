'use client';

import React, { useState, FormEvent, InputHTMLAttributes, SelectHTMLAttributes } from 'react';
import { useApp } from '@/hooks/useApp';
import { SPECIALIZATIONS } from '@/lib/data';
import { validateBukuInput } from '@/validators/bukuValidator';
import { ModalShell, CloseButton } from '@/components/common/modals/InfoModal';
import CloudFileUpload from '@/components/common/CloudFileUpload';
import { BukuItem } from '@/types';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  className?: string;
}

function FormField({ label, error, className = '', ...inputProps }: FormFieldProps) {
  return (
    <div className={className}>
      <label className="lbl fl">{label}</label>
      <input {...inputProps} style={error ? { borderColor: 'var(--bad)' } : undefined} />
      {error && <small style={{ color: 'var(--bad)', fontSize: 11, display: 'block', marginTop: 2 }}>{error}</small>}
    </div>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: [string, string][];
  error?: string;
}

function SelectField({ label, options, error, ...selectProps }: SelectFieldProps) {
  return (
    <div className="h">
      <label className="lbl fl">{label}</label>
      <select {...selectProps} style={error ? { borderColor: 'var(--bad)' } : undefined}>
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
      {error && <small style={{ color: 'var(--bad)', fontSize: 11, display: 'block', marginTop: 2 }}>{error}</small>}
    </div>
  );
}

export interface BukuFormModalProps {
  buku?: BukuItem | null;
  onClose: () => void;
}

export function BukuFormModal({ buku, onClose }: BukuFormModalProps) {
  const { data, saveBuku } = useApp();
  const editing = Boolean(buku);
  const init = buku || {
    j: '',
    p: '',
    c: SPECIALIZATIONS[0],
    k: data.kios[0] ? data.kios[0].id : '',
    st: 1,
    harga: 0,
    cover: ''
  };

  const [f, setF] = useState({
    j: init.j,
    p: init.p,
    c: init.c,
    k: init.k,
    st: init.st,
    harga: String(init.harga ?? ''),
    cover: init.cover || '',
    cover_file_key: (init as BukuItem).cover_file_key || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string>('');

  const set = (name: string, value: any) => {
    setF(p => ({ ...p, [name]: value }));
    if (errors[name]) {
      setErrors(p => ({ ...p, [name]: '' }));
    }
  };

  const submit = (e?: FormEvent) => {
    if (e) e.preventDefault();

    // Validasi inputan data katalog buku
    const validation = validateBukuInput(f, { existingKiosList: data.kios });
    if (!validation.isValid) {
      setErrors(validation.errors);
      setGeneralError(validation.message);
      return;
    }

    setErrors({});
    setGeneralError('');

    saveBuku(
      {
        j: f.j.trim(),
        p: f.p.trim(),
        c: f.c,
        k: f.k,
        st: Math.max(0, parseInt(String(f.st), 10) || 0),
        harga: Number(f.harga),
        cover: f.cover || null,
        cover_file_key: f.cover_file_key || null
      },
      buku ? buku.id : undefined
    );
  };

  return (
    <ModalShell onClose={onClose}>
      <div className="mh">
        <h3>{editing ? 'Edit Buku' : 'Tambah Buku'}</h3>
        <CloseButton onClose={onClose} />
      </div>

      <div className="mb" id="fm">
        <FormField
          label="Judul Buku *"
          value={f.j}
          onChange={e => set('j', e.target.value)}
          placeholder="Judul karya literatur"
          error={errors.j}
        />
        <FormField
          label="Penulis / Pengarang *"
          value={f.p}
          onChange={e => set('p', e.target.value)}
          placeholder="Nama penulis"
          error={errors.p}
        />
        <SelectField
          label="Kategori Spesialisasi"
          options={SPECIALIZATIONS.map(s => [s, s] as [string, string])}
          value={f.c}
          onChange={e => set('c', e.target.value)}
          error={errors.c}
        />
        <SelectField
          label="Kios Pemilik"
          options={data.kios.map(k => [k.id, `${k.id} · ${k.n}`] as [string, string])}
          value={f.k}
          onChange={e => set('k', e.target.value)}
          error={errors.k}
        />
        <FormField
          label="Stok Tersedia (Eksemplar)"
          className="h"
          type="number"
          min="0"
          value={f.st}
          onChange={e => set('st', e.target.value)}
          error={errors.st}
        />
        <div>
          <label className="lbl fl">Harga Buku *</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700 }}>Rp</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={f.harga}
              onChange={e => set('harga', e.target.value.replace(/\D/g, ''))}
              placeholder="Contoh: 25000"
              style={errors.harga ? { borderColor: 'var(--bad)' } : undefined}
            />
          </div>
          {errors.harga && <small style={{ color: 'var(--bad)', fontSize: 11, display: 'block', marginTop: 2 }}>{errors.harga}</small>}
        </div>

        <div>
          <CloudFileUpload
            label="Sampul / Cover Buku (Maks. 5 MB)"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            maxSizeMB={5}
            entityType="buku_cover"
            value={f.cover || null}
            fileKey={f.cover_file_key || null}
            onChange={(fileKey, publicUrl) => {
              set('cover_file_key', fileKey || '');
              set('cover', publicUrl || '');
            }}
            helperText="Langsung unggah ke Vercel Blob • Format: JPG, PNG, WEBP • Maksimal 5 MB"
          />
        </div>

        {generalError && (
          <div className="er" id="er" style={{ display: 'block' }}>
            ⚠️ {generalError}
          </div>
        )}
      </div>

      <div className="mf">
        <button className="btn o" onClick={onClose}>
          Batal
        </button>
        <button className="btn" onClick={submit}>
          {editing ? 'Simpan Perubahan' : '+ Simpan Buku'}
        </button>
      </div>
    </ModalShell>
  );
}

export default BukuFormModal;

