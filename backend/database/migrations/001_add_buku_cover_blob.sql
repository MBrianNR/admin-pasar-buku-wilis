-- Additive migration for an existing database; preserves all current book records.
ALTER TABLE buku
    ADD COLUMN cover_url VARCHAR(2048) NULL AFTER stok,
    ADD COLUMN cover_file_key VARCHAR(500) NULL AFTER cover_url;
