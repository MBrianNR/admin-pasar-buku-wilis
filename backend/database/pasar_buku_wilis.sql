-- =====================================================================
--  Database Admin Pasar Buku Wilis
--  Kompatibel dengan MySQL 5.7+/8.x dan MariaDB 10.3+ (XAMPP)
--
--  Cara pakai:
--    1) phpMyAdmin  : tab Import -> pilih file ini -> Go
--    2) Terminal    : mysql -u root -p < database/pasar_buku_wilis.sql
--
--  PERINGATAN: file ini menghapus lalu membuat ulang semua tabel,
--  jadi data lama di database pasar_buku_wilis akan hilang.
--
--  Akun admin awal  -> username: adminwilis | password: Admin12345
--  (ganti setelah login pertama kali)
-- =====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS pasar_buku_wilis
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pasar_buku_wilis;

DROP TABLE IF EXISTS buku;
DROP TABLE IF EXISTS kios_spesialisasi;
DROP TABLE IF EXISTS forum_post;
DROP TABLE IF EXISTS kios;
DROP TABLE IF EXISTS spesialisasi;
DROP TABLE IF EXISTS pengaturan;
DROP TABLE IF EXISTS admin;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
--  admin : akun yang boleh login ke Admin Portal (JWT)
-- ---------------------------------------------------------------------
CREATE TABLE admin (
    id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
    username   VARCHAR(50)  NOT NULL,
    nama       VARCHAR(100) NULL,
    email      VARCHAR(100) NOT NULL,
    password   VARCHAR(255) NOT NULL,                       -- hash bcrypt, bukan password asli
    peran      VARCHAR(100) NOT NULL DEFAULT 'Administrator Portal Pasar Buku Wilis Malang',
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_admin_username (username),
    UNIQUE KEY uq_admin_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
--  spesialisasi : kategori buku (dipakai kios & katalog buku)
-- ---------------------------------------------------------------------
CREATE TABLE spesialisasi (
    id   TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nama VARCHAR(50)      NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_spesialisasi_nama (nama)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
--  kios : id berupa nomor kios, contoh A-04 (huruf = blok A/B/C)
-- ---------------------------------------------------------------------
CREATE TABLE kios (
    id             VARCHAR(5)   NOT NULL,
    nama           VARCHAR(100) NOT NULL,
    pemilik        VARCHAR(100) NOT NULL DEFAULT '',
    whatsapp       VARCHAR(20)  NOT NULL DEFAULT '',
    email          VARCHAR(100) NOT NULL DEFAULT '',
    status         ENUM('buka', 'pending', 'tutup') NOT NULL DEFAULT 'buka',
    jumlah_judul   INT UNSIGNED NOT NULL DEFAULT 0,          -- jumlah judul yang dimiliki kios (angka dari pedagang)
    tanggal_daftar DATE         NOT NULL,
    created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_kios_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
--  kios_spesialisasi : satu kios bisa punya banyak spesialisasi (many-to-many)
-- ---------------------------------------------------------------------
CREATE TABLE kios_spesialisasi (
    kios_id         VARCHAR(5)       NOT NULL,
    spesialisasi_id TINYINT UNSIGNED NOT NULL,
    PRIMARY KEY (kios_id, spesialisasi_id),
    CONSTRAINT fk_ks_kios FOREIGN KEY (kios_id) REFERENCES kios (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ks_spesialisasi FOREIGN KEY (spesialisasi_id) REFERENCES spesialisasi (id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
--  buku : master katalog buku, tiap buku milik satu kios
--  (kios dihapus -> bukunya ikut terhapus)
-- ---------------------------------------------------------------------
CREATE TABLE buku (
    id              INT UNSIGNED     NOT NULL AUTO_INCREMENT,
    judul           VARCHAR(200)     NOT NULL,
    penulis         VARCHAR(150)     NOT NULL,
    spesialisasi_id TINYINT UNSIGNED NOT NULL,               -- kategori buku
    kios_id         VARCHAR(5)       NOT NULL,
    stok            INT UNSIGNED     NOT NULL DEFAULT 0,
    created_at      TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_buku_kios (kios_id),
    CONSTRAINT fk_buku_spesialisasi FOREIGN KEY (spesialisasi_id) REFERENCES spesialisasi (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_buku_kios FOREIGN KEY (kios_id) REFERENCES kios (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
--  forum_post : antrean moderasi forum pencarian buku
--  status: pending / laporan = antre; disetujui / dipertahankan / dihapus = sudah dimoderasi
-- ---------------------------------------------------------------------
CREATE TABLE forum_post (
    id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
    username        VARCHAR(80)  NOT NULL,
    judul           VARCHAR(200) NOT NULL,
    isi             TEXT         NOT NULL,
    status          ENUM('pending', 'laporan', 'disetujui', 'dipertahankan', 'dihapus') NOT NULL DEFAULT 'pending',
    alasan          VARCHAR(255) NOT NULL DEFAULT '',        -- catatan untuk moderator
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    dimoderasi_at   DATETIME     NULL,
    dimoderasi_oleh INT UNSIGNED NULL,
    PRIMARY KEY (id),
    KEY idx_forum_status (status),
    CONSTRAINT fk_forum_admin FOREIGN KEY (dimoderasi_oleh) REFERENCES admin (id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
--  pengaturan : identitas & kontak website (selalu hanya 1 baris, id = 1)
-- ---------------------------------------------------------------------
CREATE TABLE pengaturan (
    id                  TINYINT UNSIGNED NOT NULL,
    nama_website        VARCHAR(150) NOT NULL,
    headline            VARCHAR(150) NOT NULL,
    deskripsi           VARCHAR(160) NOT NULL DEFAULT '',
    whatsapp            VARCHAR(30)  NOT NULL DEFAULT '',
    email               VARCHAR(100) NOT NULL DEFAULT '',
    denah_diperbarui_at DATETIME     NULL,                   -- terakhir tombol "Update Denah" ditekan
    updated_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
--  DATA AWAL (sama dengan data contoh di frontend: src/lib/data.js)
-- =====================================================================

INSERT INTO admin (id, username, nama, email, password) VALUES
(1, 'adminwilis', 'Admin Wilis', 'admin.wilis@malang.go.id', '$2b$10$0nKctAJffps1FwJPbKwwjO0Rcc8DBrwIh/KG4scBvDYQubnIcYJaG');

INSERT INTO spesialisasi (id, nama) VALUES
(1, 'Buku Pelajaran'),
(2, 'Novel & Sastra'),
(3, 'Buku Langka & Antik'),
(4, 'Agama & Kitab'),
(5, 'Komik');

INSERT INTO kios (id, nama, pemilik, whatsapp, email, status, jumlah_judul, tanggal_daftar) VALUES
('A-01', 'Toko Surya',            'Hendra Surya',          '0812-1100-0001', '', 'buka',    1280, '2024-01-12'),
('A-02', 'Pustaka Kumala',        'Ibu Kumala',            '0812-1100-0002', '', 'buka',     940, '2024-02-03'),
('A-03', 'Wilis Book',            'Pak Anton',             '0812-1100-0003', '', 'buka',    1530, '2024-02-19'),
('A-04', 'Barokah',               'Bambang Soedjarwo',     '0812-9876-5432', '', 'buka',    6450, '2024-01-12'),
('B-01', 'Arsip Lawas',           'Pak Darmo',             '0813-2200-0001', '', 'buka',    2100, '2023-03-05'),
('B-02', 'Buku Langka',           'Bu Retno',              '0813-2200-0002', '', 'buka',     870, '2023-04-21'),
('B-03', 'Antika Jaya',           'Pak Jaya',              '0813-2200-0003', '', 'buka',     640, '2023-06-09'),
('C-03', 'Kios Wilis Antik 80',   'Cak Suroso',            '0813-7761-0021', '', 'buka',    1120, '2023-03-04'),
('A-12', 'Kios Pustaka Lawas',    'Pak Bambang Soedjarwo', '0812-3456-7890', '', 'buka',    3200, '2024-01-12'),
('B-07', 'Kios Sahabat Buku',     'Bu Hj. Siti Maryam',    '0856-9922-1143', '', 'pending',     0, DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
('B-19', 'Kios Hikmah Pustaka',   'Ustadz M. Fauzi',       '0821-4433-2211', '', 'tutup',   2750, '2024-01-29');

INSERT INTO kios_spesialisasi (kios_id, spesialisasi_id) VALUES
('A-01', 1),
('A-02', 2),
('A-03', 5),
('A-04', 1), ('A-04', 2), ('A-04', 4),
('B-01', 3),
('B-02', 3),
('B-03', 3),
('C-03', 5),
('A-12', 2),
('B-07', 1),
('B-19', 4);

INSERT INTO buku (id, judul, penulis, spesialisasi_id, kios_id, stok) VALUES
(1, 'Bumi Manusia',             'Pramoedya A. Toer', 2, 'A-02', 12),
(2, 'Laskar Pelangi',           'Andrea Hirata',     2, 'A-02',  8),
(3, 'Matematika SMA Kelas XII', 'Tim Erlangga',      1, 'A-01', 25),
(4, 'Tafsir Al-Azhar',          'Buya Hamka',        4, 'B-19',  3),
(5, 'Majalah Tempo 1982',       'Redaksi Tempo',     3, 'B-02',  2),
(6, 'Si Buta dari Gua Hantu',   'Ganesh T.H.',       5, 'C-03',  5);

-- Antrean moderasi (3 menunggu, 1 dilaporkan)
INSERT INTO forum_post (id, username, judul, isi, status, alasan) VALUES
(1, 'Rina Dewi',       'Request: "Sejarah Malang Tempo Doeloe"', 'Ada yang punya cetakan lama? Siap beli di kios mana pun.',   'pending', 'Permintaan buku baru dari pengunjung.'),
(2, 'Budi_Kolektor',   'Jual komik Tintin edisi 1970',           'Menawarkan transaksi langsung di luar pasar.',               'pending', 'Perlu dicek: ajakan transaksi di luar kios.'),
(3, 'Anonim88',        'Promo judi online!!',                    'Klik link ini untuk bonus new member.',                      'laporan', 'Dilaporkan 5 pengguna: spam & konten tidak pantas.'),
(4, 'Sari Mahasiswi',  'Cari Kitab Fiqih untuk skripsi',         'Ada yang jual Fiqih Sunnah lengkap?',                        'pending', 'Permintaan buku baru dari pengunjung.');

-- Riwayat moderasi (12 postingan sudah dimoderasi, sesuai angka "Sudah Dimoderasi: 12" di frontend)
INSERT INTO forum_post (username, judul, isi, status, alasan, dimoderasi_at, dimoderasi_oleh) VALUES
('Dewi_Lestari',  'Cari buku Fisika kelas XI',        'Ada yang jual bekas, kondisi masih bagus?',  'disetujui',     'Permintaan buku baru dari pengunjung.', DATE_SUB(NOW(), INTERVAL 12 DAY), 1),
('Agus_Pelajar',  'Novel Ronggeng Dukuh Paruk',       'Cari trilogi lengkap.',                      'disetujui',     'Permintaan buku baru dari pengunjung.', DATE_SUB(NOW(), INTERVAL 11 DAY), 1),
('Promo_Murah',   'Diskon besar judi bola',           'Daftar sekarang dapat bonus.',               'dihapus',       'Spam.',                                 DATE_SUB(NOW(), INTERVAL 10 DAY), 1),
('Hendra_K',      'Komik Wiro Sableng lengkap',       'Ada stok seri 1-50?',                        'disetujui',     'Permintaan buku baru dari pengunjung.', DATE_SUB(NOW(), INTERVAL 9 DAY),  1),
('Lia_Mahasiswi', 'Buku Statistika Dasar',            'Cari edisi lama yang murah.',                'disetujui',     'Permintaan buku baru dari pengunjung.', DATE_SUB(NOW(), INTERVAL 8 DAY),  1),
('Anon_Cuan',     'Klik link ini',                    'Hadiah gratis untuk 100 pengunjung.',        'dihapus',       'Dilaporkan 3 pengguna: spam.',          DATE_SUB(NOW(), INTERVAL 7 DAY),  1),
('Pak_Haryo',     'Majalah Intisari 1990-an',         'Siapa punya koleksi?',                       'disetujui',     'Permintaan buku baru dari pengunjung.', DATE_SUB(NOW(), INTERVAL 6 DAY),  1),
('Rizky_Pustaka', 'Kritik harga kios tertentu',       'Harga terlalu tinggi dibanding kios lain.',  'dipertahankan', 'Dilaporkan 2 pengguna: dinilai menyerang.', DATE_SUB(NOW(), INTERVAL 5 DAY), 1),
('Nanda_S',       'Cari kamus Arab-Indonesia',        'Untuk belajar mandiri.',                     'disetujui',     'Permintaan buku baru dari pengunjung.', DATE_SUB(NOW(), INTERVAL 4 DAY),  1),
('Bot_Iklan',     'Jual followers murah',             'Hubungi nomor di bio.',                      'dihapus',       'Spam.',                                 DATE_SUB(NOW(), INTERVAL 3 DAY),  1),
('Maya_Reader',   'Buku Tere Liye bekas',             'Cari yang masih mulus.',                     'disetujui',     'Permintaan buku baru dari pengunjung.', DATE_SUB(NOW(), INTERVAL 2 DAY),  1),
('Bima_Antik',    'Peta Malang tahun 1930',           'Ada reproduksi peta lama?',                  'disetujui',     'Permintaan buku baru dari pengunjung.', DATE_SUB(NOW(), INTERVAL 1 DAY),  1);

INSERT INTO pengaturan (id, nama_website, headline, deskripsi, whatsapp, email) VALUES
(1,
 'Pasar Buku Wilis - Malang',
 'Temukan Harta Karun Pustaka Nusantara',
 'Pusat pantauan terpusat untuk 60+ kios buku antik, katalog literatur langka, denah lorong tematik, dan interaksi komunitas pembaca di Kota Malang.',
 '+62 812-3456-7890',
 'info@pasarbukuwilis.id');
