import { del, head } from '@vercel/blob';

/** Resolve a saved Blob pathname or URL to its public URL. */
export async function resolveFileUrl(fileKeyOrUrl: string): Promise<string> {
  if (!fileKeyOrUrl) return '';
  if (/^(https?:\/\/|data:)/i.test(fileKeyOrUrl)) return fileKeyOrUrl;

  const blob = await head(fileKeyOrUrl);
  return blob.url;
}

/** Check whether a Vercel Blob object exists and return its metadata. */
export async function verifyStorageFile(fileKeyOrUrl: string): Promise<{
  exists: boolean;
  contentLength?: number;
  contentType?: string;
}> {
  try {
    const blob = await head(fileKeyOrUrl);
    return {
      exists: true,
      contentLength: blob.size,
      contentType: blob.contentType,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'BlobNotFoundError') {
      return { exists: false };
    }
    throw error;
  }
}

/** Delete a Vercel Blob object by its pathname or URL. */
export async function deleteStorageFile(fileKeyOrUrl: string): Promise<boolean> {
  if (!fileKeyOrUrl) return false;
  await del(fileKeyOrUrl);
  return true;
}
