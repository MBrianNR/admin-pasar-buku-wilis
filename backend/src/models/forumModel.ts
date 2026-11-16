import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import db from '../config/db.js';

export type StatusPost = 'pending' | 'laporan' | 'disetujui' | 'dipertahankan' | 'dihapus';

export interface Post {
    id: number;
    username: string;
    judul: string;
    isi: string;
    status: StatusPost;
    alasan: string;
    created_at: string;
    dimoderasi_at: string | null;
}

export interface PostInput {
    username: string;
    judul: string;
    isi: string;
    status: 'pending' | 'laporan';
    alasan: string;
}

type PostRow = Post & RowDataPacket;

const COLUMNS = 'id, username, judul, isi, status, alasan, created_at, dimoderasi_at';

export const ForumModel = {
    // Tanpa status = antrean moderasi (pending + laporan), laporan ditampilkan paling bawah seperti urutan data awal
    async findAll(status?: string): Promise<Post[]> {
        const [rows] = status
            ? await db.query<PostRow[]>(`SELECT ${COLUMNS} FROM forum_post WHERE status = ? ORDER BY id ASC`, [status])
            : await db.query<PostRow[]>(
                  `SELECT ${COLUMNS} FROM forum_post WHERE status IN ('pending', 'laporan') ORDER BY id ASC`
              );
        return rows;
    },

    async summary(): Promise<{ menunggu: number; dilaporkan: number; sudah_dimoderasi: number }> {
        const [rows] = await db.query<RowDataPacket[]>(
            `SELECT COALESCE(SUM(status = 'pending'), 0) AS menunggu,
                    COALESCE(SUM(status = 'laporan'), 0) AS dilaporkan,
                    COALESCE(SUM(status IN ('disetujui', 'dipertahankan', 'dihapus')), 0) AS sudah_dimoderasi
             FROM forum_post`
        );
        const r = rows[0];
        return {
            menunggu: Number(r.menunggu),
            dilaporkan: Number(r.dilaporkan),
            sudah_dimoderasi: Number(r.sudah_dimoderasi)
        };
    },

    async findById(id: number): Promise<Post | null> {
        const [rows] = await db.query<PostRow[]>(`SELECT ${COLUMNS} FROM forum_post WHERE id = ?`, [id]);
        return rows[0] ?? null;
    },

    async create(data: PostInput): Promise<number> {
        const [result] = await db.query<ResultSetHeader>(
            'INSERT INTO forum_post (username, judul, isi, status, alasan) VALUES (?, ?, ?, ?, ?)',
            [data.username, data.judul, data.isi, data.status, data.alasan]
        );
        return result.insertId;
    },

    // Hanya postingan yang masih di antrean yang bisa dimoderasi
    async moderate(id: number, status: 'disetujui' | 'dipertahankan' | 'dihapus', adminId: number): Promise<boolean> {
        const [result] = await db.query<ResultSetHeader>(
            `UPDATE forum_post SET status = ?, dimoderasi_at = NOW(), dimoderasi_oleh = ?
             WHERE id = ? AND status IN ('pending', 'laporan')`,
            [status, adminId, id]
        );
        return result.affectedRows > 0;
    }
};
