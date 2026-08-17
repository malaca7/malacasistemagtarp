import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Send, 
  MessageSquare, 
  ShieldCheck, 
  ThumbsUp,
  Image as ImageIcon,
  Share2
} from 'lucide-react';
import { MapLocation, Comment } from '../../types';
import { ApiService } from '../../services/api';
import { sanitizeInput } from '../../utils/anonymousUser';

interface LocationDetailsDrawerProps {
  location: MapLocation | null;
  onClose: () => void;
  onConfirmLocation: (locationId: string) => void;
  currentServerId: string;
}

export const LocationDetailsDrawer: React.FC<LocationDetailsDrawerProps> = ({
  location,
  onClose,
  onConfirmLocation,
  currentServerId
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [nickname, setNickname] = useState(localStorage.getItem('cidade_alta_nickname') || '');
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (location) {
      loadComments(location.id);
    }
  }, [location?.id]);

  const loadComments = async (locId: string) => {
    const data = await ApiService.getComments(currentServerId, locId);
    setComments(data);
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !newComment.trim() || !nickname.trim()) return;

    setIsSubmitting(true);
    localStorage.setItem('cidade_alta_nickname', nickname.trim());

    await ApiService.addComment({
      server_id: currentServerId,
      location_id: location.id,
      nickname: sanitizeInput(nickname),
      content: sanitizeInput(newComment.slice(0, 280))
    });

    setNewComment('');
    setIsSubmitting(false);
    loadComments(location.id);
  };

  const handleCopyCoords = () => {
    if (!location) return;
    const text = `X: ${location.x}, Y: ${location.y} (${location.name})`;
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (!location) return null;

  const isAndarilho = location.category === 'Andarilho';
  const confirmations = location.confirmations_count || 0;

  // Trust badge calculation
  let trustBadge = { label: 'Poucas confirmações', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
  if (confirmations >= 8) {
    trustBadge = { label: 'Alta Confiança', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
  } else if (confirmations >= 3) {
    trustBadge = { label: 'Confirmado pela Comunidade', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[420px] bg-slate-950/95 backdrop-blur-2xl border-l border-slate-800 shadow-2xl z-40 flex flex-col transition-all duration-300">
      {/* HEADER */}
      <div className="p-5 border-b border-slate-800/80 flex items-start justify-between relative bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg"
            style={{ backgroundColor: `${location.color}15`, borderColor: location.color }}
          >
            <MapPin className="w-6 h-6" style={{ color: location.color }} />
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {location.category}
            </span>
            <h2 className="text-lg font-bold text-white mt-1 leading-tight">
              {location.name}
            </h2>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* CONTENT SCROLLABLE AREA */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
        {/* IMAGE PREVIEW */}
        {location.image_url && (
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-lg group">
            <img 
              src={location.image_url} 
              alt={location.name} 
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
          </div>
        )}

        {/* DESCRIPTION */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Descrição</h3>
          <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
            {location.description || 'Sem descrição cadastrada.'}
          </p>
        </div>

        {/* COORDINATES CARD */}
        <div className="flex items-center justify-between p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
          <div>
            <span className="text-[11px] font-medium text-slate-400">Coordenadas Relativas</span>
            <div className="text-sm font-mono font-bold text-rose-400 mt-0.5">
              X: {location.x} | Y: {location.y}
            </div>
          </div>

          <button
            onClick={handleCopyCoords}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copySuccess ? 'Copiado!' : 'Copiar'}</span>
          </button>
        </div>

        {/* WANDERER VOTING SECTION */}
        {isAndarilho && (
          <div className="p-5 bg-gradient-to-br from-cyan-950/40 via-slate-900/80 to-slate-950 rounded-2xl border border-cyan-500/30 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <span className="text-sm font-bold text-white">Status do Andarilho</span>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${trustBadge.color}`}>
                {trustBadge.label}
              </span>
            </div>

            <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-300">Confirmações da Comunidade:</span>
              <span className="text-base font-bold font-mono text-cyan-300">{confirmations} confirmações</span>
            </div>

            <button
              onClick={() => onConfirmLocation(location.id)}
              className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
                location.user_has_confirmed
                  ? 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40'
                  : 'bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white shadow-cyan-600/20'
              }`}
            >
              {location.user_has_confirmed ? (
                <>
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>Retirar Minha Confirmação</span>
                </>
              ) : (
                <>
                  <ThumbsUp className="w-4 h-4 text-white" />
                  <span>Marcar Andarilho Aqui</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* LOCATION SPECIFIC COMMENTS */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>Comentários deste Ponto ({comments.length})</span>
            </h3>
          </div>

          {/* ADD COMMENT FORM */}
          <form onSubmit={handlePostComment} className="mb-4 space-y-2">
            <input
              type="text"
              placeholder="Seu Nick (ex: FalcãoRP)"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              required
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Escreva um comentário rápido..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                maxLength={280}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                required
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50 flex items-center justify-center"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* COMMENTS LIST */}
          <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
            {comments.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4 italic">Nenhum comentário ainda. Seja o primeiro!</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-rose-400">{c.nickname}</span>
                    <span className="text-slate-500">{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-normal">{c.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 text-center text-[10px] text-slate-500">
        Última atualização do mapa em {new Date().toLocaleDateString('pt-BR')}
      </div>
    </div>
  );
};
