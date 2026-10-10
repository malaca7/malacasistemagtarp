import React, { useState, useEffect } from 'react';
import type { MapLocation, UserProfile } from '../../types';
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
  Lock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface LocationDrawerProps {
  location: MapLocation | null;
  onClose: () => void;
  onConfirm: (locationId: string) => Promise<void>;
  onUnconfirm: (locationId: string) => Promise<void>;
  user?: UserProfile | null;
  onRequireAuth?: () => void;
}

export const LocationDrawer: React.FC<LocationDrawerProps> = ({
  location,
  onClose,
  onConfirm,
  onUnconfirm,
  user,
  onRequireAuth,
}) => {
  const [loading, setLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setIsCollapsed(false);
  }, [location?.id]);

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
    reliabilityColor = 'text-[#38bdf8] bg-[#00d2ff]/10 border-[#00d2ff]/20';
  }

  const handleToggleConfirm = async () => {
    if (!user) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    setLoading(true);
    if (location.user_confirmed) {
      await onUnconfirm(location.id);
    } else {
      await onConfirm(location.id);
    }
    setLoading(false);
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 md:left-auto md:top-20 md:right-6 md:bottom-auto w-full md:w-96 bg-[#060d1a]/95 backdrop-blur-xl border border-[#00d2ff]/30 rounded-t-3xl md:rounded-2xl shadow-2xl z-40 p-4 sm:p-5 space-y-3 transition-all duration-300 animate-in slide-in-from-bottom ${
      isCollapsed ? 'max-h-20 md:max-h-[85vh] overflow-hidden' : 'max-h-[44vh] md:max-h-[85vh] overflow-y-auto'
    }`}>
      {/* Mobile Drag & Collapse Handle */}
      <div 
        onClick={() => setIsCollapsed((prev) => !prev)}
        className="w-16 h-1.5 bg-slate-700 hover:bg-[#00d2ff] rounded-full mx-auto -mt-1 mb-2 md:hidden cursor-pointer transition-colors"
        title={isCollapsed ? 'Expandir Detalhes' : 'Recolher para ver o mapa'}
      />

      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2.5 truncate pr-2">
          <div className="w-10 h-10 rounded-xl bg-[#00d2ff]/20 border border-[#00d2ff]/30 flex-shrink-0 flex items-center justify-center text-lg shadow-inner">
            {location.category === 'andarilho' || location.category === 'local_possivel'
              ? (location.confirmations_count ? '🚶‍♂️' : '⭕')
              : location.category === 'desmanche'
              ? '🔧'
              : location.category === 'hospital_ilegal'
              ? '🏥'
              : location.category === 'mercado_ilegal'
              ? '🏪'
              : location.category === 'lavanderia_ilegal'
              ? '🧼'
              : '📍'}
          </div>
          <div className="truncate">
            <h3 className="font-extrabold text-white text-sm sm:text-base leading-tight truncate">{location.name}</h3>
            <span className="text-[10px] sm:text-[11px] text-[#38bdf8] font-semibold uppercase tracking-wider block truncate">
              {location.category === 'local_possivel' ? 'Local Possível do Andarilho' : location.category.replace('_', ' ')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden transition-colors"
            title={isCollapsed ? 'Expandir' : 'Recolher'}
          >
            {isCollapsed ? <ChevronUp className="w-5 h-5 text-[#00d2ff]" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Fechar Detalhes"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>

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
        <div className="bg-[#030712]/60 p-2.5 rounded-xl border border-[#00d2ff]/20 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#00d2ff]" />
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">COORDENADAS</span>
            <span className="font-mono font-bold text-slate-200">X: {location.x} | Y: {location.y}</span>
          </div>
        </div>

        <div className="bg-[#030712]/60 p-2.5 rounded-xl border border-[#00d2ff]/20 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#00d2ff]" />
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">ATUALIZADO</span>
            <span className="text-slate-200 font-semibold">Hoje</span>
          </div>
        </div>
      </div>

      {/* Description */}
      {location.description && (
        <div className="bg-[#030712]/40 p-3 rounded-xl border border-slate-800/60">
          <p className="text-xs text-slate-300 leading-relaxed">{location.description}</p>
        </div>
      )}

      {/* Andarilho Special Confirmation System */}
      {isAndarilho && (
        <div className="bg-gradient-to-br from-[#00d2ff]/20 to-[#060d1a]/90 p-4 rounded-xl border border-[#00d2ff]/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#38bdf8]" />
              Confirmações da Comunidade
            </span>
            <span className="text-sm font-black text-[#38bdf8] font-mono">
              {confirmations} votos
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 bg-black/40 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <span>Ciclo Diário</span>
            <span className="text-[#7dd3fc] font-semibold">Reseta às 06:00 e 18:00</span>
          </div>

          {/* Reliability Badge */}
          <div className={`text-xs font-bold px-3 py-1.5 rounded-lg border flex items-center gap-2 ${reliabilityColor}`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>{reliabilityText}</span>
          </div>

          {/* Action Button */}
          {!user ? (
            <button
              onClick={() => onRequireAuth && onRequireAuth()}
              className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg bg-[#5865F2] hover:bg-[#4752C4] text-white shadow-[#5865F2]/25"
            >
              <i className="fa-brands fa-discord text-sm"></i>
              <span>Entrar com Discord para Votar</span>
            </button>
          ) : (
            <button
              onClick={handleToggleConfirm}
              disabled={loading}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
                location.user_confirmed
                  ? 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40'
                  : 'bg-gradient-to-r from-[#00d2ff] via-[#2563eb] to-[#38bdf8] hover:from-[#38bdf8] hover:to-[#00d2ff] text-slate-950 font-black shadow-[#00d2ff]/25'
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
          )}

        </div>
      )}
        </>
      )}
    </div>
  );
};
