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

  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const bounds: L.LatLngBoundsExpression = [
    [0, 0],
    [1000, 1000],
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

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

  useEffect(() => {
    const markersGroup = markersGroupRef.current;
    if (!markersGroup) return;

    markersGroup.clearLayers();

    const wandererLocs = locations.filter(
      (l) => (l.category === 'andarilho' || l.category === 'local_possivel') && (l.confirmations_count || 0) > 0
    );
    let mostConfirmedId: string | null = null;
    if (wandererLocs.length > 0) {
      const topLoc = wandererLocs.reduce((max, loc) =>
        (loc.confirmations_count || 0) > (max.confirmations_count || 0) ? loc : max
      );
    }

    const filteredLocations = locations.filter((loc) =>
      selectedCategories.includes(loc.category)
    );

    filteredLocations.forEach((loc) => {
      const isSelected = selectedLocation?.id === loc.id;
      const color = getCategoryColor(loc.category);
      const iconSymbol = getCategoryIcon(loc.category);
      const isAndarilho = loc.category === 'andarilho' || loc.category === 'local_possivel';
      const isMostConfirmed = isAndarilho && mostConfirmedLocation?.id === loc.id && (loc.confirmations_count || 0) > 0;
      const hasConfirmations = (loc.confirmations_count || 0) > 0 || (loc as any).user_confirmed;
      const isUnconfirmedPossivel = isAndarilho && !hasConfirmations;
      const isConfirmedAndarilho = isAndarilho && hasConfirmations;

      const customIcon = L.divIcon({
        className: 'custom-map-pin-wrapper',
        html: `
          <div class="relative group cursor-pointer transition-all duration-300 ${
            isUnconfirmedPossivel ? 'opacity-40 scale-90 hover:opacity-100 hover:scale-110 z-10' : isSelected ? 'scale-130 z-50' : 'scale-105 z-20'
          }">
            ${
              isMostConfirmed
                ? `<div class="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#FA7608] to-[#FFB52E] text-black font-black text-[9px] px-2 py-0.5 rounded-full border border-white shadow-xl flex items-center gap-0.5 animate-bounce z-30 whitespace-nowrap pointer-events-none">
                    👑 MAIS CONFIRMADO
                   </div>`
                : ''
            }
            <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] shadow-md transition-all duration-300 ${
              isConfirmedAndarilho
                ? 'border border-[#FFB52E] ring-2 ring-[#FA7608]/70 shadow-[0_0_12px_#FA7608] animate-pulse scale-105'
                : isUnconfirmedPossivel
                ? 'border border-dashed border-[#FA7608]/50 shadow-none'
                : isSelected
                ? 'border border-white shadow-[#FA7608]/80 animate-bounce ring-1 ring-[#FFB52E]'
                : 'border border-black/80 shadow-black/80'
            }" style="background-color: ${color}">
              <span class="drop-shadow-sm text-[10px] leading-none ${isConfirmedAndarilho ? 'filter drop-shadow-[0_0_6px_#FFB52E]' : ''}">${iconSymbol}</span>
            </div>
            
            ${
              hasConfirmations
                ? `<div class="absolute -bottom-1 -right-1 ${
                    isMostConfirmed ? 'bg-[#FFB52E] text-black font-black' : 'bg-[#FA7608] text-white'
                  } text-[8px] font-extrabold px-1 py-0.2 rounded-full border border-white shadow-md leading-none pointer-events-none">
                    ${loc.confirmations_count || 1}
                   </div>`
                : ''
            }

            <div class="absolute top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-black/95 text-white text-[10px] font-semibold px-2 py-1 rounded-lg border border-[#FA7608]/40 whitespace-nowrap shadow-2xl z-50 pointer-events-none">
              ${loc.name} ${loc.confirmations_count ? `(${loc.confirmations_count} confirmações)` : isUnconfirmedPossivel ? '(Não confirmado)' : ''}
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([loc.y, loc.x], { icon: customIcon });

      marker.on('click', () => {
        onSelectLocation(loc);
      });

      markersGroup.addLayer(marker);
    });
  }, [locations, selectedCategories, selectedLocation, onSelectLocation]);

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

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
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
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#FA7608] text-white font-bold text-xs px-4 py-2 rounded-full shadow-2xl border border-[#FFB52E] z-30 animate-in fade-in duration-200">
          {toastMessage}
        </div>
      )}

      {/* Map Container Element */}
      <div ref={containerRef} className="w-full h-full z-10" />

      {/* Admin Mode Overlay Banner */}
      {isAdminPinMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#FA7608] to-[#E73701] text-white text-xs font-bold px-4 py-2 rounded-full border border-[#FFB52E] shadow-2xl z-20 flex items-center gap-2 animate-pulse">
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
            className="w-full bg-[#000000]/90 backdrop-blur-md border border-[#FA7608]/25 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FA7608] shadow-2xl transition-all"
          />

          {/* Search Dropdown Results */}
          {searchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#0D0D0D] backdrop-blur-xl border border-[#FA7608]/30 rounded-xl overflow-hidden shadow-2xl max-h-60 overflow-y-auto z-30">
              {searchResults.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => handleSelectSearchResult(loc)}
                  className="w-full px-3 py-2 text-left hover:bg-[#FA7608]/15 border-b border-slate-900/60 last:border-0 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-sm">{CATEGORY_ICONS[loc.category] || '📍'}</span>
                    <span className="text-xs font-bold text-slate-200 truncate">{loc.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#FFB52E] font-semibold whitespace-nowrap ml-2">
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
          className="absolute top-4 right-4 z-20 bg-[#000000]/90 backdrop-blur-md border border-[#FA7608]/30 px-3.5 py-1.5 rounded-xl shadow-2xl flex items-center gap-2 cursor-pointer hover:border-[#FA7608] transition-all text-xs font-mono text-slate-300 group"
          title="Clique para copiar coordenadas GTA"
        >
          <Crosshair className="w-3.5 h-3.5 text-[#FA7608] group-hover:animate-spin" />
          <span>X: <strong className="text-white">{hoverCoords.x}</strong> | Y: <strong className="text-white">{hoverCoords.y}</strong></span>
          <Copy className="w-3 h-3 text-slate-500 group-hover:text-[#FFB52E] transition-colors ml-1" />
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
