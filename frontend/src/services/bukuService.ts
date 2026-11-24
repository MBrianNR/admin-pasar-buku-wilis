import { apiRequest } from './api';
import { BukuItem } from '@/types';

export interface BukuQueryParams {
  q?: string;
  kiosId?: string;
  kategori?: string;
}

interface ApiBuku {
  id: number;
  judul: string;
  penulis: string;
  kategori: string;
  kios_id: string;
  stok: number;
  harga?: number;
  cover_url?: string | null;
  cover_file_key?: string | null;
}

const fromApi = (book: ApiBuku): BukuItem => ({
  id: book.id,
  j: book.judul,
  p: book.penulis,
  c: book.kategori,
  k: book.kios_id,
  st: Number(book.stok),
  harga: Number(book.harga || 0),
  cover: book.cover_url || undefined,
  cover_url: book.cover_url || undefined,
  cover_file_key: book.cover_file_key || undefined,
});

const toApi = (book: Partial<BukuItem>): Record<string, unknown> => ({
  ...(book.j !== undefined ? { judul: book.j } : {}),
  ...(book.p !== undefined ? { penulis: book.p } : {}),
  ...(book.c !== undefined ? { kategori: book.c } : {}),
  ...(book.k !== undefined ? { kios_id: book.k } : {}),
  ...(book.st !== undefined ? { stok: book.st } : {}),
  ...(book.harga !== undefined ? { harga: book.harga } : {}),
  ...(book.cover !== undefined || book.cover_url !== undefined ? { cover_url: book.cover_url ?? book.cover ?? null } : {}),
  ...(book.cover_file_key !== undefined ? { cover_file_key: book.cover_file_key || null } : {}),
});

export const bukuService = {
  /**
   * Ambil katalog buku
   */
  async getAll(params: BukuQueryParams = {}): Promise<BukuItem[]> {
    const query = new URLSearchParams();
    if (params.q) query.set('q', params.q);
    if (params.kiosId) query.set('kiosId', params.kiosId);
    if (params.kategori) query.set('kategori', params.kategori);
    const qs = query.toString();
    const result = await apiRequest<ApiBuku[]>(`/api/buku?${qs ? `${qs}&` : ''}limit=100`);
    return result.map(fromApi);
  },

  /**
   * Tambah buku baru ke katalog
   */
  async create(bukuData: Partial<BukuItem> & Record<string, any>): Promise<BukuItem> {
    const result = await apiRequest<ApiBuku>('/api/buku', {
      method: 'POST',
      body: JSON.stringify(toApi(bukuData))
    });
    return fromApi(result);
  },

  /**
   * Perbarui informasi buku
   */
  async update(id: number | string, bukuData: Partial<BukuItem> & Record<string, any>): Promise<BukuItem> {
    const result = await apiRequest<ApiBuku>(`/api/buku/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toApi(bukuData))
    });
    return fromApi(result);
  },

  /**
   * Hapus buku dari katalog
   */
  async delete(id: number | string): Promise<{ success: boolean; message?: string }> {
    return apiRequest(`/api/buku/${id}`, {
      method: 'DELETE'
    });
  }
};

