'use client';

import React from 'react';

export interface DashboardHeroProps {
  nama: string;
  head: string;
  desc: string;
}

export default function DashboardHero({ nama, head, desc }: DashboardHeroProps) {
  return (
    <section className="hero">
      <span className="pill">Portal Pengelola {nama}</span>
      <h2>{head}</h2>
      <p>{desc}</p>
    </section>
  );
}

