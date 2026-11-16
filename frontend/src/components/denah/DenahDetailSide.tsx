'use client';

import React from 'react';
import { STATUS } from '@/lib/data';
import { waLink } from '@/lib/utils';
import { KiosItem } from '@/types';

export interface DenahDetailSideProps {
  kios?: KiosItem;
  slotId: string;
  onEdit: (kios: KiosItem) => void;
  onProfile: (slotId: string) => void;
  onNewKios: (kios: null, slotId: string) => void;
}

export default function DenahDetailSide({
  kios,
  slotId,
  onEdit,
  onProfile,
  onNewKios
}: DenahDetailSideProps) {
  if (kios) {
    return (
      <aside className="card dt">
        <div>
          <span className="tag b mono">Kios {kios.id}</span>
          <span className={`pill ${STATUS[kios.s]?.[0] || 'ok'}`}>
            {kios.s === 'buka' ? 'Buka Sekarang' : STATUS[kios.s]?.[1] || kios.s}
          </span>
        </div>
        <h3>{kios.n}</h3>
        <small style={{ color: 'var(--mut)' }}>Spesialis {kios.sp.join(', ') || '-'}</small>
        <div>
          <div className="lbl">Nama Pemilik / Penyewa</div>
          <div className="v">{kios.o}</div>
        </div>
        <div>
          <div className="lbl">Kontak WhatsApp</div>
          <div className="v mono">
            {kios.wa}{' '}
            {kios.wa && (
              <a
                className="pill ok"
                style={{ border: 0 }}
                target="_blank"
                rel="noopener noreferrer"
                href={waLink(kios.wa)}
              >
                Chat WA
              </a>
            )}
          </div>
        </div>
        <div>
          <div className="lbl">Posisi Lorong Pasar</div>
          <div className="v">Lorong Tengah Blok {kios.id[0]}</div>
        </div>
        <div className="row4" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="box">
            <div className="lbl">Total Katalog</div>
            <b style={{ color: 'var(--p)', fontSize: 17 }}>{kios.k.toLocaleString('id-ID')} Judul</b>
          </div>
          <div className="box">
            <div className="lbl">Status Verifikasi</div>
            <b style={{ color: kios.s === 'pending' ? 'var(--warn)' : 'var(--ok)' }}>
              {kios.s === 'pending' ? 'Menunggu' : '✓ Terdaftar'}
            </b>
          </div>
        </div>
        <div className="box" style={{ background: '#f0f9ff', borderColor: '#bae6fd' }}>
          <div className="lbl">Masa Izin Sewa Pemkot</div>
          Berlaku Aktif s/d Oktober 2026
          <div className="bar">
            <i></i>
          </div>
        </div>
        <button className="btn o w" onClick={() => onEdit(kios)}>
          Edit Penempatan Kios
        </button>
        <button className="btn w" onClick={() => onProfile(slotId)}>
          Lihat Profil Toko & Katalog
        </button>
      </aside>
    );
  }

  return (
    <aside className="card dt">
      <div>
        <span className="tag mono">Kios {slotId}</span>
        <span className="pill">Kosong</span>
      </div>
      <h3>Siap Dihuni</h3>
      <small style={{ color: 'var(--mut)' }}>Kios ini masih kosong dan tersedia untuk disewakan.</small>
      <button className="btn w" onClick={() => onNewKios(null, slotId)}>
        Tempatkan Kios Baru
      </button>
    </aside>
  );
}

