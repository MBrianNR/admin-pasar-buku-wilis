'use client';

import React from 'react';
import { useApp } from '@/hooks/useApp';
import { STATUS } from '@/lib/data';
import { initials } from '@/lib/utils';
import DataTable, { ColumnDefinition } from '@/components/common/DataTable';
import { KiosItem } from '@/types';

const COLUMNS: ColumnDefinition[] = [
  { label: 'Nama Kios' },
  { label: 'Blok & No.' },
  { label: 'Pemilik' },
  { label: 'WhatsApp' },
  { label: 'Spesialisasi' },
  { label: 'Status' },
  { label: 'Aksi', right: true }
];

export interface KiosTableProps {
  items: KiosItem[];
  per: number;
}

export default function KiosTable({ items, per }: KiosTableProps) {
  const { approveKios, openKiosForm, openKiosDetail } = useApp();

  return (
    <DataTable
      items={items}
      per={per}
      columns={COLUMNS}
      empty="Tidak ada kios yang cocok."
      renderRow={k => (
        <tr key={k.id}>
          <td>
            <span className="av">{initials(k.n)}</span>
            <b>{k.n}</b>
            <small>Terdaftar: {k.t}</small>
          </td>
          <td>
            <span className="tag b">Blok {k.id}</span>
          </td>
          <td>{k.o}</td>
          <td className="mono">{k.wa}</td>
          <td>
            {k.sp.map(s => (
              <span className="tag" key={s}>
                {s}
              </span>
            ))}
          </td>
          <td>
            <span className={`pill ${STATUS[k.s]?.[0] || 'ok'}`}>{STATUS[k.s]?.[1] || k.s}</span>
          </td>
          <td className="r">
            {k.s === 'pending' && (
              <a
                className="ln"
                style={{ color: 'var(--ok)', fontWeight: 700 }}
                onClick={() => approveKios(k.id)}
              >
                Setujui
              </a>
            )}
            <a className="ln" onClick={() => openKiosDetail(k.id)}>
              Detail
            </a>
            <a className="ln" onClick={() => openKiosForm(k)}>
              Edit
            </a>
          </td>
        </tr>
      )}
    />
  );
}

