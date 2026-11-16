// Konstanta yang sama dengan src/lib/data.js di frontend

export const SPECIALIZATIONS = [
    'Buku Pelajaran',
    'Novel & Sastra',
    'Buku Langka & Antik',
    'Agama & Kitab',
    'Komik'
] as const;

export const STATUS_KIOS = ['buka', 'pending', 'tutup'] as const;

export const STATUS_LABEL: Record<string, string> = {
    buka: 'Buka',
    pending: 'Pending Verifikasi',
    tutup: 'Tutup Sementara'
};

export const BLOCKS = ['A', 'B', 'C'] as const;

export const MAP_LABEL: Record<string, string> = {
    A: 'Blok A (Sisi Timur Jl. Simpang Wilis)',
    B: 'Blok B (Area Tengah)',
    C: 'Blok C (Sisi Selatan)'
};

export const FORUM_STATUS = ['pending', 'laporan', 'disetujui', 'dipertahankan', 'dihapus'] as const;
