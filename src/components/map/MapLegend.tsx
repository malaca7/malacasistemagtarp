import React, { useState } from 'react';
import { 
  Cross, 
  ShoppingBag, 
  DollarSign, 
  Wrench, 
  UserCheck, 
  HelpCircle, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  Filter
} from 'lucide-react';
import { LocationCategory, MapLocation } from '../../types';

interface MapLegendProps {
  locations: MapLocation[];
  selectedCategories: LocationCategory[];
  onToggleCategory: (category: LocationCategory) => void;
  onSelectAll: () => void;
}

export const CATEGORIES_CONFIG: { category: LocationCategory; label: string; icon: any; color: string }[] = [
  { category: 'Hospital Ilegal', label: 'Hospital Ilegal', icon: Cross, color: '#ef4444' },
  { category: 'Mercado Ilegal', label: 'Mercado Ilegal', icon: ShoppingBag, color: '#f59e0b' },
  { category: 'Lavanderia Ilegal', label: 'Lavanderia Ilegal', icon: DollarSign, color: '#10b981' },
  { category: 'Desmanche', label: 'Desmanche', icon: Wrench, color: '#a855f7' },
  { category: 'Andarilho', label: 'Andarilho (Pontos)', icon: UserCheck, color: '#06b6d4' },
  { category: 'Outros', label: 'Outros Locais', icon: HelpCircle, color: '#64748b' }
];

export const MapLegend: React.FC<MapLegendProps> = React.memo(({
  locations,
  selectedCategories,
  onToggleCategory,
  onSelectAll
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Count items per category
  const counts: Record<string, number> = {};
  locations.forEach(loc => {
    counts[loc.category] = (counts[loc.category] || 0) + 1;
  });

  return (
    <div className="absolute top-20 left-4 md:top-24 md:left-6 z-20 max-w-xs w-full">
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between text-slate-200 font-semibold text-xs tracking-wider uppercase hover:bg-slate-800/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-rose-500" />
            <span>Filtros do Mapa</span>
            <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-mono">
              {selectedCategories.length}/{CATEGORIES_CONFIG.length}
            </span>
          </div>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {isExpanded && (
          <div className="p-3 border-t border-slate-800/80 space-y-1.5 max-h-72 overflow-y-auto custom-scrollbar">
            {CATEGORIES_CONFIG.map(({ category, label, icon: Icon, color }) => {
              const isSelected = selectedCategories.includes(category);
              const count = counts[category] || 0;

              return (
                <button
                  key={category}
                  onClick={() => onToggleCategory(category)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isSelected 
                      ? 'bg-slate-800 text-slate-100 border border-slate-700/60 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-3 h-3 rounded-md flex items-center justify-center transition-transform"
                      style={{ backgroundColor: isSelected ? color : '#334155' }}
                    />
                    <Icon className="w-3.5 h-3.5" style={{ color: isSelected ? color : '#64748b' }} />
                    <span className="truncate">{label}</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                    isSelected ? 'bg-slate-900 text-slate-300' : 'bg-slate-950 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}

            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between px-1">
              <button
                onClick={onSelectAll}
                className="text-[11px] text-rose-400 hover:text-rose-300 font-medium transition-colors"
              >
                {selectedCategories.length === CATEGORIES_CONFIG.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </button>
              <span className="text-[10px] text-slate-500">Total: {locations.length} pontos</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
