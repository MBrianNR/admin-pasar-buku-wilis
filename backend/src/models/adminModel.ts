import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import db from '../config/db';

export interface Admin {
    id: number;
    username: string;
    nama: string | null;
    email: string;
    password: string; // hash bcrypt
    peran: string;
}

type AdminRow = Admin & RowDataPacket;

export const AdminModel = {
    async findByUsername(username: string): Promise<Admin | null> {
        const [rows] = await db.query<AdminRow[]>('SELECT * FROM admin WHERE username = ?', [username]);
        return rows[0] ?? null;
    },

    async findById(id: number): Promise<Admin | null> {
        const [rows] = await db.query<AdminRow[]>('SELECT * FROM admin WHERE id = ?', [id]);
        return rows[0] ?? null;
    },

    async existsByUsernameOrEmail(username: string, email: string): Promise<boolean> {
        const [rows] = await db.query<RowDataPacket[]>(
            'SELECT id FROM admin WHERE username = ? OR email = ? LIMIT 1',
            [username, email]
        );
        return rows.length > 0;
    },

    async create(username: string, nama: string | null, email: string, passwordHash: string): Promise<number> {
        const [result] = await db.query<ResultSetHeader>(
            'INSERT INTO admin (username, nama, email, password) VALUES (?, ?, ?, ?)',
            [username, nama, email, passwordHash]
        );
        return result.insertId;
    }
};
