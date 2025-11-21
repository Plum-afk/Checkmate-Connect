import React from 'react';

interface PieceProps {
  type: string; // p, r, n, b, q, k
  color: 'w' | 'b';
  className?: string;
}

export const Piece: React.FC<PieceProps> = ({ type, color, className }) => {
  const isWhite = color === 'w';
  const fill = isWhite ? '#f8fafc' : '#1e293b'; // slate-50 vs slate-800
  const stroke = isWhite ? '#1e293b' : '#f8fafc';

  // SVGs based on standard representations
  const getPath = () => {
    switch (type.toLowerCase()) {
      case 'p': // Pawn
        return (
          <g transform="translate(9, 9) scale(0.8)">
            <path d="M22.5 39c0-6-4-9-9-9s-9 3-9 9" fill={fill} stroke={stroke} strokeWidth="1.5" />
            <path d="M13.5 30c0-6.5 4.5-9 9-9s9 2.5 9 9" fill="none" stroke={stroke} strokeWidth="1.5" />
            <path d="M18 15c-3 0-5.5 2.5-5.5 5.5S15 26 18 26s5.5-2.5 5.5-5.5S21 15 18 15z" fill={fill} stroke={stroke} strokeWidth="1.5" />
          </g>
        );
      case 'r': // Rook
        return (
          <g transform="translate(9, 9) scale(0.8)">
             <path d="M9 39h27v-3H9v3zM12 36v-4h21v4M11 14V9h4v2h5V9h5v2h4v5" fill={fill} stroke={stroke} strokeLinecap="round" strokeWidth="1.5" />
             <path d="M34 14l-3 3H14l-3-3" fill="none" stroke={stroke} />
             <path d="M31 17v12.5H14V17" fill={fill} stroke={stroke} strokeWidth="1.5" />
             <path d="M31 29.5l1.5 2.5h-20l1.5-2.5" fill={fill} stroke={stroke} strokeLinejoin="round" strokeWidth="1.5"/>
             <path d="M11 14h23" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
          </g>
        );
      case 'n': // Knight
        return (
          <g transform="translate(9, 9) scale(0.8)">
            <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 10-21" fill={fill} stroke={stroke} strokeWidth="1.5" />
            <path d="M24 18c.38 2.32-2.41 2.51-3 2.51-2.24 0-5.85-2.51-3-2.51.68 0 1.85.38 3 2.51zM9.5 25.5A4.5 4.5 0 1 1 18.5 25.5 4.5 4.5 0 1 1 9.5 25.5z" fill={fill} stroke={stroke} strokeWidth="1.5" />
            <path d="M15 15.5c-1.67 3.33-4.83 2-7.5 5.5" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
          </g>
        );
      case 'b': // Bishop
        return (
          <g transform="translate(9, 9) scale(0.8)">
            <g fill={fill} stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
              <path d="M9 36c3.39-.97 9.11-1.45 13.5-1.45 4.39 0 10.11.48 13.5 1.45" />
              <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
              <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" />
            </g>
            <path d="M17.5 26h10M15 30h15M22.5 10v5M20 12.5h5" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
          </g>
        );
      case 'q': // Queen
        return (
          <g transform="translate(9, 9) scale(0.8)">
            <path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM10.5 20a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM38.5 20a2 2 0 1 1-4 0 2 2 0 1 1 4 0z" fill={fill} stroke={stroke} strokeWidth="1.5" />
            <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-5.5-13.5V25l-7-11-2 12z" fill={fill} stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d="M9 26c0 2 1.5 2 2.5 4 1 2.5 11 8.5 11 8.5s10-6 11-8.5c1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" fill={fill} stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" fill="none" stroke={stroke} strokeWidth="1.5" />
          </g>
        );
      case 'k': // King
        return (
          <g transform="translate(9, 9) scale(0.8)">
            <path d="M22.5 11.63V6M20 8h5" fill="none" stroke={stroke} strokeLinejoin="round" strokeWidth="1.5" />
            <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill={fill} stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-1-5 5.5-8 12h-17c-3-6.5-4-13-8-12-3 6 6 10.5 6 10.5v7z" fill={fill} stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d="M11.5 30c5.5-3 15.5-3 21 0M11.5 33.5c5.5-3 15.5-3 21 0M11.5 37c5.5-3 15.5-3 21 0" fill="none" stroke={stroke} strokeWidth="1.5" />
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <svg viewBox="0 0 45 45" className={className} style={{ width: '100%', height: '100%' }}>
      {getPath()}
    </svg>
  );
};