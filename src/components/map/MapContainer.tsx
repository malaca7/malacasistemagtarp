import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapLocation, LocationCategory } from '../../types';
import { ZoomIn, ZoomOut, Maximize2, LocateFixed, Compass, Search, Copy, Check, Crosshair } from 'lucide-react';

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

  // Live Coordinates HUD
  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number } | null>(null);

  // Quick Search Bar
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Map Bounds for relative coordinate space (0..1000, 0..1000)
  const bounds: L.LatLngBoundsExpression = [
    [0, 0],
    [1000, 1000],
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
      maxZoom: 3,
      maxBounds: bounds,
      maxBoundsViscosity: 1.0,
      zoomControl: false,
      attributionControl: false,
      bounceAtZoomLimits: false,
    });

    L.imageOverlay(mapImageUrl, bounds).addTo(map);

    const updateZoomLimits = () => {
      const minZoom = map.getBoundsZoom(bounds, true);
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

    const filteredLocations = locations.filter((loc) =>
      selectedCategories.includes(loc.category)
    );

    filteredLocations.forEach((loc) => {
      const isSelected = selectedLocation?.id === loc.id;
      const isAndarilho = loc.category === 'andarilho' || loc.category === 'local_possivel';
      const isMostConfirmed = loc.id === mostConfirmedId;
      const isUnconfirmedPossibleSpot = loc.category === 'local_possivel' && (loc.confirmations_count || 0) === 0;

      let color = loc.color || CATEGORY_COLORS[loc.category] || '#3b82f6';
      let iconSymbol = CATEGORY_ICONS[loc.category] || '📍';

      if (isAndarilho && (loc.confirmations_count || 0) > 0) {
        iconSymbol = '🚶‍♂️';
        color = isMostConfirmed ? '#f59e0b' : '#8b5cf6';
      }

      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: isUnconfirmedPossibleSpot
          ? `
          <div class="relative group cursor-pointer transition-transform duration-200 ${
            isSelected ? 'scale-125 z-50' : 'scale-100 hover:scale-125 z-10'
          }">
            <div class="w-7 h-7 rounded-full bg-sky-500/25 border-2 border-dashed border-sky-400 flex items-center justify-center shadow-lg transition-all duration-200 ${
              isSelected ? 'ring-2 ring-white animate-pulse' : ''
            }">
              <div class="w-2.5 h-2.5 rounded-full bg-sky-400"></div>
            </div>
            <div class="absolute top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-950/95 text-sky-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-sky-800 whitespace-nowrap shadow-xl z-50 pointer-events-none">
              ⭕ ${loc.name} (Clique para marcar)
            </div>
          </div>
        `
          : `
          <div class="relative group cursor-pointer transition-transform duration-200 ${
            isSelected ? 'scale-125 z-50' : 'scale-100 hover:scale-115 z-10'
          }">
            ${
              isMostConfirmed
                ? `<div class="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded-full border border-amber-200 shadow-lg flex items-center gap-0.5 animate-bounce z-30 whitespace-nowrap pointer-events-none">
                    👑 MAIS VOTADO
                   </div>`
                : ''
            }
            <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-md border-[1.5px] transition-all duration-200 ${
              isMostConfirmed
                ? 'border-amber-300 ring-2 ring-amber-400/60 shadow-amber-500/80 animate-pulse'
                : isSelected
                ? 'border-white shadow-purple-500/50 animate-bounce ring-2 ring-purple-400/50'
                : 'border-slate-900/90 shadow-black/90'
            }" style="background-color: ${color}">
              <span class="drop-shadow-sm text-[12px] leading-none">${iconSymbol}</span>
            </div>
            
            ${
              isAndarilho && (loc.confirmations_count || 0) > 0
                ? `<div class="absolute -bottom-1 -right-1 ${
                    isMostConfirmed ? 'bg-amber-500 text-slate-950' : 'bg-purple-600 text-white'
                  } text-[9px] font-extrabold px-1 py-0.2 rounded-full border border-white shadow-sm leading-none pointer-events-none">
                    ${loc.confirmations_count}
                   </div>`
                : ''
            }

            <div class="absolute top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-950/95 text-white text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-800 whitespace-nowrap shadow-xl z-50 pointer-events-none">
              ${loc.name} ${loc.confirmations_count ? `(${loc.confirmations_count} confirmações)` : ''}
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([loc.y, loc.x], { icon: customIcon });

      marker.on('click', () => {
        onSelectLocation(loc);
      });

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
    <div className="relative w-full h-full bg-slate-950 overflow-hidden select-none">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-cyan-600 text-white font-bold text-xs px-4 py-2 rounded-full shadow-2xl border border-cyan-400 z-30 animate-in fade-in duration-200">
          {toastMessage}
        </div>
      )}

      {/* Map Container Element */}
      <div ref={containerRef} className="w-full h-full z-10" />

      {/* Admin Mode Overlay Banner */}
      {isAdminPinMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-purple-600/90 backdrop-blur text-white text-xs font-bold px-4 py-2 rounded-full border border-purple-400 shadow-2xl z-20 flex items-center gap-2 animate-pulse">
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
            className="w-full bg-slate-950/90 backdrop-blur-md border border-slate-800/90 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 shadow-2xl transition-all"
          />

          {/* Search Dropdown Results */}
          {searchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-xl overflow-hidden shadow-2xl max-h-60 overflow-y-auto z-30">
              {searchResults.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => handleSelectSearchResult(loc)}
                  className="w-full px-3 py-2 text-left hover:bg-slate-900/80 border-b border-slate-900/60 last:border-0 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-sm">{CATEGORY_ICONS[loc.category] || '📍'}</span>
                    <span className="text-xs font-bold text-slate-200 truncate">{loc.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 font-semibold whitespace-nowrap ml-2">
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
          className="absolute top-4 right-4 z-20 bg-slate-950/90 backdrop-blur-md border border-slate-800/90 px-3.5 py-1.5 rounded-xl shadow-2xl flex items-center gap-2 cursor-pointer hover:border-cyan-500/50 transition-all text-xs font-mono text-slate-300 group"
          title="Clique para copiar coordenadas GTA"
        >
          <Crosshair className="w-3.5 h-3.5 text-cyan-400 group-hover:animate-spin" />
          <span>X: <strong className="text-white">{hoverCoords.x}</strong> | Y: <strong className="text-white">{hoverCoords.y}</strong></span>
          <Copy className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-colors ml-1" />
        </div>
      )}

      {/* Map Interactive Control Panel */}
      <div className="absolute bottom-6 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-slate-200 hover:text-white hover:bg-cyan-600/20 hover:border-cyan-500/50 flex items-center justify-center shadow-xl transition-all"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-slate-200 hover:text-white hover:bg-cyan-600/20 hover:border-cyan-500/50 flex items-center justify-center shadow-xl transition-all"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={handleCenter}
          className="w-10 h-10 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-slate-200 hover:text-white hover:bg-cyan-600/20 hover:border-cyan-500/50 flex items-center justify-center shadow-xl transition-all"
          title="Centralizar no Ponto"
        >
          <Compass className="w-5 h-5 text-cyan-400" />
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
          </div>
        </div>
      </div>
    </div>
  );
};
