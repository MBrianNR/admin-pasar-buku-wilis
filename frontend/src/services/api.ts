import { clearSession, getToken } from '@/lib/auth';

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

const DEFAULT_TIMEOUT_MS = 15_000;
const UPLOAD_TIMEOUT_MS = 60_000;

export interface ApiRequestOptions extends RequestInit {
  headers?: Record<string, string>;
  /** Batas waktu request (ms). Default 15 detik, upload 60 detik. */
  timeoutMs?: number;
  /** Set false untuk request tanpa token (mis. login). Default true. */
  auth?: boolean;
}

/**
 * Error standar dari API. Membawa status HTTP dan body respons mentah.
 */
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status = 0, data: any = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Susun query string. Nilai undefined / null / '' dilewati.
 */
export function buildQuery(params: Record<string, string | number | boolean | null | undefined> = {}): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    query.set(key, String(value));
  });
  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Base fetch wrapper dengan automatic header Authorization dan JSON parser.
 * - Body FormData dikirim apa adanya (Content-Type diatur browser, wajib untuk upload file)
 * - Respons 204 / body kosong menghasilkan undefined
 * - 401 pada request ber-token: sesi dihapus + event `auth:unauthorized` dikirim
 */
export async function apiRequest<T = any>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, auth = true, headers: customHeaders, signal, ...init } = options;
  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const token = auth ? getToken() : null;

  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(init.body !== undefined && init.body !== null && !isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(customHeaders || {})
  };

  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  let response: Response;
  try {
    response = await fetch(url, { ...init, headers, signal: controller.signal });
  } catch (error) {
    if (timedOut) {
      throw new ApiError('Server terlalu lama merespons. Coba lagi beberapa saat.', 408);
    }
    if ((error as Error)?.name === 'AbortError') throw error;
    throw new ApiError(`Tidak dapat terhubung ke server backend. Pastikan backend berjalan di ${API_URL}.`, 0);
  } finally {
    clearTimeout(timer);
  }

  const raw = await response.text().catch(() => '');
  let result: any = null;
  if (raw) {
    try {
      result = JSON.parse(raw);
    } catch {
      result = null;
    }
  }

  if (response.status === 401 && token) {
    clearSession();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
  }

  if (!response.ok || (result && result.success === false)) {
    const message = result?.message || `Request gagal dengan status ${response.status}`;
    throw new ApiError(message, response.status, result);
  }

  if (!raw) return undefined as T;
  return (result?.data !== undefined ? result.data : result) as T;
}

/**
 * Kirim multipart/form-data (upload file ke backend → cloud storage).
 */
export async function apiUpload<T = any>(
  endpoint: string,
  formData: FormData,
  options: ApiRequestOptions = {}
): Promise<T> {
  return apiRequest<T>(endpoint, {
    timeoutMs: UPLOAD_TIMEOUT_MS,
    ...options,
    method: 'POST',
    body: formData
  });
}
