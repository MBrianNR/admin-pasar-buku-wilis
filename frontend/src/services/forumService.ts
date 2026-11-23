import { apiRequest } from './api';
import { ForumPostItem } from '@/types';

export const forumService = {
  /**
   * Ambil daftar postingan forum moderasi
   */
  async getPosts(): Promise<ForumPostItem[]> {
    return apiRequest<ForumPostItem[]>('/api/forum');
  },

  /**
   * Setujui postingan forum
   */
  async approvePost(id: number | string): Promise<ForumPostItem> {
    return apiRequest<ForumPostItem>(`/api/forum/${encodeURIComponent(id)}/approve`, {
      method: 'PATCH'
    });
  },

  /**
   * Hapus / tolak postingan forum
   */
  async deletePost(id: number | string): Promise<{ success: boolean; message?: string }> {
    return apiRequest(`/api/forum/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  }
};
