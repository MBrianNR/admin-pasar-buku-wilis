# Backend Admin Pasar Buku Wilis

REST API untuk project `pasar-buku-wilis-admin-nextjs`, dibuat dengan **Express + TypeScript + MySQL + JWT**
dan mengikuti arsitektur middleware dari modul *Pertemuan 4 - Arsitektur Middleware (Express JS)*.

## 1. Persiapan

Butuh Node.js 20+ dan MySQL/MariaDB (XAMPP juga bisa).

```bash
npm install
cp .env.example .env        # lalu isi DB_* dan JWT_SECRET
```

## 2. Import database

Nyalakan MySQL, lalu pilih salah satu cara:

- **phpMyAdmin:** tab *Import* -> pilih `database/pasar_buku_wilis.sql` -> *Go*
- **Terminal:** `mysql -u root -p < database/pasar_buku_wilis.sql`

File ini membuat database `pasar_buku_wilis`, semua tabel, dan data awal yang sama dengan data contoh di frontend
(11 kios, 6 buku, 4 postingan antrean + 12 riwayat moderasi, pengaturan website).
Mengimpor ulang akan **menghapus** data lama di database itu.

Akun admin awal: `adminwilis` / `Admin12345` (segera ganti kalau dipakai di luar tugas).

## 3. Jalankan server

```bash
npm run dev       # auto-reload, http://localhost:5000
npm start         # tanpa auto-reload
npm run typecheck # cek tipe TypeScript
```

Lalu import `postman/pasar-buku-wilis.postman_collection.json` ke Postman, jalankan request **Login**
(token otomatis tersimpan di `{{jwt_token}}`), dan seluruh folder bisa dijalankan lewat *Collection Runner*.

## 4. Struktur

```
database/pasar_buku_wilis.sql     skema + data awal
postman/                          koleksi uji (75 request, 117 assertion)
src/
  config/db.ts                    pool MySQL + helper transaksi
  models/                         query SQL (admin, kios, buku, forum, pengaturan)
  middlewares/
    logger.ts                     catat setiap request
    authMiddleware.ts             verifyToken (JWT)
    validator.ts                  validasi body & parameter
    errorHandler.ts               404 handler + error handler global (4 argumen)
  controllers/                    logika tiap endpoint
  routes/                         authRoutes, kiosRoutes, bukuRoutes, ... lalu api.ts
  utils/                          konstanta & fungsi bantu
  app.ts                          setup Express (logger, CORS, JSON parser, rute, 404, error)
  server.ts                       entry point (memuat .env, cek koneksi DB, app.listen)
```

## 5. Alur middleware

Urutan di `app.ts` menentukan urutan eksekusi:

```
Request -> requestLogger -> cors() -> express.json() -> /api (router)
        -> verifyToken -> validator -> controller -> Response
        (tidak ada rute cocok -> notFoundHandler; error -> errorHandler)
```

Contoh rantai di route, sama seperti `router.post('/todos', verifyToken, validateTodo, createTodo)` pada modul:

```ts
router.post('/', verifyToken, validateKios, createKios);
// Minta Akses -> Cek Token -> Cek Data -> Simpan Data
```

- `verifyToken`: ambil token dari header `Authorization: Bearer <token>`, tidak ada -> **401**, tidak valid/kedaluwarsa -> **403**,
  valid -> simpan `res.locals.userId` lalu `next()`.
- Validator: data cacat -> **400** (gagal cepat), valid -> data yang sudah dibersihkan ditaruh di `req.body`, lalu `next()`.
- Controller berjalan paling akhir dan mengambil data bersih dari `req.body` serta identitas admin dari `res.locals.userId`.

Semua respons berbentuk `{ "success": true|false, "message": "...", "data": ... }`.

## 6. Endpoint

Semua endpoint selain `register` dan `login` wajib memakai token. Prefix: `/api`.

