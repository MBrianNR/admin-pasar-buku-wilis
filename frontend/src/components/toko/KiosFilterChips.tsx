'use client';

import React from 'react';
import { STATUS_FILTERS } from '@/lib/data';

export interface KiosFilterChipsProps {
  currentFilter: string;
  onSelectFilter: (filter: string) => void;
  onExport: () => void;
}

export default function KiosFilterChips({
  currentFilter,
  onSelectFilter,
  onExport
}: KiosFilterChipsProps) {
  return (
    <div className="card chips">
      {STATUS_FILTERS.map(([value, label]) => (
        <button
          key={value}
          className={currentFilter === value ? 'on' : ''}
          onClick={() => onSelectFilter(value)}
        >
          {label}
        </button>
      ))}
      <button className="ex btn o s" onClick={onExport}>
        Ekspor Data
      </button>
    </div>
  );
}

