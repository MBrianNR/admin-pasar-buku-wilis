# Admin Pasar Buku Wilis (Next.js)

Versi Next.js (App Router) dari proyek `pasar-buku-wilis-admin-react` (React + Vite), ditambah
halaman **Login Admin** (`/login`) yang terhubung ke backend Express.
Data contoh kios/buku/forum tetap disimpan di `localStorage` (kunci `pbw-admin-v1`).

## Cara menjalankan
Butuh Node.js 20.9 atau lebih baru.

```bash
npm install
npm run dev      # buka http://localhost:3000 (belum login -> otomatis ke /login)
```

Alamat backend diatur lewat `.env.local` (salin dari `.env.example`; PowerShell: `Copy-Item .env.example .env.local`).
Tanpa file ini, alamat bawaannya `http://localhost:5000`. Setelah mengubah `.env.local`, jalankan ulang `npm run dev`.

## Upload gambar ke Vercel Blob
- Di Vercel, buka project → **Storage** → **Create Database** → **Blob**, lalu buat store dengan akses **Public**.
- Hubungkan store ke project dan tambahkan environment variable read-write token.
- Untuk development lokal, salin `BLOB_READ_WRITE_TOKEN` ke `frontend/.env.local`. Jangan beri nama `NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN` dan jangan commit token.
- Upload browser memakai route `/api/upload`; route memvalidasi sesi admin melalui backend, MIME type, ekstensi, dan batas 5 MB. URL publik dan pathname Blob dikembalikan ke form.
- Vercel Blob dashboard: project → **Storage** → pilih Blob store → **Blob Browser** untuk melihat file yang terunggah.
- Data proyek lain (kios, buku, forum, dan pengaturan) tidak otomatis dipindahkan ke Blob; alur tersebut tetap mengikuti penyimpanan yang sudah dipakai aplikasi.

## Login Admin
- Halaman `/login` mengikuti desain `Login.png`. Form mengirim `POST {NEXT_PUBLIC_API_URL}/api/auth/login`
  dengan body `{ "username": "...", "password": "..." }`.
- Balasan yang diharapkan: `{ "success": true, "data": { "token": "<JWT>", "user": { ... } } }`.
  Kalau gagal, pesan dari kolom `message` balasan backend ditampilkan di atas tombol Login.
- Token JWT dan data user disimpan di `localStorage` (`pbw-admin-token`, `pbw-admin-user`).
- Semua halaman admin dijaga di `context/AppProvider.jsx`: tanpa token yang masih berlaku, pengguna
  diarahkan ke `/login`. Sebaliknya, membuka `/login` saat sudah login langsung masuk ke `/dashboard`.
- Tombol **Keluar** di sidebar menghapus token lalu kembali ke `/login`.
- Backend harus mengizinkan alamat frontend (CORS), misalnya `CORS_ORIGIN=http://localhost:3000` di `.env` backend.
- Akun admin dibuat lewat backend (misalnya `POST /api/auth/register`), bukan lewat halaman ini.

Build produksi:
```bash
npm run build
npm run start
```

> Font (Plus Jakarta Sans & JetBrains Mono) diunduh dari Google Fonts saat `dev`/`build`
> lalu di-hosting sendiri oleh `next/font`, jadi koneksi internet dibutuhkan saat pertama kali menjalankannya.

