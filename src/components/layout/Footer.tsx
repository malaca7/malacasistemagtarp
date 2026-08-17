import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Sparkles, MessageSquare, Check, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { theme, t } = useSettings();
  const [copied, setCopied] = useState(false);

  const isLight = theme === 'light';
  const isMidnight = theme === 'midnight';

  const handleCopyDiscord = () => {
    navigator.clipboard.writeText('malaca7');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const footerBg = isLight 
    ? 'bg-white/95 border-slate-200 text-slate-600 shadow-sm' 
    : isMidnight 
    ? 'bg-black/95 border-zinc-800 text-zinc-400' 
    : 'bg-slate-950/90 border-slate-800/80 text-slate-400';

  const discordBtnStyle = copied
    ? isLight 
      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-400/40'
      : 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
    : isLight
      ? 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700'
      : 'bg-indigo-600/15 hover:bg-indigo-600/30 border-indigo-500/40 text-indigo-300 hover:border-indigo-400';

  return (
    <footer className={`w-full py-4 px-6 border-t backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 text-xs select-none z-30 relative transition-colors duration-300 ${footerBg}`}>
      {/* BRAND & AUTHOR CREDIT */}
      <div className="flex items-center gap-2">
        <span>{t('footerCreatedBy')}</span>
        <span className="font-display font-black text-sm tracking-wider bg-gradient-to-r from-sky-400 via-cyan-500 to-blue-600 bg-clip-text text-transparent uppercase flex items-center gap-1">
          {t('footerAuthor')}
          <Heart className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400 inline animate-pulse" />
        </span>
      </div>

      {/* DISCORD LINK / TAG BADGE */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleCopyDiscord}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all duration-300 ${discordBtnStyle}`}
          title="Clique para copiar a tag do Discord"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t('discordCopied')}</span>
            </>
          ) : (
            <>
              <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
              <span>Discord: <strong className={`font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>malaca7</strong></span>
            </>
          )}
        </button>
      </div>

      {/* RIGHTS */}
      <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
        {t('footerRights')}
      </div>
    </footer>
  );
};
