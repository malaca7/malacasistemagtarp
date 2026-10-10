import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapLocation, LocationCategory } from '../../types';
import { ZoomIn, ZoomOut, Maximize2, LocateFixed, Compass, Search, Copy, Check, Crosshair, Sun, Moon } from 'lucide-react';

interface MapContainerProps {
  mapImageUrl: string;
  locations: MapLocation[];
  selectedLocation: MapLocation | null;
  onSelectLocation: (location: MapLocation) => void;
  selectedCategories: LocationCategory[];
  isAdminPinMode?: boolean;
  onAdminMapClick?: (x: number, y: number) => void;
}

const CATEGORY_COLORS: Record<LocationCategory, string> = {
  hospital_ilegal: '#ef4444',
  mercado_ilegal: '#f59e0b',
  lavanderia_ilegal: '#3b82f6',
  desmanche: '#10b981',
  andarilho: '#8b5cf6',
  local_possivel: '#a78bfa',
  outros: '#6b7280',
};

const CATEGORY_ICONS: Record<LocationCategory, string> = {
  hospital_ilegal: '🏥',
  mercado_ilegal: '🛒',
  lavanderia_ilegal: '🧺',
  desmanche: '🔧',
  andarilho: '🚶‍♂️',
  local_possivel: '❓',
  outros: '📍',
};

