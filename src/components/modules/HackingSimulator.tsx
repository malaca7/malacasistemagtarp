import React, { useState, useEffect } from 'react';
import { Terminal, Play, CheckCircle2, XCircle } from 'lucide-react';

export const HackingSimulator: React.FC = () => {
  const [grid, setGrid] = useState<number[]>([]);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');

  const startHack = () => {
    const newGrid = Array.from({ length: 16 }, () => Math.floor(Math.random() * 90) + 10);
    const target = Math.floor(Math.random() * 16);
    setGrid(newGrid);
    setTargetIndex(target);
    setScore(0);
    setGameState('playing');
  };

  const handleCellClick = (index: number) => {
    if (gameState !== 'playing') return;

    if (index === targetIndex) {
      setScore(s => s + 1);
      if (score + 1 >= 5) {
        setGameState('won');
      } else {
        // Next round
        const newGrid = Array.from({ length: 16 }, () => Math.floor(Math.random() * 90) + 10);
        const nextTarget = Math.floor(Math.random() * 16);
        setGrid(newGrid);
        setTargetIndex(nextTarget);
      }
    } else {
      setGameState('lost');
    }
  };

  return (
    <div className="flex-1 w-full h-full bg-slate-950 p-6 flex flex-col items-center justify-center relative overflow-hidden select-none">
      <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-500">
              <Terminal className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Simulador Hacking Keycard</h2>
              <p className="text-xs text-slate-400">Encontre o bloco de memória correto (Acertos 5/5)</p>
            </div>
          </div>

          <span className="text-xs font-mono font-bold text-rose-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            Etapa: {score}/5
          </span>
        </div>

        {/* 4x4 GRID */}
        <div className="grid grid-cols-4 gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800">
          {grid.length === 0 ? (
            <div className="col-span-4 py-12 text-center text-xs text-slate-500">
              Clique em "Iniciar Bypass" para iniciar a varredura de dados
            </div>
          ) : (
            grid.map((num, idx) => (
              <button
                key={idx}
                onClick={() => handleCellClick(idx)}
                className={`h-16 rounded-xl font-mono font-bold text-base transition-all flex items-center justify-center border ${
                  gameState === 'playing'
                    ? 'bg-slate-900 hover:bg-rose-950 hover:border-rose-500 text-slate-200 border-slate-800 hover:scale-105'
                    : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
              >
                {num}
              </button>
            ))
          )}
        </div>

        {gameState === 'won' && (
          <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-300 text-center font-bold text-xs flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>SISTEMA DE SEGURANÇA HACKEADO COM SUCESSO!</span>
          </div>
        )}

        {gameState === 'lost' && (
          <div className="p-4 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-rose-300 text-center font-bold text-xs flex items-center justify-center gap-2">
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>ALARME DISPARADO! ENDEREÇO DE MEMÓRIA INCORRETO.</span>
          </div>
        )}

        <button
          onClick={startHack}
          className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4" />
          <span>{gameState === 'playing' ? 'Reiniciar Hack' : 'Iniciar Bypass'}</span>
        </button>
      </div>
    </div>
  );
};
