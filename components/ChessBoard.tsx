import React, { useState, useEffect } from 'react';
import { Chess, Square } from 'chess.js';
import { Piece } from './Piece';
import { PlayerColor, MoveData } from '../types';

interface ChessBoardProps {
  game: Chess;
  boardFen: string; // Used to trigger re-renders when game state changes
  userColor: PlayerColor;
  onMove: (move: MoveData) => void;
  disabled: boolean;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export const ChessBoard: React.FC<ChessBoardProps> = ({ game, boardFen, userColor, onMove, disabled }) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);

  useEffect(() => {
    // Clear selection if board updates externally (e.g. move made by opponent)
    setSelectedSquare(null);
    setPossibleMoves([]);
  }, [boardFen]);

  const getSquareMoves = (square: Square) => {
    const moves = game.moves({ square, verbose: true });
    return moves.map((m) => m.to);
  };

  const handleSquareClick = (square: Square) => {
    if (disabled) return;

    // If clicking the same square, unselect
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setPossibleMoves([]);
      return;
    }

    // If a square is already selected, try to move
    if (selectedSquare) {
      const moveAttempt = {
        from: selectedSquare,
        to: square,
        promotion: 'q', // Always promote to queen for simplicity in this UI
      };

      try {
        const result = game.move(moveAttempt);
        if (result) {
          // Valid move
          game.undo(); // Revert internal state, let the parent handle the authoritative update via prop
          onMove(moveAttempt);
          setSelectedSquare(null);
          setPossibleMoves([]);
        } else {
          // Invalid move, check if clicking on another own piece
          const piece = game.get(square);
          if (piece && piece.color === userColor) {
            setSelectedSquare(square);
            setPossibleMoves(getSquareMoves(square));
          } else {
            setSelectedSquare(null);
            setPossibleMoves([]);
          }
        }
      } catch (e) {
        // Move invalid (chess.js throws or returns null depending on method)
        const piece = game.get(square);
        if (piece && piece.color === userColor) {
          setSelectedSquare(square);
          setPossibleMoves(getSquareMoves(square));
        } else {
          setSelectedSquare(null);
          setPossibleMoves([]);
        }
      }
      return;
    }

    // Select a piece
    const piece = game.get(square);
    if (piece && piece.color === userColor) {
      setSelectedSquare(square);
      setPossibleMoves(getSquareMoves(square));
    }
  };

  // Board Orientation
  const renderRanks = userColor === 'w' ? RANKS : [...RANKS].reverse();
  const renderFiles = userColor === 'w' ? FILES : [...FILES].reverse();

  // Last move highlighting
  const history = game.history({ verbose: true });
  const lastMove = history.length > 0 ? history[history.length - 1] : null;

  return (
    <div className="select-none grid grid-cols-8 border-4 border-slate-700 rounded-lg overflow-hidden shadow-2xl aspect-square w-full max-w-[600px] mx-auto">
      {renderRanks.map((rank) => (
        renderFiles.map((file) => {
          const square = `${file}${rank}` as Square;
          const piece = game.get(square);
          const isDark = (FILES.indexOf(file) + RANKS.indexOf(rank)) % 2 === 1;
          
          const isSelected = selectedSquare === square;
          const isPossibleMove = possibleMoves.includes(square);
          const isLastMoveFrom = lastMove?.from === square;
          const isLastMoveTo = lastMove?.to === square;
          const isKingInCheck = piece?.type === 'k' && piece?.color === game.turn() && game.inCheck();

          let bgClass = isDark ? 'bg-board-dark' : 'bg-board-light';
          
          return (
            <div
              key={square}
              className={`relative flex items-center justify-center w-full h-full cursor-pointer ${bgClass}`}
              onClick={() => handleSquareClick(square)}
            >
              {/* Last Move Highlight */}
              {(isLastMoveFrom || isLastMoveTo) && (
                <div className="absolute inset-0 bg-board-lastMove opacity-50" />
              )}

              {/* Selection Highlight */}
              {isSelected && (
                <div className="absolute inset-0 bg-yellow-400 opacity-40" />
              )}

              {/* Check Highlight */}
              {isKingInCheck && (
                <div className="absolute inset-0 bg-red-500 opacity-60 radial-gradient" />
              )}

              {/* Possible Move Indicator */}
              {isPossibleMove && (
                <div className={`absolute w-1/3 h-1/3 rounded-full ${piece ? 'border-4 border-slate-900/30' : 'bg-slate-900/20'}`} />
              )}

              {/* Rank/File Labels */}
              {file === (userColor === 'w' ? 'a' : 'h') && (
                <span className={`absolute top-0.5 left-0.5 text-[10px] font-bold ${isDark ? 'text-board-light' : 'text-board-dark'}`}>
                  {rank}
                </span>
              )}
              {rank === (userColor === 'w' ? '1' : '8') && (
                <span className={`absolute bottom-0 right-1 text-[10px] font-bold ${isDark ? 'text-board-light' : 'text-board-dark'}`}>
                  {file}
                </span>
              )}

              {/* Piece */}
              {piece && (
                <div className="w-5/6 h-5/6 z-10 transition-transform duration-150">
                  <Piece type={piece.type} color={piece.color} />
                </div>
              )}
            </div>
          );
        })
      ))}
    </div>
  );
};