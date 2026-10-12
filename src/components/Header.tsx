import React from 'react';
import type { Server } from '../types';
import { UserProfile, checkAdminPermission, extractDiscordId, DEFAULT_ADMIN_DISCORD_IDS } from '../services/auth';
import { Menu, Settings, ArrowLeft, Sliders, UserCheck } from 'lucide-react';

interface HeaderProps {
  servers: Server[];
  currentServer: Server | null;
  onSelectServer: (server: Server) => void;
  onToggleSidebar: () => void;
  onOpenAdmin: () => void;
  onOpenAppearance?: () => void;
  user?: UserProfile | null;
  onOpenDiscordAuth?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  servers,
  currentServer,
  onSelectServer,
  onToggleSidebar,
  onOpenAdmin,
  onOpenAppearance,
  user,
  onOpenDiscordAuth,
}) => {
  const isAdmin = user ? (checkAdminPermission(user) || DEFAULT_ADMIN_DISCORD_IDS.includes(extractDiscordId(user))) : false;

  return (
    <header className="h-16 bg-[#030712]/95 backdrop-blur-xl border-b border-[#00d2ff]/20 px-4 md:px-6 flex items-center justify-between z-30 relative shadow-2xl">
      {/* Navigation Left: Back Button & Brand */}
      <div className="flex items-center gap-4">
        <a 
          href={currentServer ? `/cidades/${currentServer.slug}/` : '/'} 
          className="px-3 py-1.5 rounded-lg bg-[#060d1a] border border-[#00d2ff]/30 text-slate-300 hover:text-[#38bdf8] hover:border-[#00d2ff]/60 transition-all flex items-center gap-2 text-xs font-semibold"
          title="Voltar para a Cidade"
        >
          <ArrowLeft className="w-4 h-4 text-[#00d2ff]" />
          <span className="hidden sm:inline">VOLTAR</span>
        </a>

        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg bg-[#060d1a] border border-[#00d2ff]/30 text-slate-300 hover:text-white hover:border-[#00d2ff] transition-colors cursor-pointer flex items-center gap-1.5"
          title="Alternar Painel do Jogador"
        >
          <Menu className="w-5 h-5 text-[#00d2ff]" />
          <span className="hidden sm:inline text-xs font-bold text-slate-300">PAINEL</span>
        </button>

        <a href="/" className="flex items-center gap-2.5">
          <img src="/images/logo_malaca_sistemas.png" alt="MALACA SISTEMAS" className="h-8 md:h-9 object-contain drop-shadow-[0_0_14px_rgba(0,210,255,0.6)]" />
        </a>
      </div>

      {/* Main Standard Nav Links: PÁGINA INICIAL, Sistemas, Plataforma */}
      <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold tracking-wider text-slate-300">
        <a href="/" className="hover:text-[#ffc046] transition-colors py-1">PÁGINA INICIAL</a>
        <a href="/sistemas/" className="hover:text-[#ffc046] transition-colors py-1">SISTEMAS</a>
        <a href="/plataforma/" className="hover:text-[#ffc046] transition-colors py-1">PLATAFORMA</a>
      </nav>

      {/* Official Platform Badge */}
      <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-black uppercase tracking-widest shadow-sm">
        <span>⭐ PLATAFORMA OFICIAL • MALACA SYSTEM</span>
      </div>

      {/* Actions & User Discord Auth Button */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Seletor Oficial de Servidores (CDA & VALLEY) */}
        <div className="flex items-center bg-[#131622] border border-[#232738] p-1 rounded-xl shadow-lg gap-1">
          {servers
            .filter((s) => s.slug === 'cda' || s.slug === 'valley')
            .map((server) => {
              const isActive =
                currentServer?.id === server.id || currentServer?.slug === server.slug;
              const isCda = server.slug === 'cda';
              return (
                <button
                  key={server.id}
                  onClick={() => onSelectServer(server)}
                  className={`px-3 py-1 rounded-lg text-xs font-black tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? isCda
                        ? 'bg-gradient-to-r from-[#ffc046] to-[#ffb703] text-black shadow-[0_0_14px_rgba(255,192,70,0.5)]'
                        : 'bg-gradient-to-r from-[#52b6ff] to-[#00d2ff] text-black shadow-[0_0_14px_rgba(82,182,255,0.5)]'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                  title={`Visualizar marcações de ${server.name}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full inline-block ${
                      isActive ? 'bg-black animate-pulse' : isCda ? 'bg-[#ffc046]' : 'bg-[#52b6ff]'
                    }`}
                  />
                  <span>{server.slug.toUpperCase()}</span>
                </button>
              );
            })}
        </div>

        {/* Discord Login / User Profile Button */}
        {onOpenDiscordAuth && (
          <button
            onClick={onOpenDiscordAuth}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
              user
                ? 'bg-slate-900 border border-[#00d2ff]/50 text-white hover:border-[#38bdf8]'
                : 'bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-[#0284c7]/25'
            }`}
            title={user ? `Perfil: ${user.username}` : 'Entrar com Discord'}
          >
            {user ? (
              <>
                <img src={user.avatar_url} alt={user.username} className="w-5 h-5 rounded-full border border-[#38bdf8]" />
                <span className="hidden sm:inline font-mono truncate max-w-[100px]">{user.username}</span>
              </>
            ) : (
              <>
                <i className="fa-brands fa-discord text-sm"></i>
                <span className="hidden sm:inline">ENTRAR</span>
              </>
            )}
          </button>
        )}

        {onOpenAppearance && (
          <button
            onClick={onOpenAppearance}
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-[#060d1a] border border-[#00d2ff]/30 hover:border-[#00d2ff] text-slate-300 hover:text-[#38bdf8] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
            title="Configurações de Aparência"
          >
            <Sliders className="w-4 h-4 text-[#00d2ff]" />
            <span className="hidden md:inline">APARÊNCIA</span>
          </button>
        )}

        {isAdmin && (
          <button
            onClick={onOpenAdmin}
            className="px-3 py-1.5 rounded-lg bg-[#060d1a] border border-[#00d2ff]/30 hover:border-[#00d2ff] text-slate-300 hover:text-[#38bdf8] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
            title="Painel Administrativo"
          >
            <Settings className="w-4 h-4 text-[#00d2ff]" />
            <span className="hidden sm:inline">PAINEL ADMIN</span>
          </button>
        )}
      </div>
    </header>
  );
};
