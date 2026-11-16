'use client';

import React from 'react';
import DataTable, { ColumnDefinition } from '@/components/common/DataTable';
import { BukuItem } from '@/types';

const COLUMNS: ColumnDefinition[] = [
  { label: '' },
  { label: 'Judul & Penulis' },
  { label: 'Kategori' },
  { label: 'Kios' },
  { label: 'Stok' },
  { label: 'Aksi', right: true }
];

export interface BukuTableProps {
  items: BukuItem[];
  kiosName: (id: string) => string;
  onEdit: (buku: BukuItem) => void;
  onDelete: (id: number | string) => void;
  per?: number;
}

export default function BukuTable({ items, kiosName, onEdit, onDelete, per = 5 }: BukuTableProps) {
  return (
    <DataTable
      items={items}
      per={per}
      columns={COLUMNS}
      empty="Tidak ada buku yang cocok."
      renderRow={b => (
        <tr key={b.id}>
          <td>
            {b.cover ? (
              <img
                src={b.cover}
                alt={b.j}
                className="cover"
                style={{ objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div className="cover"></div>
            )}
          </td>
          <td>
            <b>{b.j}</b>
            <small>{b.p}</small>
          </td>
          <td>
            <span className="tag">{b.c}</span>
          </td>
          <td>
            <span className="tag b">{b.k}</span> {kiosName(b.k)}
          </td>
          <td className="mono">{b.st}</td>
          <td className="r">
            <a className="ln" onClick={() => onEdit(b)}>
              Edit
            </a>
            <a className="ln" style={{ color: 'var(--bad)' }} onClick={() => onDelete(b.id)}>
              Hapus
            </a>
          </td>
        </tr>
      )}
    />
  );
}

