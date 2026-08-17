import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Server, MapLocation, ServerSlug, LocationCategory } from './types';
import { ApiService } from './services/api';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { PlatformNavbar } from './components/platform/PlatformNavbar';
import { HomeHub } from './components/platform/HomeHub';
import { Header } from './components/layout/Header';
import { WandererBanner } from './components/wanderer/WandererBanner';
import { MapViewer } from './components/map/MapViewer';
import { MapControls } from './components/map/MapControls';
import { MapLegend, CATEGORIES_CONFIG } from './components/map/MapLegend';
import { LocationDetailsDrawer } from './components/drawer/LocationDetailsDrawer';
import { CommentsModal } from './components/community/CommentsModal';
import { SuggestionModal } from './components/community/SuggestionModal';
import { AdminModal } from './components/admin/AdminModal';
import { SettingsModal } from './components/common/SettingsModal';
import { Footer } from './components/layout/Footer';

// PLATFORM MODULE COMPONENTS
import { OriginalMinigameContainer } from './components/modules/OriginalMinigameContainer';
import { MoneyLaunderingCalc } from './components/modules/MoneyLaunderingCalc';
import { RpReferenceTables } from './components/modules/RpReferenceTables';

// MAP MODULE
function MapModule() {
  const [servers, setServers] = useState<Server[]>([]);
  const [activeServer, setActiveServer] = useState<Server | null>(null);
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);

  const [selectedCategories, setSelectedCategories] = useState<LocationCategory[]>(
    CATEGORIES_CONFIG.map(c => c.category)
  );

  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(
    localStorage.getItem('cidade_alta_admin') === 'true'
  );

  const [isAddingMarkerMode, setIsAddingMarkerMode] = useState(false);
  const [newMarkerCoords, setNewMarkerCoords] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    loadServers();
  }, []);

  useEffect(() => {
    if (activeServer) {
      loadLocations(activeServer.id);
    }
  }, [activeServer?.id]);

  const loadServers = async () => {
    const data = await ApiService.getServers();
    setServers(data);
    const initial = data.find(s => s.slug === 'cda') || data[0] || null;
    setActiveServer(initial);
  };

  const loadLocations = async (serverId: string) => {
    const data = await ApiService.getLocations(serverId);
    setLocations(data);
  };

  const handleSelectServer = (slug: ServerSlug) => {
    const target = servers.find(s => s.slug === slug);
    if (target && target.id !== activeServer?.id) {
      setActiveServer(target);
      setSelectedLocation(null);
      setNewMarkerCoords(null);
      setIsAddingMarkerMode(false);
    }
  };

  const handleToggleCategory = useCallback((category: LocationCategory) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  }, []);

  const handleSelectAllCategories = useCallback(() => {
    setSelectedCategories(prev => {
      if (prev.length === CATEGORIES_CONFIG.length) {
        return [];
      } else {
        return CATEGORIES_CONFIG.map(c => c.category);
      }
    });
  }, []);

  const handleConfirmWandererLocation = useCallback(async (locationId: string) => {
    const result = await ApiService.toggleWandererConfirmation(locationId);
    setLocations(prev =>
      prev.map(loc => {
        if (loc.id === locationId) {
          return {
            ...loc,
            confirmations_count: result.count,
            user_has_confirmed: result.confirmed
          };
        }
        return loc;
      })
    );
    setSelectedLocation(prev => {
      if (prev?.id === locationId) {
        return {
          ...prev,
          confirmations_count: result.count,
          user_has_confirmed: result.confirmed
        };
      }
      return prev;
    });
  }, []);

  const handleFocusLocation = useCallback((location: MapLocation) => {
    setSelectedLocation(location);
  }, []);

  const handleAdminAuthenticate = useCallback((username: string, passcode: string) => {
    if (username.trim().toLowerCase() === 'malaca' && passcode.trim() === '199425') {
      setIsAdminAuthenticated(true);
      localStorage.setItem('cidade_alta_admin', 'true');
      return true;
    }
    return false;
  }, []);

  const handleAdminLogout = useCallback(() => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('cidade_alta_admin');
  }, []);

  const handleMapClickForNewMarker = useCallback((coords: { x: number; y: number }) => {
    setNewMarkerCoords(coords);
    setIsAddingMarkerMode(false);
    setIsAdminOpen(true);
  }, []);

  const filteredLocations = useMemo(() => {
    return locations.filter(loc => selectedCategories.includes(loc.category));
  }, [locations, selectedCategories]);

  const andarilhoSpots = useMemo(() => {
    return locations.filter(l => l.category === 'Andarilho');
  }, [locations]);

  const topVotedAndarilho = useMemo(() => {
    if (andarilhoSpots.length === 0) return null;
    const sorted = [...andarilhoSpots].sort((a, b) => (b.confirmations_count || 0) - (a.confirmations_count || 0));
    return sorted[0]?.confirmations_count && sorted[0].confirmations_count > 0 ? sorted[0] : null;
  }, [andarilhoSpots]);

  const handleZoomIn = useCallback(() => {
    const el = document.querySelector('.leaflet-container');
    if (el) {
      const evt = new WheelEvent('wheel', { deltaY: -100 });
      el.dispatchEvent(evt);
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    const el = document.querySelector('.leaflet-container');
    if (el) {
      const evt = new WheelEvent('wheel', { deltaY: 100 });
      el.dispatchEvent(evt);
    }
  }, []);

  const handleResetView = useCallback(() => {
    setActiveServer(prev => {
      if (prev) {
        const temp = prev;
        setTimeout(() => setActiveServer(temp), 50);
        return null;
      }
      return prev;
    });
  }, []);

  const handleFocusAndarilho = useCallback(() => {
    if (topVotedAndarilho) {
      setSelectedLocation(topVotedAndarilho);
    }
  }, [topVotedAndarilho]);

  return (
    <>
      <div className="flex-1 flex flex-col w-full h-full overflow-hidden">
        <Header
          servers={servers}
          activeServer={activeServer}
          onSelectServer={handleSelectServer}
          onOpenComments={() => setIsCommentsOpen(true)}
          onOpenSuggestions={() => setIsSuggestionsOpen(true)}
          onOpenAdmin={() => setIsAdminOpen(true)}
          isAdminAuthenticated={isAdminAuthenticated}
        />

        <WandererBanner
          locations={locations}
          onFocusLocation={handleFocusLocation}
        />

        <div className="relative flex-1 w-full h-full overflow-hidden">
          <MapLegend
            locations={locations}
            selectedCategories={selectedCategories}
            onToggleCategory={handleToggleCategory}
            onSelectAll={handleSelectAllCategories}
          />

          {activeServer && (
            <MapViewer
              mapImageUrl={activeServer.map_image_url}
              locations={filteredLocations}
              selectedLocation={selectedLocation}
              onSelectLocation={setSelectedLocation}
              isAddingMarker={isAddingMarkerMode}
              onMapClickForNewMarker={handleMapClickForNewMarker}
              newMarkerDraftCoords={newMarkerCoords}
              mostVotedAndarilhoId={topVotedAndarilho?.id}
            />
          )}

          <MapControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetView={handleResetView}
            onFocusAndarilho={handleFocusAndarilho}
            hasAndarilhoSpots={Boolean(topVotedAndarilho)}
          />

          {activeServer && (
            <LocationDetailsDrawer
              location={selectedLocation}
              onClose={() => setSelectedLocation(null)}
              onConfirmLocation={handleConfirmWandererLocation}
              currentServerId={activeServer.id}
            />
          )}
        </div>
      </div>

      <CommentsModal
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        activeServer={activeServer}
        isAdminAuthenticated={isAdminAuthenticated}
      />

      <SuggestionModal
        isOpen={isSuggestionsOpen}
        onClose={() => setIsSuggestionsOpen(false)}
        activeServer={activeServer}
      />

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        isAuthenticated={isAdminAuthenticated}
        onAuthenticate={handleAdminAuthenticate}
        onLogout={handleAdminLogout}
        servers={servers}
        activeServer={activeServer}
        locations={locations}
        onRefreshData={() => activeServer && loadLocations(activeServer.id)}
        onStartVisualAddMarker={() => {
          setIsAddingMarkerMode(true);
        }}
        newMarkerCoords={newMarkerCoords}
        onClearNewMarkerCoords={() => setNewMarkerCoords(null)}
      />
    </>
  );
}

