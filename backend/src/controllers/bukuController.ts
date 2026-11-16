import type { Request, Response } from 'express';
import { BukuModel } from '../models/bukuModel.js';
import type { BukuInput } from '../models/bukuModel.js';
import { KiosModel } from '../models/kiosModel.js';
import { parsePagination, queryText, serverError } from '../utils/helpers.js';

export const getBuku = async (req: Request, res: Response): Promise<void> => {
    const query = req.query as Record<string, unknown>;
    const q = queryText(query.q);
    const { page, limit, offset } = parsePagination(query);

    try {
        const [data, total, ringkasan] = await Promise.all([
            BukuModel.findAll(q, limit, offset),
            BukuModel.count(q),
            BukuModel.summary()
        ]);

        res.status(200).json({
            success: true,
            data,
            pagination: { page, limit, total, total_pages: Math.max(1, Math.ceil(total / limit)) },
            ringkasan
        });
    } catch (error) {
        serverError(res, error, 'Gagal mengambil data buku.');
    }
};

export const getBukuById = async (req: Request, res: Response): Promise<void> => {
    try {
        const buku = await BukuModel.findById(Number(req.params.id));
        if (!buku) {
            res.status(404).json({ success: false, message: 'Buku tidak ditemukan.' });
            return;
        }
        res.status(200).json({ success: true, data: buku });
    } catch (error) {
        serverError(res, error, 'Gagal mengambil data buku.');
    }
};

export const createBuku = async (req: Request, res: Response): Promise<void> => {
    const data = req.body as BukuInput;

    try {
        if (!(await KiosModel.findById(data.kios_id))) {
            res.status(400).json({ success: false, message: `Kios ${data.kios_id} tidak ditemukan.` });
            return;
        }

        const id = await BukuModel.create(data);
        res.status(201).json({
            success: true,
            message: 'Buku ditambahkan ke katalog',
            data: await BukuModel.findById(id)
        });
    } catch (error) {
        serverError(res, error, 'Gagal menambahkan buku.');
    }
};

export const updateBuku = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const data = req.body as Partial<BukuInput>;

    try {
        if (!(await BukuModel.findById(id))) {
            res.status(404).json({ success: false, message: 'Buku tidak ditemukan.' });
            return;
        }
        if (data.kios_id && !(await KiosModel.findById(data.kios_id))) {
            res.status(400).json({ success: false, message: `Kios ${data.kios_id} tidak ditemukan.` });
            return;
        }

        await BukuModel.update(id, data);
        res.status(200).json({ success: true, message: 'Buku diperbarui', data: await BukuModel.findById(id) });
    } catch (error) {
        serverError(res, error, 'Gagal memperbarui buku.');
    }
};

export const deleteBuku = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!(await BukuModel.remove(Number(req.params.id)))) {
            res.status(404).json({ success: false, message: 'Buku tidak ditemukan.' });
            return;
        }
        res.status(200).json({ success: true, message: 'Buku dihapus' });
    } catch (error) {
        serverError(res, error, 'Gagal menghapus buku.');
    }
};
