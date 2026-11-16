import { apiRequest } from './api';
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
  async updateSettings(data: Partial<PengaturanItem>): Promise<PengaturanItem> {
    return apiRequest<PengaturanItem>('/api/pengaturan', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
};

