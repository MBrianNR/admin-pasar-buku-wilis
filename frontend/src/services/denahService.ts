import { apiRequest } from './api';
import { toStorageFields, uploadService } from './uploadService';

export const denahService = {
  /**
   * Ambil data layout denah
   */
  async getDenah<T = any>(): Promise<T> {
    return apiRequest<T>('/api/denah');
  },

  /**
   * Perbarui denah
   */
  async updateDenah<T = any>(data: any): Promise<T> {
    return apiRequest<T>('/api/denah', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  /**
   * Upload gambar denah ke cloud storage.
   * Hasilnya ({ gambar_url, gambar_file_key }) digabung ke payload updateDenah().
   */
  async uploadGambar(file: File) {
    const uploaded = await uploadService.uploadImage(file, 'denah');
    return toStorageFields('gambar', uploaded);
  }
};
