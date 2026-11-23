// Data awal, konstanta, dan penyimpanan localStorage

import { AppState, KiosItem, KiosStatus } from '@/types';

export const KEY = 'pbw-admin-v1';

export const SPECIALIZATIONS: string[] = [
  'Buku Pelajaran',
  'Novel & Sastra',
  'Buku Langka & Antik',
  'Agama & Kitab',
  'Komik',
  'Kuliah',
  'Kamus',
  'Majalah'
];

export interface MenuItem {
  path: string;
  icon: string;
  label: string;
}

export const MENU: MenuItem[] = [
  { path: 'dashboard', icon: 'grid', label: 'Dashboard' },
  { path: 'toko', icon: 'store', label: 'Toko & Kios Wilis' },
  { path: 'katalog', icon: 'book', label: 'Katalog Buku' },
  { path: 'denah', icon: 'map', label: 'Denah Pasar Wilis' },
  { path: 'moderasi', icon: 'chat', label: 'Moderasi Forum' },
  { path: 'pengaturan', icon: 'gear', label: 'Pengaturan' }
];

export const ROUTES: string[] = MENU.map(m => m.path);

export interface PageHeaderConfig {
  title: string;
  search?: string;
  button?: string;
  action?: string;
}

// title, placeholder pencarian, label tombol, dan nama aksi tombol di header
export const PAGE_HEADERS: Record<string, PageHeaderConfig> = {
  dashboard: { title: 'Dashboard', search: 'Cari kios, pemilik... (Ctrl+K)' },
  toko: {
    title: 'Toko & Kios Wilis',
    search: 'Cari nama kios, nomor, pemilik...',
    button: '+ Tambah Kios Baru',
    action: 'newKios'
  },
  katalog: {
    title: 'Katalog Buku',
    search: 'Cari judul, penulis, kios...',
    button: '+ Tambah Buku',
    action: 'newBuku'
  },
  denah: { title: 'Denah Pasar Wilis', button: 'Update Denah', action: 'updateDenah' },
  moderasi: { title: 'Moderasi Forum' },
  pengaturan: { title: 'Pengaturan' }
};

export const STATUS: Record<string, [string, string]> = {
  buka: ['ok', 'Buka'],
  pending: ['wn', 'Pending Verifikasi'],
  tutup: ['bd', 'Tutup Sementara']
};

export const STATUS_FILTERS: [string, string][] = [
  ['all', 'Semua Kios'],
  ['buka', 'Buka'],
  ['pending', 'Pending Verifikasi'],
  ['tutup', 'Tutup Sementara']
];

export const BLOCK_FILTERS: [string, string][] = [
  ['all', 'Semua Blok (A, B, C)'],
  ['A', 'Blok A'],
  ['B', 'Blok B'],
  ['C', 'Blok C']
];

export const BLOCK_OPTIONS: [string, string][] = [
  ['A', 'Blok A (Utara)'],
  ['B', 'Blok B (Tengah)'],
  ['C', 'Blok C (Selatan)']
];

export const MAP_LABEL: Record<string, string> = {
  A: 'Blok A (Sisi Timur Jl. Simpang Wilis)',
  B: 'Blok B (Area Tengah)',
  C: 'Blok C (Sisi Selatan)'
};

// id, nama, pemilik, WhatsApp, spesialisasi (dipisah "|"), status, jumlah judul, tanggal daftar
const kios = (
  id: string,
  n: string,
  o: string,
  wa: string,
  sp: string,
  s: KiosStatus,
  k: number,
  t: string
): KiosItem => ({ id, n, o, wa, em: '', sp: sp.split('|'), s, k, t });

