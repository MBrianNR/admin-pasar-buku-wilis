'use client';

import React, { useState } from 'react';
import { useApp } from '@/hooks/useApp';
import { validatePengaturanInput } from '@/validators/pengaturanValidator';
import { PengaturanItem } from '@/types';

export default function PengaturanForm() {
  const { data, saveSettings, toast } = useApp();
  const [f, setF] = useState<PengaturanItem>(data.set);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string>('');

  const set = (name: keyof PengaturanItem, value: string) => {
    setF(p => ({ ...p, [name]: value }));
    if (errors[name]) {
      setErrors(p => ({ ...p, [name]: '' }));
    }
  };

  const save = () => {
    const s: PengaturanItem = {
      nama: f.nama.trim(),
      head: f.head.trim(),
      desc: f.desc.trim(),
      wa: f.wa.trim(),
      em: f.em.trim()
    };

    // Validasi data input pengaturan
    const validation = validatePengaturanInput(s);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setGeneralError(validation.message);
      return;
    }

    setErrors({});
    setGeneralError('');
    saveSettings(s);
  };

  const reset = () => {
    setF(data.set);
    setErrors({});
    setGeneralError('');
    toast('Perubahan dibatalkan');
  };

  return (
    <section className="card">
      <div className="mb">
        <div>
          <h3>Identitas &amp; Teks Website</h3>
          <p style={{ fontSize: 12, color: 'var(--mut)' }}>
            Pengaturan judul, slogan, dan pengumuman yang tampil pada beranda.
          </p>
        </div>
        <div className="h">
          <label className="lbl fl">Nama Website *</label>
          <input
            id="s-nama"
            value={f.nama}
            onChange={e => set('nama', e.target.value)}
            style={errors.nama ? { borderColor: 'var(--bad)' } : undefined}
          />
          {errors.nama && (
            <small style={{ color: 'var(--bad)', fontSize: 11, display: 'block', marginTop: 2 }}>
              {errors.nama}
            </small>
          )}
        </div>
        <div className="h">
          <label className="lbl fl">Headline *</label>
          <input
            id="s-head"
            value={f.head}
            onChange={e => set('head', e.target.value)}
            style={errors.head ? { borderColor: 'var(--bad)' } : undefined}
          />
          {errors.head && (
            <small style={{ color: 'var(--bad)', fontSize: 11, display: 'block', marginTop: 2 }}>
              {errors.head}
            </small>
          )}
        </div>
        <div>
          <label className="lbl fl">
            Description Text{' '}
            <span id="cc" style={{ float: 'right' }}>
              {f.desc.length}/160
            </span>
          </label>
          <textarea
            id="s-desc"
            rows={3}
            maxLength={160}
            value={f.desc}
            onChange={e => set('desc', e.target.value)}
            style={errors.desc ? { borderColor: 'var(--bad)' } : undefined}
          />
          {errors.desc && (
            <small style={{ color: 'var(--bad)', fontSize: 11, display: 'block', marginTop: 2 }}>
              {errors.desc}
            </small>
          )}
        </div>
      </div>

      <div className="mb" style={{ borderTop: '1px solid var(--line)' }}>
        <div>
          <h3>Kontak Pengunjung Website</h3>
          <p style={{ fontSize: 12, color: 'var(--mut)' }}>
            Saluran komunikasi resmi yang ditampilkan di footer portal.
          </p>
        </div>
        <div className="h">
          <label className="lbl fl">WhatsApp Pusat Informasi</label>
          <input
            id="s-wa"
            value={f.wa}
            onChange={e => set('wa', e.target.value)}
            style={errors.wa ? { borderColor: 'var(--bad)' } : undefined}
          />
          {errors.wa && (
            <small style={{ color: 'var(--bad)', fontSize: 11, display: 'block', marginTop: 2 }}>
              {errors.wa}
            </small>
          )}
        </div>
        <div className="h">
          <label className="lbl fl">Email Pengaduan / Pertanyaan</label>
          <input
            id="s-em"
            type="email"
            value={f.em}
            onChange={e => set('em', e.target.value)}
            style={errors.em ? { borderColor: 'var(--bad)' } : undefined}
          />
          {errors.em && (
            <small style={{ color: 'var(--bad)', fontSize: 11, display: 'block', marginTop: 2 }}>
              {errors.em}
            </small>
          )}
        </div>
      </div>

      <div className="mf" style={{ background: '#f8f9ff', borderRadius: '0 0 16px 16px' }}>
        <span style={{ fontSize: 12, color: 'var(--mut)' }}>
          ⓘ Perubahan langsung tersinkronisasi pada beranda &amp; footer.{' '}
          {generalError && (
            <span className="er" id="ser" style={{ display: 'inline', color: 'var(--bad)', marginLeft: 8 }}>
              ⚠️ {generalError}
            </span>
          )}
        </span>
        <span style={{ display: 'flex', gap: 10 }}>
          <button className="btn o" onClick={reset}>
            Batal
          </button>
          <button className="btn" onClick={save}>
            Simpan Pengaturan
          </button>
        </span>
      </div>
    </section>
  );
}

