import React, { useState, useEffect } from 'react';
import type { Server, MapLocation, LocationCategory, Suggestion, SuggestionType } from './types';
import { ApiService } from './services/api';
import { RealtimeSync } from './services/realtimeSync';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MapContainer } from './components/Map/MapContainer';
import { LocationDrawer } from './components/Map/LocationDrawer';
import { AdminModal } from './components/Admin/AdminModal';
import { AppearanceModal } from './components/AppearanceModal';
import { DiscordAuthModal } from './components/DiscordAuthModal';
import { AuthService, UserProfile } from './services/auth';
import { supabase } from './lib/supabase';

export const App: React.FC = () => {
  const [servers, setServers] = useState<Server[]>([]);
  const [currentServer, setCurrentServer] = useState<Server | null>(null);

  const [locations, setLocations] = useState<MapLocation[]>([]);
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

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [discordAuthOpen, setDiscordAuthOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(AuthService.getSavedProfile());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    AuthService.syncDiscordUser().then((u) => {
      setUser(u);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const u = session.user;
        const meta = u.user_metadata || {};
        const discordId = meta.provider_id || meta.sub || u.id;
        const username = meta.preferred_username || meta.user_name || meta.name || meta.full_name || 'Discord User';
        AuthService.logAccessSession(u.id, String(discordId), String(username));
      }
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED') {
        const synced = await AuthService.syncDiscordUser();
        setUser(synced);
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('malaca_user_profile');
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Admin Pin Mode
  const [isAdminPinMode, setIsAdminPinMode] = useState(false);
  const [pendingPinCoords, setPendingPinCoords] = useState<{ x: number; y: number } | null>(null);

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

        if (params.get('admin') === 'true' || params.get('admin') === '1') {
          setAdminOpen(true);
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
        const delta = payload.action === 'vote_added' ? 1 : -1;
        setLocations((prev) =>
          prev.map((loc) => {
            if (loc.id === locId) {
              const freshVal = typeof payload.count === 'number'
                ? payload.count
                : Math.max(0, (loc.confirmations_count || 0) + delta);
              return { ...loc, confirmations_count: freshVal };
            }
            return loc;
          })
        );

        setSelectedLocation((prev) => {
          if (!prev || prev.id !== locId) return prev;
          const freshVal = typeof payload.count === 'number'
            ? payload.count
            : Math.max(0, (prev.confirmations_count || 0) + delta);
          return { ...prev, confirmations_count: freshVal };
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
    const ok = await ApiService.addWandererConfirmation(locationId, currentServer.id);
    if (ok) {
      setLocations((prev) =>
        prev.map((loc) =>
          loc.id === locationId
            ? {
                ...loc,
                confirmations_count: (loc.confirmations_count || 0) + 1,
                user_confirmed: true,
              }
            : loc
        )
      );
      if (selectedLocation?.id === locationId) {
        setSelectedLocation((prev) =>
          prev
            ? {
                ...prev,
                confirmations_count: (prev.confirmations_count || 0) + 1,
                user_confirmed: true,
              }
            : null
        );
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
    const ok = await ApiService.removeWandererConfirmation(locationId, currentServer.id);
    if (ok) {
      setLocations((prev) =>
        prev.map((loc) =>
          loc.id === locationId
            ? {
                ...loc,
                confirmations_count: Math.max(0, (loc.confirmations_count || 1) - 1),
                user_confirmed: false,
              }
            : loc
        )
      );
      if (selectedLocation?.id === locationId) {
        setSelectedLocation((prev) =>
          prev
            ? {
                ...prev,
                confirmations_count: Math.max(0, (prev.confirmations_count || 1) - 1),
                user_confirmed: false,
              }
            : null
        );
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
        onOpenAdmin={() => setAdminOpen(true)}
        onOpenAppearance={() => setAppearanceOpen(true)}
        user={user}
        onOpenDiscordAuth={() => setDiscordAuthOpen(true)}
      />

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
        />

        {/* Map Container View */}
        <main className="flex-1 relative h-full w-full">
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

      {/* Admin Panel Modal */}
      <AdminModal
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
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
