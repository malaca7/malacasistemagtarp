import React from 'react';
import type { Server } from '../types';
import { Menu, Settings, ArrowLeft, Sliders } from 'lucide-react';

interface HeaderProps {
  servers: Server[];
  currentServer: Server | null;
  onSelectServer: (server: Server) => void;
  onToggleSidebar: () => void;
  onOpenAdmin: () => void;
  onOpenAppearance?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  servers,
  currentServer,
  onSelectServer,
  onToggleSidebar,
  onOpenAdmin,
  onOpenAppearance,
}) => {
  return (
    <header className="h-16 bg-black/95 backdrop-blur-xl border-b border-[#FA7608]/20 px-4 md:px-6 flex items-center justify-between z-30 relative shadow-2xl">
      {/* Navigation Left: Back Button & Brand */}
      <div className="flex items-center gap-4">
        <a 
          href={currentServer ? `/cidades/${currentServer.slug}/` : '/'} 
          className="px-3 py-1.5 rounded-lg bg-[#0D0D0D] border border-[#FA7608]/30 text-slate-300 hover:text-[#FFB52E] hover:border-[#FA7608]/60 transition-all flex items-center gap-2 text-xs font-semibold"
          title="Voltar para a Cidade"
        >
          <ArrowLeft className="w-4 h-4 text-[#FA7608]" />
          <span className="hidden sm:inline">VOLTAR</span>
        </a>

        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg bg-[#0D0D0D] border border-[#FA7608]/30 text-slate-300 hover:text-white md:hidden transition-colors"
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
        <a href="/" className="hover:text-[#FFB52E] transition-colors py-1">PÁGINA INICIAL</a>
        <a href="/sistemas/" className="hover:text-[#FFB52E] transition-colors py-1">SISTEMAS</a>
        <a href="/plataforma/" className="hover:text-[#FFB52E] transition-colors py-1">PLATAFORMA</a>
      </nav>

      {/* Active City Badge & Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {currentServer && (
          <div className="hidden sm:flex items-center gap-2.5 bg-[#0D0D0D] border border-[#FA7608]/40 px-3 py-1.5 rounded-xl shadow-lg">
            <img 
              src={currentServer.banner_image_url || '/images/hero_banner.jpg'} 
              alt={currentServer.name} 
              className="w-7 h-7 rounded-lg object-cover border border-[#FFB52E]/40"
            />
            <div className="flex flex-col">
              <span className="text-[9px] font-extrabold text-[#FA7608] uppercase tracking-wider leading-none">CIDADE ATIVA</span>
              <span className="text-xs font-black text-white leading-tight">{currentServer.name}</span>
            </div>
          </div>
        )}

        {onOpenAppearance && (
          <button
            onClick={onOpenAppearance}
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-[#0D0D0D] border border-[#FA7608]/30 hover:border-[#FA7608] text-slate-300 hover:text-[#FFB52E] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
            title="Configurações de Aparência (Tema, Brilho, Idioma)"
          >
            <Sliders className="w-4 h-4 text-[#FA7608]" />
            <span className="hidden md:inline">APARÊNCIA</span>
          </button>
        )}

        <button
          onClick={onOpenAdmin}
          className="px-3 py-1.5 rounded-lg bg-[#0D0D0D] border border-[#FA7608]/30 hover:border-[#FA7608] text-slate-300 hover:text-[#FFB52E] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
        >
          <Settings className="w-4 h-4 text-[#FA7608]" />
          <span className="hidden sm:inline">PAINEL ADMIN</span>
        </button>
      </div>
    </header>
  );
};
