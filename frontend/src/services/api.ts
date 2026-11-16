import { getToken } from '@/lib/auth';

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

export interface ApiRequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

/**
 * Base fetch wrapper dengan automatic header Authorization dan JSON parser
 */
export async function apiRequest<T = any>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers
    });
  } catch (error) {
    throw new Error('Tidak dapat terhubung ke server backend Express. Pastikan backend sudah berjalan di port 5000.');
  }

  const result = await response.json().catch(() => null);

  if (!response.ok || (result && result.success === false)) {
    const errorMsg = result?.message || `Request gagal dengan status ${response.status}`;
    const err = new Error(errorMsg) as Error & { status?: number; data?: any };
    err.status = response.status;
    err.data = result;
    throw err;
  }

  return (result?.data !== undefined ? result.data : result) as T;
}

