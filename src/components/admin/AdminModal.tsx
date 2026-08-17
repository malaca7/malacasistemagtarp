import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  User,
  Plus, 
  Trash2, 
  Edit3, 
  MapPin, 
  Server as ServerIcon, 
  CheckCircle2, 
  Clock, 
  BarChart3,
  Sparkles,
  Eye,
  Shield,
  Layers
} from 'lucide-react';
import { Server, MapLocation, Suggestion, LocationCategory, SuggestionStatus } from '../../types';
import { ApiService } from '../../services/api';
import { CATEGORIES_CONFIG } from '../map/MapLegend';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  onAuthenticate: (username: string, passcode: string) => boolean;
  onLogout: () => void;
  servers: Server[];
  activeServer: Server | null;
  locations: MapLocation[];
  onRefreshData: () => void;
  onStartVisualAddMarker: () => void;
  newMarkerCoords: { x: number; y: number } | null;
  onClearNewMarkerCoords: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  isAuthenticated,
  onAuthenticate,
  onLogout,
  servers,
  activeServer,
  locations,
  onRefreshData,
  onStartVisualAddMarker,
  newMarkerCoords,
  onClearNewMarkerCoords
}) => {
  const [username, setUsername] = useState('');
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'locations' | 'servers' | 'suggestions'>('dashboard');

  // Locations Form State
  const [editingLocation, setEditingLocation] = useState<Partial<MapLocation> | null>(null);
  const [isSavingLoc, setIsSavingLoc] = useState(false);

  // Suggestions State
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  // Server Form State
  const [editingServer, setEditingServer] = useState<Partial<Server> | null>(null);

  useEffect(() => {
    if (isAuthenticated && isOpen) {
      loadSuggestions();
    }
  }, [isAuthenticated, isOpen]);

  useEffect(() => {
    if (newMarkerCoords) {
      setEditingLocation(prev => ({
        ...prev,
        server_id: activeServer?.id || '',
        name: prev?.name || 'Novo Ponto Visual',
        category: prev?.category || 'Hospital Ilegal',
        description: prev?.description || '',
        x: newMarkerCoords.x,
        y: newMarkerCoords.y,
        icon: prev?.icon || 'MapPin',
        color: prev?.color || '#f43f5e',
        image_url: prev?.image_url || ''
      }));
      setActiveTab('locations');
    }
  }, [newMarkerCoords]);

  const loadSuggestions = async () => {
    const data = await ApiService.getSuggestions();
    setSuggestions(data);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = onAuthenticate(username, passcode);
    if (ok) {
      setAuthError(false);
      setPasscode('');
      setUsername('');
    } else {
      setAuthError(true);
    }
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLocation || !editingLocation.name || !editingLocation.server_id) return;

    setIsSavingLoc(true);
    await ApiService.saveLocation(editingLocation);
    setIsSavingLoc(false);
    setEditingLocation(null);
    onClearNewMarkerCoords();
    onRefreshData();
  };

  const handleDeleteLocation = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este ponto do mapa?')) {
      await ApiService.deleteLocation(id);
      onRefreshData();
    }
  };

  const handleUpdateSuggestion = async (id: string, status: SuggestionStatus) => {
    await ApiService.updateSuggestionStatus(id, status);
    loadSuggestions();
  };

  const handleSaveServer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingServer || !editingServer.name || !editingServer.slug) return;

    await ApiService.saveServer(editingServer);
    setEditingServer(null);
    onRefreshData();
  };

  if (!isOpen) return null;

  // LOGIN SCREEN IF NOT AUTHENTICATED
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn select-none">
        <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white">Painel Administrativo</h2>
            <p className="text-xs text-slate-400">Informe suas credenciais de administração</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {authError && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs text-center font-semibold animate-shake">
                Usuário ou senha incorretos. Tente novamente!
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-300">Usuário</label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5" />
                <input
                  type="text"
                  placeholder="Nome de usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-300">Senha</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5" />
                <input
                  type="password"
                  placeholder="Senha de acesso"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition-all"
              >
                Entrar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // AUTHENTICATED ADMIN PANEL
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
        {/* TOP BAR */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Painel de Gestão & Qualidade</h2>
              <p className="text-xs text-slate-400">Gerenciar mapas, marcadores e sugestões</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onLogout}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20"
            >
              Sair
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-5 gap-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'dashboard' ? 'border-rose-500 text-rose-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('locations')}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'locations' ? 'border-rose-500 text-rose-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Marcadores ({locations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('servers')}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'servers' ? 'border-rose-500 text-rose-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ServerIcon className="w-4 h-4" />
            <span>Servidores ({servers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('suggestions')}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'suggestions' ? 'border-rose-500 text-rose-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Sugestões ({suggestions.length})</span>
          </button>
        </div>

        {/* TAB BODY */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-semibold">Total de Pontos</span>
                  <div className="text-2xl font-bold font-mono text-white mt-1">{locations.length}</div>
                </div>

                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-semibold">Sugestões Pendentes</span>
                  <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                    {suggestions.filter(s => s.status === 'Nova').length}
                  </div>
                </div>

                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-semibold">Servidores Ativos</span>
                  <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">{servers.length}</div>
                </div>

                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-semibold">Andarilhos Mapeados</span>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                    {locations.filter(l => l.category === 'Andarilho').length}
                  </div>
                </div>
              </div>

              {/* QUICK ACTIONS */}
              <div className="p-5 bg-gradient-to-r from-rose-950/30 to-slate-900 rounded-2xl border border-rose-500/20 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Ferramenta Visual de Posicionamento</h3>
                  <p className="text-xs text-slate-400">Clique diretamente no mapa para marcar novas coordenadas X e Y.</p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onStartVisualAddMarker();
                  }}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Posicionar Ponto no Mapa</span>
                </button>
              </div>
            </div>
          )}

          {/* LOCATIONS TAB */}
          {activeTab === 'locations' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Gerenciar Marcadores ({activeServer?.name})</h3>
                <button
                  onClick={() => {
                    onClose();
                    onStartVisualAddMarker();
                  }}
                  className="px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Ponto Visual</span>
                </button>
              </div>

              {/* LOCATION FORM EDIT */}
              {editingLocation && (
                <form onSubmit={handleSaveLocation} className="p-5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4">
                  <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                    {editingLocation.id ? 'Editar Ponto' : 'Criar Novo Ponto'}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Nome do Ponto</label>
                      <input
                        type="text"
                        value={editingLocation.name || ''}
                        onChange={(e) => setEditingLocation({ ...editingLocation, name: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Categoria</label>
                      <select
                        value={editingLocation.category || 'Hospital Ilegal'}
                        onChange={(e) => setEditingLocation({ ...editingLocation, category: e.target.value as LocationCategory })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      >
                        {CATEGORIES_CONFIG.map(c => (
                          <option key={c.category} value={c.category}>{c.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Coordenada X (0 a 1000)</label>
                      <input
                        type="number"
                        value={editingLocation.x ?? 500}
                        onChange={(e) => setEditingLocation({ ...editingLocation, x: parseFloat(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Coordenada Y (0 a 1000)</label>
                      <input
                        type="number"
                        value={editingLocation.y ?? 500}
                        onChange={(e) => setEditingLocation({ ...editingLocation, y: parseFloat(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Descrição</label>
                    <textarea
                      rows={2}
                      value={editingLocation.description || ''}
                      onChange={(e) => setEditingLocation({ ...editingLocation, description: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setEditingLocation(null)}
                      className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingLoc}
                      className="px-4 py-2 bg-emerald-600 text-white text-xs rounded-xl font-bold"
                    >
                      Salvar Ponto
                    </button>
                  </div>
                </form>
              )}

              {/* LOCATIONS TABLE */}
              <div className="space-y-2">
                {locations.map(loc => (
                  <div key={loc.id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{loc.name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300">
                          {loc.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        X: {loc.x} | Y: {loc.y}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingLocation(loc)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteLocation(loc.id)}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SERVERS TAB */}
          {activeTab === 'servers' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Servidores Configurados</h3>

              <div className="space-y-3">
                {servers.map(s => (
                  <div key={s.id} className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{s.name} ({s.slug.toUpperCase()})</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                        Ativo
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                      URL do Mapa: <span className="font-mono text-slate-500">{s.map_image_url}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUGGESTIONS TAB */}
          {activeTab === 'suggestions' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Sugestões da Comunidade</h3>

              <div className="space-y-3">
                {suggestions.map(s => (
                  <div key={s.id} className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-400">{s.nickname} ({s.type})</span>
                      <select
                        value={s.status}
                        onChange={(e) => handleUpdateSuggestion(s.id, e.target.value as SuggestionStatus)}
                        className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 text-[11px]"
                      >
                        <option value="Nova">Nova</option>
                        <option value="Em análise">Em análise</option>
                        <option value="Aceita">Aceita</option>
                        <option value="Recusada">Recusada</option>
                        <option value="Implementada">Implementada</option>
                      </select>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{s.content}</p>
                    <div className="text-[10px] text-slate-500">
                      Enviada em {new Date(s.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