## Struktur Proyek (Terstandarisasi Sesuai Arsitektur Modern)
```
next.config.mjs, jsconfig.json    # konfigurasi (alias import "@/..." = folder src/)
src/
  app/
    layout.jsx                    # <html>/<body>, font, impor CSS, metadata
    page.jsx                      # "/" -> redirect ke /dashboard
    not-found.jsx                 # halaman 404
    login/page.jsx                # /login (halaman login admin)
    (admin)/                      # grup rute admin
      layout.jsx                  # membungkus semua halaman admin dengan AppProvider
      dashboard/page.jsx          # /dashboard
      toko/page.jsx               # /toko
      katalog/page.jsx            # /katalog
      denah/page.jsx              # /denah
      moderasi/page.jsx           # /moderasi
      pengaturan/page.jsx         # /pengaturan
  components/                     # Komponen modular yang diorganisasi per halaman / fitur
    common/                       # Komponen umum & layout (Header, Footer, Sidebar, Icon, Stat, DataTable, ModalRoot, modals/)
    auth/                         # Komponen autentikasi (LoginForm)
    dashboard/                    # Komponen halaman Dashboard (DashboardHero, DashboardStats, DashboardTabs)
    toko/                         # Komponen halaman Toko & Kios (KiosTable, KiosFilterChips, KiosFormModal, KiosDetailModal)
    katalog/                      # Komponen halaman Katalog Buku (BukuTable, BukuFormModal)
    denah/                        # Komponen halaman Denah (DenahGrid, DenahDetailSide)
    moderasi/                     # Komponen halaman Moderasi (ForumItem, ForumList)
    pengaturan/                   # Komponen halaman Pengaturan (PengaturanForm)
  hooks/                          # Custom React Hooks
    useApp.js                     # Hook akses context & global state
    useAuth.js                    # Hook manajemen sesi & login admin
    useKios.js                    # Hook pengelolaan data, filter, dan aksi kios
    useBuku.js                    # Hook pengelolaan katalog buku
    useDenah.js                   # Hook interaksi denah pasar
    useModerasi.js                # Hook moderasi forum
    useDebounce.js                # Hook optimasi debounce pencarian
  lib/                            # Utilitas & pustaka inti
    auth.js                       # Sesi login (token JWT) & cek kedaluwarsa
    data.js                       # Data seed, konstanta konfigurasi, baca/tulis localStorage
    utils.js                      # Helper kecil (inisial nama, format tanggal, link WA, CSV export)
  services/                       # Layer integrasi API backend Express
    api.js                        # Base HTTP client (fetch wrapper + JWT bearer token handler)
    authService.js                # Service API autentikasi
    kiosService.js                # Service API kios
    bukuService.js                # Service API katalog buku
    dashboardService.js           # Service API ringkasan statistik
    denahService.js               # Service API denah pasar
    forumService.js               # Service API moderasi forum
    pengaturanService.js          # Service API konfigurasi website
  types/                          # Definisi tipe data & skema domain
    auth.js, kios.js, buku.js, forum.js, pengaturan.js
  validators/                     # Modul validasi inputan data
    authValidator.js              # Validasi form login admin
    kiosValidator.js              # Validasi form tambah/edit kios & cek duplikasi nomor
    bukuValidator.js              # Validasi form tambah/edit katalog buku & stok
    pengaturanValidator.js        # Validasi form konfigurasi identitas web & email
  context/
    AppContext.js                 # React context
    AppProvider.jsx               # State provider utama
  css/
    style.css                     # Token warna & styling slicing Figma
    app.css                       # Modal, form, toast, responsif
    login.css                     # Tampilan halaman login
```

## Pemetaan dari versi React + Vite
| Versi React (Vite)                         | Versi Next.js                                              |
| ------------------------------------------ | ---------------------------------------------------------- |
| `index.html` + `main.jsx` (`createRoot`)   | `app/layout.jsx` (Next yang merender ke `<body>`)          |
| `<link>` Google Fonts di `index.html`      | `next/font/google` di `app/layout.jsx`                     |
| Routing hash `#/dash`, `#/toko`, ...       | Route asli per folder: `/dashboard`, `/toko`, `/katalog`, `/denah`, `/moderasi`, `/pengaturan` |
| `window.location.hash` + `hashchange`      | `usePathname()` + `useRouter().push()` (`next/navigation`) |
| `<a href="#/toko">` di Sidebar             | `<Link href="/toko">` (`next/link`)                        |
| `App.jsx` + objek `VIEWS`                  | `context/AppProvider.jsx` + satu `page.jsx` per halaman    |
| `src/views/*.jsx`                          | `src/app/(admin)/<rute>/page.jsx`                          |
| `data.js`, `utils.js`                      | `lib/data.js`, `lib/utils.js`                              |
| `#root { display: contents }`              | dihapus (tidak ada elemen `#root` lagi)                    |

Hash lama dan URL baru: `#/dash` → `/dashboard`, `#/kat` → `/katalog`, `#/mod` → `/moderasi`, `#/set` → `/pengaturan`
(`#/toko` dan `#/denah` tetap bernama sama).

## Hal yang berbeda karena Next.js merender di server
- File yang memakai hook, context, atau `localStorage` diberi `'use client'` di baris pertama.
- Server tidak punya `localStorage`, jadi `AppProvider` mengisi data awal, lalu memuat data tersimpan dari
  `localStorage` setelah halaman terbuka di browser. Isi halaman baru ditampilkan setelah data selesai dimuat,
  supaya tidak ada kedipan data awal dan form Pengaturan langsung terisi nilai yang tersimpan.
- Pencarian, filter, dan nomor halaman di-reset setiap pindah halaman (termasuk tombol back/forward),
  sama seperti versi hash. Dua pengecualian tetap berlaku: "Tinjau" di notifikasi membuka `/toko` dengan filter
  *pending*, dan "Lihat Profil Toko & Katalog" di Denah membuka `/katalog` dengan pencarian terisi nomor kios.
