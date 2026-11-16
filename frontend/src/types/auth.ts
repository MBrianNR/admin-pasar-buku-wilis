/**
 * Definisi tipe data sesi login dan autentikasi admin
 */

export interface AdminUser {
  id: number;
  username: string;
  email?: string;
  nama?: string;
  role?: string;
}

export interface AuthSession {
  token: string;
  user: AdminUser;
}

export interface LoginCredentials {
  username: string;
  password?: string;
  [key: string]: any;
}

