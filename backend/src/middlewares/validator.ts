import type { Request, Response, NextFunction } from 'express';
import { FORUM_STATUS, SPECIALIZATIONS, STATUS_KIOS } from '../utils/constants';
import { isEmail, normalizeKiosId } from '../utils/helpers';

// Gagal Cepat (Fail Fast): hentikan di sini dan balas 400, controller tidak pernah dijalankan
const fail = (res: Response, message: string): void => {
    res.status(400).json({ success: false, message });
};

const isBlank = (v: unknown): boolean => typeof v !== 'string' || v.trim() === '';
const has = (body: Record<string, unknown>, key: string): boolean => body[key] !== undefined;
const bodyOf = (req: Request): Record<string, unknown> =>
    req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};

/* ---------- parameter URL ---------- */

// /:id angka (buku, forum)
export const validateNumericId = (req: Request, res: Response, next: NextFunction): void => {
    if (!/^\d+$/.test(String(req.params.id))) {
        fail(res, 'ID harus berupa angka!');
        return;
    }
    next();
};

// /:id nomor kios, contoh A-04. Hasil normalisasi disimpan di res.locals.kiosId
export const validateKiosIdParam = (req: Request, res: Response, next: NextFunction): void => {
    const id = normalizeKiosId(req.params.id);
    if (!id) {
        fail(res, 'Nomor kios tidak valid, contoh: A-15.');
        return;
    }
    res.locals.kiosId = id;
    next();
};

/* ---------- auth ---------- */

export const validateRegister = (req: Request, res: Response, next: NextFunction): void => {
    const { username, email, password, nama } = bodyOf(req);

    if (isBlank(username) || isBlank(email) || isBlank(password)) {
        fail(res, 'Username, email, dan password wajib diisi!');
        return;
    }
    if (!/^[a-zA-Z0-9_.]{3,50}$/.test((username as string).trim())) {
        fail(res, 'Username 3-50 karakter, hanya huruf, angka, titik, dan underscore!');
        return;
    }
    if (!isEmail((email as string).trim()) || (email as string).length > 100) {
        fail(res, 'Format email tidak valid!');
        return;
    }
    if ((password as string).length < 6 || (password as string).length > 72) {
        fail(res, 'Password minimal 6 dan maksimal 72 karakter!');
        return;
    }
    if (nama !== undefined && (typeof nama !== 'string' || nama.length > 100)) {
        fail(res, 'Nama maksimal 100 karakter!');
        return;
    }
    next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
    const { username, password } = bodyOf(req);

    if (isBlank(username) || isBlank(password)) {
        fail(res, 'Username dan password wajib diisi!');
        return;
    }
    next();
};

/* ---------- kios ---------- */

// partial = false: dipakai POST (id & nama wajib). partial = true: dipakai PUT (hanya field yang dikirim diperiksa)
const checkKios = (req: Request, res: Response, next: NextFunction, partial: boolean): void => {
    const b = bodyOf(req);
    const clean: Record<string, unknown> = {};

    if (!partial || has(b, 'id')) {
        const id = normalizeKiosId(b.id);
        if (!id) {
            fail(res, 'Nomor kios tidak valid, contoh: A-15.');
            return;
        }
        clean.id = id;
    }

    if (!partial || has(b, 'nama')) {
        if (isBlank(b.nama)) {
            fail(res, 'Nama toko wajib diisi.');
            return;
        }
        if ((b.nama as string).trim().length > 100) {
            fail(res, 'Nama toko maksimal 100 karakter.');
            return;
        }
        clean.nama = (b.nama as string).trim();
    }

    if (has(b, 'pemilik')) {
        if (typeof b.pemilik !== 'string' || b.pemilik.trim().length > 100) {
            fail(res, 'Nama pemilik maksimal 100 karakter.');
            return;
        }
        clean.pemilik = b.pemilik.trim();
    }

    if (has(b, 'whatsapp')) {
        if (typeof b.whatsapp !== 'string' || b.whatsapp.trim().length > 20) {
            fail(res, 'Nomor WhatsApp tidak valid.');
            return;
        }
        const digits = b.whatsapp.replace(/\D/g, '').length;
        if (b.whatsapp.trim() && digits < 9) {
            fail(res, 'Nomor WhatsApp tidak valid.');
            return;
        }
        clean.whatsapp = b.whatsapp.trim();
    }

    if (has(b, 'email')) {
        if (typeof b.email !== 'string' || (b.email.trim() && !isEmail(b.email.trim())) || b.email.length > 100) {
            fail(res, 'Format email tidak valid.');
            return;
        }
        clean.email = b.email.trim();
    }

    if (has(b, 'spesialisasi')) {
        const sp = b.spesialisasi;
        const known: readonly string[] = SPECIALIZATIONS;
        if (!Array.isArray(sp) || sp.some(s => typeof s !== 'string' || !known.includes(s))) {
            fail(res, 'Spesialisasi harus berupa array dari: ' + SPECIALIZATIONS.join(', ') + '.');
            return;
        }
        clean.spesialisasi = SPECIALIZATIONS.filter(s => sp.includes(s)); // urutan sesuai daftar, tanpa duplikat
    }

    if (has(b, 'status')) {
        const known: readonly string[] = STATUS_KIOS;
        if (typeof b.status !== 'string' || !known.includes(b.status)) {
            fail(res, 'Status harus salah satu dari: ' + STATUS_KIOS.join(', ') + '.');
            return;
        }
        clean.status = b.status;
    }

    if (partial && Object.keys(clean).length === 0) {
        fail(res, 'Tidak ada data yang dikirim untuk diubah!');
        return;
    }

    req.body = clean;
    next();
};

