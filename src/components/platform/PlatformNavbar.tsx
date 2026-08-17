import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layers, ArrowLeft, Settings } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const PlatformNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { theme, setIsSettingsOpen, t } = useSettings();

  const isLight = theme === 'light';
  const isMidnight = theme === 'midnight';

  const navBg = isLight 
    ? 'bg-white/95 border-b border-slate-200 shadow-sm text-slate-900' 
    : isMidnight 
    ? 'bg-black/95 border-b border-zinc-800 text-white' 
    : 'bg-slate-950/95 border-b border-slate-800/50 text-slate-100';

  const backBtnStyle = isLight 
    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' 
    : 'text-slate-400 hover:text-white hover:bg-slate-800/60';

  const settingsBtnStyle = isLight
    ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-cyan-600 shadow-sm'
    : isMidnight
    ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300 hover:text-cyan-400'
    : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800/80 text-slate-300 hover:text-cyan-400';

  return (
    <nav className={`h-12 backdrop-blur-xl px-4 flex items-center justify-between z-40 relative transition-colors duration-300 ${navBg}`}>
      {/* LEFT — Back button (only when not on home) */}
      <div className="w-28 flex items-center">
        {!isHome && (
          <button
            onClick={() => navigate('/')}
            className={`flex items-center gap-1.5 text-xs font-semibold transition-colors px-2.5 py-1.5 rounded-lg ${backBtnStyle}`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('back')}</span>
          </button>
        )}
      </div>

      {/* CENTER — Brand logo (always centered, always navigates home) */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2.5 hover:opacity-90 transition-opacity absolute left-1/2 -translate-x-1/2"
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-300 via-cyan-500 to-blue-600 p-[2px] shadow-md shadow-cyan-500/20">
          <div className={`w-full h-full rounded-[6px] flex items-center justify-center ${isLight ? 'bg-white' : 'bg-slate-950'}`}>
            <Layers className="w-3.5 h-3.5 text-sky-400" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-display font-black text-sm tracking-wider bg-gradient-to-r from-sky-300 via-cyan-400 to-blue-600 bg-clip-text text-transparent uppercase">
            MALACA SYSTEM
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border hidden sm:inline ${
            isLight ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-slate-900/80 text-cyan-400/80 border-cyan-500/20'
          }`}>
            GTA RP
          </span>
        </div>
      </button>

      {/* RIGHT — Appearance Settings Button */}
      <div className="w-28 flex items-center justify-end">
        <button
          onClick={() => setIsSettingsOpen(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-md group ${settingsBtnStyle}`}
          title="Configurações de Aparência"
        >
          <Settings className="w-4 h-4 text-slate-400 group-hover:text-cyan-500 transition-colors" />
          <span className="hidden md:inline">Aparência</span>
        </button>
      </div>
    </nav>
  );
};
