import { apiRequest } from './api';

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
  }
};