export const seed = (): AppState => ({
  kios: [
    kios('A-01', 'Toko Surya', 'Hendra Surya', '0812-1100-0001', 'Buku Pelajaran', 'buka', 1280, '12 Jan 2024'),
    kios('A-02', 'Pustaka Kumala', 'Ibu Kumala', '0812-1100-0002', 'Novel & Sastra', 'buka', 940, '03 Feb 2024'),
    kios('A-03', 'Wilis Book', 'Pak Anton', '0812-1100-0003', 'Komik', 'buka', 1530, '19 Feb 2024'),
    kios('A-04', 'Barokah', 'Bambang Soedjarwo', '0812-9876-5432', 'Buku Pelajaran|Agama & Kitab|Novel & Sastra', 'buka', 6450, '12 Jan 2024'),
    kios('B-01', 'Arsip Lawas', 'Pak Darmo', '0813-2200-0001', 'Buku Langka & Antik', 'buka', 2100, '05 Mar 2023'),
    kios('B-02', 'Buku Langka', 'Bu Retno', '0813-2200-0002', 'Buku Langka & Antik', 'buka', 870, '21 Apr 2023'),
    kios('B-03', 'Antika Jaya', 'Pak Jaya', '0813-2200-0003', 'Buku Langka & Antik', 'buka', 640, '09 Jun 2023'),
    kios('C-03', 'Kios Wilis Antik 80', 'Cak Suroso', '0813-7761-0021', 'Komik', 'buka', 1120, '04 Mar 2023'),
    kios('A-12', 'Kios Pustaka Lawas', 'Pak Bambang Soedjarwo', '0812-3456-7890', 'Novel & Sastra', 'buka', 3200, '12 Jan 2024'),
    kios('B-07', 'Kios Sahabat Buku', 'Bu Hj. Siti Maryam', '0856-9922-1143', 'Buku Pelajaran', 'pending', 0, 'Kemarin'),
    kios('B-19', 'Kios Hikmah Pustaka', 'Ustadz M. Fauzi', '0821-4433-2211', 'Agama & Kitab', 'tutup', 2750, '29 Jan 2024')
  ],
  buku: (
    [
      ['Bumi Manusia', 'Pramoedya A. Toer', 'Novel & Sastra', 'A-02', 12],
      ['Laskar Pelangi', 'Andrea Hirata', 'Novel & Sastra', 'A-02', 8],
      ['Matematika SMA Kelas XII', 'Tim Erlangga', 'Buku Pelajaran', 'A-01', 25],
      ['Tafsir Al-Azhar', 'Buya Hamka', 'Agama & Kitab', 'B-19', 3],
      ['Majalah Tempo 1982', 'Redaksi Tempo', 'Buku Langka & Antik', 'B-02', 2],
      ['Si Buta dari Gua Hantu', 'Ganesh T.H.', 'Komik', 'C-03', 5]
    ] as const
  ).map((a, i) => ({ id: i + 1, j: a[0], p: a[1], c: a[2], k: a[3], st: a[4] })),
  post: (
    [
      [1, 'Rina Dewi', 'Request: "Sejarah Malang Tempo Doeloe"', 'Ada yang punya cetakan lama? Siap beli di kios mana pun.', 'pending', 'Permintaan buku baru dari pengunjung.'],
      [2, 'Budi_Kolektor', 'Jual komik Tintin edisi 1970', 'Menawarkan transaksi langsung di luar pasar.', 'pending', 'Perlu dicek: ajakan transaksi di luar kios.'],
      [3, 'Anonim88', 'Promo judi online!!', 'Klik link ini untuk bonus new member.', 'laporan', 'Dilaporkan 5 pengguna: spam & konten tidak pantas.'],
      [4, 'Sari Mahasiswi', 'Cari Kitab Fiqih untuk skripsi', 'Ada yang jual Fiqih Sunnah lengkap?', 'pending', 'Permintaan buku baru dari pengunjung.']
    ] as const
  ).map(a => ({ id: a[0], u: a[1], j: a[2], i: a[3], s: a[4] as any, w: a[5] })),
  set: {
    nama: 'Pasar Buku Wilis - Malang',
    head: 'Temukan Harta Karun Pustaka Nusantara',
    desc: 'Pusat pantauan terpusat untuk 60+ kios buku antik, katalog literatur langka, denah lorong tematik, dan interaksi komunitas pembaca di Kota Malang.',
    wa: '+62 812-3456-7890',
    em: 'info@pasarbukuwilis.id'
  },
  done: 12,
  upd: ''
});

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved) return saved;
    }
  } catch {
    /* abaikan: pakai data awal */
  }
  return seed();
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* abaikan: penyimpanan penuh / diblokir */
  }
}

