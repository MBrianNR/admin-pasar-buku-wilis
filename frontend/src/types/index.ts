import { KiosItem } from './kios';
import { BukuItem } from './buku';
import { ForumPostItem } from './forum';
import { PengaturanItem } from './pengaturan';

export * from './kios';
export * from './buku';
export * from './forum';
export * from './pengaturan';
export * from './auth';

export interface AppState {
  kios: KiosItem[];
  buku: BukuItem[];
  post: ForumPostItem[];
  set: PengaturanItem;
  done: number;
  upd: string;
}
