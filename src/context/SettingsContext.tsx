import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'dark' | 'midnight' | 'soft' | 'light';
export type LanguageMode = 'BR' | 'EN';

interface SettingsContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  brightness: number;
  setBrightness: (brightness: number) => void;
  language: LanguageMode;
  setLanguage: (lang: LanguageMode) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  t: (key: string) => string;
}

const translations: Record<LanguageMode, Record<string, string>> = {
  BR: {
    platformName: 'MALACA SYSTEM',
    tagline: 'PLATAFORMA INTEGRADA GTA RP',
    heroTitle: 'MALACA SYSTEM GTA RP',
    heroSubtitle: 'Portal oficial de ferramentas, mapa interativo dos servidores CDA e VALLEY, e simuladores originais para treinamento no servidor.',
    homeHub: 'Início / Hub',
    mapModule: 'Mapa Interativo',
    caixinhaModule: 'Caixinha Eletrônica',
    hackingModule: 'Hacking Keycard',
    lockpickModule: 'Lockpick Simulator',
    calcModule: 'Calculadora de Lavagem',
    tablesModule: 'Tabelas & Guia RP',
    accessSystem: 'Acessar Sistema',
    back: 'Voltar',
    settingsTitle: 'Configurações de Aparência',
    settingsSubtitle: 'Personalize o tema visual, o brilho da tela e o idioma da plataforma',
    themeLabel: 'Tema Visual',
    themeDark: 'Escuro',
    themeMidnight: 'Midnight',
    themeSoft: 'Suave',
    themeLight: 'Claro',
    brightnessLabel: 'Intensidade de Brilho',
    languageLabel: 'Idioma do Sistema',
    footerCreatedBy: 'Sistema desenvolvido por',
    footerAuthor: 'Malaca',
    discordTag: 'malaca7',
    discordCopied: 'Tag do Discord copiada: malaca7',
    footerRights: 'Malaca System GTA RP • Todos os direitos reservados.'
  },
  EN: {
    platformName: 'MALACA SYSTEM',
    tagline: 'GTA RP INTEGRATED PLATFORM',
    heroTitle: 'MALACA SYSTEM GTA RP',
    heroSubtitle: 'Official tools portal, interactive map for CDA and VALLEY servers, and original GTA RP training simulators.',
    homeHub: 'Home / Hub',
    mapModule: 'Interactive Map',
    caixinhaModule: 'ATM Hack',
    hackingModule: 'Keycard Hack',
    lockpickModule: 'Lockpick Simulator',
    calcModule: 'Money Laundering Calc',
    tablesModule: 'RP Tables & Guide',
    accessSystem: 'Open System',
    back: 'Back',
    settingsTitle: 'Appearance Settings',
    settingsSubtitle: 'Customize visual theme, brightness intensity, and system language',
    themeLabel: 'Visual Theme',
    themeDark: 'Dark',
    themeMidnight: 'Midnight',
    themeSoft: 'Soft',
    themeLight: 'Light',
    brightnessLabel: 'Brightness Intensity',
    languageLabel: 'System Language',
    footerCreatedBy: 'System developed by',
    footerAuthor: 'Malaca',
    discordTag: 'malaca7',
    discordCopied: 'Discord tag copied: malaca7',
    footerRights: 'Malaca System GTA RP • All rights reserved.'
  }
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('malaca_theme') as ThemeMode) || 'dark';
  });
  const [brightness, setBrightnessState] = useState<number>(() => {
    const saved = localStorage.getItem('malaca_brightness');
    return saved ? Number(saved) : 100;
  });
  const [language, setLanguageState] = useState<LanguageMode>(() => {
    return (localStorage.getItem('malaca_language') as LanguageMode) || 'BR';
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync theme with body class & html data attribute so CSS rules in styles.css and minigames react
  useEffect(() => {
    document.body.classList.remove('dark-theme', 'midnight-theme', 'soft-theme', 'light-theme');
    document.body.classList.add(`${theme}-theme`);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('malaca_theme', newTheme);
  };

  const setBrightness = (newBrightness: number) => {
    setBrightnessState(newBrightness);
    localStorage.setItem('malaca_brightness', String(newBrightness));
  };

  const setLanguage = (newLang: LanguageMode) => {
    setLanguageState(newLang);
    localStorage.setItem('malaca_language', newLang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['BR']?.[key] || key;
  };

  return (
    <SettingsContext.Provider value={{
      theme,
      setTheme,
      brightness,
      setBrightness,
      language,
      setLanguage,
      isSettingsOpen,
      setIsSettingsOpen,
      t
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return ctx;
};
