'use client';

import React from 'react';
import { useApp } from '@/hooks/useApp';
import { PAGE_HEADERS } from '@/lib/data';
import Icon from '@/components/common/Icon';

export default function Header() {
  const { route, data, query, changeQuery, searchRef, headerActions, openBell } = useApp();
  const h = PAGE_HEADERS[route] || { title: route };
  const openCount = data.kios.filter(k => k.s === 'buka').length;

  return (
    <header id="hd">
      <div className="bc">
        Admin Portal / <b>{h.title}</b>
      </div>
      {route === 'dashboard' && <span className="pill ok">{openCount} Kios Buka Hari Ini</span>}
      <div className="sp"></div>

      {h.search && (
        <label className="srch">
          <Icon name="search" size={16} />
          <input
            id="q"
            ref={searchRef}
            value={query}
            onChange={e => changeQuery(e.target.value)}
            placeholder={h.search}
          />
        </label>
      )}

      {h.button && h.action && (
        <button className="btn" onClick={() => { if (h.action) headerActions[h.action]?.(); }}>
          {h.button}
        </button>
      )}

      <span className="bell" onClick={openBell} style={{ cursor: 'pointer' }}>
        <Icon name="bell" />
      </span>
    </header>
  );
}
