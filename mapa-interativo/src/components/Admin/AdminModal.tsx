import React, { useState, useEffect } from 'react';
import type { Server, System, MapLocation, Suggestion, LocationCategory, SuggestionStatus, UserProfile, AccessLog, PlatformSettings } from '../../types';
import { ApiService } from '../../services/api';
import { AuthService, checkAdminPermission, extractDiscordId, DEFAULT_ADMIN_DISCORD_IDS } from '../../services/auth';
import { calculateWandererCycle } from '../../utils/wandererCycle';
import { RealtimeSync } from '../../services/realtimeSync';
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
  Users,
  Settings,
  Activity,
  Search,
  ShieldCheck,
  ShieldAlert,
  Ban,
  Megaphone,
  ToggleLeft,
  ToggleRight,
  Radio,
  Bell,
} from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserProfile | null;
  servers?: Server[];
  initialServers?: Server[];
  locations?: MapLocation[];
  suggestions?: Suggestion[];
  onSaveLocation?: (location: Omit<MapLocation, 'id'>) => Promise<boolean | MapLocation | null> | void;
  onUpdateLocation?: (id: string, updates: Partial<MapLocation>) => Promise<boolean> | void;
  onAddLocation?: (location: Omit<MapLocation, 'id' | 'created_at'>) => void;
  onDeleteLocation?: (id: string) => Promise<boolean> | void;
  onUpdateSuggestionStatus?: (id: string, status: SuggestionStatus) => Promise<boolean> | void;
  onDeleteSuggestion?: (id: string) => Promise<boolean> | void;
  onStartPinMode?: () => void;
  pendingPinCoords?: { x: number; y: number } | null;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  user,
  servers,
  initialServers,
  locations = [],
  suggestions = [],
  onSaveLocation,
  onUpdateLocation,
  onAddLocation,
  onDeleteLocation,
  onUpdateSuggestionStatus,
  onDeleteSuggestion,
  onStartPinMode,
  pendingPinCoords,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = user || AuthService.getSavedProfile();
    return saved ? (checkAdminPermission(saved) || DEFAULT_ADMIN_DISCORD_IDS.includes(extractDiscordId(saved))) : false;
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'cities' | 'systems' | 'locations' | 'wanderer' | 'suggestions' | 'users' | 'access_logs' | 'settings'>('dashboard');

  // Safe Array Guarantees
  const rawServers = servers || initialServers || [];
  const safeInitialServers = Array.isArray(rawServers) ? rawServers : [];
  const safeLocations = Array.isArray(locations) ? locations : [];
  const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];

  // Dynamic Data State
  const [serversList, setServersList] = useState<Server[]>(safeInitialServers);
  const [systemsList, setSystemsList] = useState<System[]>([]);
  const [profilesList, setProfilesList] = useState<UserProfile[]>([]);
  const [accessLogsList, setAccessLogsList] = useState<AccessLog[]>([]);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    maintenance_mode: false,
    maintenance_message: 'Plataforma em manutenção para melhorias no servidor.',
    global_announcement: '',
    announcement_active: false,
    announcement_type: 'info',
    disabled_systems: [],
    require_auth_for_interactive_map: false,
  });
  const [userSearchQuery, setUserSearchQuery] = useState('');

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

  // Location Form & Management State
  const [editingLocation, setEditingLocation] = useState<MapLocation | null>(null);
  const [locName, setLocName] = useState('');
  const [locCategory, setLocCategory] = useState<LocationCategory>('hospital_ilegal');
  const [locDescription, setLocDescription] = useState('');
  const [locImageUrl, setLocImageUrl] = useState('');
  const [locServerId, setLocServerId] = useState(safeInitialServers[0]?.id || 'cda-server-uuid');
  const [locIsActive, setLocIsActive] = useState(true);
  const [locX, setLocX] = useState<number | ''>('');
  const [locY, setLocY] = useState<number | ''>('');
  const [locSearchText, setLocSearchText] = useState('');
  const [locFilterCategory, setLocFilterCategory] = useState<string>('all');
  const [locFilterServer, setLocFilterServer] = useState<string>('all');

  // Update locX / locY when pendingPinCoords changes
  useEffect(() => {
    if (pendingPinCoords) {
      setLocX(pendingPinCoords.x);
      setLocY(pendingPinCoords.y);
    }
  }, [pendingPinCoords]);

  // Toast Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit State
  const [editingCity, setEditingCity] = useState<Server | null>(null);
  const [editingSystem, setEditingSystem] = useState<System | null>(null);
  const [accessDeniedUser, setAccessDeniedUser] = useState<any | null>(null);

  useEffect(() => {
    const current = user || AuthService.getSavedProfile();
    if (current && (checkAdminPermission(current) || DEFAULT_ADMIN_DISCORD_IDS.includes(extractDiscordId(current)))) {
      setIsAuthenticated(true);
      setAccessDeniedUser(null);
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (isOpen) {
      checkDiscordAdminSession();
      loadAdminData();
    }
  }, [isOpen]);

  // Realtime Sync Subscription for Admin Data
  useEffect(() => {
    if (!isOpen || !isAuthenticated) return;
    const unsubProfiles = RealtimeSync.onProfilesChange(() => {
      ApiService.fetchProfiles().then(setProfilesList);
    });
    const unsubSettings = RealtimeSync.onSettingsChange(() => {
      ApiService.fetchPlatformSettings().then(setPlatformSettings);
    });
    return () => {
      unsubProfiles();
      unsubSettings();
    };
  }, [isOpen, isAuthenticated]);

  const checkDiscordAdminSession = async () => {
    try {
      const savedProfile = user || AuthService.getSavedProfile();
      if (savedProfile) {
        if (checkAdminPermission(savedProfile) || DEFAULT_ADMIN_DISCORD_IDS.includes(extractDiscordId(savedProfile))) {
          setIsAuthenticated(true);
          setAccessDeniedUser(null);
          return;
        } else {
          setAccessDeniedUser(savedProfile);
        }
      }
      const synced = await AuthService.syncDiscordUser();
      if (synced) {
        if (checkAdminPermission(synced) || DEFAULT_ADMIN_DISCORD_IDS.includes(extractDiscordId(synced))) {
          setIsAuthenticated(true);
          setAccessDeniedUser(null);
        } else {
          setAccessDeniedUser(synced);
        }
      }
    } catch (e) {
      console.error('Error checking Discord Admin session:', e);
    }
  };

  const loadAdminData = async () => {
    try {
      const [s, sys, profs, logs, sets] = await Promise.all([
        ApiService.fetchServers(),
        ApiService.fetchSystems(),
        ApiService.fetchProfiles(),
        ApiService.fetchAccessLogs(),
        ApiService.fetchPlatformSettings(),
      ]);
      setServersList(Array.isArray(s) ? s : []);
      setSystemsList(Array.isArray(sys) ? sys : []);
      setProfilesList(Array.isArray(profs) ? profs : []);
      setAccessLogsList(Array.isArray(logs) ? logs : []);
      if (sets) setPlatformSettings(sets);
    } catch (e) {
      console.error('Error loading admin data:', e);
    }
  };


  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const u = username.trim().toLowerCase();
    const p = password.trim();
    if (
      (u === 'malaca' && p === '199425') ||
      (u === 'admin' && (p === 'cidadealta123' || p === 'admin')) ||
      (u === '722320491767136346') ||
      (p === '722320491767136346' || p === '199425')
    ) {
      setIsAuthenticated(true);
      setAuthError(false);
      setAccessDeniedUser(null);
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

  // Location Edit & Management Handlers
  const handleStartEditLocation = (loc: MapLocation) => {
    setEditingLocation(loc);
    setLocName(loc.name);
    setLocCategory(loc.category);
    setLocDescription(loc.description || '');
    setLocImageUrl(loc.image_url || '');
    setLocServerId(loc.server_id);
    setLocIsActive(loc.is_active !== false);
    setLocX(loc.x);
    setLocY(loc.y);
  };

  const handleCancelEditLocation = () => {
    setEditingLocation(null);
    setLocName('');
    setLocDescription('');
    setLocImageUrl('');
    setLocX('');
    setLocY('');
  };

  const handleSaveLocationForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalX = typeof locX === 'number' ? locX : (pendingPinCoords ? pendingPinCoords.x : 500);
    const finalY = typeof locY === 'number' ? locY : (pendingPinCoords ? pendingPinCoords.y : 500);

    if (editingLocation) {
      const updates: Partial<MapLocation> = {
        name: locName,
        category: locCategory,
        description: locDescription,
        image_url: locImageUrl || undefined,
        server_id: locServerId,
        is_active: locIsActive,
        x: finalX,
        y: finalY,
      };

      const ok = onUpdateLocation
        ? await onUpdateLocation(editingLocation.id, updates)
        : await ApiService.updateLocation(editingLocation.id, updates);

      if (ok) {
        showToast(`Ponto "${locName}" atualizado com sucesso!`);
        handleCancelEditLocation();
      } else {
        showToast('Erro ao atualizar ponto no banco.');
      }
    } else {
      const ok = onSaveLocation
        ? await onSaveLocation({
            server_id: locServerId || serversList[0]?.id || 'cda-server-uuid',
            name: locName,
            category: locCategory,
            description: locDescription,
            image_url: locImageUrl || undefined,
            x: finalX,
            y: finalY,
            is_active: locIsActive,
          })
        : await ApiService.createLocation({
            server_id: locServerId || serversList[0]?.id || 'cda-server-uuid',
            name: locName,
            category: locCategory,
            description: locDescription,
            image_url: locImageUrl || undefined,
            x: finalX,
            y: finalY,
            is_active: locIsActive,
          });

      if (ok) {
        showToast('Novo ponto criado no mapa com sucesso!');
        handleCancelEditLocation();
      } else {
        showToast('Erro ao criar ponto no banco.');
      }
    }
  };

  const handleDeleteLocation = async (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o ponto "${name}" do mapa?`)) {
      const ok = onDeleteLocation ? await onDeleteLocation(id) : await ApiService.deleteLocation(id);
      if (ok) {
        showToast(`Ponto "${name}" excluído do mapa!`);
        if (editingLocation?.id === id) {
          handleCancelEditLocation();
        }
      } else {
        showToast('Erro ao excluir ponto do mapa.');
      }
    }
  };

  // Delete Suggestion Handler
  const handleDeleteSuggestion = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta sugestão?')) {
      const ok = await ApiService.deleteSuggestion(id);
      if (ok) {
        showToast('Sugestão excluída com sucesso!');
        if (onDeleteSuggestion) onDeleteSuggestion(id);
      } else {
        showToast('Erro ao excluir sugestão.');
      }
    }
  };

  // Clear Access Logs Handler
  const handleClearAccessLogs = async () => {
    if (confirm('Tem certeza que deseja limpar todo o histórico de logs de acesso?')) {
      const ok = await ApiService.clearAccessLogs();
      if (ok) {
        setAccessLogsList([]);
        showToast('Histórico de acessos limpo com sucesso!');
      } else {
        showToast('Erro ao limpar histórico de acessos.');
      }
    }
  };

  // Reset Wanderer Cycle (Zera votos e sincroniza instantaneamente todas as telas abertas)
  const handleResetCycle = async () => {
    const ok = await ApiService.resetWandererCycle('admin_manual');
    if (ok) {
      showToast('Ciclo do Andarilho reiniciado com sucesso! Todos os votos foram zerados em todas as telas.');
    } else {
      showToast('Erro ao reiniciar ciclo do Andarilho.');
    }
  };

  // --- Handlers para Usuários & Permissões ---
  const handleToggleAdmin = async (u: UserProfile) => {
    if (u.discord_id === '722320491767136346' || u.id === '722320491767136346') {
      showToast('O fundador principal não pode ter sua permissão alterada.');
      return;
    }
    const newAdmin = !u.is_admin;
    const newRole = newAdmin ? 'admin' : 'user';
    const ok = await ApiService.updateProfile(u.id, {
      is_admin: newAdmin,
      role: newRole,
    });
    if (ok) {
      showToast(`Permissão do usuário @${u.username} atualizada para: ${newAdmin ? 'ADMINISTRADOR' : 'USUÁRIO'}`);
      setProfilesList((prev) =>
        prev.map((item) => (item.id === u.id ? { ...item, is_admin: newAdmin, role: newRole } : item))
      );
    } else {
      showToast('Falha ao atualizar cargo do usuário.');
    }
  };

  const handleToggleBan = async (u: UserProfile) => {
    if (u.discord_id === '722320491767136346' || u.id === '722320491767136346') {
      showToast('O fundador principal não pode ser banido.');
      return;
    }
    const newBanned = !u.is_banned;
    const updates: Partial<UserProfile> = {
      is_banned: newBanned,
      role: newBanned ? 'banned' : 'user',
      ...(newBanned ? { is_admin: false } : {}),
    };
    const ok = await ApiService.updateProfile(u.id, updates);
    if (ok) {
      showToast(`Usuário @${u.username} ${newBanned ? 'BANIDO' : 'DESBANIDO'} com sucesso.`);
      setProfilesList((prev) =>
        prev.map((item) => (item.id === u.id ? { ...item, ...updates } : item))
      );
    } else {
      showToast('Falha ao alterar status de banimento.');
    }
  };

  const handleChangeRole = async (u: UserProfile, newRole: 'admin' | 'moderator' | 'user' | 'vip') => {
    const ok = await ApiService.updateProfile(u.id, {
      role: newRole,
      is_admin: newRole === 'admin',
    });
    if (ok) {
      showToast(`Cargo de @${u.username} alterado para ${newRole.toUpperCase()}`);
      setProfilesList((prev) =>
        prev.map((item) => (item.id === u.id ? { ...item, role: newRole, is_admin: newRole === 'admin' } : item))
      );
    } else {
      showToast('Falha ao alterar cargo.');
    }
  };

  const handleDeleteUser = async (u: UserProfile) => {
    if (confirm(`Excluir permanentemente o perfil do usuário @${u.username}?`)) {
      const ok = await ApiService.deleteProfile(u.id);
      if (ok) {
        showToast(`Perfil de @${u.username} removido.`);
        setProfilesList((prev) => prev.filter((item) => item.id !== u.id));
      } else {
        showToast('Falha ao remover usuário.');
      }
    }
  };

  // --- Handlers para Opções da Plataforma ---
  const handleSaveAnnouncement = async (announcement: string, active: boolean, type: 'info' | 'warning' | 'alert' | 'success') => {
    const ok = await ApiService.updatePlatformSettings({
      global_announcement: announcement,
      announcement_active: active,
      announcement_type: type,
    });
    if (ok) {
      showToast('Anúncio global atualizado e sincronizado em tempo real!');
      setPlatformSettings((prev) => ({
        ...prev,
        global_announcement: announcement,
        announcement_active: active,
        announcement_type: type,
      }));
    } else {
      showToast('Erro ao atualizar anúncio global.');
    }
  };

  const handleToggleMaintenance = async (active: boolean, message: string) => {
    const ok = await ApiService.updatePlatformSettings({
      maintenance_mode: active,
      maintenance_message: message,
    });
    if (ok) {
      showToast(active ? 'Modo de Manutenção ATIVADO em tempo real!' : 'Modo de Manutenção DESATIVADO.');
      setPlatformSettings((prev) => ({
        ...prev,
        maintenance_mode: active,
        maintenance_message: message,
      }));
    } else {
      showToast('Erro ao atualizar modo de manutenção.');
    }
  };

  const handleToggleSystemDisabled = async (slug: string) => {
    const current = platformSettings.disabled_systems || [];
    const isCurrentlyDisabled = current.includes(slug);
    const updated = isCurrentlyDisabled ? current.filter((s) => s !== slug) : [...current, slug];
    const ok = await ApiService.updatePlatformSettings({ disabled_systems: updated });
    if (ok) {
      showToast(`Sistema "${slug}" ${isCurrentlyDisabled ? 'HABILITADO' : 'DESABILITADO'}`);
      setPlatformSettings((prev) => ({ ...prev, disabled_systems: updated }));
    }
  };

  const handleToggleRequireAuth = async (val: boolean) => {
    const ok = await ApiService.updatePlatformSettings({ require_auth_for_interactive_map: val });
    if (ok) {
      showToast(`Exigir Login Discord para usar o mapa: ${val ? 'ATIVADO' : 'DESATIVADO'}`);
      setPlatformSettings((prev) => ({ ...prev, require_auth_for_interactive_map: val }));
    }
  };


  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-[#00d2ff] text-white font-bold text-xs px-5 py-3 rounded-full shadow-2xl border border-[#38bdf8] z-50 animate-in fade-in duration-200">
          {toastMessage}
        </div>
      )}

      <div className="bg-[#060d1a] border border-[#00d2ff]/35 rounded-2xl w-[90vw] h-[90vh] max-w-[90vw] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl z-50">
        {/* Top Header Bar */}
        <div className="p-4 border-b border-[#00d2ff]/20 flex items-center justify-between bg-[#000000]/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00d2ff] to-[#38bdf8] p-[1.5px] shadow-md flex items-center justify-center">
              <img src="/images/platform_icon.png" alt="MALACA ICON" className="w-full h-full object-contain p-0.5" />
            </div>
            <div>
              <h2 className="font-extrabold text-white text-sm leading-tight">Painel Administrativo — Malaca System GTARP</h2>
              <p className="text-[10px] text-[#7dd3fc] font-semibold uppercase tracking-wider">Gestão de Cidades, Sistemas, Mapa & Moderação</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={() => setIsAuthenticated(false)}
                className="px-3 py-1.5 rounded-lg bg-[#000000] border border-slate-800 text-slate-400 hover:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
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
          <div className="p-8 flex flex-col items-center justify-center max-w-md mx-auto my-auto text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-[#5865F2]/20 border border-[#5865F2]/40 flex items-center justify-center text-[#5865F2] shadow-xl">
              <i className="fa-brands fa-discord text-3xl"></i>
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-white">Autenticação Administrativa</h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Acesse o painel de gestão através da sua conta autorizada do Discord.
              </p>
            </div>

            {accessDeniedUser && (
              <div className="w-full p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold text-left flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-rose-200">Acesso Negado</div>
                  A conta <span className="underline font-bold text-white">{accessDeniedUser.username || accessDeniedUser.email || 'Discord'}</span> não possui permissão de Administrador nesta plataforma.
                </div>
              </div>
            )}

            <button
              onClick={() => {
                sessionStorage.setItem('malaca_open_admin_after_auth', '1');
                AuthService.loginWithDiscord();
              }}
              className="w-full py-3.5 px-6 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-3 transition-all shadow-lg shadow-[#5865F2]/25"
            >
              <i className="fa-brands fa-discord text-lg"></i>
              <span>Entrar com Discord (Admin)</span>
            </button>

            <details className="w-full text-left pt-2">
              <summary className="text-[11px] text-slate-500 hover:text-slate-300 cursor-pointer font-semibold py-1 transition-colors text-center">
                Opção de emergência (Senha Mestra)
              </summary>
              <form onSubmit={handleLogin} className="mt-3 space-y-3 bg-[#000000]/60 p-4 rounded-xl border border-slate-800">
                <input
                  type="text"
                  placeholder="Usuário (ex: malaca)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#000000] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
                <input
                  type="password"
                  placeholder="Senha máster"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#000000] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
                {authError && (
                  <p className="text-xs text-rose-400 font-semibold">Usuário ou senha incorretos.</p>
                )}
                <button
                  type="submit"
                  className="w-full py-2 bg-[#00d2ff] hover:bg-[#38bdf8] text-black font-bold rounded-xl text-xs"
                >
                  Entrar com Senha
                </button>
              </form>
            </details>
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
                    ? 'border-[#00d2ff] text-[#38bdf8] bg-[#00d2ff]/15'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'users'
                    ? 'border-[#5865F2] text-[#818cf8] bg-[#5865F2]/15'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-4 h-4 text-[#818cf8]" />
                Usuários & Cargos ({profilesList.length})
              </button>

              <button
                onClick={() => setActiveTab('access_logs')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'access_logs'
                    ? 'border-emerald-500 text-emerald-400 bg-emerald-500/15'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Activity className="w-4 h-4 text-emerald-400" />
                Auditoria de Acessos ({accessLogsList.length})
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'border-amber-500 text-amber-400 bg-amber-500/15'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Settings className="w-4 h-4 text-amber-400" />
                Opções da Plataforma
              </button>

              <button
                onClick={() => setActiveTab('cities')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'cities'
                    ? 'border-[#00d2ff] text-[#38bdf8] bg-[#00d2ff]/15'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building2 className="w-4 h-4 text-[#00d2ff]" />
                Cidades ({serversList.length})
              </button>

              <button
                onClick={() => setActiveTab('systems')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'systems'
                    ? 'border-[#00d2ff] text-[#38bdf8] bg-[#00d2ff]/15'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-4 h-4 text-[#38bdf8]" />
                Sistemas ({systemsList.length})
              </button>

              <button
                onClick={() => setActiveTab('locations')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'locations'
                    ? 'border-[#00d2ff] text-[#38bdf8] bg-[#00d2ff]/15'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <MapPin className="w-4 h-4 text-[#00d2ff]" />
                Locais do Mapa ({locations.length})
              </button>

              <button
                onClick={() => setActiveTab('wanderer')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'wanderer'
                    ? 'border-[#00d2ff] text-[#38bdf8] bg-[#00d2ff]/15'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Clock className="w-4 h-4 text-[#38bdf8]" />
                Andarilho
              </button>

            </div>

            {/* Tab Contents View */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* TAB 1: DASHBOARD OVERVIEW */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  {/* Top Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#060d1a] p-4 rounded-xl border border-[#5865F2]/40 space-y-1 relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">USUÁRIOS DISCORD</span>
                        <Users className="w-4 h-4 text-[#5865F2]" />
                      </div>
                      <span className="text-2xl font-black text-[#818cf8] font-mono">{profilesList.length}</span>
                      <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                        {profilesList.filter((p) => p.is_admin || p.role === 'admin').length} Administradores
                      </p>
                    </div>

                    <div className="bg-[#060d1a] p-4 rounded-xl border border-emerald-500/30 space-y-1 relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">ACESSOS REGISTRADOS</span>
                        <Activity className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="text-2xl font-black text-emerald-400 font-mono">{accessLogsList.length}</span>
                      <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">Sessões gravadas no Supabase</p>
                    </div>

                    <div className="bg-[#060d1a] p-4 rounded-xl border border-[#00d2ff]/20 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">CIDADES ATIVAS</span>
                        <Building2 className="w-4 h-4 text-[#00d2ff]" />
                      </div>
                      <span className="text-2xl font-black text-[#00d2ff] font-mono">{serversList.length}</span>
                      <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">Cidades & Servidores RP</p>
                    </div>

                    <div className="bg-[#060d1a] p-4 rounded-xl border border-[#00d2ff]/20 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">MARCAÇÕES NO MAPA</span>
                        <MapPin className="w-4 h-4 text-[#00d2ff]" />
                      </div>
                      <span className="text-2xl font-black text-[#00d2ff] font-mono">{locations.length}</span>
                      <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">Hospitais, Desmanches, Andarilho</p>
                    </div>
                  </div>

                  {/* Secondary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#060d1a] p-4 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">SISTEMAS HABILITADOS</span>
                      <span className="text-xl font-black text-white font-mono">{systemsList.length}</span>
                      <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">Mapa, Lockpick, Caixinha, Hacking</p>
                    </div>

                    <div className="bg-[#060d1a] p-4 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">PONTOS CADASTRADOS</span>
                      <span className="text-xl font-black text-white font-mono">{safeLocations.length}</span>
                      <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">Locais ativos e marcações</p>
                    </div>

                    <div className="bg-[#060d1a] p-4 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">SUGESTÕES RECEBIDAS</span>
                      <span className="text-xl font-black text-white font-mono">{suggestions.length}</span>
                      <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">Feedback dos jogadores</p>
                    </div>

                    <div className="bg-[#060d1a] p-4 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">SINCRONIZAÇÃO REALTIME</span>
                      <span className="text-xl font-black text-emerald-400 font-mono flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" /> ATIVA
                      </span>
                      <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">Supabase & Broadcast</p>
                    </div>
                  </div>

                  {/* Banner & Platform Status Overview */}
                  <div className="bg-gradient-to-r from-[#060d1a] via-[#0b1329] to-[#060d1a] p-5 rounded-xl border border-[#00d2ff]/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[#00d2ff]" />
                        Status da Infraestrutura & Acesso Administrativo
                      </h4>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30">
                        ADMIN MASTER CONECTADO
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Gerencie tudo através das abas de navegação acima: atribua cargos de Administrador a usuários do Discord, acompanhe auditoria de acessos em tempo real, defina avisos e alertas globais para todos os visitantes do site e ative/desative sistemas dinamicamente.
                    </p>
                  </div>
                </div>
              )}


              {/* TAB 2: CIDADES (SERVERS) MANAGEMENT */}
              {activeTab === 'cities' && (
                <div className="space-y-6">
                  {/* Create City Form */}
                  <form onSubmit={handleCreateCity} className="bg-[#060d1a] p-5 rounded-xl border border-[#00d2ff]/25 space-y-4">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <Plus className="w-4 h-4 text-[#00d2ff]" />
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
                          className="w-full bg-[#000000] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#00d2ff]"
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
                          className="w-full bg-[#000000] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#00d2ff]"
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
                          className="w-full bg-[#000000] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#00d2ff]"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">URL da Imagem do Banner</label>
                        <input
                          type="text"
                          placeholder="Ex: /images/hero_banner.jpg"
                          value={cityBannerUrl}
                          onChange={(e) => setCityBannerUrl(e.target.value)}
                          className="w-full bg-[#000000] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#00d2ff]"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-slate-400 font-semibold mb-1">Descrição Curta</label>
                        <textarea
                          placeholder="Descrição detalhada dos recursos da cidade..."
                          value={cityDescription}
                          onChange={(e) => setCityDescription(e.target.value)}
                          rows={2}
                          className="w-full bg-[#000000] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#00d2ff]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-gradient-to-r from-[#00d2ff] via-[#2563eb] to-[#38bdf8] text-white font-bold text-xs rounded-xl shadow-lg hover:from-[#00d2ff] hover:to-[#38bdf8] transition-all flex items-center gap-2"
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
                        <div key={c.id} className="bg-[#060d1a] p-4 rounded-xl border border-[#00d2ff]/20 flex items-center justify-between gap-3">
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
                            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                              <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                              <h5 className="font-bold text-white text-xs">{c.name}</h5>
                              <span className="text-[10px] text-[#38bdf8] font-mono">/{c.slug}</span>
                              <p className="text-[11px] text-slate-400 line-clamp-1">{c.subtitle || c.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleStartEditCity(c)}
                              className="p-1.5 rounded-lg bg-[#00d2ff]/15 border border-[#00d2ff]/30 text-[#38bdf8] hover:bg-[#00d2ff]/25 transition-colors"
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
                  <form onSubmit={handleCreateSystem} className="bg-[#060d1a] p-5 rounded-xl border border-[#00d2ff]/25 space-y-4">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <Plus className="w-4 h-4 text-[#00d2ff]" />
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
                          className="w-full bg-[#000000] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#00d2ff]"
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
                          className="w-full bg-[#000000] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#00d2ff]"
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
                          className="w-full bg-[#000000] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#00d2ff]"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Link de Acesso</label>
                        <input
                          type="text"
                          placeholder="Ex: hacking/ ou mapa-interativo/"
                          value={sysLink}
                          onChange={(e) => setSysLink(e.target.value)}
                          className="w-full bg-[#000000] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#00d2ff]"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-slate-400 font-semibold mb-1.5">Vincular a Cidades Específicas</label>
                        <div className="flex flex-wrap gap-2 bg-[#000000] p-3 rounded-lg border border-slate-800">
                          {serversList.map((server) => {
                            const isChecked = sysCityIds.includes(server.id) || sysCityIds.includes(server.slug);
                            return (
                              <label key={server.id} className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${
                                isChecked
                                  ? 'bg-[#00d2ff]/20 border-[#00d2ff]/50 text-[#38bdf8]'
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
                          className="w-full bg-[#000000] border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#00d2ff]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-gradient-to-r from-[#00d2ff] via-[#2563eb] to-[#38bdf8] text-white font-bold text-xs rounded-xl shadow-lg hover:from-[#00d2ff] hover:to-[#38bdf8] transition-all flex items-center gap-2"
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
                        <div key={sys.id} className="bg-[#060d1a] p-4 rounded-xl border border-[#00d2ff]/20 flex items-center justify-between gap-3">
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
                            <div className="w-10 h-10 rounded-lg bg-[#00d2ff]/15 border border-[#00d2ff]/30 flex items-center justify-center text-[#38bdf8] font-bold">
                              <i className={`fa-solid ${sys.icon}`}></i>
                            </div>
                            <div>
                              <h5 className="font-bold text-white text-xs">{sys.name}</h5>
                              <span className="text-[10px] text-[#00d2ff] font-mono">{sys.tag}</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {sys.city_ids && sys.city_ids.length > 0 ? (
                                  serversList
                                    .filter((serv) => sys.city_ids.includes(serv.id) || sys.city_ids.includes(serv.slug))
                                    .map((serv) => (
                                      <span key={serv.id} className="px-1.5 py-0.5 rounded bg-[#00d2ff]/20 text-[#38bdf8] text-[9px] font-bold border border-[#00d2ff]/30">
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
                              className="p-1.5 rounded-lg bg-[#00d2ff]/15 border border-[#00d2ff]/30 text-[#38bdf8] hover:bg-[#00d2ff]/25 transition-colors"
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
              {activeTab === 'locations' && (() => {
                const filteredLocs = locations.filter((loc) => {
                  const matchText = !locSearchText || 
                    loc.name.toLowerCase().includes(locSearchText.toLowerCase()) ||
                    (loc.description && loc.description.toLowerCase().includes(locSearchText.toLowerCase()));
                  const matchCat = locFilterCategory === 'all' || loc.category === locFilterCategory;
                  const matchServer = locFilterServer === 'all' || loc.server_id === locFilterServer;
                  return matchText && matchCat && matchServer;
                });

                return (
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
                            'Clique no botão para marcar uma coordenada clicando no mapa interativo ou digite X/Y abaixo.'
                          )}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={onStartPinMode}
                        className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs rounded-xl flex items-center gap-2 transition-all"
                      >
                        <MapPin className="w-4 h-4" />
                        Marcar no Mapa
                      </button>
                    </div>

                    {/* Create / Edit Location Form */}
                    <form onSubmit={handleSaveLocationForm} className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-white text-sm flex items-center gap-2">
                          {editingLocation ? (
                            <>
                              <Edit2 className="w-4 h-4 text-[#38bdf8]" />
                              <span>Editar Ponto: <strong className="text-[#38bdf8]">{editingLocation.name}</strong></span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 text-emerald-400" />
                              <span>Adicionar Novo Ponto no Mapa</span>
                            </>
                          )}
                        </h4>
                        {editingLocation && (
                          <button
                            type="button"
                            onClick={handleCancelEditLocation}
                            className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-800"
                          >
                            Cancelar Edição
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
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
                          <label className="block text-slate-400 font-semibold mb-1">Coordenada X *</label>
                          <input
                            type="number"
                            placeholder="Ex: 500"
                            value={locX}
                            onChange={(e) => setLocX(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">Coordenada Y *</label>
                          <input
                            type="number"
                            placeholder="Ex: 500"
                            value={locY}
                            onChange={(e) => setLocY(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 font-semibold mb-1">Status de Exibição</label>
                          <div className="flex items-center gap-2 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                              <input
                                type="checkbox"
                                checked={locIsActive}
                                onChange={(e) => setLocIsActive(e.target.checked)}
                                className="accent-emerald-500 w-4 h-4 cursor-pointer"
                              />
                              <span>Exibir Ponto no Mapa</span>
                            </label>
                          </div>
                        </div>

                        <div className="md:col-span-2 lg:col-span-3">
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

                      <div className="flex items-center gap-3">
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs rounded-xl shadow-lg hover:from-emerald-400 hover:to-teal-500 transition-all flex items-center gap-2"
                        >
                          {editingLocation ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                          {editingLocation ? 'Salvar Alterações do Ponto' : 'Salvar Novo Ponto no Mapa'}
                        </button>

                        {editingLocation && (
                          <button
                            type="button"
                            onClick={handleCancelEditLocation}
                            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </form>

                    {/* Locations Management & Filter List */}
                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#060d1a] p-4 rounded-xl border border-slate-800">
                        <div className="relative flex-1">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Buscar ponto por nome ou descrição..."
                            value={locSearchText}
                            onChange={(e) => setLocSearchText(e.target.value)}
                            className="w-full bg-[#000000] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00d2ff]"
                          />
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <select
                            value={locFilterCategory}
                            onChange={(e) => setLocFilterCategory(e.target.value)}
                            className="bg-[#000000] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
                          >
                            <option value="all">Todas Categorias</option>
                            <option value="hospital_ilegal">Hospital Ilegal</option>
                            <option value="mercado_ilegal">Mercado Ilegal</option>
                            <option value="lavanderia_ilegal">Lavanderia Ilegal</option>
                            <option value="desmanche">Desmanche</option>
                            <option value="andarilho">Andarilho</option>
                            <option value="local_possivel">Possível Andarilho</option>
                            <option value="outros">Outros</option>
                          </select>

                          <select
                            value={locFilterServer}
                            onChange={(e) => setLocFilterServer(e.target.value)}
                            className="bg-[#000000] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
                          >
                            <option value="all">Todas as Cidades</option>
                            {serversList.map((s) => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                        <span>Exibindo <strong>{filteredLocs.length}</strong> de <strong>{locations.length}</strong> pontos cadastrados</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredLocs.length === 0 ? (
                          <div className="col-span-full py-10 text-center text-slate-500 text-xs font-semibold">
                            Nenhum ponto encontrado com os filtros selecionados.
                          </div>
                        ) : (
                          filteredLocs.map((loc) => {
                            const isWanderer = loc.category === 'andarilho' || loc.category === 'local_possivel';
                            return (
                              <div
                                key={loc.id}
                                className={`bg-[#060d1a] p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                                  editingLocation?.id === loc.id
                                    ? 'border-[#00d2ff] bg-[#00d2ff]/5'
                                    : 'border-slate-800 hover:border-slate-700'
                                }`}
                              >
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                                      loc.category === 'hospital_ilegal' ? 'bg-rose-500/15 border-rose-500/30 text-rose-300' :
                                      loc.category === 'mercado_ilegal' ? 'bg-amber-500/15 border-amber-500/30 text-amber-300' :
                                      loc.category === 'lavanderia_ilegal' ? 'bg-blue-500/15 border-blue-500/30 text-blue-300' :
                                      loc.category === 'desmanche' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' :
                                      isWanderer ? 'bg-purple-500/15 border-purple-500/30 text-purple-300' :
                                      'bg-slate-800 border-slate-700 text-slate-300'
                                    }`}>
                                      {loc.category.replace('_', ' ')}
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-400 bg-black/60 px-2 py-0.5 rounded border border-slate-800">
                                      X: {loc.x} | Y: {loc.y}
                                    </span>
                                  </div>

                                  <h5 className="font-extrabold text-white text-xs mt-1">{loc.name}</h5>
                                  {loc.description && (
                                    <p className="text-[11px] text-slate-400 line-clamp-2">{loc.description}</p>
                                  )}

                                  {isWanderer && (
                                    <div className="text-[10px] text-purple-300 font-mono font-bold flex items-center gap-1 pt-1">
                                      <Clock className="w-3 h-3" /> Votos no Ciclo: {loc.confirmations_count || 0}
                                    </div>
                                  )}
                                </div>

                                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                                  <span className={`text-[10px] font-bold ${loc.is_active !== false ? 'text-emerald-400' : 'text-slate-500'}`}>
                                    {loc.is_active !== false ? '● Ativo' : '○ Inativo'}
                                  </span>

                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleStartEditLocation(loc)}
                                      className="p-1.5 rounded-lg bg-[#00d2ff]/15 border border-[#00d2ff]/30 text-[#38bdf8] hover:bg-[#00d2ff]/25 transition-colors"
                                      title="Editar Ponto"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteLocation(loc.id, loc.name)}
                                      className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors"
                                      title="Excluir Ponto"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* TAB 5: CICLO DO ANDARILHO */}
              {activeTab === 'wanderer' && (() => {
                const cycle = calculateWandererCycle();
                const totalCycleVotes = locations
                  .filter((l) => l.category === 'andarilho' || l.category === 'local_possivel')
                  .reduce((sum, l) => sum + (l.confirmations_count || 0), 0);

                return (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-[#00d2ff]/15 via-slate-900/80 to-black p-5 rounded-xl border border-[#00d2ff]/30 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#00d2ff]" />
                          Controle e Automação do Ciclo do Andarilho
                        </h4>
                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#00d2ff]/20 text-[#7dd3fc] font-bold border border-[#00d2ff]/40">
                          Reset Automático às 06:00 e 18:00
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        O Andarilho troca de posição a cada 12 horas (exatamente às <strong>06:00</strong> da manhã e <strong>18:00</strong> da noite).
                        O sistema apaga e reinicia automaticamente os votos da comunidade nesses horários e sincroniza em tempo real com todos os jogadores ativos.
                      </p>

                      {/* Status Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div className="bg-black/60 p-3.5 rounded-xl border border-slate-800">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ciclo Atual</span>
                          <span className="text-sm font-extrabold text-[#38bdf8] mt-0.5 block">{cycle.cycleLabel}</span>
                          <span className="text-[11px] text-slate-400 mt-0.5 block">Iniciado às {cycle.formattedStartTime}</span>
                        </div>

                        <div className="bg-black/60 p-3.5 rounded-xl border border-slate-800">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Próxima Virada</span>
                          <span className="text-sm font-mono font-black text-white mt-0.5 block">{cycle.formattedTimeLeft}</span>
                          <span className="text-[11px] text-slate-400 mt-0.5 block">Às {cycle.formattedEndTime} (Auto-reset)</span>
                        </div>

                        <div className="bg-black/60 p-3.5 rounded-xl border border-slate-800">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Votos Registrados</span>
                          <span className="text-sm font-mono font-black text-emerald-400 mt-0.5 block">{totalCycleVotes} votos</span>
                          <span className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Sincronização em tempo real ativa
                          </span>
                        </div>
                      </div>

                      {/* Manual Reset Action */}
                      <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="text-xs text-slate-400">
                          Precisa forçar um reset fora do horário programado? Clique abaixo para zerar os votos em todas as telas conectadas.
                        </div>

                        <button
                          onClick={handleResetCycle}
                          className="px-4 py-2.5 bg-gradient-to-r from-amber-500/25 to-rose-500/25 hover:from-amber-500/35 hover:to-rose-500/35 text-amber-200 border border-amber-500/40 font-bold text-xs rounded-xl flex items-center gap-2 transition-all whitespace-nowrap shadow-lg shadow-amber-500/10"
                        >
                          <RefreshCw className="w-4 h-4 text-amber-400" />
                          Zerar Votos Agora (Sincronizar Todas as Telas)
                        </button>
                      </div>
                      {/* Wanderer Candidate Locations & Votes */}
                      <div className="pt-3 border-t border-slate-800/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-white text-xs">Locais Candidatos do Andarilho & Votações em Tempo Real</h5>
                          <span className="text-[10px] text-slate-400">Total: {locations.filter(l => l.category === 'andarilho' || l.category === 'local_possivel').length} pontos</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {locations
                            .filter((l) => l.category === 'andarilho' || l.category === 'local_possivel')
                            .map((l) => (
                              <div key={l.id} className="bg-black/40 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                                <div className="min-w-0 pr-2">
                                  <div className="text-xs font-bold text-white truncate">{l.name}</div>
                                  <div className="text-[10px] text-slate-500 font-mono">X: {l.x} | Y: {l.y}</div>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-xs font-mono font-black ${
                                  (l.confirmations_count || 0) > 0 
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' 
                                    : 'bg-slate-800 text-slate-500'
                                }`}>
                                  {l.confirmations_count || 0}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* TAB 8: GERENCIAMENTO DE USUÁRIOS */}
              {activeTab === 'users' && (() => {
                const filteredUsers = profilesList.filter((u) => {
                  const q = userSearchQuery.toLowerCase();
                  return (
                    (u.username && u.username.toLowerCase().includes(q)) ||
                    (u.full_name && u.full_name.toLowerCase().includes(q)) ||
                    (u.discord_id && u.discord_id.includes(q)) ||
                    (u.email && u.email.toLowerCase().includes(q))
                  );
                });

                return (
                  <div className="space-y-6">
                    {/* Header Controls */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#060d1a] p-4 rounded-xl border border-slate-800">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Buscar por nome, @username, ID Discord ou e-mail..."
                          value={userSearchQuery}
                          onChange={(e) => setUserSearchQuery(e.target.value)}
                          className="w-full bg-[#000000] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#5865F2]"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            showToast('Atualizando lista de usuários...');
                            ApiService.fetchProfiles().then((profs) => {
                              setProfilesList(profs);
                              showToast('Lista de usuários atualizada com sucesso!');
                            });
                          }}
                          className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Atualizar</span>
                        </button>
                      </div>
                    </div>

                    {/* Users Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredUsers.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-slate-500 text-xs font-semibold">
                          Nenhum usuário encontrado para a pesquisa.
                        </div>
                      ) : (
                        filteredUsers.map((u) => {
                          const isOwner = u.discord_id === '722320491767136346' || u.id === '722320491767136346';
                          const isBanned = !isOwner && u.is_banned === true;
                          const isAdmin = isOwner || (!isBanned && (u.is_admin || u.role === 'admin'));

                          return (
                            <div
                              key={u.id}
                              className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                                isBanned
                                  ? 'bg-rose-950/20 border-rose-900/40'
                                  : isOwner
                                  ? 'bg-gradient-to-br from-[#00d2ff]/10 via-[#060d1a] to-[#000000] border-[#00d2ff]/40 shadow-lg shadow-[#00d2ff]/5'
                                  : isAdmin
                                  ? 'bg-gradient-to-br from-[#5865F2]/10 via-[#060d1a] to-[#000000] border-[#5865F2]/40 shadow-lg shadow-[#5865F2]/5'
                                  : 'bg-[#060d1a] border-slate-800'
                              }`}
                            >
                              {/* User Header */}
                              <div className="flex items-start gap-3">
                                <div className="relative shrink-0">
                                  <img
                                    src={u.avatar_url || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                                    alt={u.username}
                                    className={`w-12 h-12 rounded-full object-cover border-2 ${
                                      isBanned
                                        ? 'border-rose-500 opacity-60'
                                        : isOwner
                                        ? 'border-[#00d2ff] shadow-md shadow-[#00d2ff]/30'
                                        : isAdmin
                                        ? 'border-[#38bdf8] shadow-md shadow-[#38bdf8]/30'
                                        : 'border-slate-700'
                                    }`}
                                  />
                                  {isOwner ? (
                                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#00d2ff] text-black rounded-full flex items-center justify-center text-[9px] shadow font-bold">
                                      👑
                                    </span>
                                  ) : isAdmin ? (
                                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#5865F2] text-white rounded-full flex items-center justify-center text-[9px] shadow">
                                      <Shield className="w-2.5 h-2.5" />
                                    </span>
                                  ) : null}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <h5 className="font-extrabold text-white text-xs truncate max-w-[140px]">
                                      {u.full_name || u.username}
                                    </h5>
                                    {isOwner && (
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-[#00d2ff]/20 text-[#38bdf8] border border-[#00d2ff]/40">
                                        FUNDADOR
                                      </span>
                                    )}
                                    {isAdmin && !isOwner && (
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-[#5865F2]/20 text-[#818cf8] border border-[#5865F2]/40">
                                        ADMIN
                                      </span>
                                    )}
                                    {!isAdmin && !isBanned && (
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-slate-800 text-slate-400 border border-slate-700">
                                        USUÁRIO
                                      </span>
                                    )}
                                    {isBanned && (
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                        BANIDO
                                      </span>
                                    )}
                                  </div>

                                  <div className="text-[11px] text-[#38bdf8] font-bold truncate">@{u.username}</div>

                                  <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                                    <span>ID: {u.discord_id}</span>
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(u.discord_id);
                                        showToast('ID Discord copiado!');
                                      }}
                                      className="hover:text-white"
                                      title="Copiar ID Discord"
                                    >
                                      📋
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* User Metadata */}
                              <div className="grid grid-cols-2 gap-2 text-[10px] bg-black/40 p-2.5 rounded-lg border border-slate-900">
                                <div>
                                  <span className="text-slate-500 font-bold block">ENTRADA</span>
                                  <span className="text-slate-300 font-semibold">
                                    {u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : 'Recente'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-500 font-bold block">CARGO</span>
                                  <span className="text-[#38bdf8] font-bold">
                                    {isOwner ? 'FUNDADOR INATO' : isAdmin ? 'ADMINISTRADOR' : 'USUÁRIO RP'}
                                  </span>
                                </div>
                              </div>

                              {/* Actions Bar */}
                              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1.5 flex-wrap">
                                {isOwner ? (
                                  <div className="text-[10px] text-[#38bdf8] font-bold py-1 flex items-center gap-1">
                                    <span>👑 Fundador Principal</span>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => handleToggleAdmin(u)}
                                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition-all ${
                                          isAdmin
                                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25'
                                            : 'bg-[#5865F2]/20 text-[#818cf8] border border-[#5865F2]/40 hover:bg-[#5865F2]/30'
                                        }`}
                                        title={isAdmin ? 'Remover Permissão de Admin' : 'Tornar Administrador'}
                                      >
                                        <ShieldCheck className="w-3 h-3" />
                                        <span>{isAdmin ? 'Remover Admin' : 'Tornar Admin'}</span>
                                      </button>

                                      <button
                                        onClick={() => handleToggleBan(u)}
                                        className={`px-2 py-1.5 rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition-all ${
                                          isBanned
                                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25'
                                        }`}
                                        title={isBanned ? 'Desbanir Usuário' : 'Banir Usuário'}
                                      >
                                        <Ban className="w-3 h-3" />
                                        <span>{isBanned ? 'Desbanir' : 'Banir'}</span>
                                      </button>
                                    </div>

                                    <button
                                      onClick={() => handleDeleteUser(u)}
                                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                      title="Excluir Usuário"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* TAB 9: AUDITORIA DE ACESSOS */}
              {activeTab === 'access_logs' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-[#060d1a] p-4 rounded-xl border border-slate-800">
                    <div>
                      <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        Histórico de Logins & Auditoria ({accessLogsList.length} registros)
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Registros em tempo real das conexões e logins efetuados via Discord OAuth2.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          showToast('Atualizando logs de acesso...');
                          ApiService.fetchAccessLogs().then((logs: AccessLog[]) => {
                            setAccessLogsList(logs);
                            showToast('Logs de acesso atualizados!');
                          });
                        }}
                        className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Atualizar</span>
                      </button>

                      <button
                        onClick={handleClearAccessLogs}
                        className="px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-xs font-bold text-rose-300 flex items-center gap-1.5 transition-colors"
                        title="Limpar todos os registros de acessos"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Limpar Histórico</span>
                      </button>
                    </div>
                  </div>

                  {/* Logs Table */}
                  <div className="bg-[#060d1a] rounded-xl border border-slate-800 overflow-hidden">
                    <div className="divide-y divide-slate-800/80 max-h-[550px] overflow-y-auto">
                      {accessLogsList.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-500 font-semibold">
                          Nenhum registro de acesso gravado ainda.
                        </div>
                      ) : (
                        accessLogsList.map((log) => (
                          <div key={log.id} className="p-3.5 flex items-center justify-between gap-4 hover:bg-slate-900/30 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#5865F2]/20 border border-[#5865F2]/40 flex items-center justify-center text-[#5865F2] font-black text-xs shrink-0">
                                <i className="fa-brands fa-discord"></i>
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-white text-xs">{log.username || 'Discord User'}</span>
                                  <span className="text-[10px] font-mono text-[#38bdf8] bg-[#00d2ff]/10 px-1.5 py-0.5 rounded border border-[#00d2ff]/20">
                                    ID: {log.discord_id || '—'}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-500 block truncate max-w-md mt-0.5 font-mono">
                                  {log.user_agent || 'Navegador Web Padrão'}
                                </span>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-xs font-bold text-slate-300 block font-mono">
                                {log.logged_at ? new Date(log.logged_at).toLocaleTimeString('pt-BR') : 'Agora'}
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                {log.logged_at ? new Date(log.logged_at).toLocaleDateString('pt-BR') : ''}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 10: OPÇÕES GLOBAIS DA PLATAFORMA */}
              {activeTab === 'settings' && (() => {
                return (
                  <div className="space-y-6">
                    {/* Anúncio Global em Tempo Real */}
                    <div className="bg-[#060d1a] p-5 rounded-xl border border-amber-500/30 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                          <Megaphone className="w-4 h-4 text-amber-400" />
                          Anúncio Global em Tempo Real
                        </h4>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                          platformSettings.announcement_active
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {platformSettings.announcement_active ? 'TRANSMITINDO AO VIVO' : 'DESATIVADO'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed">
                        Exibe um banner de alerta no topo de todas as páginas para todos os jogadores conectados instantaneamente.
                      </p>

                      <div className="space-y-3">
                        <textarea
                          placeholder="Digite aqui o texto do anúncio para todos os usuários..."
                          value={platformSettings.global_announcement || ''}
                          onChange={(e) =>
                            setPlatformSettings((prev) => ({ ...prev, global_announcement: e.target.value }))
                          }
                          rows={2}
                          className="w-full bg-[#000000] border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400 placeholder-slate-600"
                        />

                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <label className="text-xs font-bold text-slate-300 flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={platformSettings.announcement_active}
                                onChange={(e) =>
                                  setPlatformSettings((prev) => ({ ...prev, announcement_active: e.target.checked }))
                                }
                                className="accent-amber-500 w-4 h-4 cursor-pointer"
                              />
                              <span>Ativar Exibição do Anúncio</span>
                            </label>

                            <select
                              value={platformSettings.announcement_type || 'info'}
                              onChange={(e) =>
                                setPlatformSettings((prev) => ({ ...prev, announcement_type: e.target.value as any }))
                              }
                              className="bg-[#000000] border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
                            >
                              <option value="info">Tipo: Informativo (Azul)</option>
                              <option value="warning">Tipo: Atenção (Amarelo)</option>
                              <option value="alert">Tipo: Alerta Crítico (Vermelho)</option>
                              <option value="success">Tipo: Sucesso (Verde)</option>
                            </select>
                          </div>

                          <button
                            onClick={() =>
                              handleSaveAnnouncement(
                                platformSettings.global_announcement || '',
                                platformSettings.announcement_active,
                                platformSettings.announcement_type || 'info'
                              )
                            }
                            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all"
                          >
                            Salvar e Transmitir Anúncio
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Modo Manutenção */}
                    <div className="bg-[#060d1a] p-5 rounded-xl border border-rose-500/30 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-rose-400" />
                          Modo de Manutenção da Plataforma
                        </h4>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                          platformSettings.maintenance_mode
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}>
                          {platformSettings.maintenance_mode ? 'MANUTENÇÃO ATIVA' : 'SISTEMA NORMAL'}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Mensagem exibida para os usuários durante manutenção..."
                          value={platformSettings.maintenance_message || ''}
                          onChange={(e) =>
                            setPlatformSettings((prev) => ({ ...prev, maintenance_message: e.target.value }))
                          }
                          className="w-full bg-[#000000] border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-400 placeholder-slate-600"
                        />

                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-300 flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={platformSettings.maintenance_mode}
                              onChange={(e) =>
                                setPlatformSettings((prev) => ({ ...prev, maintenance_mode: e.target.checked }))
                              }
                              className="accent-rose-500 w-4 h-4 cursor-pointer"
                            />
                            <span>Ativar Modo de Manutenção (Apenas Admins conseguem acessar)</span>
                          </label>

                          <button
                            onClick={() =>
                              handleToggleMaintenance(
                                platformSettings.maintenance_mode,
                                platformSettings.maintenance_message || ''
                              )
                            }
                            className="px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all"
                          >
                            Aplicar Status de Manutenção
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Interruptor de Sistemas & Minijogos */}
                    <div className="bg-[#060d1a] p-5 rounded-xl border border-slate-800 space-y-4">
                      <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#38bdf8]" />
                        Controle de Disponibilidade dos Sistemas
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { slug: 'mapa-interativo', name: 'Mapa Interativo RP', desc: 'Sincronização em tempo real e localização de pontos' },
                          { slug: 'lockpick', name: 'Lockpick Simulator', desc: 'Simulador de arrombamento de pinos' },
                          { slug: 'caixinha', name: 'Caixinha Eletrônico', desc: 'Decodificador de cofres e caixas eletrônicos' },
                          { slug: 'hacking', name: 'Hacking Device', desc: 'Terminal de invasão Cayo Perico' },
                        ].map((sys) => {
                          const isDisabled = (platformSettings.disabled_systems || []).includes(sys.slug);

                          return (
                            <div
                              key={sys.slug}
                              className="p-3.5 rounded-xl bg-black/50 border border-slate-800 flex items-center justify-between gap-3"
                            >
                              <div>
                                <h5 className="font-bold text-white text-xs">{sys.name}</h5>
                                <p className="text-[10px] text-slate-400 mt-0.5">{sys.desc}</p>
                              </div>

                              <button
                                onClick={() => handleToggleSystemDisabled(sys.slug)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                                  isDisabled
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                                }`}
                              >
                                {isDisabled ? 'DESATIVADO' : 'ATIVO'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Política de Autenticação */}
                    <div className="bg-[#060d1a] p-5 rounded-xl border border-slate-800 space-y-3">
                      <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                        <Lock className="w-4 h-4 text-[#5865F2]" />
                        Regras de Acesso Discord
                      </h4>

                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-slate-800">
                        <div>
                          <span className="text-xs font-bold text-white block">Exigir Login Discord para usar o Mapa Interativo</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Se ativado, visitantes anônimos são obrigados a autenticar pelo Discord antes de interagir.
                          </span>
                        </div>

                        <button
                          onClick={() => handleToggleRequireAuth(!platformSettings.require_auth_for_interactive_map)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                            platformSettings.require_auth_for_interactive_map
                              ? 'bg-[#5865F2] text-white'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {platformSettings.require_auth_for_interactive_map ? 'ATIVADO' : 'DESATIVADO'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

            </div>
          </div>
        )}
      </div>
    </div>
  );
};
