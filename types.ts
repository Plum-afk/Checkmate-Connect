export enum GameStatus {
  IDLE = 'IDLE',
  WAITING = 'WAITING',
  PLAYING = 'PLAYING',
  CHECKMATE = 'CHECKMATE',
  DRAW = 'DRAW',
  STALEMATE = 'STALEMATE',
  DISCONNECTED = 'DISCONNECTED',
}

export type PlayerColor = 'w' | 'b';

export interface MoveData {
  from: string;
  to: string;
  promotion?: string;
}

export interface PeerMessage {
  type: 'MOVE' | 'SYNC' | 'RESTART' | 'RESIGN';
  data?: any;
}

export interface GameState {
  fen: string;
  turn: PlayerColor;
  isCheck: boolean;
  isGameOver: boolean;
  status: GameStatus;
  history: string[];
  captured: { w: string[]; b: string[] };
}