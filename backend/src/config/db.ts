import mysql from 'mysql2/promise';
import type { PoolConnection } from 'mysql2/promise';

// Koneksi MySQL (pool). Nilainya dibaca dari .env (dimuat di server.ts).
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pasar_buku_wilis',
    waitForConnections: true,
    connectionLimit: 10,
    charset: 'utf8mb4',
    dateStrings: true // DATE/DATETIME dikembalikan sebagai string, bukan objek Date
});

// Jalankan beberapa query sebagai satu transaksi (semua berhasil, atau dibatalkan semua)
export const withTransaction = async <T>(work: (conn: PoolConnection) => Promise<T>): Promise<T> => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const result = await work(conn);
        await conn.commit();
        return result;
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};

export default db;
