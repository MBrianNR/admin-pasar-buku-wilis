import type { Request, Response } from 'express';
import { PengaturanModel } from '../models/pengaturanModel.js';
import { serverError } from '../utils/helpers.js';

const notSet = 'Data pengaturan belum ada di database. Import ulang file SQL.';

export const getPengaturan = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = await PengaturanModel.get();
        if (!data) {
            res.status(404).json({ success: false, message: notSet });
            return;
        }
        res.status(200).json({ success: true, data });
    } catch (error) {
        serverError(res, error, 'Gagal mengambil pengaturan.');
    }
};

export const updatePengaturan = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!(await PengaturanModel.get())) {
            res.status(404).json({ success: false, message: notSet });
            return;
        }

        await PengaturanModel.update(req.body);
        res.status(200).json({
            success: true,
            message: 'Pengaturan website tersimpan',
            data: await PengaturanModel.get()
        });
    } catch (error) {
        serverError(res, error, 'Gagal menyimpan pengaturan.');
    }
};
