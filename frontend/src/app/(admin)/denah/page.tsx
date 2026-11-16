'use client';

import React, { useEffect } from 'react';
import { useDenah } from '@/hooks/useDenah';
import { BLOCK_OPTIONS } from '@/lib/data';
import Stat from '@/components/common/Stat';
import DenahGrid from '@/components/denah/DenahGrid';
import DenahDetailSide from '@/components/denah/DenahDetailSide';

export default function Denah() {
  const {
    tab,
    setTab,
    selected,
    setSel,
    rows,
    ids,
    kiosInView,
    openCount,
    emptyCount,
    allKios,
    lastUpdate,
    openKiosForm,
    openProfileCatalog
  } = useDenah();

  // Kalau kios terpilih tidak ada di tab ini, pilih kotak pertama
  const sel = ids.includes(selected) ? selected : ids[0];
  useEffect(() => {
    if (sel !== selected) setSel(sel);
  }, [sel, selected, setSel]);

  const currentKios = allKios.find(x => x.id === sel);

  return (
    <>
      <div className="tabs" style={{ gap: 6 }}>
        {BLOCK_OPTIONS.map(([value, label]) => (
          <button
            key={value}
            className={tab === value ? 'on' : ''}
            onClick={() => setTab(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <section className="stats">
        <Stat label="Total Kapasitas Kios" value={`${ids.length} Kios`} />
        <Stat label="Kios Aktif / Terbuka" value={`${openCount} Kios`} />
        <Stat
          label="Status Operasional"
          value={`${kiosInView.length ? Math.round((openCount / kiosInView.length) * 100) : 0}% Buka`}
        />
        <Stat label="Kosong / Tersedia" value={`${emptyCount} Kios`} />
      </section>

      <div className="grid2">
        <DenahGrid
          tab={tab}
          rows={rows}
          allKios={allKios}
          selectedSlot={sel}
          onSelectSlot={setSel}
          lastUpdate={lastUpdate}
          kiosInView={kiosInView}
          emptyCount={emptyCount}
        />

        <DenahDetailSide
          kios={currentKios}
          slotId={sel}
          onEdit={k => openKiosForm(k)}
          onProfile={openProfileCatalog}
          onNewKios={(_, slot) => openKiosForm(null, slot)}
        />
      </div>
    </>
  );
}

