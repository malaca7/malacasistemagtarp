import React, { useState } from 'react';
import type { MapLocation } from '../../types';
import {
  X,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ThumbsUp,
  RotateCcw,
  ShieldCheck,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';

interface LocationDrawerProps {
  location: MapLocation | null;
  onClose: () => void;
  onConfirm: (locationId: string) => Promise<void>;
  onUnconfirm: (locationId: string) => Promise<void>;
}

export const LocationDrawer: React.FC<LocationDrawerProps> = ({
  location,
  onClose,
  onConfirm,
  onUnconfirm,
}) => {
  const [loading, setLoading] = useState(false);

  if (!location) return null;

  const isAndarilho = location.category === 'andarilho' || location.category === 'local_possivel';
  const confirmations = location.confirmations_count || 0;

  // Reliability Badge Calculator
  let reliabilityText = 'Poucas confirmações';
  let reliabilityColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';

  if (confirmations >= 15) {
    reliabilityText = 'Alta Confiança da Comunidade';
    reliabilityColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  } else if (confirmations >= 5) {
    reliabilityText = 'Confirmado pela Comunidade';
    reliabilityColor = 'text-purple-400 bg-purple-500/10 border-purple-500/20';
  }

  const handleToggleConfirm = async () => {
    setLoading(true);
    if (location.user_confirmed) {
      await onUnconfirm(location.id);
    } else {
      await onConfirm(location.id);
    }
    setLoading(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 md:left-auto md:top-20 md:right-6 md:bottom-auto w-full md:w-96 bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-t-2xl md:rounded-2xl shadow-2xl z-40 p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-lg">
            {location.category === 'andarilho' ? '🚶‍♂️' : '📍'}
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base leading-tight">{location.name}</h3>
            <span className="text-[11px] text-purple-400 font-semibold uppercase tracking-wider">
              {location.category.replace('_', ' ')}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Image if available */}
      {location.image_url && (
        <div className="w-full h-40 rounded-xl overflow-hidden border border-slate-800">
          <img
            src={location.image_url}
            alt={location.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Coordinates & Status */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-purple-400" />
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">COORDENADAS</span>
            <span className="font-mono font-bold text-slate-200">X: {location.x} | Y: {location.y}</span>
          </div>
        </div>

        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-400" />
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">ATUALIZADO</span>
            <span className="text-slate-200 font-semibold">Hoje</span>
          </div>
        </div>
      </div>

      {/* Description */}
      {location.description && (
        <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/60">
          <p className="text-xs text-slate-300 leading-relaxed">{location.description}</p>
        </div>
      )}

      {/* Andarilho Special Confirmation System */}
      {isAndarilho && (
        <div className="bg-gradient-to-br from-purple-950/40 to-slate-900/80 p-4 rounded-xl border border-purple-900/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              Confirmações da Comunidade
            </span>
            <span className="text-sm font-black text-purple-300 font-mono">
              {confirmations} votos
            </span>
          </div>

          {/* Reliability Badge */}
          <div className={`text-xs font-bold px-3 py-1.5 rounded-lg border flex items-center gap-2 ${reliabilityColor}`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>{reliabilityText}</span>
          </div>

          {/* Action Button */}
          <button
            onClick={handleToggleConfirm}
            disabled={loading}
            className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
              location.user_confirmed
                ? 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/20'
            }`}
          >
            {location.user_confirmed ? (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Retirar Minha Confirmação</span>
              </>
            ) : (
              <>
                <ThumbsUp className="w-4 h-4" />
                <span>Marcar Andarilho Aqui</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
