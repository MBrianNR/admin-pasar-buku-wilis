import { apiRequest } from './api';
import { toStorageFields, uploadService } from './uploadService';
import { PengaturanItem } from '@/types';

export const pengaturanService = {
  /**
   * Ambil data pengaturan situs
   */
  async getSettings(): Promise<PengaturanItem> {
    return apiRequest<PengaturanItem>('/api/pengaturan');
  },

  /**
   * Perbarui data pengaturan situs
   */
  async updateSettings(data: Partial<PengaturanItem> & Record<string, any>): Promise<PengaturanItem> {
    return apiRequest<PengaturanItem>('/api/pengaturan', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  /**
   * Upload logo situs ke cloud storage.
   * Hasilnya ({ logo_url, logo_file_key }) digabung ke payload updateSettings().
   */
  async uploadLogo(file: File) {
    const uploaded = await uploadService.uploadImage(file, 'pengaturan');
    return toStorageFields('logo', uploaded);
  }
};
