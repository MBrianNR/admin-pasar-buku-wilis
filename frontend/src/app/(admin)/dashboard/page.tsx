'use client';

import React from 'react';
import { useApp } from '@/hooks/useApp';
import { BLOCK_FILTERS } from '@/lib/data';
import DashboardHero from '@/components/dashboard/DashboardHero';
import DashboardStats from '@/components/dashboard/DashboardStats';
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import KiosTable from '@/components/toko/KiosTable';

export default function Dashboard() {
  const { data, filteredKios, block, changeBlock, openExport, goTo } = useApp();

  const total = data.kios.length;
  const active = data.kios.filter(k => k.s === 'buka').length;
  const pending = data.kios.filter(k => k.s === 'pending').length;
  const percent = total ? Math.round((active / total) * 100) : 0;

  // Kios yang menunggu verifikasi ditampilkan paling atas
  const sorted = [...filteredKios].sort((x, y) => ((y.s === 'pending' ? 1 : 0) - (x.s === 'pending' ? 1 : 0)));

  return (
    <>
      <DashboardHero
        nama={data.set.nama}
        head={data.set.head}
        desc={data.set.desc}
      />

      <DashboardStats
        active={active}
        total={total}
        percent={percent}
        bukuCount={data.buku.length}
        postCount={data.post.length}
      />

      <DashboardTabs
        pendingCount={pending}
        onNavigate={goTo}
      />

      <section className="card">
        <div className="th">
          <div>
            <h3>Manajemen Status Kios Pasar Wilis</h3>
            <p>Kelola verifikasi kios baru, status operasional harian, dan kontak paguyuban pedagang.</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <select value={block} onChange={e => changeBlock(e.target.value)} style={{ width: 'auto' }}>
              {BLOCK_FILTERS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <button className="btn o s" onClick={openExport}>
              Export Data
            </button>
          </div>
        </div>
        <KiosTable items={sorted} per={4} />
      </section>
    </>
  );
}

