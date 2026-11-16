import type { Request, Response } from 'express';
import { ForumModel } from '../models/forumModel.js';
import type { PostInput } from '../models/forumModel.js';
import { isForumStatus } from '../middlewares/validator.js';
import { queryText, serverError } from '../utils/helpers.js';

// Tanpa ?status= : antrean moderasi (pending + laporan). Dengan ?status=disetujui dst. : riwayat.
export const getForum = async (req: Request, res: Response): Promise<void> => {
    const status = queryText(req.query.status);
    if (status && !isForumStatus(status)) {
        res.status(400).json({
            success: false,
            message: 'Filter status harus salah satu dari: pending, laporan, disetujui, dipertahankan, dihapus.'
        });
        return;
    }

    try {
        const [data, ringkasan] = await Promise.all([ForumModel.findAll(status || undefined), ForumModel.summary()]);
        res.status(200).json({ success: true, data, ringkasan });
    } catch (error) {
        serverError(res, error, 'Gagal mengambil postingan forum.');
    }
};

// Dipakai untuk mengisi antrean (mis. dari aplikasi pengunjung) dan untuk uji Postman
export const createPost = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = await ForumModel.create(req.body as PostInput);
        res.status(201).json({
            success: true,
            message: 'Postingan masuk antrean moderasi.',
            data: await ForumModel.findById(id)
        });
    } catch (error) {
        serverError(res, error, 'Gagal membuat postingan.');
    }
};

// Pending -> disetujui (tayang). Laporan -> dipertahankan (laporan diabaikan).
export const approvePost = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);

    try {
        const post = await ForumModel.findById(id);
        if (!post) {
            res.status(404).json({ success: false, message: 'Postingan tidak ditemukan.' });
            return;
        }

        const isReport = post.status === 'laporan';
        const ok = await ForumModel.moderate(id, isReport ? 'dipertahankan' : 'disetujui', res.locals.userId as number);
        if (!ok) {
            res.status(409).json({ success: false, message: 'Postingan sudah dimoderasi.' });
            return;
        }

        res.status(200).json({
            success: true,
            message: isReport
                ? 'Laporan diabaikan, postingan dipertahankan'
                : 'Postingan disetujui dan ditayangkan',
            data: await ForumModel.findById(id)
        });
    } catch (error) {
        serverError(res, error, 'Gagal memoderasi postingan.');
    }
};

// "Tolak" / "Hapus Postingan": baris tidak dibuang, statusnya jadi "dihapus" supaya hitungan "Sudah Dimoderasi" tetap benar
export const deletePost = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);

    try {
        const post = await ForumModel.findById(id);
        if (!post) {
            res.status(404).json({ success: false, message: 'Postingan tidak ditemukan.' });
            return;
        }

        if (!(await ForumModel.moderate(id, 'dihapus', res.locals.userId as number))) {
            res.status(409).json({ success: false, message: 'Postingan sudah dimoderasi.' });
            return;
        }

        res.status(200).json({ success: true, message: 'Postingan dihapus', data: await ForumModel.findById(id) });
    } catch (error) {
        serverError(res, error, 'Gagal menghapus postingan.');
    }
};
