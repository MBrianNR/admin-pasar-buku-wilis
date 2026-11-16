import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextRequest, NextResponse } from 'next/server';
import { validateFileMetadata } from '@/lib/storage/validation';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

async function authenticateAdmin(request: NextRequest): Promise<string> {
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

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as HandleUploadBody;
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const userId = await authenticateAdmin(request);
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
        return {
          pathname: `uploads/${userId}/${pathname.split('/').pop()}`,
          allowedContentTypes: [metadata.mimeType as string],
          maximumSizeInBytes: 5 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId, entityType: metadata.entityType }),
        };
      },
      onUploadCompleted: async () => {
        // The browser receives the resulting URL and pathname from the SDK.
      },
    });
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Gagal memproses upload.' },
      { status: 400 },
    );
  }
}
