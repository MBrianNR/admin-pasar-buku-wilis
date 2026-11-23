-- Add the remaining Flutter catalog categories without changing existing books.
INSERT INTO spesialisasi (nama) VALUES ('Kuliah'), ('Kamus'), ('Majalah')
ON DUPLICATE KEY UPDATE nama = VALUES(nama);
