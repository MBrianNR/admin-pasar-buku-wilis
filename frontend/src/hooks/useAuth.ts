'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getUser, isTokenExpired, clearSession } from '@/lib/auth';
import { authService } from '@/services/authService';
import { AdminUser, AuthSession } from '@/types';

export interface UseAuthReturn {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string;
  setError: (err: string) => void;
  login: (username: string, password: string) => Promise<AuthSession>;
  logout: () => void;
}

/**
 * Custom hook untuk manajemen status login admin
 */
export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const t = getToken();
    if (t && !isTokenExpired(t)) {
      setToken(t);
      setUser(getUser());
    } else {
      clearSession();
      setToken(null);
      setUser(null);
    }
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<AuthSession> => {
    setLoading(true);
    setError('');
    try {
      const data = await authService.login(username, password);
      setToken(data.token);
      setUser(data.user);
      router.replace('/dashboard');
      return data;
    } catch (err: any) {
      setError(err?.message || 'Login gagal.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const logout = useCallback(() => {
    authService.logout();
    setToken(null);
    setUser(null);
    router.replace('/login');
  }, [router]);

  return {
    user,
    token,
    isAuthenticated: Boolean(token && !isTokenExpired(token)),
    loading,
    error,
    setError,
    login,
    logout
  };
}

export default useAuth;

