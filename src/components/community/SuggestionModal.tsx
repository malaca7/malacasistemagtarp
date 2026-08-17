import React, { useState } from 'react';
import { X, Lightbulb, Send, CheckCircle2 } from 'lucide-react';
import { SuggestionType, Server } from '../../types';
import { ApiService } from '../../services/api';
import { sanitizeInput } from '../../utils/anonymousUser';

interface SuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeServer: Server | null;
}

const SUGGESTION_TYPES: SuggestionType[] = [
  'Novo NPC',
  'Novo local',
  'Correção de localização',
  'Alteração de informação',
  'Nova funcionalidade',
  'Outro'
];

export const SuggestionModal: React.FC<SuggestionModalProps> = ({
  isOpen,
  onClose,
  activeServer
}) => {
  const [nickname, setNickname] = useState(localStorage.getItem('cidade_alta_nickname') || '');
  const [type, setType] = useState<SuggestionType>('Novo NPC');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeServer || !nickname.trim() || !content.trim()) return;

    setIsSubmitting(true);
    localStorage.setItem('cidade_alta_nickname', nickname.trim());

    await ApiService.addSuggestion({
      server_id: activeServer.id,
      nickname: sanitizeInput(nickname),
      type: type,
      content: sanitizeInput(content)
    });

    setIsSubmitting(false);
    setSuccessMsg(true);
    setContent('');
    setTimeout(() => {
      setSuccessMsg(false);
      onClose();
    }, 2000);
  };

  if (!isOpen || !activeServer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        {/* MODAL HEADER */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Enviar Sugestão / Correção</h2>
              <p className="text-xs text-slate-400">Servidor {activeServer.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {successMsg && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Sugestão enviada com sucesso! Obrigado por colaborar.</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Seu Nick / Nome</label>
            <input
              type="text"
              placeholder="ex: PeraltaRP"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo da Sugestão</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as SuggestionType)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {SUGGESTION_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Detalhes da Sugestão</label>
            <textarea
              rows={4}
              placeholder="Descreva a sugestão ou informe o local e as coordenadas exatas se souber..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Enviar Sugestão</span>
          </button>
        </form>
      </div>
    </div>
  );
};
