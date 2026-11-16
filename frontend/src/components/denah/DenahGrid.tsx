'use client';

import React from 'react';
import { MAP_LABEL } from '@/lib/data';
import { slotIds } from '@/lib/utils';
import { KiosItem } from '@/types';

export interface DenahGridProps {
  tab: string;
  rows: string[];
  allKios: KiosItem[];
  selectedSlot: string;
  onSelectSlot: (slotId: string) => void;
  lastUpdate?: string;
  kiosInView: KiosItem[];
  emptyCount: number;
}

export default function DenahGrid({
  tab,
  rows,
  allKios,
  selectedSlot,
  onSelectSlot,
  lastUpdate,
  kiosInView,
  emptyCount
}: DenahGridProps) {
  const renderSlot = (id: string) => {
    const x = allKios.find(y => y.id === id);
    return (
      <div
        key={id}
        className={`st ${id === selectedSlot ? 'on' : ''} ${x ? '' : 'em'}`}
        data-s={x ? x.s : ''}
        onClick={() => onSelectSlot(id)}
      >
        {id}
        <small>{x ? x.n : 'Siap Dihuni'}</small>
      </div>
    );
  };

  const renderRow = (letter: string) => <div className="row4">{slotIds(letter).map(renderSlot)}</div>;

  return (
    <section className="card dt">
      <div>
        <h3 style={{ fontSize: 16 }}>Peta Lorong: {MAP_LABEL[tab]}</h3>
        <small style={{ color: 'var(--mut)' }}>
          Pilih kotak nomor kios untuk melihat rincian penyewa.
          {lastUpdate ? ` Diperbarui: ${lastUpdate}` : ''}
        </small>
      </div>

      <div className="map">
        {renderRow(rows[0])}
        <div className="lorong">
          <span>← AKSES MASUK</span>
          <span>Lorong Tengah (Lebar 3.5m)</span>
          <span>AKSES KELUAR →</span>
        </div>
        {rows[1] && renderRow(rows[1])}
      </div>

      <div className="leg">
        <span>■ Kios Terpilih ({selectedSlot})</span>
        <span>
          □ Kios Aktif / Terisi <span className="tag b mono">{kiosInView.length} Unit</span>
        </span>
        <span>
          ▨ Kosong / Tersedia <span className="tag mono">{emptyCount} Unit</span>
        </span>
      </div>
    </section>
  );
}

