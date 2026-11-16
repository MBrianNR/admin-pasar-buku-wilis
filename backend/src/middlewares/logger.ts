import type { Request, Response, NextFunction } from 'express';

// Middleware logging: catat setiap request setelah response selesai dikirim
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();
    res.on('finish', () => {
        console.log(`${new Date().toISOString()}  ${req.method} ${req.originalUrl}  ${res.statusCode}  ${Date.now() - start}ms`);
    });
    next();
};
