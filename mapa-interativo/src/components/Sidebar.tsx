import React, { useState, useEffect } from 'react';
import type { LocationCategory, Comment, Suggestion, SuggestionType } from '../types';
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
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategories: LocationCategory[];
  onToggleCategory: (category: LocationCategory) => void;
  comments: Comment[];
  onAddComment: (nickname: string, content: string) => Promise<boolean>;
  onAddSuggestion: (nickname: string, type: SuggestionType, content: string) => Promise<boolean>;
}

const CATEGORIES: { id: LocationCategory; label: string; color: string; icon: string }[] = [
  { id: 'hospital_ilegal', label: 'Hospital Ilegal', color: 'bg-red-500', icon: '🏥' },
  { id: 'mercado_ilegal', label: 'Mercado Ilegal', color: 'bg-amber-500', icon: '🛒' },
  { id: 'lavanderia_ilegal', label: 'Lavanderia Ilegal', color: 'bg-blue-500', icon: '🧺' },
  { id: 'desmanche', label: 'Desmanche', color: 'bg-emerald-500', icon: '🔧' },
  { id: 'andarilho', label: 'Andarilho (Confirmado)', color: 'bg-purple-500', icon: '🚶‍♂️' },
  { id: 'local_possivel', label: 'Possíveis Locais', color: 'bg-purple-400', icon: '❓' },
  { id: 'outros', label: 'Outros Pontos', color: 'bg-slate-500', icon: '📍' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  selectedCategories,
  onToggleCategory,
  comments,
  onAddComment,
  onAddSuggestion,
}) => {
  const [activeTab, setActiveTab] = useState<'filters' | 'comments' | 'suggestions'>('filters');

  // Andarilho Countdown calculation (Resets at 06:00 and 18:00)
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const nextCycle = new Date();

      const hours = now.getHours();
      if (hours < 6) {
        nextCycle.setHours(6, 0, 0, 0);
      } else if (hours < 18) {
        nextCycle.setHours(18, 0, 0, 0);
      } else {
        nextCycle.setDate(nextCycle.getDate() + 1);
        nextCycle.setHours(6, 0, 0, 0);
      }

      const diffMs = nextCycle.getTime() - now.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeLeft(
        `${String(diffHrs).padStart(2, '0')}:${String(diffMins).padStart(2, '0')}:${String(
          diffSecs
        ).padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Form States
  const [commentNickname, setCommentNickname] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const [sugNickname, setSugNickname] = useState('');
  const [sugType, setSugType] = useState<SuggestionType>('novo_npc');
  const [sugContent, setSugContent] = useState('');
  const [sugSubmitting, setSugSubmitting] = useState(false);
  const [sugSuccess, setSugSuccess] = useState(false);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentNickname.trim() || !commentContent.trim()) return;
    setCommentSubmitting(true);
    const ok = await onAddComment(commentNickname, commentContent);
    setCommentSubmitting(false);
    if (ok) {
      setCommentContent('');
    }
  };

  const handleSuggestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sugNickname.trim() || !sugContent.trim()) return;
    setSugSubmitting(true);
    const ok = await onAddSuggestion(sugNickname, sugType, sugContent);
    setSugSubmitting(false);
    if (ok) {
      setSugContent('');
      setSugSuccess(true);
      setTimeout(() => setSugSuccess(false), 4000);
    }
  };

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
        className={`fixed md:static top-0 left-0 h-full w-80 md:w-84 bg-[#0D0D0D] backdrop-blur-xl border-r border-[#FA7608]/20 z-40 flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header inside Sidebar */}
        <div className="p-4 border-b border-[#FA7608]/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#FA7608]" />
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
        <div className="p-4 bg-gradient-to-br from-[#FA7608]/10 via-[#0D0D0D] to-[#000000] border-b border-[#FA7608]/25">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#FFB52E] flex items-center gap-1.5 uppercase tracking-wide">
              <Clock className="w-3.5 h-3.5 text-[#FA7608]" />
              Troca do Andarilho
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FA7608]/20 text-[#FFB52E] font-medium border border-[#FA7608]/40">
              06h & 18h
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black tracking-tight text-white font-mono">
              {timeLeft || '00:00:00'}
            </span>
            <span className="text-[11px] text-slate-400">Próxima rotação</span>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-slate-800/80 bg-slate-900/50 p-1 gap-1">
          <button
            onClick={() => setActiveTab('filters')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'filters'
                ? 'bg-slate-800 text-purple-300 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filtros
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'comments'
                ? 'bg-slate-800 text-purple-300 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Chat ({comments.length})
          </button>
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'suggestions'
                ? 'bg-slate-800 text-purple-300 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            Sugestão
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
                    CATEGORIES.forEach(c => {
                      if (!selectedCategories.includes(c.id)) onToggleCategory(c.id);
                    });
                  }}
                  className="text-[10px] font-bold text-[#FFB52E] hover:underline"
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
                        ? 'bg-[#FA7608]/20 border-[#FA7608] text-white shadow-lg shadow-[#FA7608]/20'
                        : isChecked
                        ? 'bg-[#0D0D0D] border-[#FA7608]/40 text-slate-200'
                        : 'bg-[#000000]/60 border-slate-800 text-slate-500 opacity-60'
                    }`}
                  >
                    <button
                      onClick={() => {
                        // Isolate this category (show only this item)
                        CATEGORIES.forEach(c => {
                          if (c.id === cat.id) {
                            if (!selectedCategories.includes(c.id)) onToggleCategory(c.id);
                          } else {
                            if (selectedCategories.includes(c.id)) onToggleCategory(c.id);
                          }
                        });
                      }}
                      className="flex items-center gap-2.5 text-left flex-1 hover:text-white"
                      title="Clique para mostrar apenas esta categoria"
                    >
                      <span className="text-base">{cat.icon}</span>
                      <span className="text-xs font-semibold">{cat.label}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          CATEGORIES.forEach(c => {
                            if (c.id === cat.id) {
                              if (!selectedCategories.includes(c.id)) onToggleCategory(c.id);
                            } else {
                              if (selectedCategories.includes(c.id)) onToggleCategory(c.id);
                            }
                          });
                        }}
                        className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FA7608]/15 border border-[#FA7608]/30 text-[#FFB52E] hover:bg-[#FA7608]/30 transition-all"
                      >
                        Apenas Este
                      </button>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggleCategory(cat.id)}
                        className="w-4 h-4 rounded border-slate-700 text-[#FA7608] focus:ring-[#FA7608] bg-[#000000] cursor-pointer"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: COMMENTS / REALTIME FEED */}
          {activeTab === 'comments' && (
            <div className="flex flex-col h-full space-y-4">
              {/* Form */}
              <form onSubmit={handleCommentSubmit} className="space-y-2.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                <input
                  type="text"
                  placeholder="Seu Nickname"
                  value={commentNickname}
                  onChange={(e) => setCommentNickname(e.target.value)}
                  maxLength={30}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  required
                />
                <textarea
                  placeholder="Deixe uma mensagem para a comunidade..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  maxLength={500}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                  required
                />
                <button
                  type="submit"
                  disabled={commentSubmitting}
                  className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  Enviar Comentário
                </button>
              </form>

              {/* Feed */}
              <div className="space-y-2.5">
                {comments.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">
                    Nenhum comentário recente. Seja o primeiro a enviar!
                  </p>
                ) : (
                  comments.map((c) => (
                    <div
                      key={c.id}
                      className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/60 space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-bold text-purple-300">{c.nickname}</span>
                        <span>
                          {c.created_at
                            ? new Date(c.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Agora'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 break-words">{c.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SUGGESTIONS */}
          {activeTab === 'suggestions' && (
            <div className="space-y-3">
              {sugSuccess && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Sugestão enviada com sucesso!
                </div>
              )}

              <form onSubmit={handleSuggestionSubmit} className="space-y-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">NICKNAME</label>
                  <input
                    type="text"
                    placeholder="Seu nome no jogo"
                    value={sugNickname}
                    onChange={(e) => setSugNickname(e.target.value)}
                    maxLength={30}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">TIPO DE SUGESTÃO</label>
                  <select
                    value={sugType}
                    onChange={(e) => setSugType(e.target.value as SuggestionType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="novo_npc">Novo NPC / Andarilho</option>
                    <option value="novo_local">Novo Local</option>
                    <option value="correcao_localizacao">Correção de Coordenada</option>
                    <option value="alteracao_informacao">Alterar Informação</option>
                    <option value="nova_funcionalidade">Nova Funcionalidade</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">DESCRIÇÃO DA SUGESTÃO</label>
                  <textarea
                    placeholder="Explique detalhadamente sua sugestão..."
                    value={sugContent}
                    onChange={(e) => setSugContent(e.target.value)}
                    maxLength={1000}
                    rows={4}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={sugSubmitting}
                  className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-600/20 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Enviar Sugestão
                </button>
              </form>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
