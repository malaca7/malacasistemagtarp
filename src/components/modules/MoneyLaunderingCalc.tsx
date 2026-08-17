import React, { useState } from 'react';
import { Calculator, DollarSign, ArrowRight, ShieldAlert } from 'lucide-react';

export const MoneyLaunderingCalc: React.FC = () => {
  const [dirtyAmount, setDirtyAmount] = useState<number>(100000);
  const [taxRate, setTaxRate] = useState<number>(15); // 15% default tax

  const cleanAmount = dirtyAmount * (1 - taxRate / 100);
  const feeAmount = dirtyAmount * (taxRate / 100);

  return (
    <div className="flex-1 w-full h-full bg-slate-950 p-6 flex flex-col items-center justify-center relative overflow-hidden select-none">
      <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400">
            <Calculator className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Calculadora de Lavagem de Dinheiro</h2>
            <p className="text-xs text-slate-400">Calcule os valores líquidos e taxas das lavanderias da cidade</p>
          </div>
        </div>

        {/* INPUTS */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Valor Sujo Total (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">$</span>
              <input
                type="number"
                step="1000"
                value={dirtyAmount}
                onChange={(e) => setDirtyAmount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-8 pr-4 py-3 text-sm font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>Taxa da Lavanderia (%)</span>
              <span className="font-mono text-emerald-400">{taxRate}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              step="1"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="w-full h-3 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>

        {/* RESULTS CARD */}
        <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-3">
            <span className="text-slate-400">Taxa Retida ({taxRate}%):</span>
            <span className="font-mono font-bold text-rose-400">
              - R$ {feeAmount.toLocaleString('pt-BR')}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Valor Limpo Recebido:
            </span>
            <span className="text-xl font-mono font-black text-emerald-400">
              R$ {cleanAmount.toLocaleString('pt-BR')}
            </span>
          </div>
        </div>

        <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 text-[11px] text-slate-500 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
          <span>A taxa padrão na Cidade Alta é de 15%. Facções controladoras podem alterar a taxa.</span>
        </div>
      </div>
    </div>
  );
};