export const validateKios = (req: Request, res: Response, next: NextFunction): void => checkKios(req, res, next, false);
export const validateUpdateKios = (req: Request, res: Response, next: NextFunction): void => checkKios(req, res, next, true);

/* ---------- buku ---------- */

const checkBuku = (req: Request, res: Response, next: NextFunction, partial: boolean): void => {
    const b = bodyOf(req);
    const clean: Record<string, unknown> = {};

    for (const [key, required, max] of [
        ['judul', 'Judul buku wajib diisi.', 200],
        ['penulis', 'Penulis wajib diisi.', 150]
    ] as const) {
        if (!partial || has(b, key)) {
            if (isBlank(b[key])) {
                fail(res, required);
                return;
            }
            if ((b[key] as string).trim().length > max) {
                fail(res, `${key === 'judul' ? 'Judul' : 'Penulis'} maksimal ${max} karakter.`);
                return;
            }
            clean[key] = (b[key] as string).trim();
        }
    }

    if (!partial || has(b, 'kategori')) {
        const known: readonly string[] = SPECIALIZATIONS;
        if (typeof b.kategori !== 'string' || !known.includes(b.kategori)) {
            fail(res, 'Kategori harus salah satu dari: ' + SPECIALIZATIONS.join(', ') + '.');
            return;
        }
        clean.kategori = b.kategori;
    }

    if (!partial || has(b, 'kios_id')) {
        const kiosId = normalizeKiosId(b.kios_id);
        if (!kiosId) {
            fail(res, 'kios_id tidak valid, contoh: A-15.');
            return;
        }
        clean.kios_id = kiosId;
    }

    if (has(b, 'stok')) {
        const stok = Number(b.stok);
        if (b.stok === '' || b.stok === null || !Number.isInteger(stok) || stok < 0 || stok > 1_000_000) {
            fail(res, 'Stok harus berupa bilangan bulat 0 atau lebih.');
            return;
        }
        clean.stok = stok;
    } else if (!partial) {
        clean.stok = 0;
    }

    if (partial && Object.keys(clean).length === 0) {
        fail(res, 'Tidak ada data yang dikirim untuk diubah!');
        return;
    }

    req.body = clean;
    next();
};

export const validateBuku = (req: Request, res: Response, next: NextFunction): void => checkBuku(req, res, next, false);
export const validateUpdateBuku = (req: Request, res: Response, next: NextFunction): void => checkBuku(req, res, next, true);

/* ---------- forum ---------- */

export const validateForum = (req: Request, res: Response, next: NextFunction): void => {
    const { username, judul, isi, status, alasan } = bodyOf(req);

    if (isBlank(username) || isBlank(judul) || isBlank(isi)) {
        fail(res, 'Username, judul, dan isi postingan wajib diisi!');
        return;
    }
    if ((username as string).trim().length > 80 || (judul as string).trim().length > 200) {
        fail(res, 'Username maksimal 80 karakter dan judul maksimal 200 karakter!');
        return;
    }
    if (status !== undefined && status !== 'pending' && status !== 'laporan') {
        fail(res, "Status awal hanya boleh 'pending' atau 'laporan'!");
        return;
    }
    if (alasan !== undefined && (typeof alasan !== 'string' || alasan.length > 255)) {
        fail(res, 'Alasan maksimal 255 karakter!');
        return;
    }

    req.body = {
        username: (username as string).trim(),
        judul: (judul as string).trim(),
        isi: (isi as string).trim(),
        status: status ?? 'pending',
        alasan: typeof alasan === 'string' ? alasan.trim() : ''
    };
    next();
};

// Dipakai untuk memeriksa filter ?status= di GET /api/forum
export const isForumStatus = (v: string): boolean => (FORUM_STATUS as readonly string[]).includes(v);

/* ---------- pengaturan ---------- */

export const validatePengaturan = (req: Request, res: Response, next: NextFunction): void => {
    const b = bodyOf(req);
    const clean: Record<string, string> = {};

    for (const [key, label] of [['nama_website', 'Nama website'], ['headline', 'Headline']] as const) {
        if (has(b, key)) {
            if (isBlank(b[key])) {
                fail(res, 'Nama website dan headline wajib diisi.');
                return;
            }
            if ((b[key] as string).trim().length > 150) {
                fail(res, `${label} maksimal 150 karakter.`);
                return;
            }
            clean[key] = (b[key] as string).trim();
        }
    }

    if (has(b, 'deskripsi')) {
        if (typeof b.deskripsi !== 'string' || b.deskripsi.trim().length > 160) {
            fail(res, 'Description text maksimal 160 karakter.');
            return;
        }
        clean.deskripsi = b.deskripsi.trim();
    }

    if (has(b, 'whatsapp')) {
        if (typeof b.whatsapp !== 'string' || b.whatsapp.trim().length > 30) {
            fail(res, 'Nomor WhatsApp maksimal 30 karakter.');
            return;
        }
        clean.whatsapp = b.whatsapp.trim();
    }

    if (has(b, 'email')) {
        if (typeof b.email !== 'string' || !isEmail(b.email.trim()) || b.email.length > 100) {
            fail(res, 'Format email tidak valid.');
            return;
        }
        clean.email = b.email.trim();
    }

    if (Object.keys(clean).length === 0) {
        fail(res, 'Tidak ada data yang dikirim untuk diubah!');
        return;
    }

    req.body = clean;
    next();
};
