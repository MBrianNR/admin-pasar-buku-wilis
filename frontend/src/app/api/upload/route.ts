import { handleUploadPresigned, type HandleUploadPresignedBody } from '@vercel/blob/client';
import { issueSignedToken } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { validateFileMetadata } from '@/lib/storage/validation';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

function ensureBackendApiConfigured(): void {
  const hostname = new URL(API_URL).hostname;
  if (process.env.VERCEL && (!process.env.NEXT_PUBLIC_API_URL || ['localhost', '127.0.0.1'].includes(hostname))) {
    throw new Error(
      'Backend belum dikonfigurasi untuk production. Tambahkan NEXT_PUBLIC_API_URL dengan URL publik backend Express di Vercel, lalu redeploy.',
    );
  }
}

async function authenticateAdmin(request: NextRequest): Promise<string> {
  ensureBackendApiConfigured();
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    throw new Error('Sesi admin tidak ditemukan. Silakan login kembali.');
  }
  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: { Authorization: authorization },
    cache: 'no-store',
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success || !result?.data?.id) {
    throw new Error('Sesi admin tidak valid atau kedaluwarsa. Silakan login kembali.');
  }
  return String(result.data.id);
}

export async function GET(request: NextRequest) {
  const hasBlobCredentials = Boolean(
    (process.env.BLOB_STORE_ID && (process.env.VERCEL_OIDC_TOKEN || process.env.VERCEL)) ||
      process.env.BLOB_READ_WRITE_TOKEN,
  );

  if (!hasBlobCredentials) {
    const message = process.env.VERCEL
      ? 'Blob store belum terhubung ke project Vercel. Hubungkan store melalui Storage → Projects, lalu redeploy.'
      : 'Kredensial Vercel Blob belum tersedia untuk lokal. Tambahkan BLOB_READ_WRITE_TOKEN ke frontend/.env.local, lalu restart server.';
    return NextResponse.json({ success: false, message }, { status: 503 });
  }

  try {
    const userId = await authenticateAdmin(request);
    return NextResponse.json({ success: true, userId });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Sesi admin tidak valid.' },
      { status: 401 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as HandleUploadPresignedBody;
    const response = await handleUploadPresigned({
      body,
      request,
      getSignedToken: async (pathname, clientPayload) => {
        const userId = await authenticateAdmin(request);
        const expectedPrefix = `uploads/${userId}/`;
        const filename = pathname.split('/').pop() || '';
        const targetPathname = `${expectedPrefix}${filename}`;
        if (!filename || pathname !== targetPathname || filename.includes('\\')) {
          throw new Error('Lokasi file upload tidak valid.');
        }
        const metadata = JSON.parse(clientPayload || '{}') as {
          filename?: string;
          mimeType?: string;
          sizeBytes?: number;
          entityType?: string;
        };
        if (!['buku_cover', 'kios_logo', 'dokumen'].includes(metadata.entityType || '')) {
          throw new Error('Jenis file tidak valid.');
        }
        validateFileMetadata(metadata.mimeType || '', metadata.filename || '', metadata.sizeBytes || 0);
        const token = await issueSignedToken({
          pathname,
          operations: ['put'],
          allowedContentTypes: [metadata.mimeType as string],
          maximumSizeInBytes: 5 * 1024 * 1024,
        });
        return {
          token,
          urlOptions: {
            pathname: targetPathname,
            allowedContentTypes: [metadata.mimeType as string],
            maximumSizeInBytes: 5 * 1024 * 1024,
            addRandomSuffix: true,
            tokenPayload: JSON.stringify({ userId, entityType: metadata.entityType }),
          },
        };
      },
      // Upload callbacks are not needed; the browser receives the uploaded URL directly.
      // The SDK still requires a key for its callback verification path.
      webhookPublicKey: process.env.BLOB_WEBHOOK_PUBLIC_KEY || 'local-no-callback',
    });
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Gagal memproses upload.' },
      { status: 400 },
    );
  }
}
