'use client';

import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, isTokenExpired, loginRequest, saveSession } from '@/lib/auth';
import { validateLoginInput } from '@/validators/authValidator';

const EyeIcon = ({ off }: { off: boolean }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {off ? (
      <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.1A10.4 10.4 0 0112 5c6 0 10 7 10 7a17 17 0 01-3.2 4M6.6 6.6A17 17 0 002 12s4 7 10 7a9.7 9.7 0 004.4-1" />
    ) : (
      <>
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Kalau sesi login masih berlaku, langsung ke dashboard
  useEffect(() => {
    const token = getToken();
    if (token && !isTokenExpired(token)) router.replace('/dashboard');
  }, [router]);

  const change = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;

    // Validasi data input login
    const validation = validateLoginInput(form.username, form.password);
    if (!validation.isValid) {
      setError(validation.message);
      return;
    }

    setError('');
    setLoading(true);
    try {
      const { token, user } = await loginRequest(form.username.trim(), form.password);
      saveSession(token, user);
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Login gagal. Coba lagi nanti.');
      setLoading(false);
    }
  };

  return (
    <main className="lg">
      <form className="lg-card" onSubmit={submit} noValidate>
        <h1>Login Admin</h1>
        <p className="lg-sub">Pasar Buku Wilis</p>

        <div className="lg-field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            autoFocus
            value={form.username}
            onChange={change}
            placeholder="Username admin"
          />
        </div>

        <div className="lg-field">
          <label htmlFor="password">Password</label>
          <div className="lg-pass">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={form.password}
              onChange={change}
              placeholder="Kata sandi"
            />
            <button
              type="button"
              className="lg-eye"
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              aria-pressed={showPassword}
              onClick={() => setShowPassword(s => !s)}
            >
              <EyeIcon off={showPassword} />
            </button>
          </div>
        </div>

        {error && (
          <div className="lg-error" role="alert">
            {error}
          </div>
        )}

        <button className="lg-submit" type="submit" disabled={loading}>
          {loading ? 'Memproses...' : 'Login'}
        </button>
      </form>
    </main>
  );
}

