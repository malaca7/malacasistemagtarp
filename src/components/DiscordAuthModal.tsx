import React, { useState, useEffect } from 'react';
import { UserProfile, AuthService, checkAdminPermission } from '../services/auth';
import { LogOut, Calendar, ShieldCheck, Clock, Hash, Shield, Sparkles, UserCheck, Save, CheckCircle2, User, Layers } from 'lucide-react';

interface DiscordAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onOpenAdmin?: () => void;
}

export const DiscordAuthModal: React.FC<DiscordAuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onOpenAdmin,
}) => {
  const [characterName, setCharacterName] = useState(user?.character_name || '');
  const [instagram, setInstagram] = useState(user?.instagram || '');
  const [twitch, setTwitch] = useState(user?.twitch || '');
  const [youtube, setYoutube] = useState(user?.youtube || '');
  const [twitterX, setTwitterX] = useState(user?.twitter_x || '');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setCharacterName(user.character_name || '');
      setInstagram(user.instagram || '');
      setTwitch(user.twitch || '');
      setYoutube(user.youtube || '');
      setTwitterX(user.twitter_x || '');
    }
  }, [user]);

  if (!isOpen) return null;

  const isAdmin = user ? (user.is_admin === true || user.role === 'admin' || checkAdminPermission(user)) : false;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await AuthService.updateProfile({
        character_name: characterName.trim(),
        instagram: instagram.trim(),
        twitch: twitch.trim(),
        youtube: youtube.trim(),
        twitter_x: twitterX.trim(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Falha ao salvar dados do perfil:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#060d1a] border border-[#00d2ff]/40 rounded-2xl p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(0,210,255,0.2)] text-white overflow-hidden font-sans max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#00d2ff]/20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#5865F2]/20 border border-[#5865F2]/40 flex items-center justify-center text-[#5865F2]">
              <i className="fa-brands fa-discord text-xl"></i>
            </div>
            <div>
              <h3 className="font-header text-lg font-bold text-white tracking-wide">
                {user ? 'DASHBOARD DO USUÁRIO' : 'AUTENTICAÇÃO DISCORD'}
              </h3>
              <span className="text-[11px] text-slate-400 block font-sans">
                {user ? 'Perfil e Dados do Personagem no RP' : 'Login Exclusivo via Discord OAuth2'}
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
          <div className="py-4 space-y-4 overflow-y-auto pr-1 flex-1">
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
                  {isAdmin ? (
                    <span className="px-2 py-0.5 text-[9px] font-black bg-gradient-to-r from-amber-500/20 to-purple-500/20 text-amber-300 border border-amber-500/40 rounded-md flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                      ADMIN
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[9px] font-black bg-[#5865F2]/20 text-[#5865F2] border border-[#5865F2]/40 rounded-md">
                      VERIFICADO
                    </span>
                  )}
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

            {/* SEÇÃO: DADOS DO PERSONAGEM & REDES SOCIAIS (RP) */}
            <form onSubmit={handleSaveProfile} className="p-4 rounded-xl bg-[#091224] border border-[#00d2ff]/30 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#00d2ff]" />
                  <span className="font-header font-extrabold text-xs text-white uppercase tracking-wider">
                    Identidade no RP & Redes Sociais
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">
                  Visível ao marcar o Andarilho
                </span>
              </div>

              {/* Nome do Personagem */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  Nome do Personagem (Roleplay)
                </label>
                <input
                  type="text"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  placeholder="Ex: Tony Montana, Roger Malaca, etc."
                  maxLength={40}
                  className="w-full bg-[#040813] border border-slate-700 focus:border-[#00d2ff] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Redes Sociais Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {/* Instagram */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                    <i className="fa-brands fa-instagram text-pink-400"></i>
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@seu_instagram ou link"
                    className="w-full bg-[#040813] border border-slate-700 focus:border-pink-500 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Twitch */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                    <i className="fa-brands fa-twitch text-purple-400"></i>
                    Twitch
                  </label>
                  <input
                    type="text"
                    value={twitch}
                    onChange={(e) => setTwitch(e.target.value)}
                    placeholder="seu_canal ou link"
                    className="w-full bg-[#040813] border border-slate-700 focus:border-purple-500 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* YouTube */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                    <i className="fa-brands fa-youtube text-rose-500"></i>
                    YouTube
                  </label>
                  <input
                    type="text"
                    value={youtube}
                    onChange={(e) => setYoutube(e.target.value)}
                    placeholder="@seu_canal ou link"
                    className="w-full bg-[#040813] border border-slate-700 focus:border-rose-500 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Twitter / X */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                    <i className="fa-brands fa-x-twitter text-slate-200"></i>
                    Twitter / X
                  </label>
                  <input
                    type="text"
                    value={twitterX}
                    onChange={(e) => setTwitterX(e.target.value)}
                    placeholder="@seu_perfil ou link"
                    className="w-full bg-[#040813] border border-slate-700 focus:border-[#00d2ff] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Botão de Salvar Dados */}
              <div className="pt-2 flex items-center justify-between">
                {saveSuccess ? (
                  <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Dados salvos com sucesso!
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500">
                    Sincronizado automaticamente no Supabase
                  </span>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[#00d2ff] to-[#2563eb] hover:from-[#38bdf8] hover:to-[#1d4ed8] text-slate-950 flex items-center gap-1.5 shadow-md shadow-[#00d2ff]/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5 text-slate-950" />
                  <span>{saving ? 'SALVANDO...' : 'SALVAR DADOS'}</span>
                </button>
              </div>
            </form>

            {/* Admin Management Section for Admins */}
            {isAdmin && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#5865F2]/20 via-[#00d2ff]/10 to-transparent border border-[#5865F2]/40 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#818cf8]" />
                    <span className="font-header font-extrabold text-xs text-white uppercase tracking-wider">
                      Painel Administrativo
                    </span>
                  </div>
                  <span className="px-2 py-0.5 text-[9px] font-black bg-[#5865F2]/30 text-[#c7d2fe] border border-[#5865F2]/50 rounded-md">
                    ADMINISTRADOR
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Você possui privilégios de administrador. Acesse o painel para gerenciar pontos do mapa, andarilho, servidores, sistemas e usuários.
                </p>
                <div className="flex flex-col gap-2">
                  <a
                    href="/painel/"
                    className="w-full py-2.5 rounded-xl font-header font-black text-xs bg-gradient-to-r from-[#5865F2] to-[#2563eb] hover:from-[#4752C4] hover:to-[#1d4ed8] text-white flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-[#5865F2]/40 active:scale-[0.98]"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#38bdf8]" />
                    <span>ACESSAR PAINEL ADMINISTRATIVO</span>
                  </a>
                  {onOpenAdmin && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenAdmin();
                      }}
                      className="w-full py-2 rounded-xl font-header font-bold text-[11px] bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >
                      <Layers className="w-3.5 h-3.5 text-[#38bdf8]" />
                      <span>Gerenciar Pontos do Mapa (Nesta Janela)</span>
                    </button>
                  )}
                </div>
              </div>
            )}

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


            {/* Logout Button */}
            <button
              onClick={() => AuthService.logout()}
              className="w-full py-2.5 rounded-xl font-header font-bold text-xs bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-rose-900/30 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>SAIR DA CONTA (LOGOUT)</span>
            </button>
          </div>
        ) : (
          /* LOGGED OUT EXCLUSIVE DISCORD OAUTH PROMPT */
          <div className="py-8 px-2 space-y-6 text-center flex-1 flex flex-col justify-center items-center">
            <div className="w-16 h-16 rounded-full bg-[#5865F2]/15 border-2 border-[#5865F2] flex items-center justify-center text-[#5865F2] shadow-[0_0_30px_#5865F2]/40">
              <i className="fa-brands fa-discord text-3xl"></i>
            </div>

            <div className="space-y-2">
              <h4 className="font-header text-lg font-black text-white tracking-wide">
                AUTENTICAÇÃO OFICIAL DISCORD
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Login e cadastro integrados exclusivamente via <strong>Discord OAuth2</strong> com o Supabase. Sem formulários manuais, seguro, rápido e unificado.
              </p>
            </div>

            <button
              type="button"
              onClick={() => AuthService.loginWithDiscord()}
              className="w-full py-3.5 rounded-xl font-header font-black text-xs bg-gradient-to-r from-[#5865F2] to-[#4752C4] hover:brightness-110 text-white flex items-center justify-center gap-2.5 transition-all shadow-[0_10px_30px_rgba(88,101,242,0.4)] active:scale-98 cursor-pointer uppercase tracking-wider"
            >
              <i className="fa-brands fa-discord text-xl"></i>
              <span>ENTRAR COM O DISCORD</span>
            </button>

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium">
              <i className="fa-solid fa-shield-halved text-emerald-400"></i>
              <span>Sessão única e sincronizada com o painel administrativo</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
