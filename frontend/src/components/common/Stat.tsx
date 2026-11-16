import React, { ReactNode } from 'react';

export interface StatProps {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  foot?: string;
  tone?: string;
}

// Kartu statistik kecil. tone: '' | 'b' | 'r'
export default function Stat({ label, value, sub, foot = '', tone = '' }: StatProps) {
  return (
    <div className="card stat">
      <div>
        <div className="lbl">{label}</div>
        <div className="n">
          {value}
          {sub && <small>{sub}</small>}
        </div>
        <div className={`ft ${tone}`.trim()}>{foot}</div>
      </div>
    </div>
  );
}

