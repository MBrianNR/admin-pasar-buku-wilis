import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api.js';
import { requestLogger } from './middlewares/logger.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

const app = express();

// Urutan app.use() = urutan eksekusi.
// 1) Global middleware: dijalankan untuk SETIAP request
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map(o => o.trim());

app.use(requestLogger);
app.use(cors({
    origin: (origin, callback) => {
        const isFlutterWebLocalhost = origin !== undefined &&
            /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
        if (!origin || allowedOrigins.includes(origin) || isFlutterWebLocalhost) {
            callback(null, true);
            return;
        }
        callback(null, false);
    },
}));
app.use(express.json()); // ubah body JSON menjadi objek di req.body

app.get('/', (req, res) => {
    res.status(200).json({ success: true, message: 'Backend Admin Pasar Buku Wilis berjalan.' });
});

// 2) Semua rute API
app.use('/api', apiRoutes);

// 3) Terakhir: rute tidak dikenal (404), lalu penangan error global
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
