import React from 'react';
import type { Server } from '../types';
import { Menu, Settings, ArrowLeft } from 'lucide-react';

interface HeaderProps {
  servers: Server[];
  currentServer: Server | null;
  onSelectServer: (server: Server) => void;
  onToggleSidebar: () => void;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  servers,
  currentServer,
  onSelectServer,
  onToggleSidebar,
  onOpenAdmin,
}) => {
  return (
    <header className="h-16 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-4 md:px-6 flex items-center justify-between z-30 relative shadow-2xl">
      {/* Navigation Left: Back Button & Brand */}
      <div className="flex items-center gap-4">
        <a 
          href={currentServer ? `../cidade.html?cidade=${currentServer.slug}` : '../'} 
          className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-all flex items-center gap-2 text-xs font-semibold"
          title="Voltar para a Cidade"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">VOLTAR</span>
        </a>

        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white md:hidden transition-colors"
          title="Abrir Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <a href="../" className="flex items-center gap-2.5">
          <img src="/images/logo_malaca_sistemas.png" alt="MALACA SISTEMAS" className="h-8 md:h-9 object-contain drop-shadow-[0_0_12px_rgba(255,102,0,0.5)]" />
        </a>
      </div>

      {/* Main Standard Nav Links: Cidade, Sistemas, Plataforma */}
      <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold tracking-wider text-slate-300">
        <a href="../cda/" className="hover:text-amber-400 transition-colors py-1">CIDADE</a>
        <a href="../#sistemas-section" className="hover:text-amber-400 transition-colors py-1">SISTEMAS</a>
        <a href="../plataforma/" className="hover:text-amber-400 transition-colors py-1">PLATAFORMA</a>
      </nav>

      {/* Server Switcher & Actions */}
      <div className="flex items-center gap-3">
        {/* City Selector */}
        {servers.length > 0 && (
          <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            {servers.map((server) => {
              const isSelected = currentServer?.id === server.id;
              return (
                <button
                  key={server.id}
                  onClick={() => onSelectServer(server)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/25'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {server.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Admin Button */}
        <button
          onClick={onOpenAdmin}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-orange-400 hover:border-orange-500/30 transition-all flex items-center gap-1.5 text-xs font-bold"
          title="Abrir Painel Administrativo"
        >
          <Settings className="w-4 h-4 text-orange-500" />
          <span className="hidden md:inline">ADMIN</span>
        </button>
      </div>
    </header>
  );
};
