import React, { useState, useEffect } from 'react';
import { Lock, ArrowLeft } from 'lucide-react';
import type { Server, MapLocation, LocationCategory, Suggestion, SuggestionType, ConfirmedUser } from './types';
import { ApiService, getLocationsForServer } from './services/api';
import { RealtimeSync } from './services/realtimeSync';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MapContainer } from './components/map/MapContainer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LocationDrawer } from './components/map/LocationDrawer';
import { AdminModal } from './components/admin/AdminModal';
import { AppearanceModal } from './components/AppearanceModal';
import { DiscordAuthModal } from './components/DiscordAuthModal';
import { AuthService, UserProfile, checkAdminPermission, extractDiscordId, DEFAULT_ADMIN_DISCORD_IDS } from './services/auth';
import { supabase } from './lib/supabase';

export const App: React.FC = () => {
  const [servers, setServers] = useState<Server[]>([]);
  const [currentServer, setCurrentServer] = useState<Server | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cityParam = params.get('cidade') || params.get('server') || params.get('id');
      const pathParts = window.location.pathname.toLowerCase().split('/').filter(Boolean);
      const isValley = cityParam === 'valley' || pathParts.includes('valley');
      if (isValley) {
        return {
          id: 'valley-server-uuid',
          name: 'VALLEY RP',
          slug: 'valley',
          subtitle: 'VALLEY ROLEPLAY HUB',
          description: 'Servidor Valley com rastreamento de pontos ilegais, lavanderia e localizações do andarilho.',
          banner_image_url: '/images/bg_wallpaper.jpg',
          map_image_url: '/images/mapa_cda_optimized.webp',
          active: true,
        };
      }
    }
    return {
      id: 'cda-server-uuid',
      name: 'CIDADE ALTA RP',
      slug: 'cda',
      subtitle: 'SERVIDORES CDA & VALLEY',
      description: 'Mapa Interativo em tempo real para os servidores CDA e VALLEY com virada do Andarilho, além de Lockpick, Caixinha e Hacking.',
      banner_image_url: '/images/hero_banner.jpg',
      map_image_url: '/images/mapa_cda_optimized.webp',
      active: true,
    };
  });

  const [locations, setLocations] = useState<MapLocation[]>(() => {
    if (typeof window !== 'undefined') {
      const pathParts = window.location.pathname.toLowerCase().split('/').filter(Boolean);
      const isValley = pathParts.includes('valley');
      return getLocationsForServer(isValley ? 'valley-server-uuid' : 'cda-server-uuid');
    }
    return getLocationsForServer('cda-server-uuid');
  });
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);

  const [selectedCategories, setSelectedCategories] = useState<LocationCategory[]>([
    'hospital_ilegal',
    'mercado_ilegal',
    'lavanderia_ilegal',
    'desmanche',
    'andarilho',
    'local_possivel',
    'outros',
  ]);

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });
  const [adminOpen, setAdminOpen] = useState(false);
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [discordAuthOpen, setDiscordAuthOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(AuthService.getSavedProfile());
  const [authLoading, setAuthLoading] = useState<boolean>(!AuthService.getSavedProfile());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // Detect and handle OAuth error redirect
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      let hashParams = new URLSearchParams();
      if (window.location.hash && window.location.hash.includes('=')) {
        hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      }
      const oauthErr = urlParams.get('error') || hashParams.get('error');
      const oauthDesc = urlParams.get('error_description') || hashParams.get('error_description');

      if (oauthErr || oauthDesc) {
        window.history.replaceState(null, document.title, window.location.pathname);
        setToastMessage('Aviso de Autenticação: Falha no trigger do Supabase. Conecte-se via Acesso Direto ou Cadastre-se.');
        setDiscordAuthOpen(true);
      }
    }

    AuthService.syncDiscordUser()
      .then((u) => {
        setUser(u);
        setAuthLoading(false);
        if (u && (checkAdminPermission(u) || DEFAULT_ADMIN_DISCORD_IDS.includes(extractDiscordId(u)))) {
          if (sessionStorage.getItem('malaca_open_admin_after_auth') === '1') {
            sessionStorage.removeItem('malaca_open_admin_after_auth');
            setAdminOpen(true);
          }
        }
      })
      .catch(() => {
        setAuthLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const u = session.user;
        const meta = u.user_metadata || {};
        const discordId = extractDiscordId(u) || meta.provider_id || meta.sub || u.id;
        const username = meta.preferred_username || meta.user_name || meta.name || meta.full_name || 'Discord User';
        AuthService.logAccessSession(u.id, String(discordId), String(username));
      }
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED') {
        const synced = await AuthService.syncDiscordUser();
        setUser(synced);
        setAuthLoading(false);
        if (synced && !synced.is_banned && (checkAdminPermission(synced) || DEFAULT_ADMIN_DISCORD_IDS.includes(extractDiscordId(synced)))) {
          if (sessionStorage.getItem('malaca_open_admin_after_auth') === '1') {
            sessionStorage.removeItem('malaca_open_admin_after_auth');
            setAdminOpen(true);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('malaca_user_profile');
        setUser(null);
        setAuthLoading(false);
      }
    });

    const liveChannel = supabase.channel('malaca_realtime_global_hub')
      .on('broadcast', { event: 'user_permission_updated' }, ({ payload }) => {
        if (!payload) return;
        setUser((prev) => {
          if (prev && (prev.id === payload.id || prev.discord_id === payload.discordId)) {
            const updated = { ...prev, is_admin: payload.is_admin, role: payload.role };
            localStorage.setItem('malaca_user_profile', JSON.stringify(updated));
            if (!payload.is_admin) setAdminOpen(false);
            return updated;
          }
          return prev;
        });
      })
      .on('broadcast', { event: 'user_ban_updated' }, ({ payload }) => {
        if (!payload) return;
        setUser((prev) => {
          if (prev && (prev.id === payload.id || prev.discord_id === payload.discordId)) {
            const updated = {
              ...prev,
              is_banned: payload.is_banned,
              ...(payload.is_banned ? { is_admin: false, role: 'user' as const } : {}),
            };
            localStorage.setItem('malaca_user_profile', JSON.stringify(updated));
            if (payload.is_banned) setAdminOpen(false);
            return updated;
          }
          return prev;
        });
      })
      .on('broadcast', { event: 'user_deleted' }, ({ payload }) => {
        if (!payload) return;
        setUser((prev) => {
          if (prev && (prev.id === payload.id || prev.discord_id === payload.discordId)) {
            localStorage.removeItem('malaca_user_profile');
            return null;
          }
          return prev;
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
        const changed = (payload.new || payload.old) as any;
        if (!changed) return;
        setUser((prev) => {
          if (prev && (prev.id === changed.id || prev.discord_id === changed.discord_id)) {
            if (payload.eventType === 'DELETE') {
              localStorage.removeItem('malaca_user_profile');
              return null;
            }
            const updated = { ...prev, ...changed };
            localStorage.setItem('malaca_user_profile', JSON.stringify(updated));
            return updated;
          }
          return prev;
        });
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(liveChannel);
    };
  }, []);

  // Admin Pin Mode
  const [isAdminPinMode, setIsAdminPinMode] = useState(false);
  const [pendingPinCoords, setPendingPinCoords] = useState<{ x: number; y: number } | null>(null);

  const isUserAdmin = (u: UserProfile | null): boolean => {
    if (!u) return false;
    if (u.is_banned === true) return false;
    return checkAdminPermission(u) || DEFAULT_ADMIN_DISCORD_IDS.includes(extractDiscordId(u));
  };

  // Load Servers on Startup & Enforce City Context
  useEffect(() => {
    const loadServers = async () => {
      const data = await ApiService.fetchServers();
      setServers(data);
      if (data.length > 0) {
        const params = new URLSearchParams(window.location.search);
        let cityParam = params.get('cidade') || params.get('server') || params.get('id');

        if (!cityParam) {
          const pathParts = window.location.pathname.split('/').filter(Boolean);
          for (const part of pathParts) {
            const found = data.find(
              (s) => s.slug.toLowerCase() === part.toLowerCase() || s.id.toLowerCase() === part.toLowerCase()
            );
            if (found) {
              cityParam = found.slug;
              break;
            }
          }
        }

        if (!cityParam) {
          cityParam = 'cda';
        }

        let selected = data[0];
        const match = data.find(
          (s) => s.slug.toLowerCase() === cityParam.toLowerCase() || s.id.toLowerCase() === cityParam.toLowerCase()
        );
        if (match) selected = match;
        setCurrentServer(selected);

        // Apenas abre o painel admin via URL se o usuário atual for comprovadamente admin
        if (params.get('admin') === 'true' || params.get('admin') === '1') {
          const saved = AuthService.getSavedProfile();
          if (isUserAdmin(saved)) {
            setAdminOpen(true);
          } else {
            const url = new URL(window.location.href);
            url.searchParams.delete('admin');
            window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
          }
        }
      }
    };
    loadServers();
  }, []);

  // Load Data whenever Current Server changes
  useEffect(() => {
    if (!currentServer) return;

    const loadServerData = async () => {
      const locs = await ApiService.fetchLocations(currentServer.id);
      setLocations(locs);

      const sugs = await ApiService.fetchSuggestions(currentServer.id);
      setSuggestions(sugs);
    };

    loadServerData();

    // 2. Subscribe to Wanderer Confirmations (sincronização de votos em tempo real)
    const subConf = ApiService.subscribeToConfirmations(async (payload) => {
      if (payload && payload.locationId) {
        const locId = payload.locationId;
        setLocations((prev) =>
          prev.map((loc) => {
            if (loc.id === locId) {
              let updatedUsers = loc.confirmed_users ? [...loc.confirmed_users] : [];
              if (payload.action === 'vote_added' && payload.user) {
                if (!updatedUsers.some((u) => u.username === payload.user?.username)) {
                  updatedUsers.unshift(payload.user);
                }
              } else if (payload.action === 'vote_removed' && payload.username) {
                updatedUsers = updatedUsers.filter((u) => u.username !== payload.username);
              }
              const isWanderer = loc.category === 'andarilho' || loc.category === 'local_possivel';
              const nextCount = isWanderer
                ? updatedUsers.length
                : typeof payload.count === 'number'
                ? payload.count
                : Math.max(0, (loc.confirmations_count || 0) + (payload.action === 'vote_added' ? 1 : -1));

              const validLatest = payload.username && !payload.username.includes('Comunidade RP') && !payload.username.startsWith('anon_')
                ? payload.username
                : updatedUsers[0]?.username;

              return {
                ...loc,
                confirmations_count: nextCount,
                last_confirmed_by: validLatest,
                last_confirmed_at: payload.confirmed_at || loc.last_confirmed_at,
                confirmed_users: updatedUsers.length > 0 ? updatedUsers : undefined,
              };
            }
            return loc;
          })
        );

        setSelectedLocation((prev) => {
          if (!prev || prev.id !== locId) return prev;
          let updatedUsers = prev.confirmed_users ? [...prev.confirmed_users] : [];
          if (payload.action === 'vote_added' && payload.user) {
            if (!updatedUsers.some((u) => u.username === payload.user?.username)) {
              updatedUsers.unshift(payload.user);
            }
          } else if (payload.action === 'vote_removed' && payload.username) {
            updatedUsers = updatedUsers.filter((u) => u.username !== payload.username);
          }
          const isWanderer = prev.category === 'andarilho' || prev.category === 'local_possivel';
          const nextCount = isWanderer
            ? updatedUsers.length
            : typeof payload.count === 'number'
            ? payload.count
            : Math.max(0, (prev.confirmations_count || 0) + (payload.action === 'vote_added' ? 1 : -1));

          const validLatest = payload.username && !payload.username.includes('Comunidade RP') && !payload.username.startsWith('anon_')
            ? payload.username
            : updatedUsers[0]?.username;

          return {
            ...prev,
            confirmations_count: nextCount,
            last_confirmed_by: validLatest,
            last_confirmed_at: payload.confirmed_at || prev.last_confirmed_at,
            confirmed_users: updatedUsers.length > 0 ? updatedUsers : undefined,
          };
        });
      } else if (currentServer) {
        const locs = await ApiService.fetchLocations(currentServer.id);
        setLocations(locs);
        setSelectedLocation((prev) => {
          if (!prev) return null;
          const fresh = locs.find((l) => l.id === prev.id);
          return fresh || prev;
        });
      }
    });

    // 3. Sincronização coletiva de presença (quando outros usuários online confirmam locais)
    const unsubPresence = RealtimeSync.onPresenceSync((counts) => {
      setLocations((prev) =>
        prev.map((loc) => {
          if (loc.category === 'andarilho' || loc.category === 'local_possivel') {
            const remoteVote = counts[loc.id] ?? 0;
            const userMin = loc.user_confirmed && remoteVote === 0 ? 1 : 0;
            const finalVal = Math.max(remoteVote, userMin);
            if (finalVal !== (loc.confirmations_count || 0)) {
              return { ...loc, confirmations_count: finalVal };
            }
          }
          return loc;
        })
      );

      setSelectedLocation((prev) => {
        if (!prev || (prev.category !== 'andarilho' && prev.category !== 'local_possivel')) return prev;
        const remoteVote = counts[prev.id] ?? 0;
        const userMin = prev.user_confirmed && remoteVote === 0 ? 1 : 0;
        const finalVal = Math.max(remoteVote, userMin);
        if (finalVal !== (prev.confirmations_count || 0)) {
          return { ...prev, confirmations_count: finalVal };
        }
        return prev;
      });
    });

    // 4. Escuta alterações em tempo real de locais/pins adicionados/editados/deletados
    const unsubLocs = RealtimeSync.onLocationsChange(async (payload) => {
      if (!payload) return;
      if (payload.action === 'INSERT' && payload.data) {
        setLocations((prev) => {
          if (prev.some((l) => l.id === payload.data.id)) return prev;
          return [...prev, payload.data];
        });
      } else if (payload.action === 'UPDATE' && payload.id) {
        setLocations((prev) =>
          prev.map((l) => (l.id === payload.id ? { ...l, ...(payload.data || {}) } : l))
        );
        setSelectedLocation((prev) =>
          prev && prev.id === payload.id ? { ...prev, ...(payload.data || {}) } : prev
        );
      } else if (payload.action === 'DELETE' && payload.id) {
        setLocations((prev) => prev.filter((l) => l.id !== payload.id));
        setSelectedLocation((prev) => (prev && prev.id === payload.id ? null : prev));
      } else if (currentServer) {
        const locs = await ApiService.fetchLocations(currentServer.id);
        setLocations(locs);
      }
    });

    // 5. Escuta alterações em tempo real de comentários
    // 6. Escuta alterações em tempo real de sugestões
    const unsubSugs = RealtimeSync.onSuggestionsChange((payload) => {
      if (!payload) return;
      if (payload.action === 'INSERT' && payload.data) {
        setSuggestions((prev) => {
          if (prev.some((s) => s.id === payload.data.id)) return prev;
          return [payload.data, ...prev];
        });
      } else if (payload.action === 'UPDATE' && payload.id) {
        setSuggestions((prev) =>
          prev.map((s) => (s.id === payload.id ? { ...s, ...(payload.data || {}) } : s))
        );
      }
    });

    // 7. Escuta alterações em tempo real de servidores/cidades
    const unsubServers = RealtimeSync.onServersChange(async () => {
      const fresh = await ApiService.fetchServers();
      setServers(fresh);
    });

    // 8. Escuta viradas de ciclo (às 06:00 e 18:00 ou reset administrativo)
    const unsubCycle = RealtimeSync.onCycleReset(async (info, reason) => {
      const message =
        reason === 'automatic_rotation_06_18'
          ? `🔄 Virada do Andarilho (${info.cycleLabel})! As marcações foram resetadas às ${info.formattedStartTime}.`
          : '🔄 Ciclo do Andarilho reiniciado em tempo real para todos os membros!';

      setToastMessage(message);
      setTimeout(() => setToastMessage(null), 6000);

      if (currentServer) {
        const fresh = await ApiService.fetchLocations(currentServer.id);
        setLocations(fresh);
      }
      setSelectedLocation((prev) =>
        prev && (prev.category === 'andarilho' || prev.category === 'local_possivel')
          ? { ...prev, confirmations_count: 0, user_confirmed: false }
          : prev
      );
    });

    return () => {
      subConf.unsubscribe();
      unsubPresence();
      unsubLocs();
      unsubSugs();
      unsubServers();
      unsubCycle();
    };
  }, [currentServer]);

  // Handlers
  const handleToggleCategory = (category: LocationCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleSelectOnlyCategory = (category: LocationCategory) => {
    setSelectedCategories([category]);
  };

  const handleSelectAllCategories = () => {
    setSelectedCategories([
      'hospital_ilegal',
      'mercado_ilegal',
      'lavanderia_ilegal',
      'desmanche',
      'andarilho',
      'local_possivel',
      'outros',
    ]);
  };

  const handleConfirmLocation = async (locationId: string) => {
    if (!user) {
      setToastMessage('🔒 Faça login com o Discord para marcar o Andarilho!');
      setDiscordAuthOpen(true);
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }
    if (!currentServer) return;
    const authorTag = user.username ? `@${user.username.replace(/^@/, '')}` : (user.full_name ? `@${user.full_name}` : null);
    if (!authorTag) return;
    const nowIso = new Date().toISOString();

    const ok = await ApiService.addWandererConfirmation(locationId, currentServer.id, user);
    if (ok) {
      const userEntry: ConfirmedUser = {
        user_id: user.id,
        discord_id: user.discord_id,
        username: authorTag,
        full_name: user.full_name || authorTag,
        avatar_url: user.avatar_url || 'https://cdn.discordapp.com/embed/avatars/0.png',
        character_name: user.character_name || '',
        instagram: user.instagram || '',
        twitch: user.twitch || '',
        youtube: user.youtube || '',
        twitter_x: user.twitter_x || '',
        confirmed_at: nowIso,
      };

      setLocations((prev) =>
        prev.map((loc) => {
          if (loc.id === locationId) {
            const nextUsers = [
              userEntry,
              ...(loc.confirmed_users || []).filter(
                (u) => u.username !== authorTag && (user.id ? u.user_id !== user.id : true)
              ),
            ];
            return {
              ...loc,
              confirmations_count: nextUsers.length,
              user_confirmed: true,
              last_confirmed_by: authorTag,
              last_confirmed_at: nowIso,
              confirmed_users: nextUsers,
            };
          }
          return loc;
        })
      );

      if (selectedLocation?.id === locationId) {
        setSelectedLocation((prev) => {
          if (!prev) return null;
          const nextUsers = [
            userEntry,
            ...(prev.confirmed_users || []).filter(
              (u) => u.username !== authorTag && (user.id ? u.user_id !== user.id : true)
            ),
          ];
          return {
            ...prev,
            confirmations_count: nextUsers.length,
            user_confirmed: true,
            last_confirmed_by: authorTag,
            last_confirmed_at: nowIso,
            confirmed_users: nextUsers,
          };
        });
      }
    }
  };

  const handleUnconfirmLocation = async (locationId: string) => {
    if (!user) {
      setToastMessage('🔒 Faça login com o Discord para interagir!');
      setDiscordAuthOpen(true);
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }
    if (!currentServer) return;
    const authorTag = user.username ? `@${user.username.replace(/^@/, '')}` : (user.full_name ? `@${user.full_name}` : '');
    const ok = await ApiService.removeWandererConfirmation(locationId, currentServer.id, user);
    if (ok) {
      setLocations((prev) =>
        prev.map((loc) => {
          if (loc.id === locationId) {
            const nextUsers = (loc.confirmed_users || []).filter(
              (u) => u.username !== authorTag && (user.id ? u.user_id !== user.id : true)
            );
            return {
              ...loc,
              confirmations_count: nextUsers.length,
              user_confirmed: false,
              last_confirmed_by: nextUsers[0]?.username,
              last_confirmed_at: nextUsers[0]?.confirmed_at,
              confirmed_users: nextUsers.length > 0 ? nextUsers : undefined,
            };
          }
          return loc;
        })
      );

      if (selectedLocation?.id === locationId) {
        setSelectedLocation((prev) => {
          if (!prev) return null;
          const nextUsers = (prev.confirmed_users || []).filter(
            (u) => u.username !== authorTag && (user.id ? u.user_id !== user.id : true)
          );
          return {
            ...prev,
            confirmations_count: nextUsers.length,
            user_confirmed: false,
            last_confirmed_by: nextUsers[0]?.username,
            last_confirmed_at: nextUsers[0]?.confirmed_at,
            confirmed_users: nextUsers.length > 0 ? nextUsers : undefined,
          };
        });
      }
    }
  };

  const handleAddSuggestion = async (nickname: string, type: SuggestionType, content: string) => {
    if (!user) {
      setToastMessage('🔒 Faça login com o Discord para enviar sugestões!');
      setDiscordAuthOpen(true);
      setTimeout(() => setToastMessage(null), 4000);
      return false;
    }
    if (!currentServer) return false;
    const ok = await ApiService.addSuggestion({
      server_id: currentServer.id,
      location_id: selectedLocation?.id,
      nickname: nickname || user.username,
      type,
      content,
    });
    if (ok) {
      const freshSugs = await ApiService.fetchSuggestions(currentServer.id);
      setSuggestions(freshSugs);
    }
    return ok;
  };

  // Admin Pin Click Handler
  const handleAdminMapClick = (x: number, y: number) => {
    setPendingPinCoords({ x, y });
    setIsAdminPinMode(false);
    setAdminOpen(true);
  };

  const handleSaveAdminLocation = async (locationData: Omit<MapLocation, 'id'>) => {
    const newLoc = await ApiService.createLocation(locationData);
    if (newLoc) {
      setLocations((prev) => [...prev, newLoc]);
      setPendingPinCoords(null);
      return true;
    }
    return false;
  };

  const handleUpdateAdminLocation = async (id: string, updates: Partial<MapLocation>) => {
    const ok = await ApiService.updateLocation(id, updates);
    if (ok) {
      setLocations((prev) =>
        prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
      );
      if (selectedLocation?.id === id) {
        setSelectedLocation((prev) => (prev ? { ...prev, ...updates } : null));
      }
    }
    return ok;
  };

  const handleDeleteAdminLocation = async (id: string) => {
    const ok = await ApiService.deleteLocation(id);
    if (ok) {
      setLocations((prev) => prev.filter((l) => l.id !== id));
      if (selectedLocation?.id === id) setSelectedLocation(null);
    }
    return ok;
  };

  const handleUpdateSuggestionStatus = async (id: string, status: any) => {
    const ok = await ApiService.updateSuggestionStatus(id, status);
    if (ok && currentServer) {
      const fresh = await ApiService.fetchSuggestions(currentServer.id);
      setSuggestions(fresh);
    }
    return ok;
  };

  const handleDeleteAdminSuggestion = async (id: string) => {
    const ok = await ApiService.deleteSuggestion(id);
    if (ok) {
      setSuggestions((prev) => prev.filter((s) => s.id !== id));
    }
    return ok;
  };

  return (
    <div className="flex flex-col h-screen h-[100dvh] w-screen max-h-[100dvh] bg-slate-950 text-slate-100 overflow-hidden font-sans relative">
      {/* Toast Banner de Notificações em Tempo Real / Virada do Ciclo */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#00d2ff] via-[#38bdf8] to-[#2563eb] text-slate-950 font-black text-xs px-5 py-3 rounded-full shadow-[0_0_25px_rgba(0,210,255,0.6)] border border-white z-50 animate-in fade-in duration-300 flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <Header
        servers={servers}
        currentServer={currentServer}
        onSelectServer={(server) => {
          setCurrentServer(server);
          setSelectedLocation(null);
        }}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onOpenAdmin={() => {
          if (isUserAdmin(user)) {
            setAdminOpen(true);
          } else {
            setToastMessage('Acesso restrito: sua conta não possui cargo de administrador.');
          }
        }}
        onOpenAppearance={() => setAppearanceOpen(true)}
        user={user}
        onOpenDiscordAuth={() => setDiscordAuthOpen(true)}
      />

      {user?.is_banned ? (
        <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-b from-[#180909] via-[#0d0404] to-[#050202]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(239,68,68,0.15),_transparent_70%)] pointer-events-none" />
          <div className="max-w-md w-full relative z-10 bg-[#120505]/95 backdrop-blur-2xl border border-rose-500/40 rounded-2xl p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(239,68,68,0.2)] text-center">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
              <i className="fa-solid fa-ban text-2xl" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-black uppercase tracking-wider mb-3">
              <i className="fa-solid fa-triangle-exclamation text-xs" /> Acesso Revogado • Conta Suspensa
            </div>

            <h2 className="text-xl md:text-2xl font-black text-white font-['Orbitron',sans-serif] tracking-wider mb-2">
              CONTA SUSPENSA
            </h2>

            <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-6">
              Seu acesso à plataforma <strong className="text-white">Malaca System GTARP</strong> foi suspenso pela administração. Todas as cidades, sistemas, mapas e painéis estão bloqueados para sua conta.
            </p>

            <div className="bg-black/60 border border-rose-500/30 rounded-xl p-3.5 mb-6 text-left flex items-center gap-3">
              <img src={user.avatar_url || 'https://cdn.discordapp.com/embed/avatars/0.png'} alt={user.username} className="w-12 h-12 rounded-full border-2 border-rose-500 object-cover shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-white font-black text-sm truncate">{user.full_name || user.username}</div>
                <div className="text-rose-400 font-bold text-xs truncate">@{user.username}</div>
                <div className="text-slate-500 font-mono text-[10px]">ID Discord: {user.discord_id}</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500/25 text-rose-300 border border-rose-500/40">
                BANIDO
              </span>
            </div>

            <button
              onClick={() => AuthService.logout()}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <i className="fa-solid fa-arrow-right-from-bracket text-sm" />
              <span>Desconectar Conta</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden relative">
          {/* Sidebar */}
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            selectedCategories={selectedCategories}
            onToggleCategory={handleToggleCategory}
            onSelectOnlyCategory={handleSelectOnlyCategory}
            onSelectAllCategories={handleSelectAllCategories}
            suggestions={suggestions}
            onAddSuggestion={handleAddSuggestion}
            locations={locations}
            onSelectLocation={(loc) => setSelectedLocation(loc)}
            currentServer={currentServer}
          />

          {/* Map Container View */}
          <main className="flex-1 relative h-full w-full">
            <ErrorBoundary>
              <MapContainer
                mapImageUrl={
                  currentServer?.map_image_url ||
                  '/images/mapa_cda_optimized.webp'
                }
                locations={locations}
                selectedLocation={selectedLocation}
                onSelectLocation={(loc) => setSelectedLocation(loc)}
                selectedCategories={selectedCategories}
                isAdminPinMode={isAdminPinMode}
                onAdminMapClick={handleAdminMapClick}
              />
            </ErrorBoundary>

            {/* Selected Location Drawer */}
            <LocationDrawer
              location={selectedLocation}
              onClose={() => setSelectedLocation(null)}
              onConfirm={handleConfirmLocation}
              onUnconfirm={handleUnconfirmLocation}
              user={user}
              onRequireAuth={() => setDiscordAuthOpen(true)}
            />

          </main>
        </div>
      )}

      {/* Admin Panel Modal - Exclusivo para administradores */}
      {isUserAdmin(user) && (
        <AdminModal
          isOpen={adminOpen}
          onClose={() => setAdminOpen(false)}
          user={user}
          servers={servers}
          locations={locations}
          suggestions={suggestions}
          onSaveLocation={handleSaveAdminLocation}
          onUpdateLocation={handleUpdateAdminLocation}
          onDeleteLocation={handleDeleteAdminLocation}
          onUpdateSuggestionStatus={handleUpdateSuggestionStatus}
          onDeleteSuggestion={handleDeleteAdminSuggestion}
          onStartPinMode={() => setIsAdminPinMode(true)}
          pendingPinCoords={pendingPinCoords}
        />
      )}

      {/* Appearance Customization Modal */}
      <AppearanceModal
        isOpen={appearanceOpen}
        onClose={() => setAppearanceOpen(false)}
      />

      {/* Discord OAuth2 Auth & User Dashboard Modal */}
      <DiscordAuthModal
        isOpen={discordAuthOpen}
        onClose={() => setDiscordAuthOpen(false)}
        user={user}
        onOpenAdmin={() => setAdminOpen(true)}
      />
    </div>
  );
};

export default App;
