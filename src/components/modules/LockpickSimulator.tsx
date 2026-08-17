import React, { useState, useEffect } from 'react';
import { KeyRound, RotateCcw, CheckCircle2 } from 'lucide-react';

export const LockpickSimulator: React.FC = () => {
  const [targetAngle, setTargetAngle] = useState(45);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [pinsUnlocked, setPinsUnlocked] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won'>('idle');

  const startLockpick = () => {
    setTargetAngle(Math.floor(Math.random() * 160) - 80);
    setCurrentAngle(0);
    setPinsUnlocked(0);
    setGameState('playing');
  };

  const handleUnlockPin = () => {
    if (gameState !== 'playing') return;

    const diff = Math.abs(currentAngle - targetAngle);
    if (diff < 15) {
      const nextPins = pinsUnlocked + 1;
      setPinsUnlocked(nextPins);

      if (nextPins >= 3) {
        setGameState('won');
      } else {
        setTargetAngle(Math.floor(Math.random() * 160) - 80);
      }
    }
  };

  return (
    <div className="flex-1 w-full h-full bg-slate-950 p-6 flex flex-col items-center justify-center relative overflow-hidden select-none">
      <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-500">
              <KeyRound className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Simulador de Lockpick</h2>
              <p className="text-xs text-slate-400">Gire a gazua até alinhar com o pino da fechadura (Pinos 3/3)</p>
            </div>
          </div>

          <span className="text-xs font-mono font-bold text-amber-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            Pinos: {pinsUnlocked}/3
          </span>
        </div>

        {/* VISUAL LOCK DIAL */}
        <div className="relative w-64 h-64 mx-auto rounded-full bg-slate-950 border-4 border-slate-800 flex items-center justify-center shadow-2xl overflow-hidden">
          {/* LOCK PIN CYLINDER */}
          <div 
            className="w-48 h-48 rounded-full border-4 border-amber-500/40 flex items-center justify-center transition-transform duration-75 shadow-inner"
            style={{ transform: `rotate(${currentAngle}deg)` }}
          >
            <div className="w-2 h-20 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full shadow-lg" />
          </div>

          {/* CENTER KNOB */}
          <div className="absolute w-16 h-16 rounded-full bg-slate-900 border-2 border-slate-700 shadow-xl flex items-center justify-center font-bold text-xs text-amber-400">
            LOCK
          </div>
        </div>

        {/* ROTATION SLIDER CONTROL */}
        <div className="space-y-2">
          <label className="block text-xs text-slate-400 text-center">Ajuste o Ângulo da Gazua</label>
          <input
            type="range"
            min="-90"
            max="90"
            value={currentAngle}
            onChange={(e) => setCurrentAngle(Number(e.target.value))}
            className="w-full h-3 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
            disabled={gameState !== 'playing'}
          />
        </div>

        {gameState === 'won' && (
          <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-300 text-center font-bold text-xs flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>FECHADURA DESTRAVADA COM SUCESSO!</span>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleUnlockPin}
            disabled={gameState !== 'playing'}
            className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            Forçar Pino
          </button>
          <button
            onClick={startLockpick}
            className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-2xl"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
