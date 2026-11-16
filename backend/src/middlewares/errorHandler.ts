import type { Request, Response, NextFunction } from 'express';

// Dipasang setelah semua rute: dijalankan kalau tidak ada rute yang cocok
export const notFoundHandler = (req: Request, res: Response): void => {
    res.status(404).json({ success: false, message: `Rute ${req.method} ${req.originalUrl} tidak ditemukan.` });
};

// Error-handling middleware: wajib 4 argumen (err, req, res, next)
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
    if (res.headersSent) {
        next(err);
        return;
    }

    const status = Number.isInteger(err?.status) && err.status >= 400 && err.status < 600 ? err.status : 500;
    let message = 'Terjadi kesalahan pada server.';

    if (err?.type === 'entity.parse.failed') message = 'Format JSON tidak valid!';
    else if (status < 500 && err?.message) message = err.message;

    if (status >= 500) console.error(err);
    res.status(status).json({ success: false, message });
};
