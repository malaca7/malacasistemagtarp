import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Play, RotateCcw, Volume2, VolumeX, Award, ShieldAlert } from 'lucide-react';

const KEYS = ['Q', 'W', 'E', 'A', 'S', 'D'];

export const CaixinhaSimulator: React.FC = () => {
  const [sequence, setSequence] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [timeLeft, setTimeLeft] = useState(8);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [completedCount, setCompletedCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const timerRef = useRef<any>(null);

  const getDifficultyTime = () => {
    switch (difficulty) {
      case 'easy': return 12;
      case 'medium': return 8;
      case 'hard': return 5;
    }
  };

  const generateSequence = () => {
    const seq: string[] = [];
    for (let i = 0; i < 8; i++) {
      seq.push(KEYS[Math.floor(Math.random() * KEYS.length)]);
    }
    return seq;
  };

  const startGame = () => {
    const newSeq = generateSequence();
    setSequence(newSeq);
    setCurrentIndex(0);
    setGameState('playing');
    setTimeLeft(getDifficultyTime());
  };

  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0.1) {
            clearInterval(timerRef.current);
            setGameState('lost');
            return 0;
          }
          return prev - 0.1;
        });
      }, 100);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;

      const pressedKey = e.key.toUpperCase();
      if (!KEYS.includes(pressedKey)) return;

      if (pressedKey === sequence[currentIndex]) {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);

        if (nextIndex === sequence.length) {
          setGameState('won');
          setCompletedCount(c => c + 1);
        }
      } else {
        setGameState('lost');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, sequence, currentIndex]);

  const maxTime = getDifficultyTime();
  const timePercent = (timeLeft / maxTime) * 100;

  return (
    <div className="flex-1 w-full h-full bg-slate-950 p-6 flex flex-col items-center justify-center relative overflow-hidden select-none">
      {/* BACKGROUND GLOW */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-cyan-400">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Simulador de Caixinha Eletrônica</h2>
              <p className="text-xs text-slate-400">Pressione a sequência correta de teclas antes que o tempo acabe</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              Hacks: {completedCount}
            </span>
          </div>
        </div>

        {/* DIFFICULTY SELECTOR */}
        <div className="flex items-center justify-center gap-2">
          {(['easy', 'medium', 'hard'] as const).map((d) => (
            <button
              key={d}
              disabled={gameState === 'playing'}
              onClick={() => setDifficulty(d)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                difficulty === d
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {d === 'easy' ? 'Fácil (12s)' : d === 'medium' ? 'Médio (8s)' : 'Difícil (5s)'}
            </button>
          ))}
        </div>

        {/* TIMER BAR */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400 font-mono">
            <span>Tempo Restante</span>
            <span>{timeLeft.toFixed(1)}s</span>
          </div>
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-100 ${
                timePercent < 25 ? 'bg-rose-500' : timePercent < 50 ? 'bg-amber-500' : 'bg-cyan-400'
              }`}
              style={{ width: `${timePercent}%` }}
            />
          </div>
        </div>

        {/* SEQUENCE DISPLAY */}
        <div className="py-6 bg-slate-950 rounded-2xl border border-slate-800/80 flex items-center justify-center gap-3">
          {sequence.length === 0 ? (
            <span className="text-xs text-slate-500">Clique em "Iniciar Hack" para começar</span>
          ) : (
            sequence.map((key, idx) => {
              const isPassed = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              return (
                <div
                  key={idx}
                  className={`w-12 h-14 rounded-xl flex items-center justify-center font-mono font-bold text-lg border-2 transition-all transform ${
                    isPassed
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 scale-95'
                      : isCurrent
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 scale-110 ring-4 ring-cyan-400/30 animate-pulse'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {key}
                </div>
              );
            })
          )}
        </div>

        {/* GAME RESULT OVERLAY */}
        {gameState === 'won' && (
          <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-300 text-center font-bold text-sm animate-bounce">
            🎉 CAIXINHA DESBLOQUEADA COM SUCESSO!
          </div>
        )}
        {gameState === 'lost' && (
          <div className="p-4 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-rose-300 text-center font-bold text-sm">
            💥 FALHA NO HACK! SEQUÊNCIA OU TEMPO INCORRETO.
          </div>
        )}

        {/* CONTROL BUTTONS */}
        <div className="flex gap-3">
          <button
            onClick={startGame}
            className="flex-1 py-3.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2"
          >
            {gameState === 'playing' ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{gameState === 'playing' ? 'Reiniciar' : 'Iniciar Hack'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
