'use client';

import React, { useState, FormEvent, InputHTMLAttributes, SelectHTMLAttributes } from 'react';
import { useApp } from '@/hooks/useApp';
import { BLOCK_OPTIONS, SPECIALIZATIONS } from '@/lib/data';
import { validateKiosInput } from '@/validators/kiosValidator';
import { ModalShell, CloseButton } from '@/components/common/modals/InfoModal';
import FileUpload from '@/components/common/FileUpload';
import { KiosItem, KiosStatus } from '@/types';

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

export interface KiosFormModalProps {
  kios?: KiosItem | null;
  pre?: string;
  onClose: () => void;
}

export function KiosFormModal({ kios, pre, onClose }: KiosFormModalProps) {
  const { data, saveKios, deleteKios } = useApp();
  const editing = Boolean(kios);
  const init: KiosItem = kios || {
    id: pre || '',
    n: '',
    o: '',
    wa: '',
    em: '',
    sp: [],
    s: 'buka',
    k: 0,
    t: ''
  };

  const [f, setF] = useState({
    n: init.n ?? '',
    em: init.em ?? '',
    b: 'ABC'.includes(init.id[0] || '?') ? init.id[0] : 'A',
    no: init.id,
    o: init.o ?? '',
    wa: init.wa ?? '',
    sp: init.sp ?? [],
    s: init.s as KiosStatus,
    foto: init.foto || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string>('');

  const set = (name: string, value: any) => {
    setF(p => ({ ...p, [name]: value }));
    if (errors[name]) {
      setErrors(p => ({ ...p, [name]: '' }));
    }
  };

  const toggleSpecialization = (s: string) =>
    setF(p => ({ ...p, sp: p.sp.includes(s) ? p.sp.filter(x => x !== s) : [...p.sp, s] }));

  const statusOptions: [string, string, string][] = [
    ['buka', 'Langsung Aktif / Buka', 'Dapat langsung ditemukan pengunjung'],
    ['pending', 'Menunggu Verifikasi', 'Verifikasi berkas & legalitas lapak']
  ].concat(editing ? [['tutup', 'Tutup Sementara', 'Renovasi / izin']] : []) as [string, string, string][];

  const submit = (e?: FormEvent) => {
    if (e) e.preventDefault();

    // Jalankan validasi inputan data menggunakan modul validator
    const validation = validateKiosInput(f, {
      existingKiosList: data.kios,
      editId: kios ? kios.id : ''
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      setGeneralError(validation.message);
      return;
    }

    setErrors({});
    setGeneralError('');

    saveKios(
      {
        id: validation.normalizedId,
        n: f.n.trim(),
        o: f.o.trim(),
        wa: f.wa.trim(),
        em: f.em.trim(),
        sp: SPECIALIZATIONS.filter(s => f.sp.includes(s)),
        s: f.s,
        foto: f.foto || undefined
      },
      kios ? kios.id : ''
    );
  };

  return (
    <ModalShell onClose={onClose}>
      <div className="mh">
        <span className="av" style={{ width: 40, height: 40, margin: 0 }}>
          ▣
        </span>
        <div>
          <h3>{editing ? 'Edit Kios' : 'Tambah Kios Baru'}</h3>
          <p>
            {editing ? 'Perbarui data kios di' : 'Daftarkan pedagang atau kios baru ke'} direktori Pasar
            Buku Wilis
          </p>
        </div>
        <CloseButton onClose={onClose} />
      </div>

      <div className="mb" id="fm">
        <FormField
          label="Nama Toko / Kios *"
          value={f.n}
          onChange={e => set('n', e.target.value)}
          placeholder="mis. Kios Berkah Buku"
          error={errors.n}
        />
        <FormField
          label="Email (opsional)"
          type="email"
          value={f.em}
          onChange={e => set('em', e.target.value)}
          placeholder="pedagang@wilis.id"
          error={errors.em}
        />
        <SelectField
          label="Pilihan Blok"
          options={BLOCK_OPTIONS}
          value={f.b}
          onChange={e => set('b', e.target.value)}
          error={errors.b}
        />
        <FormField
          label="Nomor Kios *"
          className="h"
          value={f.no}
          onChange={e => set('no', e.target.value)}
          placeholder="A-15 atau 15"
          error={errors.no}
        />
        <FormField
          label="Nama Pemilik / PJ"
          className="h"
          value={f.o}
          onChange={e => set('o', e.target.value)}
          placeholder="Nama pemilik"
          error={errors.o}
        />
        <FormField
          label="WhatsApp Aktif"
          className="h"
          value={f.wa}
          onChange={e => set('wa', e.target.value)}
          placeholder="0812-3456-7890"
          error={errors.wa}
        />

        <div>
          <label className="lbl fl">Spesialisasi Buku</label>
          {SPECIALIZATIONS.map(s => (
            <label className="ck" key={s}>
              <input
                type="checkbox"
                checked={f.sp.includes(s)}
                onChange={() => toggleSpecialization(s)}
              />
              {s}
            </label>
          ))}
        </div>

        <div>
          <label className="lbl fl">Status Awal Kios</label>
          <div className="rg">
            {statusOptions.map(([value, title, desc]) => (
              <label className="rc" key={value}>
                <input
                  type="radio"
                  name="s"
                  checked={f.s === value}
                  onChange={() => set('s', value)}
                />
                <span>
                  <b>{title}</b>
                  <small>{desc}</small>
                </span>
              </label>
            ))}
          </div>
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
        {editing && kios && (
          <button className="btn ro" onClick={() => deleteKios(kios.id)}>
            Hapus
          </button>
        )}
        <button className="btn" onClick={submit}>
          {editing ? 'Simpan Perubahan' : '+ Simpan & Daftarkan Kios'}
        </button>
      </div>
    </ModalShell>
  );
}

export default KiosFormModal;
