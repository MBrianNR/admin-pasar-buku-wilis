// Sesi login admin: token JWT dari backend disimpan di localStorage browser

import { AdminUser, AuthSession } from '@/types';

export const TOKEN_KEY = 'pbw-admin-token';
export const USER_KEY = 'pbw-admin-user';

// Alamat backend Express (atur lewat NEXT_PUBLIC_API_URL di file .env.local)
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getUser(): AdminUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(token: string, user: AdminUser | null): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user ?? null));
  } catch {
    /* abaikan: penyimpanan diblokir */
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    /* abaikan */
  }
}

// Membaca waktu kedaluwarsa (exp) dari isi token. Hanya untuk menentukan perlu login ulang atau tidak;
// keaslian token tetap diperiksa oleh backend.
export function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const { exp } = JSON.parse(atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, '=')));
    return typeof exp === 'number' && exp * 1000 <= Date.now();
  } catch {
    return true; // token rusak dianggap tidak berlaku
  }
}

// POST /api/auth/login -> { token, user }. Melempar Error dengan pesan yang siap ditampilkan.
export async function loginRequest(username: string, password?: string): Promise<AuthSession> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
  } catch {
    throw new Error('Tidak dapat terhubung ke server. Pastikan backend sudah berjalan.');
  }

  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success || !result?.data?.token) {
    throw new Error(result?.message || 'Login gagal. Coba lagi nanti.');
  }
  return result.data as AuthSession;
}

