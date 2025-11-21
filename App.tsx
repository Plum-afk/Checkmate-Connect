import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess, Move } from 'chess.js';
import Peer, { DataConnection } from 'peerjs';
import { ChessBoard } from './components/ChessBoard';
import { GameStatus, PlayerColor, MoveData, PeerMessage } from './types';
import { Copy, RefreshCw, RotateCcw, Users, Wifi, WifiOff } from 'lucide-react';

function App() {
  // Game Logic State
  const chessRef = useRef(new Chess());
  const [fen, setFen] = useState(chessRef.current.fen());
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [playerColor, setPlayerColor] = useState<PlayerColor>('w');
  
  // Multiplayer State
  const [peerId, setPeerId] = useState<string>('');
  const [targetPeerId, setTargetPeerId] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);
  const [isHost, setIsHost] = useState(false);

  // Initialize Peer
  useEffect(() => {
    const initPeer = async () => {
      try {
        // Import PeerJS dynamically to avoid SSR issues if expanded later, mainly for clean client-side init
        const PeerJs = (await import('peerjs')).default;
        const peer = new PeerJs();

        peer.on('open', (id) => {
          setPeerId(id);
        });

        peer.on('connection', (conn) => {
          // HOST logic: Receiving connection
          handleConnection(conn, true);
        });

        peerRef.current = peer;
      } catch (err) {
        console.error("Failed to init peer", err);
      }
    };

    initPeer();

    return () => {
      peerRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConnection = (conn: DataConnection, asHost: boolean) => {
    connRef.current = conn;
    setConnectionStatus('connected');
    setGameStatus(GameStatus.PLAYING);
    
    // If hosting, we are White. If joining, we are Black.
    const color = asHost ? 'w' : 'b';
    setPlayerColor(color);
    setIsHost(asHost);

    conn.on('data', (data: any) => {
      const msg = data as PeerMessage;
      if (msg.type === 'MOVE') {
        const move = msg.data as MoveData;
        try {
          chessRef.current.move(move);
          setFen(chessRef.current.fen());
          checkGameOver();
        } catch (e) {
          console.error("Invalid move received", e);
        }
      } else if (msg.type === 'SYNC') {
        const newFen = msg.data;
        chessRef.current.load(newFen);
        setFen(newFen);
        checkGameOver();
      } else if (msg.type === 'RESTART') {
        chessRef.current.reset();
        setFen(chessRef.current.fen());
        setGameStatus(GameStatus.PLAYING);
      }
    });

    conn.on('close', () => {
      setConnectionStatus('disconnected');
      setGameStatus(GameStatus.DISCONNECTED);
      connRef.current = null;
    });

    conn.on('error', (err) => {
        console.error("Connection error", err);
        setConnectionStatus('disconnected');
    });

    // If Host, send initial state immediately
    if (asHost) {
      setTimeout(() => {
         conn.send({ type: 'SYNC', data: chessRef.current.fen() });
      }, 500);
    }
  };

  const joinGame = () => {
    if (!targetPeerId || !peerRef.current) return;
    setConnectionStatus('connecting');
    const conn = peerRef.current.connect(targetPeerId);
    conn.on('open', () => {
      handleConnection(conn, false);
    });
    conn.on('error', (err) => {
        console.error("Join error", err);
        setConnectionStatus('disconnected');
        alert("Could not connect to peer. Check the ID.");
    });
  };

  const handleMove = useCallback((move: MoveData) => {
    if (gameStatus !== GameStatus.PLAYING) return;
    // Check turn
    if (chessRef.current.turn() !== playerColor) return;

    try {
      const result = chessRef.current.move(move);
      if (result) {
        setFen(chessRef.current.fen());
        checkGameOver();
        // Send move
        connRef.current?.send({ type: 'MOVE', data: move });
      }
    } catch (e) {
      console.log("Invalid move attempted locally");
    }
  }, [gameStatus, playerColor]);

  const checkGameOver = () => {
    if (chessRef.current.isGameOver()) {
      if (chessRef.current.isCheckmate()) setGameStatus(GameStatus.CHECKMATE);
      else if (chessRef.current.isDraw()) setGameStatus(GameStatus.DRAW);
      else if (chessRef.current.isStalemate()) setGameStatus(GameStatus.STALEMATE);
      else setGameStatus(GameStatus.DRAW);
    }
  };

  const restartGame = () => {
    if (!isHost) return; // Only host can restart
    chessRef.current.reset();
    setFen(chessRef.current.fen());
    setGameStatus(GameStatus.PLAYING);
    connRef.current?.send({ type: 'RESTART' });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(peerId);
    alert("Game Code copied!");
  };

  // Render Logic
  const turnColor = chessRef.current.turn();
  const isMyTurn = turnColor === playerColor;
  const turnText = isMyTurn ? "Your Turn" : "Opponent's Turn";

  if (connectionStatus === 'disconnected' || connectionStatus === 'connecting') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-900 text-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-emerald-400">Checkmate Connect</h1>
            <p className="mt-2 text-slate-400">Real-time P2P Chess</p>
          </div>

          <div className="bg-slate-800 p-8 rounded-xl shadow-xl border border-slate-700 space-y-6">
            {/* Peer ID Loading */}
            {!peerId && (
              <div className="flex items-center justify-center space-x-2 text-amber-400">
                <RefreshCw className="animate-spin w-5 h-5" />
                <span>Generating secure ID...</span>
              </div>
            )}

            {peerId && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">Start a New Game</label>
                  <div className="flex items-center space-x-2 bg-slate-900 p-3 rounded border border-slate-600">
                    <code className="flex-1 text-emerald-300 font-mono text-sm truncate">{peerId}</code>
                    <button onClick={copyToClipboard} className="p-2 hover:bg-slate-700 rounded transition">
                      <Copy className="w-4 h-4 text-slate-300" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">Share this code with a friend to play White.</p>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-600"></div></div>
                  <div className="relative flex justify-center text-sm"><span className="px-2 bg-slate-800 text-slate-400">OR</span></div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">Join a Game</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Enter Friend's Code"
                      value={targetPeerId}
                      onChange={(e) => setTargetPeerId(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-600 text-white px-3 py-2 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <button
                      onClick={joinGame}
                      disabled={!targetPeerId || connectionStatus === 'connecting'}
                      className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded font-medium transition"
                    >
                      {connectionStatus === 'connecting' ? 'Joining...' : 'Join'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center p-4 lg:p-8">
      {/* Header */}
      <header className="w-full max-w-4xl flex justify-between items-center mb-8 bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-500/10 p-2 rounded-full">
            <Users className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-slate-100">Match in Progress</h2>
            <p className="text-xs text-slate-400 font-mono">vs Peer</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
             <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-bold ${isMyTurn ? 'bg-emerald-500 text-white animate-pulse' : 'bg-slate-700 text-slate-400'}`}>
                {turnText}
             </div>
        </div>
      </header>

      {/* Game Area */}
      <main className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Board Section */}
        <div className="lg:col-span-2 flex justify-center">
             <ChessBoard
                game={chessRef.current}
                boardFen={fen}
                userColor={playerColor}
                onMove={handleMove}
                disabled={!isMyTurn || gameStatus !== GameStatus.PLAYING}
             />
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
           {/* Game Status Card */}
           <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
              <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-4">Game Info</h3>
              
              <div className="space-y-4">
                  <div className="flex justify-between items-center">
                      <span className="text-slate-300">Status</span>
                      <span className={`font-bold ${gameStatus === GameStatus.PLAYING ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {gameStatus.replace('_', ' ')}
                      </span>
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-slate-300">You play</span>
                      <span className="font-bold text-white flex items-center">
                         <span className={`w-3 h-3 rounded-full mr-2 ${playerColor === 'w' ? 'bg-white' : 'bg-slate-900 border border-slate-500'}`}></span>
                         {playerColor === 'w' ? 'White' : 'Black'}
                      </span>
                  </div>
                   <div className="flex justify-between items-center">
                      <span className="text-slate-300">Connection</span>
                      <span className="font-bold text-emerald-400 flex items-center">
                         <Wifi className="w-4 h-4 mr-1" /> Stable
                      </span>
                  </div>
              </div>

              {(gameStatus !== GameStatus.PLAYING) && (
                  <div className="mt-6 p-4 bg-slate-900 rounded-lg border border-slate-700 text-center">
                      <p className="text-lg font-bold text-white mb-2">
                        {gameStatus === GameStatus.CHECKMATE && (isMyTurn ? "You Lost!" : "You Won!")}
                        {gameStatus === GameStatus.DRAW && "Draw"}
                      </p>
                      {isHost && (
                        <button onClick={restartGame} className="mt-2 w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white py-2 px-4 rounded transition">
                           <RotateCcw className="w-4 h-4" />
                           <span>Rematch</span>
                        </button>
                      )}
                      {!isHost && (
                        <p className="text-xs text-slate-500">Waiting for host to restart...</p>
                      )}
                  </div>
              )}
           </div>

           {/* Rules/Help */}
           <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
               <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-4">Controls</h3>
               <ul className="text-sm text-slate-300 space-y-2 list-disc pl-4">
                   <li>Share the Game Code on the home screen.</li>
                   <li>Click a piece to select, click destination to move.</li>
                   <li>Valid moves are highlighted.</li>
                   <li>Host plays White, guest plays Black.</li>
               </ul>
           </div>
        </div>
      </main>
    </div>
  );
}

export default App;