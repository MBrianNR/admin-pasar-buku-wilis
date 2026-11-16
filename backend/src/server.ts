// WAJIB paling atas: memuat .env sebelum file lain membaca process.env
import 'dotenv/config';
import app from './app.js';
import db from './config/db.js';

const PORT = Number(process.env.PORT) || 5000;

if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET belum diisi. Salin .env.example menjadi .env lalu isi nilainya.');
    process.exit(1);
}

const start = async (): Promise<void> => {
    try {
        await db.query('SELECT 1');
        console.log('Terhubung ke database MySQL');
    } catch (error) {
        console.error('Gagal terhubung ke database. Cek DB_* di file .env dan pastikan MySQL menyala.');
        console.error(error);
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log(`Server berjalan di http://localhost:${PORT}`);
    });
};

start();
