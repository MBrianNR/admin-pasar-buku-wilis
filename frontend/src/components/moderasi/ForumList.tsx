'use client';

import React from 'react';
import ForumItem from './ForumItem';
import { ForumPostItem } from '@/types';

export interface ForumListProps {
  posts: ForumPostItem[];
  onApprove: (id: number | string) => void;
  onDelete: (id: number | string) => void;
}

export default function ForumList({ posts, onApprove, onDelete }: ForumListProps) {
  if (!posts || posts.length === 0) {
    return (
      <section className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--mut)' }}>
        Semua postingan sudah dimoderasi.
      </section>
    );
  }

  return (
    <>
      {posts.map(post => (
        <ForumItem
          key={post.id}
          post={post}
          onApprove={onApprove}
          onDelete={onDelete}
        />
      ))}
    </>
  );
}

