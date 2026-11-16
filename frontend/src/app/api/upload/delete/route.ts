import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

function ensureBackendApiConfigured(): void {
  const hostname = new URL(API_URL).hostname;
  if (process.env.VERCEL && (!process.env.NEXT_PUBLIC_API_URL || ['localhost', '127.0.0.1'].includes(hostname))) {
    throw new Error('NEXT_PUBLIC_API_URL harus berisi URL publik backend Express pada deployment Vercel.');
  }
}

async function authenticateAdmin(request: NextRequest): Promise<string | null> {
  ensureBackendApiConfigured();
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) return null;
  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: { Authorization: authorization },
    cache: 'no-store',
  });
  const result = await response.json().catch(() => null);
  return response.ok && result?.success && result?.data?.id ? String(result.data.id) : null;
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await authenticateAdmin(req);
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Sesi admin tidak valid.' }, { status: 401 });
    }

    let fileKey = req.nextUrl.searchParams.get('fileKey');

    if (!fileKey) {
      const body = await req.json().catch(() => null);
      if (body && body.fileKey) {
        fileKey = body.fileKey;
      }
    }

    if (!fileKey) {
      return NextResponse.json(
        { success: false, message: 'Parameter fileKey wajib disertakan.' },
        { status: 400 }
      );
    }

    // Validasi format fileKey untuk mencegah penghapusan direktori lain secara tidak sengaja
    if (!fileKey.startsWith(`uploads/${userId}/`) || fileKey.split('/').includes('..')) {
      return NextResponse.json(
        { success: false, message: 'Format fileKey tidak valid.' },
        { status: 400 }
      );
    }

    // Vercel Blob accepts the saved pathname and deletes the matching object.
    await del(fileKey);

    return NextResponse.json({
      success: true,
      message: `File "${fileKey}" berhasil dihapus dari Vercel Blob.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Gagal menghapus file dari storage.',
      },
      { status: 500 }
    );
  }
}
