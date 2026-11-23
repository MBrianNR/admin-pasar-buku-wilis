import { apiRequest, buildQuery } from './api';
import { toStorageFields, uploadService } from './uploadService';
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
    const qs = buildQuery({
      status: params.status && params.status !== 'all' ? params.status : undefined,
      blok: params.blok && params.blok !== 'all' ? params.blok : undefined,
      q: params.q?.trim(),
      // string 'false' tidak boleh dianggap true
      pendingFirst: params.pendingFirst === true || params.pendingFirst === 'true' ? 'true' : undefined
    });
    return apiRequest<KiosItem[]>(`/api/kios${qs}`);
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
  },

  /**
   * Upload foto kios ke cloud storage.
   * Hasilnya ({ foto_url, foto_file_key }) digabung ke payload create()/update(),
   * sama seperti cover_url / cover_file_key pada buku.
   */
  async uploadFoto(file: File) {
    const uploaded = await uploadService.uploadImage(file, 'kios');
    return toStorageFields('foto', uploaded);
  }
};
