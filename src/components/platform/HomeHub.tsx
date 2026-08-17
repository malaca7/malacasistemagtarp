import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlatformModule } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { 
  Map, 
  Cpu, 
  Terminal, 
  KeyRound, 
  Calculator, 
  BookOpen, 
  ArrowRight, 
  Radio
} from 'lucide-react';

export const HomeHub: React.FC = () => {
  const navigate = useNavigate();
  const { theme, t } = useSettings();

  const isLight = theme === 'light';
  const isMidnight = theme === 'midnight';

  const SYSTEM_CARDS: {
    id: PlatformModule;
    path: string;
    title: string;
    subtitle: string;
    description: string;
    icon: any;
    badge: string;
    gradient: string;
    borderColor: string;
    iconBg: string;
  }[] = [
    {
      id: 'map',
      path: '/mapa',
      title: t('mapModule'),
      subtitle: 'CDA & VALLEY SERVERS',
      description: 'Mapa tático em tempo real. Consulte hospitais ilegais, desmanches, lavanderias e a localização do Andarilho com inteligência colaborativa.',
      icon: Map,
      badge: 'CDA & VALLEY',
      gradient: isLight 
        ? 'from-rose-500/10 via-white to-slate-50' 
        : isMidnight 
        ? 'from-rose-950/30 via-black to-black' 
        : 'from-rose-600/20 via-slate-900/90 to-slate-950/95',
      borderColor: isLight ? 'border-rose-300 hover:border-rose-500' : 'border-rose-500/40 hover:border-rose-500',
      iconBg: isLight ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
    },
    {
      id: 'caixinha',
      path: '/caixinha',
      title: t('caixinhaModule'),
      subtitle: 'MINIGAME SIMULATOR',
      description: 'Treine a sequência de teclas da caixinha eletrônica antes de ir pra ação. Código e velocidade fiéis ao jogo.',
      icon: Cpu,
      badge: 'ORIGINAL',
      gradient: isLight 
        ? 'from-cyan-500/10 via-white to-slate-50' 
        : isMidnight 
        ? 'from-cyan-950/30 via-black to-black' 
        : 'from-cyan-600/20 via-slate-900/90 to-slate-950/95',
      borderColor: isLight ? 'border-cyan-300 hover:border-cyan-500' : 'border-cyan-500/40 hover:border-cyan-500',
      iconBg: isLight ? 'bg-cyan-50 text-cyan-600 border-cyan-200' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
    },
    {
      id: 'hacking',
      path: '/hacking',
      title: t('hackingModule'),
      subtitle: 'MINIGAME SIMULATOR',
      description: 'Pratique o bypass de cartões de segurança e portas criptografadas de alta prioridade na cidade.',
      icon: Terminal,
      badge: 'ORIGINAL',
      gradient: isLight 
        ? 'from-emerald-500/10 via-white to-slate-50' 
        : isMidnight 
        ? 'from-emerald-950/30 via-black to-black' 
        : 'from-emerald-600/20 via-slate-900/90 to-slate-950/95',
      borderColor: isLight ? 'border-emerald-300 hover:border-emerald-500' : 'border-emerald-500/40 hover:border-emerald-500',
      iconBg: isLight ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    },
    {
      id: 'lockpick',
      path: '/lockpick',
      title: t('lockpickModule'),
      subtitle: 'MINIGAME SIMULATOR',
      description: 'Simulador de destravamento de fechaduras com gazua mecânica. Ajuste o ângulo correto para abrir sem quebrar.',
      icon: KeyRound,
      badge: 'ORIGINAL',
      gradient: isLight 
        ? 'from-amber-500/10 via-white to-slate-50' 
        : isMidnight 
        ? 'from-amber-950/30 via-black to-black' 
        : 'from-amber-600/20 via-slate-900/90 to-slate-950/95',
      borderColor: isLight ? 'border-amber-300 hover:border-amber-500' : 'border-amber-500/40 hover:border-amber-500',
      iconBg: isLight ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    },
    {
      id: 'calculator',
      path: '/calculadora',
      title: t('calcModule'),
      subtitle: 'FERRAMENTA RP',
      description: 'Calcule o retorno líquido do dinheiro sujo aplicando as taxas de lavagem atualizadas da facção ou da cidade.',
      icon: Calculator,
      badge: 'UTILITÁRIO',
      gradient: isLight 
        ? 'from-purple-500/10 via-white to-slate-50' 
        : isMidnight 
        ? 'from-purple-950/30 via-black to-black' 
        : 'from-purple-600/20 via-slate-900/90 to-slate-950/95',
      borderColor: isLight ? 'border-purple-300 hover:border-purple-500' : 'border-purple-500/40 hover:border-purple-500',
      iconBg: isLight ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
    },
    {
      id: 'tables',
      path: '/tabelas',
      title: t('tablesModule'),
      subtitle: 'MANUAL & CRAFTING',
      description: 'Guia completo de receitas de craft, utilitários, regras de Roleplay (RDM, VDM, Meta) para consulta rápida durante o jogo.',
      icon: BookOpen,
      badge: 'GUIA RP',
      gradient: isLight 
        ? 'from-blue-500/10 via-white to-slate-50' 
        : isMidnight 
        ? 'from-blue-950/30 via-black to-black' 
        : 'from-blue-600/20 via-slate-900/90 to-slate-950/95',
      borderColor: isLight ? 'border-blue-300 hover:border-blue-500' : 'border-blue-500/40 hover:border-blue-500',
      iconBg: isLight ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
    }
  ];

  return (
    <div className="flex-1 w-full h-full overflow-y-auto p-6 md:p-12 custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* HERO SECTION */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold shadow-lg backdrop-blur-md border ${
            isLight ? 'bg-white/90 border-rose-300 text-rose-600' : 'bg-slate-950/80 border-rose-500/50 text-rose-400'
          }`}>
            <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span>{t('tagline')}</span>
          </div>

          <h1 className={`font-display font-black text-3xl md:text-5xl tracking-wider uppercase leading-tight ${
            isLight ? 'text-slate-900' : 'text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]'
          }`}>
            MALACA SYSTEM <span className="bg-gradient-to-r from-sky-400 via-cyan-500 to-blue-600 bg-clip-text text-transparent drop-shadow-none">GTA RP</span>
          </h1>

          <p className={`text-sm md:text-base font-medium leading-relaxed p-4 rounded-2xl border backdrop-blur-sm shadow-md ${
            isLight 
              ? 'bg-white/80 border-slate-200 text-slate-700' 
              : 'bg-slate-950/40 border-slate-800/50 text-slate-200 drop-shadow-md'
          }`}>
            {t('heroSubtitle')}
          </p>
        </div>

        {/* SYSTEM CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SYSTEM_CARDS.map(({ id, path, title, subtitle, description, icon: Icon, badge, gradient, borderColor, iconBg }) => (
            <div
              key={id}
              onClick={() => navigate(path)}
              className={`group relative bg-gradient-to-b ${gradient} border ${borderColor} rounded-3xl p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between overflow-hidden`}
            >
              {/* SHINE EFFECT ON HOVER */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className={`p-3.5 rounded-2xl border ${iconBg}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-[10px] font-bold tracking-wider font-mono px-2.5 py-1 rounded-full border ${
                    isLight ? 'bg-slate-100/90 border-slate-200 text-slate-700' : 'bg-slate-950/80 border-slate-800 text-slate-300'
                  }`}>
                    {badge}
                  </span>
                </div>

                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest block ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    {subtitle}
                  </span>
                  <h3 className={`text-lg font-bold transition-colors mt-0.5 ${
                    isLight ? 'text-slate-900 group-hover:text-rose-600' : 'text-white group-hover:text-rose-400'
                  }`}>
                    {title}
                  </h3>
                </div>

                <p className={`text-xs leading-relaxed ${
                  isLight ? 'text-slate-600' : 'text-slate-300/80'
                }`}>
                  {description}
                </p>
              </div>

              <div className={`pt-6 mt-6 border-t flex items-center justify-between text-xs font-bold relative z-10 ${
                isLight ? 'border-slate-200 text-slate-700 group-hover:text-slate-900' : 'border-slate-800/80 text-slate-300 group-hover:text-white'
              }`}>
                <span>{t('accessSystem')}</span>
                <ArrowRight className={`w-4 h-4 group-hover:translate-x-1 transition-all ${
                  isLight ? 'text-slate-500 group-hover:text-rose-600' : 'text-slate-400 group-hover:text-rose-400'
                }`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
