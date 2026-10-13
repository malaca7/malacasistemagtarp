import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex items-center justify-center p-6 bg-slate-950 text-slate-100 min-h-[300px] w-full">
          <div className="max-w-md w-full bg-slate-900/90 border border-red-500/30 rounded-2xl p-6 text-center shadow-2xl backdrop-blur-xl">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {this.props.fallbackTitle || 'Falha ao carregar o Mapa Interativo'}
            </h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              {this.props.fallbackMessage ||
                'Ocorreu uma instabilidade na renderização do mapa. Clique abaixo para reiniciar a visualização com segurança.'}
            </p>
            {this.state.error && (
              <pre className="text-[10px] text-red-300/80 bg-black/50 p-3 rounded-lg overflow-x-auto text-left mb-6 font-mono border border-white/5">
                {this.state.error.message || String(this.state.error)}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Recarregar Mapa</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
