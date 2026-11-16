import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AdminModel } from '../models/adminModel';
import type { Admin } from '../models/adminModel';
import { isDuplicateError, serverError } from '../utils/helpers';

const toProfile = (a: Admin) => ({
    id: a.id,
    username: a.username,
    nama: a.nama ?? a.username,
    email: a.email,
    peran: a.peran
});

export const register = async (req: Request, res: Response): Promise<void> => {
    // Matikan pendaftaran admin baru kalau sudah di-deploy (ALLOW_REGISTER=false di .env)
    if (process.env.ALLOW_REGISTER === 'false') {
        res.status(403).json({ success: false, message: 'Pendaftaran admin baru sedang ditutup.' });
        return;
    }

    const username = (req.body.username as string).trim();
    const email = (req.body.email as string).trim();
    const nama = typeof req.body.nama === 'string' && req.body.nama.trim() ? req.body.nama.trim() : null;

    try {
        if (await AdminModel.existsByUsernameOrEmail(username, email)) {
            res.status(409).json({ success: false, message: 'Username atau email sudah terdaftar!' });
            return;
        }

        const passwordHash = await bcrypt.hash(req.body.password as string, 10);
        const id = await AdminModel.create(username, nama, email, passwordHash);

        res.status(201).json({
            success: true,
            message: 'Admin berhasil didaftarkan!',
            data: { id, username, email }
        });
    } catch (error) {
        if (isDuplicateError(error)) {
            res.status(409).json({ success: false, message: 'Username atau email sudah terdaftar!' });
            return;
        }
        serverError(res, error, 'Gagal mendaftarkan admin.');
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    const username = (req.body.username as string).trim();
    const password = req.body.password as string;

    try {
        const admin = await AdminModel.findByUsername(username);
        const passwordMatch = admin ? await bcrypt.compare(password, admin.password) : false;

        if (!admin || !passwordMatch) {
            res.status(401).json({ success: false, message: 'Username atau password salah!' });
            return;
        }

        const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET as string, {
            expiresIn: (process.env.JWT_EXPIRES_IN || '1d') as jwt.SignOptions['expiresIn']
        });

        res.status(200).json({
            success: true,
            message: 'Login berhasil!',
            data: { token, admin: toProfile(admin) }
        });
    } catch (error) {
        serverError(res, error, 'Gagal login.');
    }
};

// Isi modal "Profil Admin"
export const me = async (req: Request, res: Response): Promise<void> => {
    try {
        const admin = await AdminModel.findById(res.locals.userId as number);
        if (!admin) {
            res.status(404).json({ success: false, message: 'Akun admin tidak ditemukan.' });
            return;
        }
        res.status(200).json({ success: true, data: toProfile(admin) });
    } catch (error) {
        serverError(res, error, 'Gagal mengambil profil admin.');
    }
};
