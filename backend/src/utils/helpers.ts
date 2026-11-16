import type { Response } from 'express';

export const isEmail = (v: string): boolean => /^\S+@\S+\.\S+$/.test(v);

// "0812-3456-7890" -> https://wa.me/6281234567890
export const waLink = (wa: string): string =>
    wa ? 'https://wa.me/62' + wa.replace(/\D/g, '').replace(/^0/, '') : '';

// "A" -> ["A-01", "A-02", "A-03", "A-04"]
export const slotIds = (letter: string): string[] => [1, 2, 3, 4].map(i => `${letter}-0${i}`);

// "a-5" -> "A-05"; null kalau format salah (hanya blok A-C, nomor 1-2 digit)
export const normalizeKiosId = (raw: unknown): string | null => {
    const s = String(raw ?? '').trim().toUpperCase().replace(/\s+/g, '');
    const m = /^([A-C])-(\d{1,2})$/.exec(s);
    return m ? `${m[1]}-${m[2].padStart(2, '0')}` : null;
};

// Ambil query string yang berupa teks biasa (abaikan array/objek)
export const queryText = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

// Escape karakter spesial LIKE supaya "50%" dicari apa adanya
export const escapeLike = (s: string): string => s.replace(/[\\%_]/g, '\\$&');

export const parsePagination = (query: Record<string, unknown>) => {
    const page = Math.max(1, parseInt(queryText(query.page), 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(queryText(query.limit), 10) || 10));
    return { page, limit, offset: (page - 1) * limit };
};

export const isDuplicateError = (error: unknown): boolean =>
    typeof error === 'object' && error !== null && (error as { code?: string }).code === 'ER_DUP_ENTRY';

export const serverError = (res: Response, error: unknown, message: string): void => {
    console.error(message, error);
    res.status(500).json({ success: false, message });
};

const quote = (s: unknown): string => '"' + String(s).replace(/"/g, '""') + '"';

// Sama dengan kiosToCsv di frontend (lib/utils.js)
export const kiosToCsv = (
    list: { id: string; nama: string; pemilik: string; whatsapp: string; spesialisasi: string[]; status: string }[],
    statusLabel: (s: string) => string
): string =>
    ['ID,Nama,Pemilik,WhatsApp,Spesialisasi,Status']
        .concat(
            list.map(k =>
                [k.id, k.nama, k.pemilik, k.whatsapp, k.spesialisasi.join('; '), statusLabel(k.status)]
                    .map(quote)
                    .join(',')
            )
        )
        .join('\n');
