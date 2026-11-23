import { apiRequest, buildQuery } from './api';
import { toStorageFields, uploadService } from './uploadService';
import { KiosItem } from '@/types';

export interface KiosQueryParams {
  status?: string;
  blok?: string;
  q?: string;
  pendingFirst?: boolean | string;
}

interface ApiKios {
  id: string;
  nama: string;
  pemilik?: string;
  whatsapp?: string;
  email?: string;
  spesialisasi?: string[];
  status: string;
  jumlah_judul?: number;
  tanggal_daftar?: string;
}

const fromApi = (kios: ApiKios): KiosItem => ({
  id: kios.id,
  n: kios.nama,
  o: kios.pemilik ?? '',
  wa: kios.whatsapp ?? '',
  em: kios.email ?? '',
  sp: kios.spesialisasi ?? [],
  s: kios.status as KiosItem['s'],
  k: Number(kios.jumlah_judul ?? 0),
  t: kios.tanggal_daftar ?? '',
});

const toApi = (kios: Partial<KiosItem> & Record<string, any>) => ({
  ...(kios.id !== undefined ? { id: kios.id } : {}),
  ...(kios.n !== undefined ? { nama: kios.n } : {}),
  ...(kios.o !== undefined ? { pemilik: kios.o } : {}),
  ...(kios.wa !== undefined ? { whatsapp: kios.wa } : {}),
  ...(kios.em !== undefined ? { email: kios.em } : {}),
  ...(kios.sp !== undefined ? { spesialisasi: kios.sp } : {}),
  ...(kios.s !== undefined ? { status: kios.s } : {}),
});

export const kiosService = {
  /**
   * Ambil daftar kios dengan query filter
   */
  async getAll(params: KiosQueryParams = {}): Promise<KiosItem[]> {
    const qs = buildQuery({
      status: params.status && params.status !== 'all' ? params.status : undefined,
      blok: params.blok && params.blok !== 'all' ? params.blok : undefined,
      q: params.q?.trim(),
      page: 1,
      limit: 100,
      // string 'false' tidak boleh dianggap true
      pendingFirst: params.pendingFirst === true || params.pendingFirst === 'true' ? 'true' : undefined
    });
    const result = await apiRequest<ApiKios[]>(`/api/kios${qs}`);
    return result.map(fromApi);
  },

  /**
   * Ambil detail kios berdasarkan ID
   */
  async getById(id: string): Promise<KiosItem> {
    const result = await apiRequest<ApiKios>(`/api/kios/${encodeURIComponent(id)}`);
    return fromApi(result);
  },

  /**
   * Daftarkan kios baru
   */
  async create(kiosData: Partial<KiosItem> & Record<string, any>): Promise<KiosItem> {
    const result = await apiRequest<ApiKios>('/api/kios', {
      method: 'POST',
      body: JSON.stringify(toApi(kiosData))
    });
    return fromApi(result);
  },

  /**
   * Perbarui informasi kios
   */
  async update(id: string, kiosData: Partial<KiosItem> & Record<string, any>): Promise<KiosItem> {
    const result = await apiRequest<ApiKios>(`/api/kios/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(toApi(kiosData))
    });
    return fromApi(result);
  },

  /**
   * Hapus kios dari sistem
   */
  async delete(id: string): Promise<{ success: boolean; message?: string }> {
    return apiRequest(`/api/kios/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  },

  /**
   * Setujui / verifikasi kios pending
   */
  async approve(id: string): Promise<KiosItem> {
    const result = await apiRequest<ApiKios>(`/api/kios/${encodeURIComponent(id)}/approve`, {
      method: 'PATCH'
    });
    return fromApi(result);
  },

  /**
   * Upload foto kios ke cloud storage.
   * Hasilnya ({ foto_url, foto_file_key }) digabung ke payload create()/update(),
   * sama seperti cover_url / cover_file_key pada buku.
   */
  async uploadFoto(file: File) {
    const uploaded = await uploadService.uploadImage(file, 'kios');
    return toStorageFields('foto', uploaded);
  }
};
