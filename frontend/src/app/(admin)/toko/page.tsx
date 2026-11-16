'use client';

import React from 'react';
import { useKios } from '@/hooks/useKios';
import Stat from '@/components/common/Stat';
import KiosTable from '@/components/toko/KiosTable';
import KiosFilterChips from '@/components/toko/KiosFilterChips';

export default function Toko() {
  const {
    filteredKios,
    total,
    pendingCount,
    tutupCount,
    filter,
    changeFilter,
    openExport
  } = useKios();

  return (
    <>
      <section className="stats c3">
        <Stat label="Total Kios Terdaftar" value={total} sub="Kapasitas 60" />
        <Stat label="Menunggu Verifikasi" value={pendingCount} sub="Perlu Tindakan" />
        <Stat label="Tutup Sementara" value={tutupCount} sub="Renovasi / Izin" />
      </section>

      <KiosFilterChips
        currentFilter={filter}
        onSelectFilter={changeFilter}
        onExport={openExport}
      />

      <section className="card">
        <KiosTable items={filteredKios} per={5} />
      </section>
    </>
  );
}

