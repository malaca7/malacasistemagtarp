import React from 'react';
import { useSettings, ThemeMode, LanguageMode } from '../../context/SettingsContext';
import { Settings, X, Sun, Moon, Sparkles, Globe, Sliders } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const { 
    theme, 
    setTheme, 
    brightness, 
    setBrightness, 
    language, 
    setLanguage, 
    isSettingsOpen, 
    setIsSettingsOpen, 
    t 
  } = useSettings();

  if (!isSettingsOpen) return null;

  const isLight = theme === 'light';
  const isMidnight = theme === 'midnight';

  const themes: { id: ThemeMode; label: string; icon: any; bg: string; border: string; desc: string }[] = [
    {
      id: 'dark',
      label: t('themeDark'),
      icon: Moon,
      bg: isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-900 text-white',
      border: 'border-cyan-500/50',
      desc: 'Padrão Dark Mode com contrastes modernos'
    },
    {
      id: 'midnight',
      label: t('themeMidnight'),
      icon: Sparkles,
      bg: 'bg-black text-white',
      border: 'border-rose-500/50',
      desc: 'Preto absoluto cyber com alto contraste'
    },
    {
      id: 'soft',
      label: t('themeSoft'),
      icon: Moon,
      bg: 'bg-slate-800 text-white',
      border: 'border-amber-500/50',
      desc: 'Escuro suave azulado para descanso visual'
    },
    {
      id: 'light',
      label: t('themeLight'),
      icon: Sun,
      bg: 'bg-slate-100 text-slate-950',
      border: 'border-slate-400',
      desc: 'Tema claro de alta visibilidade'
    }
  ];

  // Theme container classes
  const modalBg = isLight 
    ? 'bg-white/98 border-slate-200 text-slate-900 shadow-2xl' 
    : isMidnight 
    ? 'bg-black/98 border-zinc-800 text-white shadow-2xl' 
    : 'bg-slate-900/98 border-slate-800 text-white shadow-2xl';

  const subTextColor = isLight ? 'text-slate-600' : 'text-slate-400';
  const labelColor = isLight ? 'text-slate-800' : 'text-slate-300';
  const dividerColor = isLight ? 'border-slate-200' : 'border-slate-800/80';
  const sliderTrackBg = isLight ? 'bg-slate-200' : 'bg-slate-950';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn select-none">
      <div className={`w-full max-w-md border rounded-3xl p-6 relative overflow-hidden transition-all duration-300 ${modalBg}`}>
        {/* HEADER */}
        <div className={`flex items-center justify-between border-b pb-4 ${dividerColor}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${isLight ? 'bg-cyan-50 border border-cyan-200 text-cyan-600' : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400'}`}>
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-base font-bold">{t('settingsTitle')}</h2>
              <p className={`text-xs ${subTextColor}`}>{t('settingsSubtitle')}</p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className={`p-2 rounded-xl transition-colors ${isLight ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* THEME SELECTION */}
        <div className="space-y-3 pt-4">
          <label className={`text-xs font-bold flex items-center gap-2 ${labelColor}`}>
            <Moon className="w-4 h-4 text-cyan-500" />
            <span>{t('themeLabel')}</span>
          </label>

          <div className="grid grid-cols-2 gap-2.5">
            {themes.map(({ id, label, icon: Icon, bg, border, desc }) => {
              const isActive = theme === id;
              return (
                <button
                  key={id}
                  onClick={() => setTheme(id)}
                  className={`p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${bg} ${
                    isActive
                      ? `ring-2 ring-cyan-500 ${border} shadow-lg shadow-cyan-500/20`
                      : `${isLight ? 'border-slate-300/80 opacity-80 hover:opacity-100' : 'border-slate-800/80 opacity-70 hover:opacity-100'}`
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">
                      {label}
                    </span>
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-500' : isLight ? 'text-slate-500' : 'text-slate-400'}`} />
                  </div>
                  <p className={`text-[10px] line-clamp-1 ${id === 'light' ? 'text-slate-600' : isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    {desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* BRIGHTNESS INTENSITY SLIDER */}
        <div className={`space-y-3 pt-3 border-t ${dividerColor}`}>
          <div className={`flex items-center justify-between text-xs font-bold ${labelColor}`}>
            <span className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-500" />
              <span>{t('brightnessLabel')}</span>
            </span>
            <span className={`font-mono px-2 py-0.5 rounded-lg border text-amber-500 ${isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-800'}`}>
              {brightness}%
            </span>
          </div>

          <div className="relative flex items-center">
            <input
              type="range"
              min="50"
              max="120"
              step="2"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className={`w-full h-3 rounded-lg appearance-none cursor-pointer accent-amber-500 ${sliderTrackBg}`}
            />
          </div>
          <div className={`flex justify-between text-[10px] font-mono ${subTextColor}`}>
            <span>50% (Escuro)</span>
            <span>100% (Normal)</span>
            <span>120% (Vibrante)</span>
          </div>
        </div>

        {/* LANGUAGE SELECTION WITH COUNTRY FLAGS */}
        <div className={`space-y-3 pt-3 border-t ${dividerColor}`}>
          <label className={`text-xs font-bold flex items-center gap-2 ${labelColor}`}>
            <Globe className="w-4 h-4 text-emerald-500" />
            <span>{t('languageLabel')}</span>
          </label>

          <div className="grid grid-cols-2 gap-3">
            {/* PORTUGUÊS (BR) */}
            <button
              onClick={() => setLanguage('BR')}
              className={`py-3 px-4 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all ${
                language === 'BR'
                  ? isLight 
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-400/40 shadow-sm'
                    : 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30 shadow-md'
                  : isLight
                    ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xl leading-none">🇧🇷</span>
                <div className="text-left">
                  <span className="block font-bold">Português</span>
                  <span className="text-[10px] opacity-75 font-mono">Brasil (BR)</span>
                </div>
              </div>
              {language === 'BR' && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
            </button>

            {/* ENGLISH (EN) */}
            <button
              onClick={() => setLanguage('EN')}
              className={`py-3 px-4 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all ${
                language === 'EN'
                  ? isLight
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-400/40 shadow-sm'
                    : 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30 shadow-md'
                  : isLight
                    ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xl leading-none">🇺🇸</span>
                <div className="text-left">
                  <span className="block font-bold">English</span>
                  <span className="text-[10px] opacity-75 font-mono">USA (EN)</span>
                </div>
              </div>
              {language === 'EN' && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
            </button>
          </div>
        </div>

        {/* CLOSE ACTION */}
        <div className={`pt-4 border-t ${dividerColor}`}>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className={`w-full py-2.5 rounded-xl font-bold text-xs transition-colors ${
              isLight
                ? 'bg-slate-900 hover:bg-slate-800 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
          >
            Concluído
          </button>
        </div>
      </div>
    </div>
  );
};
