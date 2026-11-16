export type KiosStatus = 'buka' | 'pending' | 'tutup';

export interface KiosItem {
  id: string; // format "A-15", dipakai untuk cek nomor kios duplikat
  [key: string]: any;
}
