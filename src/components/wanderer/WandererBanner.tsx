import React, { useEffect, useState } from 'react';
import { UserCheck, Clock, ShieldCheck, Sparkles, Navigation, AlertTriangle } from 'lucide-react';
import { MapLocation } from '../../types';
import { getNextWandererReset, WandererCycleTime } from '../../utils/wandererTimer';

interface WandererBannerProps {
  locations: MapLocation[];
  onFocusLocation: (location: MapLocation) => void;
}

export const WandererBanner: React.FC<WandererBannerProps> = ({
  locations,
  onFocusLocation
}) => {
  const [cycleTime, setCycleTime] = useState<WandererCycleTime>(getNextWandererReset());

  useEffect(() => {
    const timer = setInterval(() => {
      setCycleTime(getNextWandererReset());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter Andarilho locations & find top voted
  const andarilhoSpots = locations.filter(l => l.category === 'Andarilho');
  const topVotedSpot = [...andarilhoSpots].sort((a, b) => (b.confirmations_count || 0) - (a.confirmations_count || 0))[0];

  const totalConfirmations = andarilhoSpots.reduce((acc, curr) => acc + (curr.confirmations_count || 0), 0);

  // Confidence status logic
  const topVotes = topVotedSpot?.confirmations_count || 0;
  let trustBadge = { text: 'Sem confirmações', color: 'bg-slate-800 text-slate-400 border-slate-700' };

  if (topVotes >= 8) {
    trustBadge = { text: 'Alta Confiança da Comunidade', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
  } else if (topVotes >= 3) {
    trustBadge = { text: 'Confirmado pela Comunidade', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
  } else if (topVotes > 0) {
    trustBadge = { text: 'Poucas Confirmações', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
  }

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border-b border-slate-800/80 px-4 py-2.5 z-20 relative flex flex-wrap items-center justify-between gap-3 shadow-md">
      {/* LEFT: STATUS & COUNTDOWN */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
          <UserCheck className="w-4 h-4 text-cyan-400 animate-pulse" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Sistema do Andarilho
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${trustBadge.color}`}>
              {trustBadge.text}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Próxima troca ({cycleTime.nextResetLabel}):</span>
            <span className="font-mono font-bold text-cyan-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
              {cycleTime.formatted}
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT: TOP VOTED SPOT FOCUS BUTTON */}
      {topVotedSpot && (
        <div className="flex items-center gap-2">
          <div className="hidden sm:block text-right">
            <div className="text-[11px] text-slate-400">Local Mais Provável:</div>
            <div className="text-xs font-bold text-amber-400 flex items-center gap-1 justify-end">
              <Sparkles className="w-3 h-3 text-amber-400" />
              {topVotedSpot.name} ({topVotedSpot.confirmations_count || 0}★)
            </div>
          </div>

          <button
            onClick={() => onFocusLocation(topVotedSpot)}
            className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Localizar no Mapa</span>
          </button>
        </div>
      )}
    </div>
  );
};
