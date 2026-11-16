'use client';

import { useMemo } from 'react';
import { useApp } from './useApp';
import { ForumPostItem } from '@/types';

export interface UseModerasiReturn {
  posts: ForumPostItem[];
  waitingCount: number;
  reportedCount: number;
  doneCount: number;
  approvePost: (id: number | string) => void;
  deletePost: (id: number | string) => void;
}

/**
 * Custom hook untuk forum moderasi
 */
export function useModerasi(): UseModerasiReturn {
  const { data, approvePost, deletePost } = useApp();

  const waitingCount = useMemo(() => data.post.filter(x => x.s === 'pending').length, [data.post]);
  const reportedCount = useMemo(() => data.post.filter(x => x.s === 'laporan').length, [data.post]);

  return {
    posts: data.post,
    waitingCount,
    reportedCount,
    doneCount: data.done,
    approvePost,
    deletePost
  };
}

export default useModerasi;

