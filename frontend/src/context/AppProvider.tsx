'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AppContext, AppContextValue, ModalState } from '@/context/AppContext';
import { ROUTES, STATUS, loadState, saveState, seed } from '@/lib/data';
import { kiosToCsv, nowLabel, todayLabel } from '@/lib/utils';
import { clearSession, getToken, isTokenExpired } from '@/lib/auth';
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import ModalRoot from '@/components/common/ModalRoot';
import { AppState, BukuItem, KiosItem, PengaturanItem } from '@/types';
import { bukuService } from '@/services/bukuService';

// "/toko" -> "toko" (URL yang tidak dikenal dianggap dashboard)
const routeOf = (pathname: string): string => {
  const r = pathname.split('/')[1];
  return ROUTES.includes(r) ? r : 'dashboard';
};

interface NextNav {
  filter: string;
  keepQuery: boolean;
}

// Titipan untuk perpindahan halaman berikutnya (filter awal & apakah kata kunci pencarian dipertahankan)
const NO_NAV: NextNav = { filter: '', keepQuery: false };

interface AppProviderProps {
  children: ReactNode;
}

// Pengganti App.jsx versi React: memegang semua state & aksi, lalu membungkus halaman (children)
// dengan sidebar, header, footer, modal, dan toast. Hanya bisa dibuka setelah login.
export default function AppProvider({ children }: AppProviderProps) {
  const router = useRouter();
  const pathname = usePathname();

  // ---- data (disimpan di localStorage) ----
  // Server tidak punya localStorage, jadi mulai dari data awal lalu muat data tersimpan setelah
  // komponen terpasang di browser. `ready` mencegah data awal menimpa data yang tersimpan.
  const [data, setData] = useState<AppState>(seed);
  const [ready, setReady] = useState<boolean>(false);

  // Penjaga halaman: tanpa token yang masih berlaku, arahkan ke /login (halaman admin tidak ditampilkan)
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      clearSession();
      router.replace('/login');
      return;
    }
    setData(loadState());
    setReady(true);
  }, [router]);

  // Katalog buku dari MySQL adalah sumber data utama; localStorage tetap dipakai
  // sebagai cache/fallback untuk bagian portal yang belum dipindahkan ke API.
  useEffect(() => {
    if (!ready) return;
    let active = true;
    bukuService.getAll().then(buku => {
      if (active) setData(current => ({ ...current, buku }));
    }).catch(error => {
      console.warn('[Katalog] Gagal memuat buku dari backend; memakai cache lokal.', error);
    });
    return () => { active = false; };
  }, [ready]);

  useEffect(() => {
    if (ready) saveState(data);
  }, [data, ready]);

  // ---- state tampilan ----
  const route = routeOf(pathname);

  const [query, setQuery] = useState<string>(''); // kata kunci pencarian
  const [filter, setFilter] = useState<string>('all'); // filter status kios (halaman Toko)
  const [block, setBlock] = useState<string>('all'); // filter blok (Dashboard)
  const [page, setPage] = useState<number>(1); // halaman tabel
  const [tab, setTab] = useState<string>('A'); // tab blok di Denah
  const [selected, setSel] = useState<string>('A-04'); // kios terpilih di Denah
  const [modal, setModal] = useState<ModalState | null>(null);
  const [toastMsg, setToastMsg] = useState<string>('');
  const [nextNav, setNextNav] = useState<NextNav>(NO_NAV);

  const searchRef = useRef<HTMLInputElement | null>(null);
  const toastTimer = useRef<NodeJS.Timeout | null>(null);

  // ---- toast ----
  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 2600);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  // ---- reset tampilan saat pindah halaman ----
  const resetView = ({ filter: nextFilter, keepQuery }: NextNav) => {
    if (!keepQuery) setQuery('');
    setPage(1);
    setFilter(nextFilter || 'all');
    setBlock('all');
  };

  // Dijalankan saat render (bukan di effect) supaya halaman baru tidak sempat tampil
  // dengan pencarian/filter dari halaman sebelumnya. Ini juga berlaku untuk tombol back/forward.
  const [prevPath, setPrevPath] = useState<string>(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    resetView(nextNav);
    setNextNav(NO_NAV);
  }

  // Pindah halaman. nextFilter = filter awal di halaman tujuan, keepQuery = pertahankan pencarian.
  const goTo = (r: string, nextFilter: string = '', keepQuery: boolean = false) => {
    setModal(null);
    const target = '/' + r;
    if (pathname === target) {
      resetView({ filter: nextFilter, keepQuery });
      window.scrollTo(0, 0);
    } else {
      setNextNav({ filter: nextFilter, keepQuery });
      router.push(target);
    }
  };

  // ---- pintasan keyboard: Ctrl/Cmd+K fokus ke pencarian, Esc tutup modal ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape') setModal(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // ---- turunan data ----
  const filteredKios = useMemo(() => {
    const q = query.toLowerCase();
    return data.kios.filter(
      k =>
        (filter === 'all' || k.s === filter) &&
        (block === 'all' || k.id[0] === block) &&
        (!q || (k.n + k.o + k.id + k.wa).toLowerCase().includes(q))
    );
  }, [data.kios, filter, block, query]);

  const kiosName = (id: string): string => (data.kios.find(k => k.id === id) || { n: '-' }).n;

  const update = (fn: (d: AppState) => AppState) => setData(d => fn(d));

  // ---- aksi: pencarian & filter ----
  const changeQuery = (v: string) => {
    setQuery(v);
    setPage(1);
  };
  const changeFilter = (v: string) => {
    setFilter(v);
    setPage(1);
  };
  const changeBlock = (v: string) => {
    setBlock(v);
    setPage(1);
  };

  // ---- aksi: modal ----
  const closeModal = () => setModal(null);
  const confirm = (message: string, onConfirm: () => void, label: string = 'Ya, Lanjutkan') =>
    setModal({ type: 'confirm', message, onConfirm, label });

  const openKiosForm = (kios?: KiosItem | null, pre?: string) =>
    setModal({ type: 'kios', kios: kios || null, pre: pre || '' });
  const openKiosDetail = (id: string) => setModal({ type: 'detail', id });
  const openBukuForm = (buku?: BukuItem | null) => setModal({ type: 'buku', buku: buku || null });
  const openProfile = () => setModal({ type: 'profile' });
  const openBell = () => setModal({ type: 'bell' });
  const openExport = () =>
    setModal({ type: 'export', csv: kiosToCsv(filteredKios, s => STATUS[s]?.[1] || s) });

  // ---- aksi: akun ----
  // Keluar: hapus token lalu kembali ke halaman login
  const logout = () => {
    clearSession();
    router.replace('/login');
  };
  const confirmLogout = () => confirm('Keluar dari Admin Portal?', logout, 'Ya, Keluar');

  // ---- aksi: kios ----
  const approveKios = (id: string) => {
    update(d => ({ ...d, kios: d.kios.map(k => (k.id === id ? { ...k, s: 'buka' } : k)) }));
    toast('Kios ' + id + ' disetujui dan kini aktif');
  };

  const saveKios = (values: any, editId?: string) => {
    update(d => ({
      ...d,
      kios: editId
        ? d.kios.map(k => (k.id === editId ? { ...k, ...values } : k))
        : [{ ...values, k: 0, t: todayLabel() }, ...d.kios]
    }));
    setSel(values.id);
    setModal(null);
    toast(editId ? 'Perubahan kios disimpan' : 'Kios ' + values.id + ' berhasil didaftarkan');
  };

  const deleteKios = (id: string) =>
    confirm(
      'Hapus kios ' + id + ' dari direktori?',
      () => {
        update(d => ({ ...d, kios: d.kios.filter(k => k.id !== id) }));
        toast('Kios ' + id + ' dihapus');
      },
      'Ya, Hapus'
    );

  // ---- aksi: buku ----
  const saveBuku = async (values: any, editId?: number | string) => {
    const previous = editId ? data.buku.find(book => String(book.id) === String(editId)) : undefined;
    try {
      const saved = editId
        ? await bukuService.update(editId, values)
        : await bukuService.create(values);
      update(d => ({
        ...d,
        buku: editId
          ? d.buku.map(book => (String(book.id) === String(editId) ? saved : book))
          : [saved, ...d.buku]
      }));
      setModal(null);
      toast(editId ? 'Buku dan data sampul tersimpan di MySQL' : 'Buku ditambahkan ke MySQL');

      // Hapus cover lama hanya sesudah MySQL menyimpan URL/key yang baru.
      if (previous?.cover_file_key && previous.cover_file_key !== saved.cover_file_key) {
        void deleteBlob(previous.cover_file_key).catch(error => {
          console.warn('[Storage] Data buku tersimpan, tetapi cover lama belum terhapus.', error);
          toast('Buku tersimpan, tetapi cover lama masih tertinggal di Blob.');
        });
      }
    } catch (error) {
      toast(error instanceof Error ? `Gagal menyimpan buku: ${error.message}` : 'Gagal menyimpan buku ke backend.');
    }
  };

  const deleteBlob = async (fileKey: string) => {
    const token = getToken();
    if (!token || !fileKey.startsWith('uploads/')) return;
    const response = await fetch(`/api/upload/delete?fileKey=${encodeURIComponent(fileKey)}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Cover lama gagal dihapus dari Vercel Blob.');
  };

  const deleteBuku = (id: number | string) =>
    confirm(
      'Hapus buku ini dari katalog?',
      () => {
        void (async () => {
          const book = data.buku.find(item => String(item.id) === String(id));
          try {
            await bukuService.delete(id);
            update(d => ({ ...d, buku: d.buku.filter(item => String(item.id) !== String(id)) }));
            if (book?.cover_file_key) {
              try {
                await deleteBlob(book.cover_file_key);
                toast('Buku dan cover dihapus');
              } catch (error) {
                console.warn('[Storage] Buku sudah terhapus dari MySQL, tetapi cover belum terhapus.', error);
                toast('Buku terhapus, tetapi cover masih tertinggal di Blob.');
              }
            } else {
              toast('Buku dihapus dari MySQL dan katalog');
            }
          } catch (error) {
            toast(error instanceof Error ? `Gagal menghapus buku: ${error.message}` : 'Gagal menghapus buku.');
          }
        })();
      },
      'Ya, Hapus'
    );

  // ---- aksi: denah ----
  const updateDenah = () => {
    update(d => ({ ...d, upd: nowLabel() }));
    toast('Denah berhasil diperbarui');
  };

  // Buka katalog dengan pencarian terisi nomor kios (tombol "Lihat Profil Toko & Katalog")
  const openProfileCatalog = (id: string) => {
    setQuery(id);
    goTo('katalog', '', true);
  };

  // ---- aksi: moderasi forum ----
  const approvePost = (id: number | string) => {
    const post = data.post.find(p => p.id === id);
    update(d => ({ ...d, post: d.post.filter(p => p.id !== id), done: d.done + 1 }));
    toast(
      post && post.s === 'laporan'
        ? 'Laporan diabaikan, postingan dipertahankan'
        : 'Postingan disetujui dan ditayangkan'
    );
  };

  const deletePost = (id: number | string) => {
    update(d => ({ ...d, post: d.post.filter(p => p.id !== id), done: d.done + 1 }));
    toast('Postingan dihapus');
  };

  // ---- aksi: pengaturan ----
  const saveSettings = (settings: PengaturanItem) => {
    update(d => ({ ...d, set: settings }));
    toast('Pengaturan website tersimpan');
  };

  // Aksi tombol utama di header, dipanggil lewat nama (lihat PAGE_HEADERS di lib/data.js)
  const headerActions: Record<string, () => void> = {
    newKios: () => openKiosForm(null),
    newBuku: () => openBukuForm(null),
    updateDenah
  };

  const ctx: AppContextValue = {
    data,
    route,
    query,
    filter,
    block,
    page,
    tab,
    selected,
    filteredKios,
    searchRef,
    toastMsg,
    modal,
    kiosName,
    setPage,
    setTab,
    setSel,
    changeQuery,
    changeFilter,
    changeBlock,
    goTo,
    toast,
    closeModal,
    openKiosForm,
    openKiosDetail,
    openBukuForm,
    openProfile,
    openBell,
    openExport,
    confirmLogout,
    approveKios,
    saveKios,
    deleteKios,
    saveBuku,
    deleteBuku,
    updateDenah,
    openProfileCatalog,
    approvePost,
    deletePost,
    saveSettings,
    headerActions
  };

  // Tunggu data dari localStorage dimuat supaya halaman tidak sempat menampilkan data awal
  // (dan form seperti Pengaturan langsung terisi nilai yang benar).
  if (!ready) return null;

  return (
    <AppContext.Provider value={ctx}>
      <Sidebar />
      <div className="wrap">
        <Header />
        <main id="mn">{children}</main>
        <Footer />
      </div>

      {/* Modal & notifikasi */}
      <div id="ov">
        <ModalRoot />
      </div>
      {toastMsg && <div id="ts">{toastMsg}</div>}
    </AppContext.Provider>
  );
}

