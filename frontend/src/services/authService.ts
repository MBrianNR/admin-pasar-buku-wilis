import { apiRequest } from './api';
import { clearSession, getToken, getUser, isTokenExpired, saveSession } from '@/lib/auth';
import { AdminUser, AuthSession } from '@/types';

export const authService = {
  /**
   * Kirim kredensial login admin ke backend Express
   */
  async login(username?: string, password?: string): Promise<AuthSession> {
    const data = await apiRequest<AuthSession>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    if (data?.token) {
      saveSession(data.token, data.user);
    }
    return data;
  },

  /**
   * Hapus token sesi lokal
   */
  logout(): void {
    clearSession();
  },

  /**
   * Ambil info user yang sedang login
   */
  getCurrentUser(): AdminUser | null {
    return getUser();
  },

  /**
   * Cek apakah user sedang login dan token valid
   */
  isAuthenticated(): boolean {
    const token = getToken();
    return Boolean(token && !isTokenExpired(token));
  }
};

