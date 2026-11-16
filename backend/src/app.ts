import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api';
import { requestLogger } from './middlewares/logger';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';

const app = express();

// Urutan app.use() = urutan eksekusi.
// 1) Global middleware: dijalankan untuk SETIAP request
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map(o => o.trim());

app.use(requestLogger);
app.use(cors({ origin: allowedOrigins })); // izinkan frontend (port 3000) memanggil backend (port 5000)
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
