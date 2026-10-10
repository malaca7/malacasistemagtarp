import React from 'react';
import { UserProfile, AuthService } from '../services/auth';
import { LogOut, Calendar, ShieldCheck, UserCheck, Clock, Hash } from 'lucide-react';

interface DiscordAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
}

export const DiscordAuthModal: React.FC<DiscordAuthModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#060d1a] border border-[#00d2ff]/40 rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(250,118,8,0.2)] text-white overflow-hidden font-sans">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#00d2ff]/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#5865F2]/20 border border-[#5865F2]/40 flex items-center justify-center text-[#5865F2]">
              <i className="fa-brands fa-discord text-xl"></i>
            </div>
            <div>
              <h3 className="font-header text-lg font-bold text-white tracking-wide">
                {user ? 'DASHBOARD DO USUÁRIO' : 'AUTENTICAÇÃO DISCORD'}
              </h3>
              <span className="text-[11px] text-slate-400 block font-sans">
                {user ? 'Perfil e Registros de Acesso' : 'Login Exclusivo via Discord OAuth2'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        {user ? (
          /* LOGGED IN DASHBOARD */
          <div className="py-5 space-y-5">
            {/* User Profile Card Header */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-slate-900 to-black border border-[#00d2ff]/25 shadow-inner">
              <img
                src={user.avatar_url}
                alt={user.username}
                className="w-16 h-16 rounded-full border-2 border-[#38bdf8] shadow-[0_0_15px_#00d2ff]/40 object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-white truncate font-header">
                    {user.full_name || user.username}
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-black bg-[#5865F2]/20 text-[#5865F2] border border-[#5865F2]/40 rounded-md">
                    VERIFICADO
                  </span>
                </div>
                <p className="text-xs text-[#38bdf8] font-medium truncate mt-0.5">
                  @{user.username}
                </p>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 font-mono">
                  <Hash className="w-3 h-3 text-[#00d2ff]" />
                  <span>ID: {user.discord_id}</span>
                </div>
              </div>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                  <Calendar className="w-4 h-4 text-[#00d2ff]" />
                  <span>Cadastro</span>
                </div>
                <span className="text-xs font-mono font-bold text-white mt-2">
                  {new Date(user.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                  <Clock className="w-4 h-4 text-[#38bdf8]" />
                  <span>Último Acesso</span>
                </div>
                <span className="text-xs font-mono font-bold text-white mt-2">
                  {new Date(user.last_login_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Access Logs Summary */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-[#00d2ff]/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="text-xs font-bold text-white block">Sessões Registradas</span>
                  <span className="text-[10px] text-slate-400">Total de logins salvos no Supabase</span>
                </div>
              </div>
              <span className="px-3 py-1 bg-[#00d2ff]/20 text-[#38bdf8] font-black text-sm rounded-lg border border-[#00d2ff]/30">
                {user.access_count || 1} acessos
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => AuthService.logout()}
              className="w-full py-3 rounded-xl font-header font-bold text-xs bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-rose-900/30"
            >
              <LogOut className="w-4 h-4" />
              <span>SAIR DA CONTA (LOGOUT)</span>
            </button>
          </div>
        ) : (
          /* LOGGED OUT LOGIN PROMPT */
          <div className="py-6 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#5865F2]/10 border-2 border-[#5865F2] flex items-center justify-center mx-auto text-[#5865F2] shadow-[0_0_20px_#5865F2]/30 animate-pulse">
              <i className="fa-brands fa-discord text-3xl"></i>
            </div>

            <div>
              <h4 className="font-header text-xl font-extrabold text-white">
                LOGIN COM DISCORD
              </h4>
              <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">
                Autenticação simples e 100% segura. Não utilize e-mail ou senhas. No primeiro acesso seu perfil será salvo automaticamente.
              </p>
            </div>

            <button
              onClick={() => AuthService.loginWithDiscord()}
              className="w-full py-3.5 rounded-xl font-header font-bold text-sm bg-[#5865F2] hover:bg-[#4752C4] text-white flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-[#5865F2]/40 active:scale-95"
            >
              <i className="fa-brands fa-discord text-xl"></i>
              <span>ENTRAR COM O DISCORD</span>
            </button>

            <p className="text-[10px] text-slate-500">
              Ao se conectar, você aceita o registro de acesso no servidor Supabase.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