export const MapContainer: React.FC<MapContainerProps> = ({
  mapImageUrl,
  locations,
  selectedLocation,
  onSelectLocation,
  selectedCategories,
  isAdminPinMode,
  onAdminMapClick,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const overlayRef = useRef<L.ImageOverlay | null>(null);

  // Live Coordinates HUD
  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number } | null>(null);

  // Quick Search Bar
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  // Map Theme: default is Dark ('dark')
  const [mapTheme, setMapTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('malaca_map_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  const applyThemeToMapOverlay = (theme: 'dark' | 'light') => {
    // Authentic dark tactical GTA radar filter (deep charcoal terrain, dark navy ocean, crisp roads)
    const filterValue =
      theme === 'dark'
        ? 'brightness(0.32) contrast(1.55) saturate(0.65) invert(0.06)'
        : 'none';

    // 1. Direct overlay element styling
    const directEl = overlayRef.current?.getElement();
    if (directEl) {
      directEl.style.setProperty('filter', filterValue, 'important');
      directEl.style.setProperty('transition', 'filter 0.35s ease', 'important');
    }

    // 2. Query all raster image elements in container to guarantee styling
    if (containerRef.current) {
      const imgs = containerRef.current.querySelectorAll<HTMLImageElement>(
        '.leaflet-image-layer, .gta-map-image-layer, .leaflet-overlay-pane img'
      );
      imgs.forEach((img) => {
        img.style.setProperty('filter', filterValue, 'important');
        img.style.setProperty('transition', 'filter 0.35s ease', 'important');
      });
    }
  };

  const handleToggleTheme = () => {
    setMapTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('malaca_map_theme', next);
      showToast(next === 'dark' ? '🌙 Modo Mapa Escuro ativado' : '☀️ Modo Mapa Claro ativado');
      return next;
    });
  };

  // Sync theme to DOM elements whenever theme changes
  useEffect(() => {
    applyThemeToMapOverlay(mapTheme);
  }, [mapTheme]);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Map Bounds for relative coordinate space (0..1000, 0..1000)
  const bounds: L.LatLngBoundsExpression = [
    [0, 0],
    [1000, 1000],
  ];

  const extendedBounds: L.LatLngBoundsExpression = [
    [-150, -150],
    [1150, 1150],
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current) return;

    const map = L.map(containerRef.current, {
      crs: L.CRS.Simple,
      maxZoom: 4,
      maxBounds: extendedBounds,
      maxBoundsViscosity: 0.4,
      zoomControl: false,
      attributionControl: false,
      bounceAtZoomLimits: false,
    });

    const overlay = L.imageOverlay(mapImageUrl, bounds, {
      className: 'gta-map-image-layer',
    }).addTo(map);
    overlayRef.current = overlay;

    overlay.on('load', () => {
      applyThemeToMapOverlay(mapTheme);
    });
    // Immediately apply in case already in DOM
    applyThemeToMapOverlay(mapTheme);

    const updateZoomLimits = () => {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const fitZoom = map.getBoundsZoom(bounds, false);
      const minZoom = isMobile ? fitZoom - 0.4 : fitZoom;
      map.setMinZoom(minZoom);
      if (map.getZoom() < minZoom) {
        map.setZoom(minZoom);
      }
    };

    map.fitBounds(bounds);
    updateZoomLimits();

    map.on('resize', updateZoomLimits);

    // Track mouse movement for live X/Y GTA coordinates
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      const x = Math.round(e.latlng.lng);
      const y = Math.round(e.latlng.lat);
      if (x >= 0 && x <= 1000 && y >= 0 && y <= 1000) {
        setHoverCoords({ x, y });
      }
    });

    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;
    mapRef.current = map;

    return () => {
      map.off('resize', updateZoomLimits);
      map.remove();
    };
  }, [mapImageUrl]);

  // Handle Admin Click for Coordinates
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (isAdminPinMode && onAdminMapClick) {
        onAdminMapClick(Math.round(e.latlng.lng), Math.round(e.latlng.lat));
      }
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [isAdminPinMode, onAdminMapClick]);

  // Update Markers
  useEffect(() => {
    const markersGroup = markersGroupRef.current;
    if (!markersGroup) return;

    markersGroup.clearLayers();

    // Find Wanderer location with highest confirmations
    const wandererLocs = locations.filter(
      (l) => (l.category === 'andarilho' || l.category === 'local_possivel') && (l.confirmations_count || 0) > 0
    );
    let mostConfirmedId: string | null = null;
    if (wandererLocs.length > 0) {
      const topLoc = wandererLocs.reduce((max, loc) =>
        (loc.confirmations_count || 0) > (max.confirmations_count || 0) ? loc : max
      );
      if ((topLoc.confirmations_count || 0) > 0) {
        mostConfirmedId = topLoc.id;
      }
    }

    // Filtro inteligente para locais do Andarilho e demais categorias
    const filteredLocations = locations.filter((loc) => {
      const isWandererPoint = loc.category === 'andarilho' || loc.category === 'local_possivel';
      if (isWandererPoint) {
        const hasConfirmations = (loc.confirmations_count || 0) > 0 || loc.user_confirmed;
        const wantPossivel = selectedCategories.includes('local_possivel');
        const wantConfirmado = selectedCategories.includes('andarilho');

        // Se marcou "Possíveis Locais", exibe todos os pontos do ciclo
        if (wantPossivel) return true;
        // Se marcou apenas "Andarilho (Confirmado)", exibe somente os com confirmação
        if (wantConfirmado && hasConfirmations) return true;
        return false;
      }
      return selectedCategories.includes(loc.category);
    });

    filteredLocations.forEach((loc) => {
      const isSelected = selectedLocation?.id === loc.id;
      const isAndarilho = loc.category === 'andarilho' || loc.category === 'local_possivel';
      const isMostConfirmed = loc.id === mostConfirmedId && (loc.confirmations_count || 0) > 0;
      const hasConfirmations = (loc.confirmations_count || 0) > 0 || loc.user_confirmed;
      const isUnconfirmedPossivel = isAndarilho && !hasConfirmations;
      const isConfirmedAndarilho = isAndarilho && hasConfirmations;

      const color = loc.color || CATEGORY_COLORS[loc.category] || '#00d2ff';
      const iconSymbol = isUnconfirmedPossivel ? '❓' : CATEGORY_ICONS[loc.category] || '📍';

      const customIcon = L.divIcon({
        className: 'custom-map-pin-wrapper',
        html: `
          <div class="relative flex items-center justify-center pointer-events-auto cursor-pointer transition-transform duration-300 ${
            isSelected ? 'scale-125 z-50' : isConfirmedAndarilho ? 'scale-110 z-40' : 'scale-100 active:scale-125 z-20'
          }" style="width: 32px; height: 32px;">
            ${
              isMostConfirmed
                ? `<div class="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#00d2ff] to-[#38bdf8] text-black font-black text-[9px] px-2 py-0.5 rounded-full border border-white shadow-xl flex items-center gap-0.5 animate-bounce z-30 whitespace-nowrap pointer-events-none">
                    👑 MAIS CONFIRMADO
                   </div>`
                : ''
            }
            ${
              isUnconfirmedPossivel
                ? `<div class="absolute inset-0 -m-1 rounded-full border border-[#00d2ff]/40 animate-ping pointer-events-none opacity-40"></div>`
                : ''
            }
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all duration-300 ${
              isConfirmedAndarilho
                ? 'bg-gradient-to-tr from-[#0284c7] via-[#00d2ff] to-[#38bdf8] border-2 border-white ring-4 ring-[#00d2ff]/70 shadow-[0_0_20px_#00d2ff] animate-pulse text-white'
                : isUnconfirmedPossivel
                ? 'bg-[#060d1a] border-2 border-[#00d2ff] shadow-[0_0_14px_rgba(0,210,255,0.75)] text-[#38bdf8] hover:border-white'
                : isSelected
                ? 'border-2 border-white shadow-[0_0_15px_#00d2ff] animate-bounce ring-2 ring-[#38bdf8]'
                : 'border-2 border-black/80 shadow-black/80'
            }" style="${!isConfirmedAndarilho && !isUnconfirmedPossivel ? `background-color: ${color};` : ''}">
              <span class="drop-shadow-md text-xs leading-none select-none">${iconSymbol}</span>
            </div>
            
            ${
              hasConfirmations
                ? `<div class="absolute -bottom-1 -right-1 ${
                    isMostConfirmed ? 'bg-[#38bdf8] text-black font-black' : 'bg-[#00d2ff] text-black font-black'
                  } text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border border-white shadow-md leading-none pointer-events-none">
                    ${loc.confirmations_count || 1}
                   </div>`
                : ''
            }

            <div class="absolute top-9 left-1/2 -translate-x-1/2 hidden md:group-hover:block bg-[#030712]/95 text-white text-[10px] font-semibold px-2 py-1 rounded-lg border border-[#00d2ff]/40 whitespace-nowrap shadow-2xl z-50 pointer-events-none">
              ${loc.name} ${loc.confirmations_count ? `(${loc.confirmations_count} confirmações)` : isUnconfirmedPossivel ? '(Possível Local)' : ''}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([loc.y, loc.x], { icon: customIcon, riseOnHover: true });

      const handleSelect = (e: L.LeafletEvent) => {
        L.DomEvent.stopPropagation(e as any);
        onSelectLocation(loc);
      };

      marker.on('click', handleSelect);

      markersGroup.addLayer(marker);
    });
  }, [locations, selectedCategories, selectedLocation, onSelectLocation]);

  // Search Results Filtering
  const searchResults = searchQuery.trim()
    ? locations.filter(
        (l) =>
          l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (l.description && l.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const handleSelectSearchResult = (loc: MapLocation) => {
    onSelectLocation(loc);
    mapRef.current?.setView([loc.y, loc.x], 2);
    setSearchQuery('');
    setSearchOpen(false);
  };

  const handleCopyHoverCoords = () => {
    if (hoverCoords) {
      navigator.clipboard.writeText(`X: ${hoverCoords.x} | Y: ${hoverCoords.y}`);
      showToast(`Coordenadas X: ${hoverCoords.x} Y: ${hoverCoords.y} copiadas!`);
    }
  };

  // Controls Handlers
  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleResetView = () => mapRef.current?.fitBounds(bounds);
  const handleCenter = () => {
    if (selectedLocation) {
      mapRef.current?.setView([selectedLocation.y, selectedLocation.x], 2);
    } else {
      mapRef.current?.setView([500, 500], 0);
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className={`relative w-full h-full bg-slate-950 overflow-hidden select-none ${mapTheme === 'dark' ? 'map-dark-theme' : 'map-light-theme'}`}>
      {/* Scoped style to guarantee map dark/light filter across all browsers and bundlers */}
      <style>{`
        .map-dark-theme .leaflet-image-layer,
        .map-dark-theme .gta-map-image-layer,
        .map-dark-theme .leaflet-overlay-pane img,
        .map-dark-theme .leaflet-pane img {
          filter: brightness(0.32) contrast(1.55) saturate(0.65) invert(0.06) !important;
          transition: filter 0.35s ease !important;
        }
        .map-dark-theme .leaflet-container {
          background-color: #060913 !important;
        }
        .map-light-theme .leaflet-image-layer,
        .map-light-theme .gta-map-image-layer,
        .map-light-theme .leaflet-overlay-pane img,
        .map-light-theme .leaflet-pane img {
          filter: none !important;
          transition: filter 0.35s ease !important;
        }
        .map-light-theme .leaflet-container {
          background-color: #1e293b !important;
        }
      `}</style>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#00d2ff] text-black font-extrabold text-xs px-4 py-2 rounded-full shadow-2xl border border-white z-30 animate-in fade-in duration-200">
          {toastMessage}
        </div>
      )}

      {/* Map Container Element */}
      <div ref={containerRef} className="w-full h-full z-10" />

      {/* Admin Mode Overlay Banner */}
      {isAdminPinMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#00d2ff] to-[#2563eb] text-black font-black text-xs px-4 py-2 rounded-full border border-white shadow-2xl z-20 flex items-center gap-2 animate-pulse">
          <LocateFixed className="w-4 h-4" />
          <span>Modo de Seleção de Coordenada Ativo. Clique em qualquer lugar no mapa!</span>
        </div>
      )}

      {/* TOP LEFT: Quick Search & Filter Bar */}
      <div className="absolute top-4 left-4 z-20 w-64 md:w-80">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar pontos no mapa..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            className="w-full bg-[#030712]/90 backdrop-blur-md border border-[#00d2ff]/25 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00d2ff] shadow-2xl transition-all"
          />

          {/* Search Dropdown Results */}
          {searchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#060d1a] backdrop-blur-xl border border-[#00d2ff]/30 rounded-xl overflow-hidden shadow-2xl max-h-60 overflow-y-auto z-30">
              {searchResults.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => handleSelectSearchResult(loc)}
                  className="w-full px-3 py-2 text-left hover:bg-[#00d2ff]/15 border-b border-slate-900/60 last:border-0 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-sm">{CATEGORY_ICONS[loc.category] || '📍'}</span>
                    <span className="text-xs font-bold text-slate-200 truncate">{loc.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#38bdf8] font-semibold whitespace-nowrap ml-2">
                    X: {loc.x} Y: {loc.y}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TOP RIGHT: Live Coordinates HUD & Copy Action */}
      {hoverCoords && (
        <div
          onClick={handleCopyHoverCoords}
          className="absolute top-4 right-4 z-20 bg-[#030712]/90 backdrop-blur-md border border-[#00d2ff]/30 px-3.5 py-1.5 rounded-xl shadow-2xl flex items-center gap-2 cursor-pointer hover:border-[#00d2ff] transition-all text-xs font-mono text-slate-300 group"
          title="Clique para copiar coordenadas GTA"
        >
          <Crosshair className="w-3.5 h-3.5 text-[#00d2ff] group-hover:animate-spin" />
          <span>X: <strong className="text-white">{hoverCoords.x}</strong> | Y: <strong className="text-white">{hoverCoords.y}</strong></span>
          <Copy className="w-3 h-3 text-slate-500 group-hover:text-[#38bdf8] transition-colors ml-1" />
        </div>
      )}

      {/* Map Interactive Control Panel */}
      <div className="absolute bottom-6 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={handleToggleTheme}
          className="w-10 h-10 rounded-xl bg-[#060d1a] backdrop-blur-md border border-[#00d2ff]/25 text-slate-200 hover:text-white hover:bg-[#00d2ff]/20 hover:border-[#00d2ff]/60 flex items-center justify-center shadow-xl transition-all group"
          title={mapTheme === 'dark' ? 'Mudar para Mapa Claro' : 'Mudar para Mapa Escuro (Padrão)'}
        >
          {mapTheme === 'dark' ? (
            <Moon className="w-5 h-5 text-[#00d2ff] group-hover:scale-110 transition-transform" />
          ) : (
            <Sun className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
          )}
        </button>
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 rounded-xl bg-[#060d1a] backdrop-blur-md border border-[#00d2ff]/25 text-slate-200 hover:text-white hover:bg-[#00d2ff]/20 hover:border-[#00d2ff]/60 flex items-center justify-center shadow-xl transition-all"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 rounded-xl bg-[#060d1a] backdrop-blur-md border border-[#00d2ff]/25 text-slate-200 hover:text-white hover:bg-[#00d2ff]/20 hover:border-[#00d2ff]/60 flex items-center justify-center shadow-xl transition-all"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={handleCenter}
          className="w-10 h-10 rounded-xl bg-[#060d1a] backdrop-blur-md border border-[#00d2ff]/25 text-slate-200 hover:text-white hover:bg-[#00d2ff]/20 hover:border-[#00d2ff]/60 flex items-center justify-center shadow-xl transition-all"
          title="Centralizar no Ponto"
        >
          <Compass className="w-5 h-5 text-[#00d2ff]" />
        </button>
        <button
          onClick={handleToggleFullscreen}
          className="w-10 h-10 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-slate-200 hover:text-white hover:bg-cyan-600/20 hover:border-cyan-500/50 flex items-center justify-center shadow-xl transition-all"
          title="Alternar Tela Cheia"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-6 left-4 z-20 hidden md:block">
        <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800/80 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 max-w-[200px]">
          <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
            Legenda de Categorias
          </span>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="truncate">Hospital</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="truncate">Mercado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="truncate">Lavanderia</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="truncate">Desmanche</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span className="truncate">Andarilho</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00d2ff] border border-white" />
              <span className="truncate">Possíveis</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 mt-1">
            <span className="text-[10px] text-slate-400 font-semibold">Tema:</span>
            <button
              onClick={handleToggleTheme}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-[#00d2ff] text-[10px] font-bold text-slate-200 hover:text-white transition-all"
              title="Alternar entre modo escuro e claro"
            >
              {mapTheme === 'dark' ? (
                <>
                  <Moon className="w-3 h-3 text-[#00d2ff]" />
                  <span>Escuro (Padrão)</span>
                </>
              ) : (
                <>
                  <Sun className="w-3 h-3 text-amber-400" />
                  <span>Claro</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
