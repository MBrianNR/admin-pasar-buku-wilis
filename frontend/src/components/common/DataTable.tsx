'use client';

import React, { ReactNode } from 'react';
import { useApp } from '@/hooks/useApp';

export interface ColumnDefinition {
  label: string;
  right?: boolean;
}

export interface DataTableProps<T> {
  items: T[];
  per: number;
  columns: ColumnDefinition[];
  renderRow: (item: T, index: number) => ReactNode;
  empty?: ReactNode;
}

// Tabel + pagination. columns: [{ label, right? }]
export default function DataTable<T>({ items, per, columns, renderRow, empty }: DataTableProps<T>) {
  const { page, setPage } = useApp();

  const n = items.length;
  const pageCount = Math.max(1, Math.ceil(n / per));
  const cur = Math.min(Math.max(page, 1), pageCount);
  const rows = items.slice((cur - 1) * per, cur * per);

  return (
    <>
      <table>
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th key={i} className={c.right ? 'r' : undefined}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map(renderRow)
          ) : (
            <tr>
              <td colSpan={columns.length || 9} style={{ textAlign: 'center', color: 'var(--mut)' }}>
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="pg">
        <div>
          Menampilkan{' '}
          <b>
            {n ? (cur - 1) * per + 1 : 0}–{Math.min(cur * per, n)}
          </b>{' '}
          dari <b>{n}</b> data
        </div>
        <div>
          <button onClick={() => setPage(Math.max(cur - 1, 1))}>Sebelumnya</button>
          {Array.from({ length: pageCount }, (_, i) => (
            <button key={i + 1} className={i + 1 === cur ? 'on' : ''} onClick={() => setPage(i + 1)}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setPage(Math.min(cur + 1, pageCount))}>Berikutnya</button>
        </div>
      </div>
    </>
  );
}

