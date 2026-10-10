import React, { useState, useEffect } from 'react';
import type { LocationCategory, Comment, Suggestion, SuggestionType, MapLocation, Server } from '../types';
import {
  Filter,
  MessageSquare,
  Lightbulb,
  Clock,
  CheckCircle2,
  X,
  UserCheck,
  Send,
  Sparkles,
  ShieldCheck,
  Radio,
  RefreshCw,
} from 'lucide-react';
import { calculateWandererCycle, WandererCycleInfo } from '../utils/wandererCycle';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategories: LocationCategory[];
  onToggleCategory: (category: LocationCategory) => void;
  onSelectOnlyCategory?: (category: LocationCategory) => void;
  onSelectAllCategories?: () => void;
  comments?: Comment[];
  suggestions?: Suggestion[];
  onAddComment?: (nickname: string, content: string) => Promise<boolean>;
  onAddSuggestion: (nickname: string, type: SuggestionType, content: string) => Promise<boolean>;
  locations?: MapLocation[];
  onSelectLocation?: (location: MapLocation | null) => void;
  currentServer?: Server | null;
}

const CATEGORIES: { id: LocationCategory; label: string; color: string; icon: string }[] = [
  { id: 'hospital_ilegal', label: 'Hospital Ilegal', color: 'bg-red-500', icon: '🏥' },
  { id: 'mercado_ilegal', label: 'Mercado Ilegal', color: 'bg-amber-500', icon: '🏪' },
  { id: 'lavanderia_ilegal', label: 'Lavanderia Ilegal', color: 'bg-purple-500', icon: '🧼' },
  { id: 'desmanche', label: 'Desmanche', color: 'bg-emerald-500', icon: '🔧' },
  { id: 'andarilho', label: 'Andarilho (Confirmado)', color: 'bg-[#00d2ff]', icon: '🚶‍♂️' },
  { id: 'local_possivel', label: 'Possíveis Locais (12h)', color: 'bg-[#38bdf8]', icon: '⭕' },
  { id: 'outros', label: 'Outros Pontos', color: 'bg-slate-500', icon: '📍' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  selectedCategories,
  onToggleCategory,
  onSelectOnlyCategory,
  onSelectAllCategories,
  suggestions = [],
  onAddSuggestion,
  locations = [],
  onSelectLocation,
  currentServer,
}) => {
  const [activeTab, setActiveTab] = useState<'filters' | 'npcs'>('filters');
  const [npcSearch, setNpcSearch] = useState('');
  const [howToOpen, setHowToOpen] = useState(false);

  // Andarilho Cycle calculation (Resets strictly at 06:00 and 18:00)
  const [cycleInfo, setCycleInfo] = useState<WandererCycleInfo>(calculateWandererCycle());

  useEffect(() => {
    const updateCountdown = () => {
      setCycleInfo(calculateWandererCycle());
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredLocationsList = locations.filter((l) => {
    if (!npcSearch.trim()) return true;
    const query = npcSearch.toLowerCase();
    return (
      l.name.toLowerCase().includes(query) ||
      (l.description && l.description.toLowerCase().includes(query)) ||
      l.category.toLowerCase().includes(query)
    );
  });

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-80 md:w-84 max-w-[85vw] bg-[#060d1a] backdrop-blur-xl border-r border-[#00d2ff]/20 z-40 flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header inside Sidebar */}
        <div className="p-4 border-b border-[#00d2ff]/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#00d2ff]" />
            <span className="font-bold text-sm text-slate-200 uppercase tracking-wider">
              Painel do Jogador
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Andarilho Cycle Status Widget */}
        <div className="p-4 bg-gradient-to-br from-[#00d2ff]/15 via-[#060d1a] to-[#030712] border-b border-[#00d2ff]/25 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#38bdf8] flex items-center gap-1.5 uppercase tracking-wide">
              <Clock className="w-3.5 h-3.5 text-[#00d2ff]" />
              Virada do Andarilho
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00d2ff]/20 text-[#7dd3fc] font-semibold border border-[#00d2ff]/40">
              06h & 18h
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-black tracking-tight text-white font-mono drop-shadow-[0_0_8px_rgba(0,210,255,0.4)]">
                {cycleInfo.formattedTimeLeft || '00:00:00'}
              </span>
              <p className="text-[10px] text-[#38bdf8] font-medium mt-0.5">
                {cycleInfo.cycleLabel}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Próximo Reset</span>
              <span className="text-xs font-bold text-white font-mono">{cycleInfo.formattedEndTime}</span>
            </div>
          </div>

          {/* Progress Bar of 12h cycle */}
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-[#00d2ff] via-[#2563eb] to-[#38bdf8] h-full rounded-full transition-all duration-1000"
              style={{ width: `${cycleInfo.progressPercent}%` }}
              title={`Progresso do ciclo: ${cycleInfo.progressPercent}%`}
            />
          </div>

          {/* Realtime Status Indicator */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px]">
            <span className="text-slate-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
              Tempo Real Ativo
            </span>
            <span className="text-slate-500 text-[9px]">Reset diário às 06:00 e 18:00</span>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-[#00d2ff]/20 bg-[#030712]/80 p-1.5 gap-1">
          <button
            onClick={() => setActiveTab('filters')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              activeTab === 'filters'
                ? 'bg-[#00d2ff]/15 text-[#38bdf8] border border-[#00d2ff]/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filtros
          </button>
          <button
            onClick={() => setActiveTab('npcs')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              activeTab === 'npcs'
                ? 'bg-[#00d2ff]/15 text-[#38bdf8] border border-[#00d2ff]/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🚶</span>
            NPCs & Locais ({locations.length})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: FILTERS */}
          {activeTab === 'filters' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Filtros de Marcação
                </span>
                <button
                  onClick={() => {
                    if (onSelectAllCategories) {
                      onSelectAllCategories();
                    } else {
                      CATEGORIES.forEach(c => {
                        if (!selectedCategories.includes(c.id)) onToggleCategory(c.id);
                      });
                    }
                  }}
                  className="text-[10px] font-bold text-[#38bdf8] hover:underline cursor-pointer"
                >
                  MOSTRAR TODOS
                </button>
              </div>

              {CATEGORIES.map((cat) => {
                const isOnly = selectedCategories.length === 1 && selectedCategories.includes(cat.id);
                const isChecked = selectedCategories.includes(cat.id);
                return (
                  <div
                    key={cat.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      isOnly
                        ? 'bg-[#00d2ff]/20 border-[#00d2ff] text-white shadow-lg shadow-[#00d2ff]/20'
                        : isChecked
                        ? 'bg-[#060d1a] border-[#00d2ff]/40 text-slate-200'
                        : 'bg-[#030712]/60 border-slate-800 text-slate-500 opacity-60'
                    }`}
                  >
                    <button
                      onClick={() => {
                        if (onSelectOnlyCategory) {
                          onSelectOnlyCategory(cat.id);
                        } else {
                          onToggleCategory(cat.id);
                        }
                      }}
                      className="flex items-center gap-2.5 text-left flex-1 hover:text-white cursor-pointer"
                      title="Clique para mostrar apenas esta categoria"
                    >
                      <span className="text-base">{cat.icon}</span>
                      <span className="text-xs font-semibold">{cat.label}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (onSelectOnlyCategory) {
                            onSelectOnlyCategory(cat.id);
                          } else {
                            CATEGORIES.forEach(c => {
                              if (c.id === cat.id) {
                                if (!selectedCategories.includes(c.id)) onToggleCategory(c.id);
                              } else {
                                if (selectedCategories.includes(c.id)) onToggleCategory(c.id);
                              }
                            });
                          }
                        }}
                        className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#00d2ff]/15 border border-[#00d2ff]/30 text-[#38bdf8] hover:bg-[#00d2ff]/30 transition-all cursor-pointer"
                      >
                        Apenas Este
                      </button>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggleCategory(cat.id)}
                        className="w-4 h-4 rounded border-slate-700 text-[#00d2ff] focus:ring-[#00d2ff] bg-[#030712] cursor-pointer"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: LISTA DE NPCS & LOCAIS */}
          {activeTab === 'npcs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>📍</span>
                    Locais no {currentServer?.name || 'Servidor'}
                  </h4>
                  <p className="text-[10px] text-slate-400">Total de {filteredLocationsList.length} pontos disponíveis</p>
                </div>
              </div>

              {/* Busca rápida */}
              <div className="relative">
                <input
                  type="text"
                  value={npcSearch}
                  onChange={(e) => setNpcSearch(e.target.value)}
                  placeholder="Buscar NPC ou ponto..."
                  className="w-full bg-[#030712] border border-[#00d2ff]/30 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00d2ff]"
                />
              </div>

              {/* Tutorial Como Marcar o Andarilho */}
              <div className="p-3 bg-gradient-to-br from-[#00d2ff]/10 to-transparent border border-[#00d2ff]/25 rounded-xl">
                <button
                  type="button"
                  onClick={() => setHowToOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between text-left text-xs font-bold text-[#38bdf8] cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <span>🎯</span> Como Marcar o Andarilho
                  </span>
                  <span className="text-xs">{howToOpen ? '▲' : '▼'}</span>
                </button>
                {howToOpen && (
                  <div className="mt-2 text-[11px] text-slate-300 space-y-1.5 border-t border-slate-800 pt-2 leading-relaxed">
                    <p>
                      O Andarilho muda de local a cada <strong>12 horas</strong> (às 06:00 e 18:00).
                    </p>
                    <div className="space-y-1 text-slate-400">
                      <div><strong className="text-white">1.</strong> Encontre os círculos azuis ⭕ no mapa.</div>
                      <div><strong className="text-white">2.</strong> Clique no círculo correspondente onde o Andarilho foi avistado.</div>
                      <div><strong className="text-white">3.</strong> Clique em <strong>"Marcar Andarilho Aqui"</strong> para confirmar para toda a comunidade!</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Lista dos Locais */}
              <div className="space-y-2">
                {filteredLocationsList.map((loc) => {
                  const isAndarilho = loc.category === 'andarilho' || loc.category === 'local_possivel';
                  const isConfirmed = isAndarilho && (loc.confirmations_count || 0) > 0;
                  const icon = isConfirmed ? '🚶‍♂️' : isAndarilho ? '⭕' : CATEGORIES.find(c => c.id === loc.category)?.icon || '📍';

                  return (
                    <div
                      key={loc.id}
                      onClick={() => {
                        if (onSelectLocation) onSelectLocation(loc);
                        if (window.innerWidth < 768) onClose();
                      }}
                      className="p-2.5 rounded-xl bg-[#060d1a] border border-slate-800 hover:border-[#00d2ff]/60 hover:bg-[#00d2ff]/10 transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5 truncate flex-1 pr-2">
                        <span className="text-base flex-shrink-0">{icon}</span>
                        <div className="truncate">
                          <h5 className="text-xs font-bold text-white group-hover:text-[#38bdf8] truncate transition-colors">
                            {loc.name}
                          </h5>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {loc.description || 'Ponto de interesse'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {isConfirmed && (
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              {loc.confirmations_count} conf.
                            </span>
                            {loc.last_confirmed_by && (
                              <span
                                className="text-[8px] text-[#38bdf8] font-bold truncate max-w-[110px]"
                                title={`Marcado por ${loc.last_confirmed_by}`}
                              >
                                {loc.last_confirmed_by.startsWith('@') ? loc.last_confirmed_by : `@${loc.last_confirmed_by}`}
                                {loc.last_confirmed_at && (
                                  <span className="text-slate-400 font-normal ml-1">
                                    {new Date(loc.last_confirmed_at).toLocaleTimeString('pt-BR', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                )}
                              </span>
                            )}
                          </div>
                        )}
                        <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          {loc.x},{loc.y}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