// MAIN APP CONTENT WRAPPER WITH THEME, BRIGHTNESS & DARK WALLPAPER
function AppContent() {
  const { theme, brightness } = useSettings();
  const location = useLocation();
  const isMapRoute = location.pathname === '/mapa';

  // Theme styling mapping
  const themeClasses: Record<string, string> = {
    dark: 'bg-slate-950 text-slate-100',
    midnight: 'bg-black text-slate-100',
    soft: 'bg-slate-900 text-slate-200',
    light: 'bg-slate-100 text-slate-950'
  };

  const themeGradients: Record<string, string> = {
    dark: 'from-slate-950 via-blue-950/80 to-slate-950',
    midnight: 'from-black via-slate-950/90 to-black',
    soft: 'from-slate-950 via-slate-900/90 to-slate-950',
    light: 'from-slate-100 via-blue-50/80 to-slate-100'
  };

  return (
    <div 
      className={`relative flex flex-col h-screen w-screen overflow-hidden font-sans ${themeClasses[theme] || themeClasses.dark}`}
      style={{ filter: `brightness(${brightness}%)` }}
    >
      {/* GLOBAL BACKGROUND WITH BALANCED WALLPAPER BRIGHTNESS & DEEP BLUE GRADIENT */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-slate-950">
        {/* Wallpaper image with higher visibility/brightness */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 transition-all duration-500"
          style={{ backgroundImage: "url('/images/bg_wallpaper.jpg')" }}
        />

        {/* Rich blue & dark gradient overlay (blended) */}
        <div className={`absolute inset-0 bg-gradient-to-br ${themeGradients[theme] || themeGradients.dark} opacity-85 transition-colors duration-500`} />

        {/* Soft radial vignette for subtle contrast */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-slate-950/40 to-slate-950/90" />
      </div>

      {/* NAVBAR */}
      <div className="relative z-20">
        <PlatformNavbar />
      </div>

      {/* PAGE CONTENT ROUTER */}
      <main className="relative z-10 flex-1 flex flex-col w-full h-full overflow-hidden">
        <Routes>
          <Route path="/" element={<HomeHub />} />
          <Route path="/mapa" element={<MapModule />} />
          <Route path="/caixinha" element={<OriginalMinigameContainer gamePath="/caixinha/index.html" title="Caixinha Eletrônica" />} />
          <Route path="/hacking" element={<OriginalMinigameContainer gamePath="/hacking/index.html" title="Hacking Keycard" />} />
          <Route path="/lockpick" element={<OriginalMinigameContainer gamePath="/lockpick/index.html" title="Lockpick Simulator" />} />
          <Route path="/calculadora" element={<MoneyLaunderingCalc />} />
          <Route path="/tabelas" element={<RpReferenceTables />} />
        </Routes>
      </main>

      {/* FOOTER (hidden on full screen interactive map for clean UX) */}
      {!isMapRoute && (
        <div className="relative z-20">
          <Footer />
        </div>
      )}

      {/* APPEARANCE SETTINGS MODAL */}
      <SettingsModal />
    </div>
  );
}

// ROOT PROVIDER WRAPPER
export default function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <AppContent />
      </SettingsProvider>
    </BrowserRouter>
  );
}
