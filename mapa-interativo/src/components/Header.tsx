import React from 'react';
import type { Server } from '../types';
import type { UserProfile } from '../services/auth';
import { Menu, Settings, ArrowLeft, Sliders } from 'lucide-react';

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
  return (
    <header className="h-16 bg-black/95 backdrop-blur-xl border-b border-[#00d2ff]/20 px-4 md:px-6 flex items-center justify-between z-30 relative shadow-2xl">
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
          className="p-2 rounded-lg bg-[#060d1a] border border-[#00d2ff]/30 text-slate-300 hover:text-white md:hidden transition-colors"
          title="Abrir Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <a href="/" className="flex items-center gap-2.5">
          <img src="/images/logo_malaca_sistemas.png" alt="MALACA SISTEMAS" className="h-8 md:h-9 object-contain drop-shadow-[0_0_12px_rgba(250,118,8,0.5)]" />
        </a>
      </div>

      {/* Main Standard Nav Links: PÁGINA INICIAL, Sistemas, Plataforma */}
      <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold tracking-wider text-slate-300">
        <a href="/" className="hover:text-[#38bdf8] transition-colors py-1">PÁGINA INICIAL</a>
        <a href="/sistemas/" className="hover:text-[#38bdf8] transition-colors py-1">SISTEMAS</a>
        <a href="/plataforma/" className="hover:text-[#38bdf8] transition-colors py-1">PLATAFORMA</a>
      </nav>

      {/* Actions & User Discord Auth Button */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Seletor Oficial de Servidores (CDA & VALLEY) */}
        <div className="flex items-center bg-[#060d1a] border border-[#00d2ff]/40 p-1 rounded-xl shadow-lg gap-1">
          {servers
            .filter((s) => s.slug === 'cda' || s.slug === 'valley')
            .map((server) => {
              const isActive =
                currentServer?.id === server.id || currentServer?.slug === server.slug;
              return (
                <button
                  key={server.id}
                  onClick={() => onSelectServer(server)}
                  className={`px-3 py-1 rounded-lg text-xs font-black tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#00d2ff] to-[#38bdf8] text-black shadow-[0_0_12px_rgba(0,210,255,0.6)]'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                  title={`Visualizar marcações de ${server.name}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full inline-block ${
                      isActive ? 'bg-black animate-pulse' : 'bg-[#00d2ff]'
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
                : 'bg-[#5865F2] hover:bg-[#4752C4] text-white shadow-[#5865F2]/25'
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

        <button
          onClick={onOpenAdmin}
          className="px-3 py-1.5 rounded-lg bg-[#060d1a] border border-[#00d2ff]/30 hover:border-[#00d2ff] text-slate-300 hover:text-[#38bdf8] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
        >
          <Settings className="w-4 h-4 text-[#00d2ff]" />
          <span className="hidden sm:inline">PAINEL ADMIN</span>
        </button>
      </div>
    </header>
  );
};
