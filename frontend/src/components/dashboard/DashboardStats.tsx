'use client';

import React from 'react';
import Stat from '@/components/common/Stat';

export interface DashboardStatsProps {
  active: number;
  total: number;
  percent: number;
  bukuCount: number;
  postCount: number;
}

export default function DashboardStats({
  active,
  total,
  percent,
  bukuCount,
  postCount
}: DashboardStatsProps) {
  return (
    <section className="stats">
      <Stat
        label="Total Kios Aktif"
        value={active}
        sub={`/ ${total} Terdaftar`}
        foot={`↑ ${percent}% Beroperasi`}
      />
      <Stat
        label="Master Katalog"
        value={bukuCount}
        sub="Judul Buku"
        foot="Kelola lewat menu Katalog"
        tone="b"
      />
      <Stat
        label="Pencari Buku (Mobile)"
        value="4.820"
        sub="Pengunjung"
        foot="↑ 14% kenaikan trafik hari libur"
      />
      <Stat
        label="Diskusi & Request"
        value={postCount}
        sub="Thread Baru"
        foot={`${postCount} perlu moderasi`}
        tone="r"
      />
    </section>
  );
}

