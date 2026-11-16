import { apiRequest } from './api';
import { BukuItem } from '@/types';

export interface BukuQueryParams {
  q?: string;
  kiosId?: string;
  kategori?: string;
}

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
    return apiRequest<BukuItem[]>(`/api/buku${qs ? `?${qs}` : ''}`);
  },

  /**
   * Tambah buku baru ke katalog
   */
  async create(bukuData: Partial<BukuItem> & Record<string, any>): Promise<BukuItem> {
    return apiRequest<BukuItem>('/api/buku', {
      method: 'POST',
      body: JSON.stringify(bukuData)
    });
  },

  /**
   * Perbarui informasi buku
   */
  async update(id: number | string, bukuData: Partial<BukuItem> & Record<string, any>): Promise<BukuItem> {
    return apiRequest<BukuItem>(`/api/buku/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bukuData)
    });
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

