import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Send, Clock, User, Trash2 } from 'lucide-react';
import { Comment, Server } from '../../types';
import { ApiService } from '../../services/api';
import { sanitizeInput } from '../../utils/anonymousUser';

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeServer: Server | null;
  isAdminAuthenticated: boolean;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  isOpen,
  onClose,
  activeServer,
  isAdminAuthenticated
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [nickname, setNickname] = useState(localStorage.getItem('cidade_alta_nickname') || '');
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && activeServer) {
      loadComments();
    }
  }, [isOpen, activeServer?.id]);

  const loadComments = async () => {
    if (!activeServer) return;
    const data = await ApiService.getComments(activeServer.id);
    setComments(data);
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeServer || !nickname.trim() || !newComment.trim()) return;

    setIsSubmitting(true);
    localStorage.setItem('cidade_alta_nickname', nickname.trim());

    await ApiService.addComment({
      server_id: activeServer.id,
      nickname: sanitizeInput(nickname),
      content: sanitizeInput(newComment.slice(0, 280))
    });

    setNewComment('');
    setIsSubmitting(false);
    loadComments();
  };

  const handleDelete = async (id: string) => {
    await ApiService.deleteComment(id);
    loadComments();
  };

  if (!isOpen || !activeServer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* MODAL HEADER */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Comentários da Comunidade</h2>
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

        {/* INPUT FORM */}
        <form onSubmit={handlePost} className="p-4 bg-slate-950/60 border-b border-slate-800 space-y-2">
          <input
            type="text"
            placeholder="Seu Nick no RP (ex: CoringaRP)"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            required
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Digite sua mensagem para a comunidade..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              maxLength={280}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              required
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Enviar</span>
            </button>
          </div>
        </form>

        {/* COMMENTS FEED */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              Nenhum comentário enviado ainda neste servidor.
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="p-3.5 bg-slate-950/50 rounded-2xl border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-rose-400">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>{c.nickname}</span>
                    {c.location_name && (
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-normal">
                        @{c.location_name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {isAdminAuthenticated && (
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-rose-400 hover:text-rose-300 p-1"
                        title="Moderar / Apagar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">{c.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
