import React from 'react';
import { Server, ServerSlug } from '../../types';
import { Radio, MessageSquare, Lightbulb, Lock } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface HeaderProps {
  servers: Server[];
  activeServer: Server | null;
  onSelectServer: (slug: ServerSlug) => void;
  onOpenComments: () => void;
  onOpenSuggestions: () => void;
  onOpenAdmin: () => void;
  isAdminAuthenticated: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  servers,
  activeServer,
  onSelectServer,
  onOpenComments,
  onOpenSuggestions,
  onOpenAdmin,
  isAdminAuthenticated
}) => {
  const { theme } = useSettings();
  const activeLogo = activeServer?.slug === 'cda' ? '/images/logo_cda.png' : '/images/logo_valley.png';

  const isLight = theme === 'light';
  const isMidnight = theme === 'midnight';

  const headerBg = isLight 
    ? 'bg-white/95 border-b border-slate-200 shadow-sm text-slate-900' 
    : isMidnight 
    ? 'bg-black/95 border-b border-zinc-800 text-white' 
    : 'bg-slate-950/90 border-b border-slate-800/80 text-slate-100';

  const actionBtnBg = isLight
    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
    : isMidnight
    ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-800'
    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800';

  return (
    <header className={`h-16 backdrop-blur-xl px-4 md:px-6 flex items-center justify-between z-30 relative shadow-2xl transition-colors duration-300 ${headerBg}`}>
      {/* BRAND & ACTIVE SERVER LOGO */}
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full overflow-hidden border-2 shadow-lg p-0.5 flex items-center justify-center ${
          isLight ? 'border-slate-300 bg-slate-100' : 'border-slate-700/80 bg-slate-900'
        }`}>
          <img 
            src={activeLogo} 
            alt={activeServer?.name || 'Servidor'} 
            className="w-full h-full object-cover rounded-full"
          />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className={`font-display font-black text-base md:text-lg tracking-wider uppercase ${
              isLight ? 'text-slate-900' : 'bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent'
            }`}>
              {activeServer?.slug === 'cda' ? (
                <>CIDADE ALTA <span className="text-amber-500">CDA</span></>
              ) : (
                <>ALTA <span className="text-rose-500">VALLEY</span></>
              )}
            </h1>
            <span className="hidden sm:flex items-center gap-1 text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
              LIVE
            </span>
          </div>
          <p className={`text-[10px] hidden sm:block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Mapa Interativo Oficial da Comunidade • Versão 2.5
          </p>
        </div>
      </div>

      {/* SERVER SELECTOR WITH CUSTOM YELLOW (CDA) & RED (VALLEY) LOGOS */}
      <div className={`flex items-center p-1.5 rounded-2xl border shadow-inner gap-1.5 ${
        isLight ? 'bg-slate-100/90 border-slate-200' : 'bg-slate-900/90 border-slate-800'
      }`}>
        {servers.map((s) => {
          const isActive = activeServer?.slug === s.slug;
          const isCda = s.slug === 'cda';
          const logoUrl = isCda ? '/images/logo_cda.png' : '/images/logo_valley.png';

          return (
            <button
              key={s.id}
              onClick={() => onSelectServer(s.slug)}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs md:text-sm tracking-wider uppercase transition-all duration-300 flex items-center gap-2 border ${
                isActive
                  ? isCda
                    ? isLight
                      ? 'bg-amber-100 text-amber-900 border-amber-400 shadow-sm ring-2 ring-amber-400/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-400/80 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/30'
                    : isLight
                      ? 'bg-rose-100 text-rose-900 border-rose-400 shadow-sm ring-2 ring-rose-400/40'
                      : 'bg-rose-600/20 text-rose-300 border-rose-500/80 shadow-lg shadow-rose-600/20 ring-2 ring-rose-500/30'
                  : isLight
                    ? 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    : 'border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <img 
                src={logoUrl} 
                alt={s.name} 
                className={`w-6 h-6 rounded-full object-cover transition-transform duration-300 ${
                  isActive ? 'scale-110 shadow-md ring-1 ring-white/50' : 'opacity-60 hover:opacity-100'
                }`} 
              />
              <span>{isCda ? 'CDA' : 'VALLEY'}</span>
            </button>
          );
        })}
      </div>

      {/* COMMUNITY & ADMIN ACTIONS */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenComments}
          className={`p-2 md:px-3 md:py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${actionBtnBg}`}
          title="Comentários da Comunidade"
        >
          <MessageSquare className="w-4 h-4 text-cyan-500" />
          <span className="hidden md:inline">Comentários</span>
        </button>

        <button
          onClick={onOpenSuggestions}
          className={`p-2 md:px-3 md:py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${actionBtnBg}`}
          title="Enviar Sugestão"
        >
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <span className="hidden md:inline">Sugestões</span>
        </button>

        <button
          onClick={onOpenAdmin}
          className={`p-2 md:px-3 md:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border shadow-sm ${
            isAdminAuthenticated
              ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-600/30'
              : actionBtnBg
          }`}
          title="Painel de Administração"
        >
          <Lock className={`w-4 h-4 ${isAdminAuthenticated ? 'text-emerald-500' : 'text-slate-400'}`} />
          <span className="hidden md:inline">{isAdminAuthenticated ? 'Admin Ativo' : 'Admin'}</span>
        </button>
      </div>
    </header>
  );
};
