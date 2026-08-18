import React, { useState, useEffect } from 'react';
import { Sliders, Sun, Globe, Palette, X, RotateCcw } from 'lucide-react';

export type ThemeType = 'escuro' | 'oled' | 'dracula' | 'cinza_escuro' | 'cinza_claro' | 'claro';
export type LanguageType = 'BR' | 'EN';

interface AppearanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppearanceModal: React.FC<AppearanceModalProps> = ({ isOpen, onClose }) => {
  const [theme, setTheme] = useState<ThemeType>('escuro');
  const [brightness, setBrightness] = useState<number>(100);
  const [language, setLanguage] = useState<LanguageType>('BR');

  // Load initial settings
  useEffect(() => {
    const savedTheme = (localStorage.getItem('malaca_theme') as ThemeType) || 'escuro';
    const savedBrightness = parseInt(localStorage.getItem('malaca_brightness') || '100', 10);
    const savedLang = (localStorage.getItem('malaca_language') as LanguageType) || 'BR';

    setTheme(savedTheme);
    setBrightness(isNaN(savedBrightness) ? 100 : savedBrightness);
    setLanguage(savedLang);

    applyBrightness(isNaN(savedBrightness) ? 100 : savedBrightness);
    applyThemeClass(savedTheme);
  }, []);

  const applyBrightness = (val: number) => {
    document.documentElement.style.filter = `brightness(${val}%)`;
    localStorage.setItem('malaca_brightness', val.toString());
  };

  const applyThemeClass = (selectedTheme: ThemeType) => {
    document.documentElement.setAttribute('data-theme', selectedTheme);
    localStorage.setItem('malaca_theme', selectedTheme);
  };

  const handleBrightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setBrightness(val);
    applyBrightness(val);
  };

  const handleBrightnessReset = () => {
    setBrightness(100);
    applyBrightness(100);
  };

  const handleThemeChange = (newTheme: ThemeType) => {
    setTheme(newTheme);
    applyThemeClass(newTheme);
  };

  const handleLanguageChange = (newLang: LanguageType) => {
    setLanguage(newLang);
    localStorage.setItem('malaca_language', newLang);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0D0D0D] border border-[#FA7608]/40 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#FA7608]/20 border border-[#FA7608]/30 text-[#FFB52E]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white leading-tight">Configurações de Aparência</h2>
              <p className="text-xs text-slate-400">Personalize tema visual, brilho e idioma</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. SELEÇÃO DE TEMAS */}
        <div className="space-y-3">
          <label className="text-xs font-extrabold text-[#FFB52E] uppercase tracking-wider flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#FA7608]" />
            Tema Visual
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'escuro', name: 'Escuro', bg: 'bg-[#0D0D0D]', border: 'border-[#FA7608]' },
              { id: 'oled', name: 'OLED (Pitch)', bg: 'bg-black', border: 'border-amber-400' },
              { id: 'dracula', name: 'Dracula', bg: 'bg-[#282a36]', border: 'border-pink-500' },
              { id: 'cinza_escuro', name: 'Cinza (Escuro)', bg: 'bg-zinc-900', border: 'border-orange-500' },
              { id: 'cinza_claro', name: 'Cinza (Claro)', bg: 'bg-zinc-300 text-zinc-900', border: 'border-zinc-500' },
              { id: 'claro', name: 'Claro', bg: 'bg-white text-slate-900', border: 'border-amber-600' },
            ].map((item) => {
              const isSelected = theme === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleThemeChange(item.id as ThemeType)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center gap-1 ${item.bg} ${
                    isSelected
                      ? `${item.border} ring-2 ring-[#FA7608]/50 shadow-lg scale-105`
                      : 'border-slate-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <span className="truncate">{item.name}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#FFB52E]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. REGULAGEM DE BRILHO (0% a 150%) */}
        <div className="space-y-3 bg-[#000000]/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold text-slate-200 flex items-center gap-2">
              <Sun className="w-4 h-4 text-[#FA7608]" />
              Brilho da Tela: <span className="text-[#FFB52E] font-mono font-bold text-sm">{brightness}%</span>
            </label>
            <button
              onClick={handleBrightnessReset}
              className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 transition-all"
              title="Dar 2 cliques ou clicar aqui para voltar ao padrão (100%)"
            >
              <RotateCcw className="w-3 h-3 text-[#FA7608]" />
              Reset (100%)
            </button>
          </div>

          <input
            type="range"
            min="0"
            max="150"
            value={brightness}
            onChange={handleBrightnessChange}
            onDoubleClick={handleBrightnessReset}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#FA7608]"
            title="Dê dois cliques para restaurar o brilho padrão (100%)"
          />
          <p className="text-[10px] text-slate-400 italic text-center">
            Dica: Dê <strong className="text-slate-200">duplo clique</strong> no slider para resetar o brilho para 100%.
          </p>
        </div>

        {/* 3. SELEÇÃO DE IDIOMA */}
        <div className="space-y-3">
          <label className="text-xs font-extrabold text-slate-200 flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#FA7608]" />
            Idioma da Plataforma
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'BR', name: 'Português (BR)', flag: '🇧🇷' },
              { id: 'EN', name: 'English (EN)', flag: '🇺🇸' },
            ].map((lang) => {
              const isSelected = language === lang.id;
              return (
                <button
                  key={lang.id}
                  onClick={() => handleLanguageChange(lang.id as LanguageType)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                    isSelected
                      ? 'bg-[#FA7608]/20 border-[#FA7608] text-white shadow-md'
                      : 'bg-[#000000]/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gradient-to-r from-[#F95A01] via-[#FA7608] to-[#FFB52E] hover:brightness-110 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#FA7608]/25"
          >
            Salvar e Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
