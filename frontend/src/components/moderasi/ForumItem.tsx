'use client';

import React from 'react';
import { ForumPostItem } from '@/types';

export interface ForumItemProps {
  post: ForumPostItem;
  onApprove: (id: number | string) => void;
  onDelete: (id: number | string) => void;
}

export default function ForumItem({ post, onApprove, onDelete }: ForumItemProps) {
  const isReport = post.s === 'laporan';

  return (
    <section className={`card post ${isReport ? 'rep' : ''}`}>
      <div>
        <span className="tag">{post.u}</span>
        <span className={`pill ${isReport ? 'bd' : 'wn'}`}>
          {isReport ? 'Dilaporkan' : 'Menunggu'}
        </span>
        <h4>{post.j}</h4>
        <p>{post.i}</p>
        <div className="why">{post.w}</div>
      </div>
      <div className="act">
        {isReport ? (
          <>
            <button className="btn d" onClick={() => onDelete(post.id)}>
              Hapus Postingan
            </button>
            <button className="btn o" onClick={() => onApprove(post.id)}>
              Abaikan Laporan
            </button>
          </>
        ) : (
          <>
            <button className="btn" onClick={() => onApprove(post.id)}>
              Setujui & Tayangkan
            </button>
            <button className="btn ro" onClick={() => onDelete(post.id)}>
              Tolak
            </button>
          </>
        )}
      </div>
    </section>
  );
}