| Halaman frontend | Method & path | Keterangan |
| --- | --- | --- |
| Auth | `POST /auth/register` | body: `username`, `email`, `password`, `nama` (opsional) |
| Auth | `POST /auth/login` | body: `username`, `password` -> `data.token` |
| Profil Admin | `GET /auth/me` | isi modal Profil Admin |
| Dashboard | `GET /dashboard` | kartu statistik + teks hero |
| Dashboard / Toko | `GET /kios` | query: `status` (buka/pending/tutup/all), `blok` (A/B/C/all), `q`, `page`, `limit`, `pendingFirst=true` |
| Toko | `GET /kios/export` | CSV, filter sama dengan `GET /kios` |
| Toko / Denah | `GET /kios/:id` | contoh `A-04` |
| Toko | `POST /kios` | `id`, `nama` wajib; `pemilik`, `whatsapp`, `email`, `spesialisasi[]`, `status` opsional |
| Toko / Denah | `PUT /kios/:id` | field yang dikirim saja yang berubah; `id` boleh diganti (pindah nomor) |
| Toko | `PATCH /kios/:id/approve` | kios `pending` -> `buka` |
| Toko | `DELETE /kios/:id` | buku milik kios ikut terhapus |
| Katalog | `GET /buku` | query: `q`, `page`, `limit`; ada `ringkasan` (total judul, total stok, kios terhubung) |
| Katalog | `GET /buku/:id`, `POST /buku`, `PUT /buku/:id`, `DELETE /buku/:id` | `judul`, `penulis`, `kategori`, `kios_id`, `stok` |
| Denah | `GET /denah?blok=A` | slot kios + ringkasan, tab A = lorong A-B, B = B-C, C = C |
| Denah | `POST /denah/update` | tombol Update Denah |
| Moderasi | `GET /forum` | antrean (pending + laporan); `?status=disetujui` dst. untuk riwayat |
| Moderasi | `POST /forum` | isi antrean (uji / aplikasi pengunjung) |
| Moderasi | `PATCH /forum/:id/approve` | pending -> disetujui, laporan -> dipertahankan |
| Moderasi | `DELETE /forum/:id` | status jadi `dihapus` (baris tetap ada supaya hitungan "Sudah Dimoderasi" benar) |
| Pengaturan | `GET /pengaturan`, `PUT /pengaturan` | `nama_website`, `headline`, `deskripsi` (maks 160), `whatsapp`, `email` |

## 7. Pemetaan nama field frontend -> API

| Data | Frontend (`lib/data.js`) | API |
| --- | --- | --- |
| Kios | `id n o wa em sp s k t` | `id nama pemilik whatsapp email spesialisasi status jumlah_judul tanggal_daftar` |
| Buku | `id j p c k st` | `id judul penulis kategori kios_id stok` (+ `kios_nama` di respons) |
| Postingan | `id u j i s w` | `id username judul isi status alasan` |
| Pengaturan | `nama head desc wa em` | `nama_website headline deskripsi whatsapp email` |

## 8. Catatan keputusan

- **Pendaftaran admin.** `POST /auth/register` terbuka seperti di modul supaya alur Postman (register -> login) jalan.
  Karena ini panel admin, set `ALLOW_REGISTER=false` di `.env` kalau server sudah bisa diakses orang lain.
- **CORS** hanya mengizinkan origin di `CORS_ORIGIN` (default `http://localhost:3000`, port frontend Next.js).
- **Hapus kios** ikut menghapus bukunya (`ON DELETE CASCADE`). Kalau mau diblokir saja, ubah ke `RESTRICT` di file SQL.
- **`jumlah_judul`** pada kios adalah angka yang tersimpan sendiri (seperti di frontend), bukan hasil hitung dari tabel `buku`.
- Hasil export CSV, urutan spesialisasi, dan aturan nomor kios (blok A-C, 1-2 digit) mengikuti kode frontend.
