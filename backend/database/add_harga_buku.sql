-- Jalankan sekali pada database Railway yang sudah aktif sebelum deploy backend baru.
ALTER TABLE buku
    ADD COLUMN harga BIGINT UNSIGNED NOT NULL DEFAULT 0 AFTER stok;
