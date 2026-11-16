import React from 'react';
import type { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';
import '../../css/login.css';

export const metadata: Metadata = {
  title: 'Login Admin - Pasar Buku Wilis'
};

// Halaman ini ada di luar grup (admin), jadi tidak memakai sidebar/header dan tidak butuh login
export default function LoginPage() {
  return <LoginForm />;
}

