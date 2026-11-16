'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/hooks/useApp';
import { MENU } from '@/lib/data';
import Icon from '@/components/common/Icon';

export default function Sidebar() {
  const { route, data, openProfile, confirmLogout } = useApp();

  return (
    <aside id="sb">
      <div className="brand">
        <i>
          <Icon name="book" size={22} />
        </i>
        <div>
          <b>Pasar Buku Wilis</b>
          <small>Admin Portal Malang</small>
        </div>
      </div>

      <nav className="nav">
        {MENU.map(m => (
          <Link key={m.path} href={`/${m.path}`} className={m.path === route ? 'on' : ''}>
            <Icon name={m.icon} />
            {m.label}
            {m.path === 'moderasi' && data.post.length > 0 && <span className="cnt">{data.post.length}</span>}
          </Link>
        ))}
      </nav>

      <div className="me" onClick={openProfile} style={{ cursor: 'pointer' }}>
        Profil Admin
        <small>admin.wilis@malang.go.id</small>
      </div>
      <a className="out" onClick={confirmLogout} style={{ cursor: 'pointer' }}>
        <Icon name="out" /> Keluar
      </a>
    </aside>
  );
}

