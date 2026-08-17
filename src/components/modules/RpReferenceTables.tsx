import React, { useState } from 'react';
import { BookOpen, Shield, Wrench, Search, Zap } from 'lucide-react';

export const RpReferenceTables: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const CRAFTING_ITEMS = [
    { name: 'Algema', materials: '2x Metal, 1x Mola', category: 'Ilegal' },
    { name: 'Capa de Colete', materials: '4x Kevlar, 2x Linha', category: 'Ilegal' },
    { name: 'Lockpick', materials: '3x Arame, 1x Engrenagem', category: 'Ferramenta' },
    { name: 'Kit Médico', materials: '2x Atadura, 1x Morfina', category: 'Hospital' },
    { name: 'Rádio Criptografado', materials: '2x Placa Mãe, 1x Antena', category: 'Eletrônico' },
  ];

  const RULES = [
    { title: 'RDM (Random Deathmatch)', desc: 'Matar ou agredir outro jogador sem motivo de RP prévio.' },
    { title: 'VDM (Vehicle Deathmatch)', desc: 'Usar o veículo como arma para atropelar pessoas intencionalmente.' },
    { title: 'Powergaming (PG)', desc: 'Realizar ações humanas impossíveis ou forçar RP sem opção de reação.' },
    { title: 'Metagaming (MG)', desc: 'Usar informações externas (Discord/Stream) dentro do jogo.' },
    { title: 'Combat Logging (CL)', desc: 'Desconectar do servidor para evitar morte, prisão ou abordagem.' }
  ];

  const filteredItems = CRAFTING_ITEMS.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.materials.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 w-full h-full bg-slate-950 p-6 flex flex-col items-center justify-center relative overflow-hidden select-none">
      <div className="w-full max-w-3xl bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-2xl text-purple-400">
              <BookOpen className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Tabelas & Guia de Referência RP</h2>
              <p className="text-xs text-slate-400">Receitas de Crafting e Regras Gerais da Cidade</p>
            </div>
          </div>

          <div className="relative w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* CRAFTING TABLE */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
            <Wrench className="w-4 h-4" />
            <span>Tabela de Receitas & Crafting</span>
          </h3>

          <div className="space-y-2">
            {filteredItems.map((item, idx) => (
              <div key={idx} className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white">{item.name}</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">Materiais: <span className="text-slate-300 font-mono">{item.materials}</span></p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-slate-900 text-purple-300 border border-purple-500/20 text-[10px] font-semibold">
                  {item.category}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RP RULES */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <Shield className="w-4 h-4" />
            <span>Regras Gerais da Cidade</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {RULES.map((rule, idx) => (
              <div key={idx} className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-1">
                <span className="font-bold text-xs text-rose-400">{rule.title}</span>
                <p className="text-[11px] text-slate-300 leading-normal">{rule.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
