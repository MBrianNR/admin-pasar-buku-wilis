import type { Request, Response } from 'express';
import { BukuModel } from '../models/bukuModel';
import { ForumModel } from '../models/forumModel';
import { KiosModel } from '../models/kiosModel';
import { PengaturanModel } from '../models/pengaturanModel';
import { serverError } from '../utils/helpers';

// Angka-angka kartu statistik + teks hero di halaman Dashboard
// (tabel kios di Dashboard memakai GET /api/kios?pendingFirst=true&blok=...)
export const getDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
        const [kios, buku, forum, pengaturan] = await Promise.all([
            KiosModel.summary(),
            BukuModel.summary(),
            ForumModel.summary(),
            PengaturanModel.get()
        ]);

        res.status(200).json({
            success: true,
            data: {
                hero: {
                    nama_website: pengaturan?.nama_website ?? '',
                    headline: pengaturan?.headline ?? '',
                    deskripsi: pengaturan?.deskripsi ?? ''
                },
                kios: {
                    total: kios.total,
                    aktif: kios.buka,
                    pending: kios.pending,
                    tutup: kios.tutup,
                    persen_beroperasi: kios.total ? Math.round((kios.buka / kios.total) * 100) : 0
                },
                katalog: { total_judul: buku.total_judul },
                forum: { perlu_moderasi: forum.menunggu + forum.dilaporkan }
            }
        });
    } catch (error) {
        serverError(res, error, 'Gagal mengambil data dashboard.');
    }
};
