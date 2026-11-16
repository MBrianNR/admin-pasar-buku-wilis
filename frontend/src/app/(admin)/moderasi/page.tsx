'use client';

import React from 'react';
import { useModerasi } from '@/hooks/useModerasi';
import Stat from '@/components/common/Stat';
import ForumList from '@/components/moderasi/ForumList';

export default function Moderasi() {
  const { posts, waitingCount, reportedCount, doneCount, approvePost, deletePost } = useModerasi();

  return (
    <>
      <section className="stats c3">
        <Stat label="Menunggu Moderasi" value={waitingCount} sub="Postingan" />
        <Stat label="Dilaporkan" value={reportedCount} sub="Postingan" tone="r" />
        <Stat label="Sudah Dimoderasi" value={doneCount} sub="Total" />
      </section>

      <ForumList
        posts={posts}
        onApprove={approvePost}
        onDelete={deletePost}
      />
    </>
  );
}

