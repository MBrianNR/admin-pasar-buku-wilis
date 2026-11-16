import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import db, { withTransaction } from '../config/db.js';
import { escapeLike } from '../utils/helpers.js';

export type StatusKios = 'buka' | 'pending' | 'tutup';

export interface Kios {
    id: string;
    nama: string;
    pemilik: string;
    whatsapp: string;
    email: string;
    spesialisasi: string[];
    status: StatusKios;
    jumlah_judul: number;
    tanggal_daftar: string;
}

// Data yang dikirim dari form (sudah dibersihkan validator)
export interface KiosInput {
    id: string;
    nama: string;
    pemilik: string;
    whatsapp: string;
    email: string;
    spesialisasi: string[];
    status: StatusKios;
}

export interface KiosFilter {
    status?: string;
    blok?: string;
    q?: string;
}

interface KiosRow extends RowDataPacket {
    id: string;
    nama: string;
    pemilik: string;
    whatsapp: string;
    email: string;
    status: StatusKios;
    jumlah_judul: number;
    tanggal_daftar: string;
    spesialisasi: string | null; // gabungan nama spesialisasi dipisah "|"
}

const SELECT_KIOS = `
    SELECT k.id, k.nama, k.pemilik, k.whatsapp, k.email, k.status, k.jumlah_judul, k.tanggal_daftar,
           GROUP_CONCAT(s.nama ORDER BY s.id SEPARATOR '|') AS spesialisasi
    FROM kios k
    LEFT JOIN kios_spesialisasi ks ON ks.kios_id = k.id
    LEFT JOIN spesialisasi s ON s.id = ks.spesialisasi_id`;

const toKios = (r: KiosRow): Kios => ({
    id: r.id,
    nama: r.nama,
    pemilik: r.pemilik,
    whatsapp: r.whatsapp,
    email: r.email,
    spesialisasi: r.spesialisasi ? r.spesialisasi.split('|') : [],
    status: r.status,
    jumlah_judul: Number(r.jumlah_judul),
    tanggal_daftar: r.tanggal_daftar
});

const buildWhere = (f: KiosFilter): { sql: string; params: string[] } => {
    const conditions: string[] = [];
    const params: string[] = [];

    if (f.status) {
        conditions.push('k.status = ?');
        params.push(f.status);
    }
    if (f.blok) {
        conditions.push('k.id LIKE ?');
        params.push(`${f.blok}-%`);
    }
    if (f.q) {
        conditions.push("CONCAT(k.nama, ' ', k.pemilik, ' ', k.id, ' ', k.whatsapp) LIKE ?");
        params.push(`%${escapeLike(f.q)}%`);
    }
    return { sql: conditions.length ? 'WHERE ' + conditions.join(' AND ') : '', params };
};

// Ganti seluruh spesialisasi sebuah kios (hapus lama, isi baru)
const setSpecializations = async (conn: PoolConnection, kiosId: string, names: string[]): Promise<void> => {
    await conn.query('DELETE FROM kios_spesialisasi WHERE kios_id = ?', [kiosId]);
    if (names.length) {
        await conn.query(
            'INSERT INTO kios_spesialisasi (kios_id, spesialisasi_id) SELECT ?, id FROM spesialisasi WHERE nama IN (?)',
            [kiosId, names]
        );
    }
};

export const KiosModel = {
    async findAll(
        filter: KiosFilter,
        opts: { pendingFirst?: boolean; limit?: number; offset?: number } = {}
    ): Promise<Kios[]> {
        const where = buildWhere(filter);
        const order = (opts.pendingFirst ? "k.status = 'pending' DESC, " : '') + 'k.id ASC';
        const params: (string | number)[] = [...where.params];
        let paging = '';
        if (opts.limit !== undefined) {
            paging = ' LIMIT ? OFFSET ?';
            params.push(opts.limit, opts.offset ?? 0);
        }

        const [rows] = await db.query<KiosRow[]>(
            `${SELECT_KIOS} ${where.sql} GROUP BY k.id ORDER BY ${order}${paging}`,
            params
        );
        return rows.map(toKios);
    },

    async count(filter: KiosFilter): Promise<number> {
        const where = buildWhere(filter);
        const [rows] = await db.query<RowDataPacket[]>(`SELECT COUNT(*) AS total FROM kios k ${where.sql}`, where.params);
        return Number(rows[0].total);
    },

    // Angka global (tidak terpengaruh filter) untuk kartu statistik Dashboard & halaman Toko
    async summary(): Promise<{ total: number; buka: number; pending: number; tutup: number }> {
        const [rows] = await db.query<RowDataPacket[]>(
            `SELECT COUNT(*) AS total,
                    COALESCE(SUM(status = 'buka'), 0) AS buka,
                    COALESCE(SUM(status = 'pending'), 0) AS pending,
                    COALESCE(SUM(status = 'tutup'), 0) AS tutup
             FROM kios`
        );
        const r = rows[0];
        return { total: Number(r.total), buka: Number(r.buka), pending: Number(r.pending), tutup: Number(r.tutup) };
    },

    async findById(id: string): Promise<Kios | null> {
        const [rows] = await db.query<KiosRow[]>(`${SELECT_KIOS} WHERE k.id = ? GROUP BY k.id`, [id]);
        return rows[0] ? toKios(rows[0]) : null;
    },

    async findByIds(ids: string[]): Promise<Kios[]> {
        if (ids.length === 0) return [];
        const [rows] = await db.query<KiosRow[]>(`${SELECT_KIOS} WHERE k.id IN (?) GROUP BY k.id ORDER BY k.id`, [ids]);
        return rows.map(toKios);
    },

    async create(data: KiosInput): Promise<void> {
        await withTransaction(async conn => {
            await conn.query(
                `INSERT INTO kios (id, nama, pemilik, whatsapp, email, status, jumlah_judul, tanggal_daftar)
                 VALUES (?, ?, ?, ?, ?, ?, 0, CURDATE())`,
                [data.id, data.nama, data.pemilik, data.whatsapp, data.email, data.status]
            );
            await setSpecializations(conn, data.id, data.spesialisasi);
        });
    },

    // Nomor kios boleh diganti (sama seperti form Edit Kios); tabel buku & spesialisasi ikut berubah (ON UPDATE CASCADE)
    async update(currentId: string, data: KiosInput): Promise<void> {
        await withTransaction(async conn => {
            await conn.query(
                'UPDATE kios SET id = ?, nama = ?, pemilik = ?, whatsapp = ?, email = ?, status = ? WHERE id = ?',
                [data.id, data.nama, data.pemilik, data.whatsapp, data.email, data.status, currentId]
            );
            await setSpecializations(conn, data.id, data.spesialisasi);
        });
    },

    async updateStatus(id: string, status: StatusKios): Promise<boolean> {
        const [result] = await db.query<ResultSetHeader>('UPDATE kios SET status = ? WHERE id = ?', [status, id]);
        return result.affectedRows > 0;
    },

    async remove(id: string): Promise<boolean> {
        const [result] = await db.query<ResultSetHeader>('DELETE FROM kios WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};
