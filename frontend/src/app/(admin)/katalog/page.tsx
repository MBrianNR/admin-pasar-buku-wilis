'use client';

import React from 'react';
import { useBuku } from '@/hooks/useBuku';
import Stat from '@/components/common/Stat';
import BukuTable from '@/components/katalog/BukuTable';

export default function Katalog() {
  const {
    filteredBuku,
    totalJudul,
    totalStok,
    connectedKiosCount,
    kiosName,
    openBukuForm,
    deleteBuku
  } = useBuku();

  return (
    <>
      <section className="stats c3">
        <Stat label="Total Judul" value={totalJudul} sub="Judul" />
        <Stat label="Total Stok" value={totalStok} sub="Eksemplar" />
        <Stat label="Kios Terhubung" value={connectedKiosCount} sub="Kios" />
      </section>

      <section className="card">
        <div className="th">
          <div>
            <h3>Master Katalog Buku</h3>
            <p>Tambah, ubah, dan hapus judul buku yang tersedia di kios.</p>
          </div>
          <button className="btn s" onClick={() => openBukuForm(null)}>
            + Tambah Buku
          </button>
        </div>

        <BukuTable
          items={filteredBuku}
          kiosName={kiosName}
          onEdit={openBukuForm}
          onDelete={deleteBuku}
          per={5}
        />
      </section>
    </>
  );
}

