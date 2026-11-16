import React from 'react';

// Ikon SVG bersama (path-nya dari js/icons.js)
const PATHS: Record<string, string> = {
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  store: 'M3 9l2-5h14l2 5M4 9v11h16V9M9 20v-6h6v6',
  book: 'M2 4h7a3 3 0 013 3v13a2 2 0 00-2-2H2zM22 4h-7a3 3 0 00-3 3v13a2 2 0 012-2h8z',
  map: 'M9 3L3 5v16l6-2 6 2 6-2V3l-6 2zM9 3v16M15 5v16',
  chat: 'M21 12a8 8 0 01-11 7l-6 2 2-5a8 8 0 1115-4z',
  gear: 'M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v3M12 19v3M2 12h3M19 12h3',
  bell: 'M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9M10 21h4',
  search: 'M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-5-5',
  out: 'M9 21H5V3h4M16 17l5-5-5-5M21 12H9'
};

export interface IconProps {
  name: string;
  size?: number;
}

export default function Icon({ name, size = 18 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

