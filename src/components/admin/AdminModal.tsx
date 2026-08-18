import React, { useState, useEffect } from 'react';
import type { Server, System, MapLocation, Suggestion, Comment, LocationCategory, SuggestionStatus } from '../../types';
import { ApiService } from '../../services/api';
import {
  X,
  Lock,
  User,
  Plus,
  Trash2,
  Edit3,
  MapPin,
  CheckCircle2,
  BarChart3,
  Sparkles,
  Shield,
  LocateFixed,
  RefreshCw,
  LogOut,
  Clock,
  MessageSquare,
  Building2,
  Layers,
  Check,
  XCircle,
  ArrowUp,
  ArrowDown,
  Edit2,
} from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  servers: Server[];
  locations: MapLocation[];
  suggestions: Suggestion[];
  comments: Comment[];
  onSaveLocation: (location: Omit<MapLocation, 'id'>) => Promise<boolean>;
  onDeleteLocation: (id: string) => Promise<boolean>;
  onUpdateSuggestionStatus: (id: string, status: SuggestionStatus) => Promise<boolean>;
  onStartPinMode: () => void;
  pendingPinCoords: { x: number; y: number } | null;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  servers: initialServers,
  locations,
  suggestions,
  comments: initialComments,
  onSaveLocation,
  onDeleteLocation,
  onUpdateSuggestionStatus,
  onStartPinMode,
  pendingPinCoords,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'cities' | 'systems' | 'locations' | 'wanderer' | 'comments' | 'suggestions'>('dashboard');

  // Dynamic Data State
  const [serversList, setServersList] = useState<Server[]>(initialServers);
  const [systemsList, setSystemsList] = useState<System[]>([]);
  const [commentsList, setCommentsList] = useState<Comment[]>(initialComments);

  // City Creation Form State
  const [cityName, setCityName] = useState('');
  const [citySlug, setCitySlug] = useState('');
  const [citySubtitle, setCitySubtitle] = useState('');
  const [cityDescription, setCityDescription] = useState('');
  const [cityBannerUrl, setCityBannerUrl] = useState('');
  const [cityMapUrl, setCityMapUrl] = useState('/images/mapa_cda_optimized.webp');
  const [cityActive, setCityActive] = useState(true);

  // System Creation Form State
  const [sysName, setSysName] = useState('');
  const [sysSlug, setSysSlug] = useState('');
  const [sysTag, setSysTag] = useState('');
  const [sysDescription, setSysDescription] = useState('');
  const [sysIcon, setSysIcon] = useState('fa-compass');
  const [sysImageUrl, setSysImageUrl] = useState('/images/gta_map_bg.webp');
  const [sysLink, setSysLink] = useState('mapa-interativo/');
  const [sysCityIds, setSysCityIds] = useState<string[]>([]);
  const [sysActive, setSysActive] = useState(true);

  // New Location Form State
  const [locName, setLocName] = useState('');
  const [locCategory, setLocCategory] = useState<LocationCategory>('hospital_ilegal');
  const [locDescription, setLocDescription] = useState('');
  const [locImageUrl, setLocImageUrl] = useState('');
  const [locServerId, setLocServerId] = useState(initialServers[0]?.id || '');
  const [locIsActive, setLocIsActive] = useState(true);

  // Toast Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAdminData();
    }
  }, [isOpen]);

  const loadAdminData = async () => {
    const s = await ApiService.fetchServers();
    setServersList(s);
    const sys = await ApiService.fetchSystems();
    setSystemsList(sys);
    const comm = await ApiService.fetchComments();
    setCommentsList(comm);
  };

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const u = username.trim().toLowerCase();
    if (
      (u === 'malaca' && password === '199425') ||
      (u === 'admin' && (password === 'cidadealta123' || password === 'admin'))
    ) {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  // Create City Handler
  const handleCreateCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityName.trim() || !citySlug.trim()) {
      showToast('Preencha o Nome e o Slug da Cidade.');
      return;
    }
    const cleanSlug = citySlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const created = await ApiService.createCity({
      name: cityName.trim().toUpperCase(),
      slug: cleanSlug,
      subtitle: citySubtitle.trim() || 'CIDADE RP',
      description: cityDescription.trim() || 'Acesse os sistemas e mapas da cidade.',
      banner_image_url: cityBannerUrl.trim() || '/images/hero_banner.jpg',
      map_image_url: cityMapUrl.trim() || '/images/mapa_cda_optimized.webp',
      active: cityActive,
    });

    if (created) {
      showToast(`Cidade "${created.name}" criada com sucesso!`);
      setCityName('');
      setCitySlug('');
      setCitySubtitle('');
      setCityDescription('');
      setCityBannerUrl('');
      loadAdminData();
    }
  };

  // Toggle City Active Status
  const handleToggleCityActive = async (city: Server) => {
    const ok = await ApiService.updateCity(city.id, { active: !city.active });
    if (ok) {
      showToast(`Status da cidade "${city.name}" atualizado.`);
      loadAdminData();
    }
  };

  // Delete City Handler
  const handleDeleteCity = async (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir a cidade "${name}"?`)) {
      const ok = await ApiService.deleteCity(id);
      if (ok) {
        showToast(`Cidade "${name}" excluída.`);
        loadAdminData();
      }
    }
  };

  // Edit State
  const [editingCity, setEditingCity] = useState<Server | null>(null);
  const [editingSystem, setEditingSystem] = useState<System | null>(null);

  // Edit City Handlers
  const handleStartEditCity = (city: Server) => {
    setEditingCity(city);
    setCityName(city.name);
    setCitySlug(city.slug);
    setCitySubtitle(city.subtitle || '');
    setCityDescription(city.description || '');
    setCityBannerUrl(city.banner_image_url || '');
    setCityActive(city.active !== false);
  };

  const handleCancelEditCity = () => {
    setEditingCity(null);
    setCityName('');
    setCitySlug('');
    setCitySubtitle('');
    setCityDescription('');
    setCityBannerUrl('');
  };

  const handleSaveEditCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCity) return;
    const ok = await ApiService.updateCity(editingCity.id, {
      name: cityName.trim().toUpperCase(),
      slug: citySlug.trim().toLowerCase(),
      subtitle: citySubtitle.trim(),
      description: cityDescription.trim(),
      banner_image_url: cityBannerUrl.trim(),
      active: cityActive,
    });
    if (ok) {
      showToast(`Cidade "${cityName}" atualizada com sucesso!`);
      handleCancelEditCity();
      loadAdminData();
    }
  };

  // Move City Up/Down Handlers
  const handleMoveCityUp = (index: number) => {
    if (index <= 0) return;
    const list = [...serversList];
    const temp = list[index - 1];
    list[index - 1] = list[index];
    list[index] = temp;
    setServersList(list);
    localStorage.setItem('malaca_custom_servers', JSON.stringify(list));
    showToast('Ordem das cidades atualizada!');
  };

  const handleMoveCityDown = (index: number) => {
    if (index >= serversList.length - 1) return;
    const list = [...serversList];
    const temp = list[index + 1];
    list[index + 1] = list[index];
    list[index] = temp;
    setServersList(list);
    localStorage.setItem('malaca_custom_servers', JSON.stringify(list));
    showToast('Ordem das cidades atualizada!');
  };

  // Edit System Handlers
  const handleStartEditSystem = (sys: System) => {
    setEditingSystem(sys);
    setSysName(sys.name);
    setSysSlug(sys.slug);
    setSysTag(sys.tag || '');
    setSysDescription(sys.description || '');
    setSysLink(sys.link || '');
    setSysCityIds(sys.city_ids || []);
    setSysActive(sys.is_active !== false);
  };

  const handleCancelEditSystem = () => {
    setEditingSystem(null);
    setSysName('');
    setSysSlug('');
    setSysTag('');
    setSysDescription('');
    setSysLink('');
    setSysCityIds([]);
  };

  const handleSaveEditSystem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSystem) return;
    const ok = await ApiService.updateSystem(editingSystem.id, {
      name: sysName.trim().toUpperCase(),
      slug: sysSlug.trim().toLowerCase(),
      tag: sysTag.trim().toUpperCase(),
      description: sysDescription.trim(),
      link: sysLink.trim(),
      city_ids: sysCityIds,
      is_active: sysActive,
    });
    if (ok) {
      showToast(`Sistema "${sysName}" atualizado com sucesso!`);
      handleCancelEditSystem();
      loadAdminData();
    }
  };

  // Move System Up/Down Handlers
  const handleMoveSystemUp = (index: number) => {
    if (index <= 0) return;
    const list = [...systemsList];
    const temp = list[index - 1];
    list[index - 1] = list[index];
    list[index] = temp;
    setSystemsList(list);
    localStorage.setItem('malaca_custom_systems', JSON.stringify(list));
    showToast('Ordem dos sistemas atualizada!');
  };

  const handleMoveSystemDown = (index: number) => {
    if (index >= systemsList.length - 1) return;
    const list = [...systemsList];
    const temp = list[index + 1];
    list[index + 1] = list[index];
    list[index] = temp;
    setSystemsList(list);
    localStorage.setItem('malaca_custom_systems', JSON.stringify(list));
    showToast('Ordem dos sistemas atualizada!');
  };

  // Create System Handler
  const handleCreateSystem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sysName.trim() || !sysSlug.trim()) {
      showToast('Preencha o Nome e o Slug do Sistema.');
      return;
    }
    const created = await ApiService.createSystem({
      name: sysName.trim().toUpperCase(),
      slug: sysSlug.trim().toLowerCase(),
      tag: sysTag.trim().toUpperCase() || 'SISTEMA RP',
      description: sysDescription.trim(),
      icon: sysIcon.trim() || 'fa-compass',
      image_url: sysImageUrl.trim() || '/images/gta_map_bg.webp',
      link: sysLink.trim() || 'mapa-interativo/',
      city_ids: sysCityIds,
      is_active: sysActive,
    });

    if (created) {
      showToast(`Sistema "${created.name}" criado com sucesso!`);
      setSysName('');
      setSysSlug('');
      setSysTag('');
      setSysDescription('');
      loadAdminData();
    }
  };

  // Delete System Handler
  const handleDeleteSystem = async (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o sistema "${name}"?`)) {
      const ok = await ApiService.deleteSystem(id);
      if (ok) {
        showToast(`Sistema "${name}" excluído.`);
        loadAdminData();
      }
    }
  };

  // Create Map Location Handler
  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingPinCoords) {
      showToast('Por favor, clique em "Marcar no Mapa" para selecionar a posição X e Y.');
      return;
    }

    const ok = await onSaveLocation({
      server_id: locServerId || serversList[0]?.id || 'cda-server-uuid',
      name: locName,
      category: locCategory,
      description: locDescription,
      image_url: locImageUrl || undefined,
      x: pendingPinCoords.x,
      y: pendingPinCoords.y,
      is_active: locIsActive,
    });

    if (ok) {
      setLocName('');
      setLocDescription('');
      setLocImageUrl('');
      showToast('Novo ponto criado no mapa com sucesso!');
    } else {
      showToast('Erro ao criar ponto no banco.');
    }
  };

  // Delete Comment Handler
  const handleDeleteComment = async (id: string) => {
    const ok = await ApiService.deleteComment(id);
    if (ok) {
      showToast('Comentário moderado e removido!');
      setCommentsList((prev) => prev.filter((c) => c.id !== id));
    } else {
      showToast('Erro ao excluir comentário.');
    }
  };

  // Reset Wanderer Cycle
  const handleResetCycle = async () => {
    const ok = await ApiService.resetWandererCycle();
    if (ok) {
      showToast('Ciclo do Andarilho reiniciado com sucesso! Todos os votos foram zerados.');
    } else {
      showToast('Erro ao reiniciar ciclo do Andarilho.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-cyan-600 text-white font-bold text-xs px-5 py-3 rounded-full shadow-2xl border border-cyan-400 z-50 animate-in fade-in duration-200">
          {toastMessage}
        </div>
      )}

      <div className="bg-slate-950 border border-slate-800/90 rounded-2xl w-[90vw] h-[90vh] max-w-[90vw] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl z-50">
        {/* Top Header Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-500 to-amber-600 p-[1.5px] shadow-md flex items-center justify-center">
              <img src="/images/platform_icon.png" alt="MALACA ICON" className="w-full h-full object-contain p-0.5" />
            </div>
            <div>
              <h2 className="font-extrabold text-white text-sm leading-tight">Painel Administrativo — Malaca System GTARP</h2>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Gestão de Cidades, Sistemas, Mapa & Moderação</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={() => setIsAuthenticated(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Sair do Painel"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Authentication Modal View */}
        {!isAuthenticated ? (
          <div className="p-10 flex flex-col items-center justify-center space-y-4 max-w-md mx-auto my-auto text-center">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-xl">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-xl text-white">Autenticação Administrativa</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Digite a chave máster para gerenciar cidades, criar sistemas, marcadores do mapa e moderação da plataforma.
            </p>

            <form onSubmit={handleLogin} className="w-full space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1 text-left">USUÁRIO ADMINISTRATIVO</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Digite o usuário (ex: malaca)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1 text-left">SENHA DE ACESSO</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="Digite a senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              {authError && (
                <p className="text-xs text-rose-400 font-semibold bg-rose-500/10 border border-rose-500/20 py-2 px-3 rounded-lg">
                  Usuário ou senha incorretos. Tente novamente.
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-cyan-500/25 mt-2"
              >
                Entrar no Painel Admin
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Admin Dashboard Layout */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-800 bg-slate-900/40 px-4 gap-1 overflow-x-auto">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'dashboard'
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </button>

              <button
                onClick={() => setActiveTab('cities')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'cities'
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building2 className="w-4 h-4 text-cyan-400" />
                Gerenciar Cidades ({serversList.length})
              </button>

              <button
                onClick={() => setActiveTab('systems')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'systems'
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-4 h-4 text-indigo-400" />
                Gerenciar Sistemas ({systemsList.length})
              </button>

              <button
                onClick={() => setActiveTab('locations')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'locations'
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <MapPin className="w-4 h-4 text-emerald-400" />
                Locais do Mapa ({locations.length})
              </button>

              <button
                onClick={() => setActiveTab('wanderer')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'wanderer'
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Clock className="w-4 h-4 text-amber-400" />
                Ciclo do Andarilho
              </button>

              <button
                onClick={() => setActiveTab('comments')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'comments'
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-blue-400" />
                Comentários ({commentsList.length})
              </button>

              <button
                onClick={() => setActiveTab('suggestions')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'suggestions'
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                Sugestões ({suggestions.length})
              </button>
            </div>

            {/* Tab Contents View */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* TAB 1: DASHBOARD OVERVIEW */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">CIDADES ATIVAS</span>
                      <span className="text-2xl font-black text-cyan-400 font-mono">{serversList.length}</span>
                      <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">CDA, Valley, Los Santos</p>
                    </div>

                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">SISTEMAS HABILITADOS</span>
                      <span className="text-2xl font-black text-indigo-400 font-mono">{systemsList.length}</span>
                      <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">Mapa, Minijogos</p>
                    </div>

                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">MARCAÇÕES NO MAPA</span>
                      <span className="text-2xl font-black text-emerald-400 font-mono">{locations.length}</span>
                      <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">Hospitais, Desmanches, Andarilho</p>
                    </div>

                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">COMENTÁRIOS DA COMUNIDADE</span>
                      <span className="text-2xl font-black text-amber-400 font-mono">{commentsList.length}</span>
                      <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">Mensagens enviadas</p>
                    </div>
                  </div>

                  <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800 space-y-3">
                    <h4 className="font-extrabold text-white text-sm">Resumo da Plataforma</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Use as abas acima para criar e gerenciar **Cidades**, vincular **Sistemas**, gerenciar **Pontos do Andarilho** e moderar **Comentários**.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: CIDADES (SERVERS) MANAGEMENT */}
              {activeTab === 'cities' && (
                <div className="space-y-6">
                  {/* Create City Form */}
                  <form onSubmit={handleCreateCity} className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-4">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <Plus className="w-4 h-4 text-cyan-400" />
                      Criar Nova Cidade na Plataforma
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Nome da Cidade *</label>
                        <input
                          type="text"
                          placeholder="Ex: CIDADE ALTA RP"
                          value={cityName}
                          onChange={(e) => setCityName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Slug / Rota Personalizada *</label>
                        <input
                          type="text"
                          placeholder="Ex: cda ou los-santos"
                          value={citySlug}
                          onChange={(e) => setCitySlug(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Subtítulo</label>
                        <input
                          type="text"
                          placeholder="Ex: SERVIDORES CDA & VALLEY"
                          value={citySubtitle}
                          onChange={(e) => setCitySubtitle(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">URL da Imagem do Banner</label>
                        <input
                          type="text"
                          placeholder="Ex: /images/hero_banner.jpg"
                          value={cityBannerUrl}
                          onChange={(e) => setCityBannerUrl(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-slate-400 font-semibold mb-1">Descrição Curta</label>
                        <textarea
                          placeholder="Descrição detalhada dos recursos da cidade..."
                          value={cityDescription}
                          onChange={(e) => setCityDescription(e.target.value)}
                          rows={2}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg hover:from-cyan-400 hover:to-indigo-500 transition-all flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Salvar Nova Cidade
                    </button>
                  </form>

                  {/* List of Existing Cities */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-white text-sm">Cidades Cadastradas ({serversList.length})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {serversList.map((c, idx) => (
                        <div key={c.id} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => handleMoveCityUp(idx)}
                                disabled={idx === 0}
                                className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
                                title="Mover para cima"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleMoveCityDown(idx)}
                                disabled={idx === serversList.length - 1}
                                className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
                                title="Mover para baixo"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>
                            <img src={c.banner_image_url || '/images/hero_banner.jpg'} alt={c.name} className="w-12 h-12 rounded-lg object-cover border border-slate-700" />
                            <div>
                              <h5 className="font-bold text-white text-xs">{c.name}</h5>
                              <span className="text-[10px] text-cyan-400 font-mono">/{c.slug}</span>
                              <p className="text-[11px] text-slate-400 line-clamp-1">{c.subtitle || c.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleStartEditCity(c)}
                              className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                              title="Editar Cidade"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleCityActive(c)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                                c.active !== false ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500'
                              }`}
                            >
                              {c.active !== false ? 'Ativa' : 'Inativa'}
                            </button>
                            <button
                              onClick={() => handleDeleteCity(c.id, c.name)}
                              className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors"
                              title="Excluir Cidade"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SISTEMAS MANAGEMENT */}
              {activeTab === 'systems' && (
                <div className="space-y-6">
                  {/* Create System Form */}
                  <form onSubmit={handleCreateSystem} className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-4">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <Plus className="w-4 h-4 text-indigo-400" />
                      Criar Novo Sistema na Plataforma
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Nome do Sistema *</label>
                        <input
                          type="text"
                          placeholder="Ex: HACKING DEVICE"
                          value={sysName}
                          onChange={(e) => setSysName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Slug / Identificador *</label>
                        <input
                          type="text"
                          placeholder="Ex: hacking"
                          value={sysSlug}
                          onChange={(e) => setSysSlug(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Tag / Categoria</label>
                        <input
                          type="text"
                          placeholder="Ex: CYBER TERMINAL"
                          value={sysTag}
                          onChange={(e) => setSysTag(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Link de Acesso</label>
                        <input
                          type="text"
                          placeholder="Ex: hacking/ ou mapa-interativo/"
                          value={sysLink}
                          onChange={(e) => setSysLink(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-slate-400 font-semibold mb-1.5">Vincular a Cidades Específicas</label>
                        <div className="flex flex-wrap gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800">
                          {serversList.map((server) => {
                            const isChecked = sysCityIds.includes(server.id) || sysCityIds.includes(server.slug);
                            return (
                              <label key={server.id} className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${
                                isChecked
                                  ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                              }`}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSysCityIds((prev) => [...prev, server.id]);
                                    } else {
                                      setSysCityIds((prev) => prev.filter((id) => id !== server.id && id !== server.slug));
                                    }
                                  }}
                                  className="hidden"
                                />
                                <Building2 className="w-3.5 h-3.5" />
                                {server.name}
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-slate-400 font-semibold mb-1">Descrição</label>
                        <textarea
                          placeholder="Descrição do funcionamento do sistema..."
                          value={sysDescription}
                          onChange={(e) => setSysDescription(e.target.value)}
                          rows={2}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs rounded-xl shadow-lg hover:from-indigo-400 hover:to-purple-500 transition-all flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Salvar Novo Sistema
                    </button>
                  </form>

                  {/* Existing Systems List */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-white text-sm">Sistemas Cadastrados ({systemsList.length})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {systemsList.map((sys, idx) => (
                        <div key={sys.id} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => handleMoveSystemUp(idx)}
                                disabled={idx === 0}
                                className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
                                title="Mover para cima"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleMoveSystemDown(idx)}
                                disabled={idx === systemsList.length - 1}
                                className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
                                title="Mover para baixo"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                              <i className={`fa-solid ${sys.icon}`}></i>
                            </div>
                            <div>
                              <h5 className="font-bold text-white text-xs">{sys.name}</h5>
                              <span className="text-[10px] text-indigo-400 font-mono">{sys.tag}</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {sys.city_ids && sys.city_ids.length > 0 ? (
                                  serversList
                                    .filter((serv) => sys.city_ids.includes(serv.id) || sys.city_ids.includes(serv.slug))
                                    .map((serv) => (
                                      <span key={serv.id} className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-bold border border-indigo-500/30">
                                        {serv.name}
                                      </span>
                                    ))
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px] font-bold">
                                    Todas as Cidades
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleStartEditSystem(sys)}
                              className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                              title="Editar Sistema"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSystem(sys.id, sys.name)}
                              className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors"
                              title="Excluir Sistema"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: LOCAIS DO MAPA */}
              {activeTab === 'locations' && (
                <div className="space-y-6">
                  {/* Pin Mode Bar */}
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-white text-sm flex items-center gap-2">
                        <LocateFixed className="w-4 h-4 text-emerald-400" />
                        Seleção de Coordenada no Mapa
                      </h4>
                      <p className="text-xs text-slate-400">
                        {pendingPinCoords ? (
                          <strong className="text-emerald-400">Posição Selecionada: X: {pendingPinCoords.x} | Y: {pendingPinCoords.y}</strong>
                        ) : (
                          'Clique no botão abaixo para selecionar a posição exata no mapa.'
                        )}
                      </p>
                    </div>
                    <button
                      onClick={onStartPinMode}
                      className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs rounded-xl flex items-center gap-2 transition-all"
                    >
                      <MapPin className="w-4 h-4" />
                      Marcar no Mapa
                    </button>
                  </div>

                  {/* Create Location Form */}
                  <form onSubmit={handleCreateLocation} className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-4">
                    <h4 className="font-bold text-white text-sm">Adicionar Novo Ponto no Mapa</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Nome do Local *</label>
                        <input
                          type="text"
                          placeholder="Ex: Hospital Ilegal Norte"
                          value={locName}
                          onChange={(e) => setLocName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Categoria *</label>
                        <select
                          value={locCategory}
                          onChange={(e) => setLocCategory(e.target.value as LocationCategory)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                        >
                          <option value="hospital_ilegal">Hospital Ilegal</option>
                          <option value="mercado_ilegal">Mercado Ilegal</option>
                          <option value="lavanderia_ilegal">Lavanderia Ilegal</option>
                          <option value="desmanche">Desmanche</option>
                          <option value="andarilho">Andarilho (Confirmado)</option>
                          <option value="local_possivel">Possível Local do Andarilho</option>
                          <option value="outros">Outros</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Cidade / Servidor</label>
                        <select
                          value={locServerId}
                          onChange={(e) => setLocServerId(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                        >
                          {serversList.map((s) => (
                            <option key={s.id} value={s.id}>{s.name} ({s.slug})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Descrição</label>
                        <input
                          type="text"
                          placeholder="Descrição opcional..."
                          value={locDescription}
                          onChange={(e) => setLocDescription(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs rounded-xl shadow-lg hover:from-emerald-400 hover:to-teal-500 transition-all flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Salvar Ponto no Mapa
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 5: CICLO DO ANDARILHO */}
              {activeTab === 'wanderer' && (
                <div className="space-y-6">
                  <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-3">
                    <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      Controle do Ciclo do Andarilho
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      O Andarilho troca de posição a cada virada de ciclo. Clique abaixo para zerar todas as confirmações da comunidade quando o Andarilho trocar de local.
                    </p>

                    <button
                      onClick={handleResetCycle}
                      className="px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs rounded-xl flex items-center gap-2 transition-all"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Zerar Todos os Votos do Ciclo
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 6: COMENTÁRIOS & MODERAÇÃO */}
              {activeTab === 'comments' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-white text-sm">Moderação de Comentários ({commentsList.length})</h4>
                  <div className="space-y-2">
                    {commentsList.map((comm) => (
                      <div key={comm.id} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">{comm.nickname}</span>
                            <span className="text-[10px] text-slate-500">{comm.created_at ? new Date(comm.created_at).toLocaleTimeString() : 'recente'}</span>
                          </div>
                          <p className="text-xs text-slate-300">{comm.content}</p>
                        </div>

                        <button
                          onClick={() => handleDeleteComment(comm.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors"
                          title="Excluir Comentário"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 7: SUGESTÕES */}
              {activeTab === 'suggestions' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-white text-sm">Sugestões Enviadas ({suggestions.length})</h4>
                  <div className="space-y-2">
                    {suggestions.map((sug) => (
                      <div key={sug.id} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">{sug.nickname}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">{sug.type}</span>
                            <span className="text-[10px] text-amber-400 font-bold uppercase">{sug.status}</span>
                          </div>
                          <p className="text-xs text-slate-300">{sug.content}</p>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onUpdateSuggestionStatus(sug.id, 'aceita')}
                            className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                            title="Aceitar Sugestão"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onUpdateSuggestionStatus(sug.id, 'recusada')}
                            className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors"
                            title="Recusar Sugestão"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
