import React, { useState, useEffect } from 'react';
import type { Server, MapLocation, LocationCategory, Comment, Suggestion, SuggestionType } from './types';
import { ApiService } from './services/api';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MapContainer } from './components/Map/MapContainer';
import { LocationDrawer } from './components/Map/LocationDrawer';
import { AdminModal } from './components/Admin/AdminModal';
import { AppearanceModal } from './components/AppearanceModal';

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

  const [comments, setComments] = useState<Comment[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [appearanceOpen, setAppearanceOpen] = useState(false);

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

      const comms = await ApiService.fetchComments(currentServer.id);
      setComments(comms);

      const sugs = await ApiService.fetchSuggestions(currentServer.id);
      setSuggestions(sugs);
    };

    loadServerData();

    // Subscribe to Realtime Comments
    const sub = ApiService.subscribeToComments(currentServer.id, (newComment) => {
      setComments((prev) => [newComment, ...prev]);
    });

    return () => {
      sub.unsubscribe();
    };
  }, [currentServer]);

  // Handlers
  const handleToggleCategory = (category: LocationCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleConfirmLocation = async (locationId: string) => {
    const ok = await ApiService.addWandererConfirmation(locationId);
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
    const ok = await ApiService.removeWandererConfirmation(locationId);
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

  const handleAddComment = async (nickname: string, content: string) => {
    if (!currentServer) return false;
    const ok = await ApiService.addComment({
      server_id: currentServer.id,
      location_id: selectedLocation?.id,
      nickname,
      content,
    });
    if (ok) {
      const freshComms = await ApiService.fetchComments(currentServer.id);
      setComments(freshComms);
    }
    return ok;
  };

  const handleAddSuggestion = async (nickname: string, type: SuggestionType, content: string) => {
    if (!currentServer) return false;
    const ok = await ApiService.addSuggestion({
      server_id: currentServer.id,
      location_id: selectedLocation?.id,
      nickname,
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

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Header Bar */}
      <Header
        servers={servers}
        currentServer={currentServer}
        onSelectServer={handleSelectServer}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onOpenAdmin={() => setAdminOpen(true)}
        onOpenAppearance={() => setAppearanceOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          selectedCategories={selectedCategories}
          onToggleCategory={handleToggleCategory}
          comments={comments}
          onAddComment={handleAddComment}
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
        comments={comments}
        onSaveLocation={handleSaveAdminLocation}
        onDeleteLocation={handleDeleteAdminLocation}
        onUpdateSuggestionStatus={handleUpdateSuggestionStatus}
        onStartPinMode={() => setIsAdminPinMode(true)}
        pendingPinCoords={pendingPinCoords}
      />

      {/* Appearance Customization Modal */}
      <AppearanceModal
        isOpen={appearanceOpen}
        onClose={() => setAppearanceOpen(false)}
      />
    </div>
  );
};

export default App;
