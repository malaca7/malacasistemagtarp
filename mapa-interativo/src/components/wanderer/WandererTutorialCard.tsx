import React, { useState } from 'react';
import { Target, ChevronDown, ChevronUp, CheckCircle, Lightbulb, Sparkles, X } from 'lucide-react';

interface WandererTutorialCardProps {
  defaultExpanded?: boolean;
  onClose?: () => void;
  isFloating?: boolean;
  className?: string;
}

export const WandererTutorialCard: React.FC<WandererTutorialCardProps> = ({
  defaultExpanded = true,
  onClose,
  isFloating = false,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div
      className={`relative w-full rounded-2xl bg-[#091122]/95 backdrop-blur-xl border border-[#00d2ff]/40 shadow-[0_10px_35px_rgba(0,0,0,0.85),0_0_25px_rgba(0,210,255,0.15)] overflow-hidden font-sans transition-all text-white ${className}`}
    >
      {/* Top Header Accordion Trigger */}
      <div
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex items-center justify-between p-4 bg-gradient-to-r from-[#0d1a33] via-[#091122] to-[#0d1a33] border-b border-[#00d2ff]/25 cursor-pointer select-none hover:bg-[#122244] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-xl filter drop-shadow-[0_0_8px_#ff007f]">🎯</span>
          <h3 className="text-sm md:text-base font-black tracking-wide text-[#00d2ff] uppercase drop-shadow-[0_0_10px_rgba(0,210,255,0.5)]">
            COMO MARCAR O ANDARILHO
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {onClose && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              title="Fechar dica"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            className="w-7 h-7 rounded-lg bg-[#00d2ff]/10 border border-[#00d2ff]/30 text-[#00d2ff] flex items-center justify-center transition-transform"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Accordion Body Content */}
      {isExpanded && (
        <div className="p-4 space-y-3 text-xs animate-fadeIn">
          {/* Cycle 12h Intro Box */}
          <div className="p-3.5 rounded-xl bg-[#0c182f] border-l-4 border-l-[#00d2ff] border border-[#00d2ff]/25 text-slate-300 leading-relaxed shadow-inner">
            <p className="text-[12px] md:text-xs">
              O Andarilho muda de localização a cada{' '}
              <strong className="text-[#00d2ff] font-extrabold drop-shadow-[0_0_8px_rgba(0,210,255,0.6)]">
                12 horas
              </strong>{' '}
              (6:00 e 18:00). Ajude a comunidade marcando onde ele está!
            </p>
          </div>

          {/* Step 1 */}
          <div className="p-3 rounded-xl bg-[#0c1527] border border-slate-700/60 flex items-start gap-3 shadow-md hover:border-[#00d2ff]/40 transition-colors">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00d2ff] to-[#0284c7] text-[#030712] font-black text-xs flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(0,210,255,0.5)]">
              1
            </div>
            <div className="space-y-0.5">
              <h4 className="font-extrabold text-white text-[12px]">
                Encontre os Locais Possíveis
              </h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                No mapa, procure pelos <span className="text-rose-400 font-bold">⭕</span> círculos azuis tracejados. Cada um representa um local possível do Andarilho.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-3 rounded-xl bg-[#0c1527] border border-slate-700/60 flex items-start gap-3 shadow-md hover:border-[#00d2ff]/40 transition-colors">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00d2ff] to-[#0284c7] text-[#030712] font-black text-xs flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(0,210,255,0.5)]">
              2
            </div>
            <div className="space-y-0.5">
              <h4 className="font-extrabold text-white text-[12px]">
                Clique no Local Correto
              </h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Quando encontrar o Andarilho no jogo, clique no círculo correspondente no mapa para ver os detalhes.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-3 rounded-xl bg-[#0c1527] border border-slate-700/60 flex items-start gap-3 shadow-md hover:border-[#00d2ff]/40 transition-colors">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00d2ff] to-[#0284c7] text-[#030712] font-black text-xs flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(0,210,255,0.5)]">
              3
            </div>
            <div className="space-y-0.5">
              <h4 className="font-extrabold text-white text-[12px]">
                Confirme a Marcação
              </h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Na barra lateral, clique no botão &quot; 📍 <span className="text-[#00d2ff] font-bold">Marcar Andarilho Aqui</span>&quot; para confirmar a localização.
              </p>
            </div>
          </div>

          {/* Confirmation Box (Green Neon) */}
          <div className="p-3.5 rounded-xl bg-[#05231c]/80 border-2 border-emerald-500/80 flex items-start gap-3 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <div className="w-7 h-7 rounded-full bg-emerald-400 text-[#022c22] flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.6)]">
              <Sparkles className="w-4 h-4 fill-emerald-400 text-[#022c22]" />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-emerald-300 text-[12px]">
                Marcação Confirmada!
              </h4>
              <p className="text-emerald-100/80 text-[11px] leading-relaxed">
                O local será marcado com <span className="text-lg">🚶</span> e ficará visível para todos! Quanto mais confirmações, mais confiável é a marcação.
              </p>
            </div>
          </div>

          {/* Tip Box (Yellow Gold border) */}
          <div className="p-3 rounded-xl bg-[#1f190e]/80 border-l-4 border-l-amber-400 border border-amber-500/30 flex items-start gap-2.5 shadow-md">
            <span className="text-base flex-shrink-0">💡</span>
            <div className="space-y-0.5">
              <h5 className="font-bold text-amber-400 text-[11px] uppercase tracking-wide">
                Dica:
              </h5>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Se você errou a marcação, pode clicar em &quot; ❌ <span className="text-rose-400 font-bold">Desmarcar</span>&quot; para removê-la!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
