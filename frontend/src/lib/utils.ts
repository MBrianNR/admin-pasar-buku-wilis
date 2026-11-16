// Fungsi kecil yang dipakai di banyak tempat

import { KiosItem, KiosStatus } from '@/types';

// "Kios Wilis Antik 80" -> "WA"
export const initials = (name: string): string =>
  name
    .replace(/^(Kios|Toko)\s+/i, '')
    .split(' ')
    .slice(0, 2)
    .map(w => w[0] || '')
    .join('')
    .toUpperCase();

export const isEmail = (v: string): boolean => /^\S+@\S+\.\S+$/.test(v);

// "0812-3456-7890" -> https://wa.me/6281234567890
export const waLink = (wa: string): string =>
  'https://wa.me/' + '62' + wa.replace(/\D/g, '').replace(/^0/, '');

// "A" -> ["A-01", "A-02", "A-03", "A-04"]
export const slotIds = (letter: string): string[] => [1, 2, 3, 4].map(i => `${letter}-0${i}`);

export const todayLabel = (): string =>
  new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

export const nowLabel = (): string =>
  new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

const quote = (s: unknown): string => '"' + String(s ?? '').replace(/"/g, '""') + '"';

export const kiosToCsv = (
  list: KiosItem[],
  statusLabel: (status: KiosStatus) => string
): string =>
  ['ID,Nama,Pemilik,WhatsApp,Spesialisasi,Status']
    .concat(
      list.map(k => [k.id, k.n, k.o, k.wa, k.sp.join('; '), statusLabel(k.s)].map(quote).join(','))
    )
    .join('\n');

