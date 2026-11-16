import type { Request, Response } from 'express';
import { KiosModel } from '../models/kiosModel';
import { PengaturanModel } from '../models/pengaturanModel';
import { BLOCKS, MAP_LABEL } from '../utils/constants';
import { queryText, serverError, slotIds, waLink } from '../utils/helpers';

// Tab A menampilkan lorong A-B, tab B menampilkan B-C, tab C hanya C (sama seperti halaman Denah)
export const getDenah = async (req: Request, res: Response): Promise<void> => {
    const blok = (queryText(req.query.blok) || 'A').toUpperCase();
    if (!(BLOCKS as readonly string[]).includes(blok)) {
        res.status(400).json({ success: false, message: 'Blok harus salah satu dari: A, B, C.' });
        return;
    }

    const baris = blok === 'A' ? ['A', 'B'] : blok === 'B' ? ['B', 'C'] : ['C'];
    const ids = baris.flatMap(slotIds);

    try {
        const [kiosList, pengaturan] = await Promise.all([KiosModel.findByIds(ids), PengaturanModel.get()]);
        const byId = new Map(kiosList.map(k => [k.id, k]));

        const slot = ids.map(id => {
            const k = byId.get(id);
            return { id, terisi: Boolean(k), kios: k ? { ...k, link_whatsapp: waLink(k.whatsapp) } : null };
        });

        const aktif = kiosList.filter(k => k.status === 'buka').length;

        res.status(200).json({
            success: true,
            data: {
                blok,
                label: MAP_LABEL[blok],
                baris,
                slot,
                ringkasan: {
                    kapasitas: ids.length,
                    terisi: kiosList.length,
                    aktif,
                    persen_buka: kiosList.length ? Math.round((aktif / kiosList.length) * 100) : 0,
                    kosong: ids.length - kiosList.length
                },
                diperbarui_pada: pengaturan?.denah_diperbarui_at ?? null
            }
        });
    } catch (error) {
        serverError(res, error, 'Gagal mengambil denah pasar.');
    }
};

// Tombol "Update Denah"
export const perbaruiDenah = async (req: Request, res: Response): Promise<void> => {
    try {
        const diperbarui_pada = await PengaturanModel.touchDenah();
        res.status(200).json({ success: true, message: 'Denah berhasil diperbarui', data: { diperbarui_pada } });
    } catch (error) {
        serverError(res, error, 'Gagal memperbarui denah.');
    }
};
