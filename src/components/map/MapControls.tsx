import React from 'react';
import { Plus, Minus, Maximize2, Crosshair, UserCheck } from 'lucide-react';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onFocusAndarilho?: () => void;
  hasAndarilhoSpots?: boolean;
}

export const MapControls: React.FC<MapControlsProps> = React.memo(({
  onZoomIn,
  onZoomOut,
  onResetView,
  onFocusAndarilho,
  hasAndarilhoSpots
}) => {
  return (
    <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20">
      {hasAndarilhoSpots && onFocusAndarilho && (
        <button
          onClick={onFocusAndarilho}
          title="Focar no Andarilho Mais Provável"
          className="p-3 bg-cyan-600/90 hover:bg-cyan-500 text-white rounded-xl shadow-xl backdrop-blur-md border border-cyan-400/50 transition-all transform hover:scale-105 active:scale-95 group flex items-center gap-2 font-medium text-xs"
        >
          <UserCheck className="w-4 h-4 text-cyan-200 animate-pulse" />
          <span className="hidden md:inline">Andarilho</span>
        </button>
      )}

      <div className="flex flex-col bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl overflow-hidden divide-y divide-slate-800">
        <button
          onClick={onZoomIn}
          title="Aumentar Zoom"
          className="p-3 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors active:bg-slate-700"
        >
          <Plus className="w-5 h-5" />
        </button>

        <button
          onClick={onZoomOut}
          title="Diminuir Zoom"
          className="p-3 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors active:bg-slate-700"
        >
          <Minus className="w-5 h-5" />
        </button>

        <button
          onClick={onResetView}
          title="Centralizar e Resetar Mapa"
          className="p-3 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors active:bg-slate-700"
        >
          <Crosshair className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
});
