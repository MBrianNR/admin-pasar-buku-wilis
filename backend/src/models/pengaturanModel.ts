import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import db from '../config/db.js';

export interface Pengaturan {
    nama_website: string;
    headline: string;
    deskripsi: string;
    whatsapp: string;
    email: string;
    denah_diperbarui_at: string | null;
}

type PengaturanRow = Pengaturan & RowDataPacket;

const FIELDS = ['nama_website', 'headline', 'deskripsi', 'whatsapp', 'email'] as const;

// Tabel pengaturan hanya punya satu baris (id = 1)
export const PengaturanModel = {
    async get(): Promise<Pengaturan | null> {
        const [rows] = await db.query<PengaturanRow[]>(
            'SELECT nama_website, headline, deskripsi, whatsapp, email, denah_diperbarui_at FROM pengaturan WHERE id = 1'
        );
        return rows[0] ?? null;
    },

    async update(data: Partial<Pick<Pengaturan, (typeof FIELDS)[number]>>): Promise<void> {
        const keys = FIELDS.filter(f => data[f] !== undefined);
        if (keys.length === 0) return;
        await db.query<ResultSetHeader>(
            `UPDATE pengaturan SET ${keys.map(k => `${k} = ?`).join(', ')} WHERE id = 1`,
            keys.map(k => data[k] as string)
        );
    },

    // Tombol "Update Denah"
    async touchDenah(): Promise<string> {
        await db.query('UPDATE pengaturan SET denah_diperbarui_at = NOW() WHERE id = 1');
        const [rows] = await db.query<RowDataPacket[]>('SELECT denah_diperbarui_at FROM pengaturan WHERE id = 1');
        return rows[0].denah_diperbarui_at as string;
    }
};
