import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, RefreshCw, Terminal } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const GAME_SPEED = 100;

const TRACKS = [
  {
    id: 1,
    title: "0x01_NEON_NIGHTS.wav",
    artist: "CYBER_GEN",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: 2,
    title: "0x02_DIGITAL_HORIZON.wav",
    artist: "NEURAL_BEATS",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: 3,
    title: "0x03_QUANTUM_GROOVE.wav",
    artist: "ALGO_RHYTHM",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  }
];

export default function App() {
  // Game State
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isGamePaused, setIsGamePaused] = useState(false);

  // Music State
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- Game Logic ---
  const generateFood = useCallback(() => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // eslint-disable-next-line no-loop-func
      if (!snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    setFood(newFood);
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
    setIsGamePaused(false);
    generateFood();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (gameOver) return;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (direction.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (direction.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (direction.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (direction.x !== -1) setDirection({ x: 1, y: 0 });
          break;
        case ' ':
          setIsGamePaused(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, gameOver]);

  useEffect(() => {
    if (gameOver || isGamePaused) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const newHead = { x: head.x + direction.x, y: head.y + direction.y };

        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE ||
          prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
        ) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 10);
          generateFood();
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const gameInterval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(gameInterval);
  }, [direction, food, gameOver, isGamePaused, generateFood]);

  // --- Music Logic ---
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };
  
  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleTrackEnd = () => {
    nextTrack();
  };

  const currentTrack = TRACKS[currentTrackIndex];

  return (
    <div className="min-h-screen bg-[#050505] text-[#00ffff] font-terminal flex flex-col items-center justify-center p-4 relative crt-flicker selection:bg-[#ff00ff] selection:text-[#050505]">
      <div className="scanlines"></div>
      <div className="static-noise"></div>
      
      {/* Header */}
      <div className="z-10 w-full max-w-3xl flex flex-col sm:flex-row justify-between items-center sm:items-end mb-8 border-b-4 border-[#ff00ff] pb-4 screen-tear">
        <div className="text-center sm:text-left mb-6 sm:mb-0">
          <h1 className="text-2xl sm:text-3xl font-pixel text-[#00ffff] uppercase tracking-widest drop-shadow-[3px_3px_0_#ff00ff]">
            SYS.SNAKE
          </h1>
          <p className="text-[#ff00ff] text-xl mt-3 uppercase tracking-widest">STATUS: ACTIVE // SECTOR 7G</p>
        </div>
        <div className="text-center sm:text-right flex flex-col items-center sm:items-end">
          <p className="text-xl text-[#00ffff] uppercase tracking-widest mb-3">DATA_YIELD</p>
          <div 
            className="text-6xl sm:text-7xl font-pixel glitch-text" 
            data-text={score.toString().padStart(4, '0')}
          >
            {score.toString().padStart(4, '0')}
          </div>
        </div>
      </div>

      {/* Game Board */}
      <div className="z-10 relative group">
        <div 
          className="bg-[#050505] border-4 border-[#00ffff] relative shadow-[8px_8px_0_#ff00ff]"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_SIZE}, 20px)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 20px)`,
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            const isSnake = snake.some(segment => segment.x === x && segment.y === y);
            const isHead = snake[0].x === x && snake[0].y === y;
            const isFood = food.x === x && food.y === y;

            return (
              <div
                key={i}
                className={`w-[20px] h-[20px] border-[1px] border-[#00ffff]/10 ${
                  isHead
                    ? 'bg-[#ff00ff] z-10'
                    : isSnake
                    ? 'bg-[#00ffff]'
                    : isFood
                    ? 'bg-[#ff00ff] animate-pulse'
                    : ''
                }`}
              />
            );
          })}
        </div>

        {/* Overlays */}
        {gameOver && (
          <div className="absolute inset-0 bg-[#050505]/90 flex flex-col items-center justify-center border-4 border-[#ff00ff] z-20">
            <h2 className="text-3xl sm:text-4xl font-pixel text-[#ff00ff] mb-4 text-center leading-tight drop-shadow-[2px_2px_0_#00ffff]">
              FATAL<br/>EXCEPTION
            </h2>
            <p className="text-[#00ffff] text-2xl mb-8 uppercase tracking-widest">YIELD: {score}</p>
            <button
              onClick={resetGame}
              className="flex items-center gap-3 px-6 py-4 bg-[#050505] text-[#00ffff] border-2 border-[#00ffff] font-pixel text-sm uppercase transition-all hover:bg-[#00ffff] hover:text-[#050505] hover:shadow-[4px_4px_0_#ff00ff] active:translate-y-1 active:translate-x-1 active:shadow-none"
            >
              <RefreshCw size={18} />
              EXECUTE_REBOOT
            </button>
          </div>
        )}
        
        {isGamePaused && !gameOver && (
          <div className="absolute inset-0 bg-[#050505]/80 flex items-center justify-center z-20 border-4 border-[#00ffff]">
            <h2 className="text-4xl font-pixel text-[#00ffff] tracking-widest drop-shadow-[4px_4px_0_#ff00ff] animate-pulse">
              HALTED
            </h2>
          </div>
        )}
      </div>

      <div className="z-10 mt-8 text-[#00ffff] text-xl uppercase tracking-widest text-center">
        INPUT: [W,A,S,D] OR [ARROWS] // HALT: [SPACE]
      </div>

      {/* Music Player */}
      <div className="z-10 mt-8 w-full max-w-3xl bg-[#050505] border-2 border-[#ff00ff] p-5 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[4px_4px_0_#00ffff] relative screen-tear">
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className={`w-14 h-14 flex items-center justify-center bg-[#050505] border-2 border-[#00ffff] ${isPlaying ? 'animate-[spin_2s_linear_infinite]' : ''}`}>
            <Terminal className="text-[#ff00ff]" size={28} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-pixel text-[#00ffff] text-xs sm:text-sm truncate mb-2">{currentTrack.title}</h3>
            <p className="text-lg text-[#ff00ff] uppercase tracking-widest truncate">SRC: {currentTrack.artist}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={prevTrack}
            className="p-3 text-[#00ffff] hover:bg-[#00ffff] hover:text-[#050505] border-2 border-transparent hover:border-[#00ffff] transition-colors"
          >
            <SkipBack size={24} />
          </button>
          
          <button 
            onClick={togglePlay}
            className="w-14 h-14 flex items-center justify-center bg-[#050505] text-[#ff00ff] border-2 border-[#ff00ff] hover:bg-[#ff00ff] hover:text-[#050505] transition-all shadow-[4px_4px_0_#00ffff] active:translate-y-1 active:translate-x-1 active:shadow-none"
          >
            {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
          </button>
          
          <button 
            onClick={nextTrack}
            className="p-3 text-[#00ffff] hover:bg-[#00ffff] hover:text-[#050505] border-2 border-transparent hover:border-[#00ffff] transition-colors"
          >
            <SkipForward size={24} />
          </button>
        </div>

        <div className="hidden sm:flex items-center">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-3 text-[#ff00ff] hover:bg-[#ff00ff] hover:text-[#050505] border-2 border-transparent hover:border-[#ff00ff] transition-colors"
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
        </div>

        <audio 
          ref={audioRef} 
          src={currentTrack.url} 
          onEnded={handleTrackEnd}
          loop={false}
        />
      </div>
    </div>
  );
}
