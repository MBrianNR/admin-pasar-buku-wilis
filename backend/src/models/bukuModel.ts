import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import db from '../config/db.js';
import { escapeLike } from '../utils/helpers.js';

export interface Buku {
    id: number;
    judul: string;
    penulis: string;
    kategori: string;
    kios_id: string;
    kios_nama: string;
    stok: number;
    harga: number;
    cover_url: string | null;
    cover_file_key: string | null;
}

export interface BukuInput {
    judul: string;
    penulis: string;
    kategori: string;
    kios_id: string;
    stok: number;
    harga: number;
    cover_url?: string | null;
    cover_file_key?: string | null;
}

type BukuRow = Buku & RowDataPacket;

const SELECT_BUKU = `
    SELECT b.id, b.judul, b.penulis, s.nama AS kategori, b.kios_id, k.nama AS kios_nama, b.stok, b.harga,
           b.cover_url, b.cover_file_key
    FROM buku b
    JOIN spesialisasi s ON s.id = b.spesialisasi_id
    JOIN kios k ON k.id = b.kios_id`;

const SEARCH = "CONCAT(b.judul, ' ', b.penulis, ' ', s.nama, ' ', b.kios_id, ' ', k.nama) LIKE ?";

const normalize = (r: BukuRow): Buku => ({
    id: r.id,
    judul: r.judul,
    penulis: r.penulis,
    kategori: r.kategori,
    kios_id: r.kios_id,
    kios_nama: r.kios_nama,
    stok: Number(r.stok),
    harga: Number(r.harga),
    cover_url: r.cover_url || null,
    cover_file_key: r.cover_file_key || null
});

export const BukuModel = {
    async findAll(q: string, limit: number, offset: number): Promise<Buku[]> {
        const where = q ? `WHERE ${SEARCH}` : '';
        const params: (string | number)[] = q ? [`%${escapeLike(q)}%`] : [];
        const [rows] = await db.query<BukuRow[]>(
            `${SELECT_BUKU} ${where} ORDER BY b.id DESC LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );
        return rows.map(normalize);
    },

    async count(q: string): Promise<number> {
        const where = q ? `WHERE ${SEARCH}` : '';
        const [rows] = await db.query<RowDataPacket[]>(
            `SELECT COUNT(*) AS total FROM buku b
             JOIN spesialisasi s ON s.id = b.spesialisasi_id
             JOIN kios k ON k.id = b.kios_id ${where}`,
            q ? [`%${escapeLike(q)}%`] : []
        );
        return Number(rows[0].total);
    },

    // Kartu statistik halaman Katalog: total judul, total stok, kios terhubung
    async summary(): Promise<{ total_judul: number; total_stok: number; kios_terhubung: number }> {
        const [rows] = await db.query<RowDataPacket[]>(
            'SELECT COUNT(*) AS total_judul, COALESCE(SUM(stok), 0) AS total_stok, COUNT(DISTINCT kios_id) AS kios_terhubung FROM buku'
        );
        const r = rows[0];
        return {
            total_judul: Number(r.total_judul),
            total_stok: Number(r.total_stok),
            kios_terhubung: Number(r.kios_terhubung)
        };
    },

    async findById(id: number): Promise<Buku | null> {
        const [rows] = await db.query<BukuRow[]>(`${SELECT_BUKU} WHERE b.id = ?`, [id]);
        return rows[0] ? normalize(rows[0]) : null;
    },

    async create(data: BukuInput): Promise<number> {
        const [result] = await db.query<ResultSetHeader>(
            `INSERT INTO buku (judul, penulis, spesialisasi_id, kios_id, stok, harga, cover_url, cover_file_key)
             SELECT ?, ?, id, ?, ?, ?, ?, ? FROM spesialisasi WHERE nama = ?`,
            [data.judul, data.penulis, data.kios_id, data.stok, data.harga, data.cover_url ?? null, data.cover_file_key ?? null, data.kategori]
        );
        return result.insertId;
    },

    // Hanya kolom yang dikirim yang diubah
    async update(id: number, data: Partial<BukuInput>): Promise<boolean> {
        const sets: string[] = [];
        const params: (string | number | null)[] = [];

        if (data.judul !== undefined) { sets.push('judul = ?'); params.push(data.judul); }
        if (data.penulis !== undefined) { sets.push('penulis = ?'); params.push(data.penulis); }
        if (data.kategori !== undefined) {
            sets.push('spesialisasi_id = (SELECT id FROM spesialisasi WHERE nama = ?)');
            params.push(data.kategori);
        }
        if (data.kios_id !== undefined) { sets.push('kios_id = ?'); params.push(data.kios_id); }
        if (data.stok !== undefined) { sets.push('stok = ?'); params.push(data.stok); }
        if (data.harga !== undefined) { sets.push('harga = ?'); params.push(data.harga); }
        if (data.cover_url !== undefined) { sets.push('cover_url = ?'); params.push(data.cover_url); }
        if (data.cover_file_key !== undefined) { sets.push('cover_file_key = ?'); params.push(data.cover_file_key); }

        if (sets.length === 0) return true;
        const [result] = await db.query<ResultSetHeader>(`UPDATE buku SET ${sets.join(', ')} WHERE id = ?`, [...params, id]);
        return result.affectedRows > 0;
    },

    async remove(id: number): Promise<boolean> {
        const [result] = await db.query<ResultSetHeader>('DELETE FROM buku WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};
