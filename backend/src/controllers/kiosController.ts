import type { Request, Response } from 'express';
import { KiosModel } from '../models/kiosModel';
import type { KiosFilter, KiosInput } from '../models/kiosModel';
import { BLOCKS, STATUS_KIOS, STATUS_LABEL } from '../utils/constants';
import { isDuplicateError, kiosToCsv, parsePagination, queryText, serverError } from '../utils/helpers';

// Baca ?status=&blok=&q= (nilai "all" = tanpa filter, sama seperti dropdown di frontend)
const parseFilter = (query: Record<string, unknown>): { filter: KiosFilter; error?: string } => {
    const filter: KiosFilter = {};

    const status = queryText(query.status).toLowerCase();
    if (status && status !== 'all') {
        if (!(STATUS_KIOS as readonly string[]).includes(status)) {
            return { filter, error: 'Filter status harus salah satu dari: all, ' + STATUS_KIOS.join(', ') + '.' };
        }
        filter.status = status;
    }

    const blok = queryText(query.blok).toUpperCase();
    if (blok && blok !== 'ALL') {
        if (!(BLOCKS as readonly string[]).includes(blok)) {
            return { filter, error: 'Filter blok harus salah satu dari: all, A, B, C.' };
        }
        filter.blok = blok;
    }

    const q = queryText(query.q);
    if (q) filter.q = q;

    return { filter };
};

export const getKios = async (req: Request, res: Response): Promise<void> => {
    const query = req.query as Record<string, unknown>;
    const { filter, error } = parseFilter(query);
    if (error) {
        res.status(400).json({ success: false, message: error });
        return;
    }

    const { page, limit, offset } = parsePagination(query);
    const pendingFirst = queryText(query.pendingFirst) === 'true'; // Dashboard: kios pending di paling atas

    try {
        const [data, total, ringkasan] = await Promise.all([
            KiosModel.findAll(filter, { pendingFirst, limit, offset }),
            KiosModel.count(filter),
            KiosModel.summary()
        ]);

        res.status(200).json({
            success: true,
            data,
            pagination: { page, limit, total, total_pages: Math.max(1, Math.ceil(total / limit)) },
            ringkasan
        });
    } catch (err) {
        serverError(res, err, 'Gagal mengambil data kios.');
    }
};

// Tombol "Export Data" (isi CSV sama dengan modal Ekspor Data Kios di frontend)
export const exportKios = async (req: Request, res: Response): Promise<void> => {
    const { filter, error } = parseFilter(req.query as Record<string, unknown>);
    if (error) {
        res.status(400).json({ success: false, message: error });
        return;
    }

    try {
        const list = await KiosModel.findAll(filter);
        const csv = kiosToCsv(list, s => STATUS_LABEL[s] ?? s);

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="kios-pasar-wilis.csv"');
        res.status(200).send(csv);
    } catch (err) {
        serverError(res, err, 'Gagal mengekspor data kios.');
    }
};

export const getKiosById = async (req: Request, res: Response): Promise<void> => {
    try {
        const kios = await KiosModel.findById(res.locals.kiosId as string);
        if (!kios) {
            res.status(404).json({ success: false, message: 'Kios tidak ditemukan.' });
            return;
        }
        res.status(200).json({ success: true, data: kios });
    } catch (error) {
        serverError(res, error, 'Gagal mengambil data kios.');
    }
};

export const createKios = async (req: Request, res: Response): Promise<void> => {
    const data: KiosInput = { pemilik: '', whatsapp: '', email: '', spesialisasi: [], status: 'buka', ...req.body };

    try {
        await KiosModel.create(data);
        res.status(201).json({
            success: true,
            message: `Kios ${data.id} berhasil didaftarkan!`,
            data: await KiosModel.findById(data.id)
        });
    } catch (error) {
        if (isDuplicateError(error)) {
            res.status(409).json({ success: false, message: `Nomor kios ${data.id} sudah dipakai.` });
            return;
        }
        serverError(res, error, 'Gagal menambahkan kios.');
    }
};

// Field yang tidak dikirim tetap memakai nilai lama
export const updateKios = async (req: Request, res: Response): Promise<void> => {
    const currentId = res.locals.kiosId as string;

    try {
        const existing = await KiosModel.findById(currentId);
        if (!existing) {
            res.status(404).json({ success: false, message: 'Kios tidak ditemukan.' });
            return;
        }

        const data: KiosInput = {
            id: existing.id,
            nama: existing.nama,
            pemilik: existing.pemilik,
            whatsapp: existing.whatsapp,
            email: existing.email,
            spesialisasi: existing.spesialisasi,
            status: existing.status,
            ...req.body
        };

        try {
            await KiosModel.update(currentId, data);
        } catch (error) {
            if (isDuplicateError(error)) {
                res.status(409).json({ success: false, message: `Nomor kios ${data.id} sudah dipakai.` });
                return;
            }
            throw error;
        }

        res.status(200).json({
            success: true,
            message: 'Perubahan kios disimpan!',
            data: await KiosModel.findById(data.id)
        });
    } catch (error) {
        serverError(res, error, 'Gagal memperbarui kios.');
    }
};

// Tombol "Setujui" pada kios Pending Verifikasi
export const approveKios = async (req: Request, res: Response): Promise<void> => {
    const id = res.locals.kiosId as string;

    try {
        const kios = await KiosModel.findById(id);
        if (!kios) {
            res.status(404).json({ success: false, message: 'Kios tidak ditemukan.' });
            return;
        }
        if (kios.status !== 'pending') {
            res.status(409).json({ success: false, message: `Kios ${id} tidak sedang menunggu verifikasi.` });
            return;
        }

        await KiosModel.updateStatus(id, 'buka');
        res.status(200).json({
            success: true,
            message: `Kios ${id} disetujui dan kini aktif`,
            data: await KiosModel.findById(id)
        });
    } catch (error) {
        serverError(res, error, 'Gagal menyetujui kios.');
    }
};

// Buku milik kios ikut terhapus (ON DELETE CASCADE di database)
export const deleteKios = async (req: Request, res: Response): Promise<void> => {
    const id = res.locals.kiosId as string;

    try {
        if (!(await KiosModel.remove(id))) {
            res.status(404).json({ success: false, message: 'Kios tidak ditemukan.' });
            return;
        }
        res.status(200).json({ success: true, message: `Kios ${id} dihapus` });
    } catch (error) {
        serverError(res, error, 'Gagal menghapus kios.');
    }
};
