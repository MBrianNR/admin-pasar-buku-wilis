import { apiRequest } from './api';
import { KiosItem } from '@/types';

export interface KiosQueryParams {
  status?: string;
  blok?: string;
  q?: string;
  pendingFirst?: boolean | string;
}

export const kiosService = {
  /**
   * Ambil daftar kios dengan query filter
   */
  async getAll(params: KiosQueryParams = {}): Promise<KiosItem[]> {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.blok && params.blok !== 'all') query.set('blok', params.blok);
    if (params.q) query.set('q', params.q);
    if (params.pendingFirst) query.set('pendingFirst', 'true');
    const qs = query.toString();
    return apiRequest<KiosItem[]>(`/api/kios${qs ? `?${qs}` : ''}`);
  },

  /**
   * Ambil detail kios berdasarkan ID
   */
  async getById(id: string): Promise<KiosItem> {
    return apiRequest<KiosItem>(`/api/kios/${encodeURIComponent(id)}`);
  },

  /**
   * Daftarkan kios baru
   */
  async create(kiosData: Partial<KiosItem> & Record<string, any>): Promise<KiosItem> {
    return apiRequest<KiosItem>('/api/kios', {
      method: 'POST',
      body: JSON.stringify(kiosData)
    });
  },

  /**
   * Perbarui informasi kios
   */
  async update(id: string, kiosData: Partial<KiosItem> & Record<string, any>): Promise<KiosItem> {
    return apiRequest<KiosItem>(`/api/kios/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(kiosData)
    });
  },

  /**
   * Hapus kios dari sistem
   */
  async delete(id: string): Promise<{ success: boolean; message?: string }> {
    return apiRequest(`/api/kios/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  },

  /**
   * Setujui / verifikasi kios pending
   */
  async approve(id: string): Promise<KiosItem> {
    return apiRequest<KiosItem>(`/api/kios/${encodeURIComponent(id)}/approve`, {
      method: 'PATCH'
    });
  }
};

