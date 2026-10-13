import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapLocation, LocationCategory } from '../../types';
import { ZoomIn, ZoomOut, Maximize2, LocateFixed, Compass, Search, Copy, Check, Crosshair, Sun, Moon, HelpCircle } from 'lucide-react';
import { WandererTutorialCard } from '../wanderer/WandererTutorialCard';

interface MapContainerProps {
  mapImageUrl: string;
  locations: MapLocation[];
  selectedLocation: MapLocation | null;
  onSelectLocation: (location: MapLocation | null) => void;
  selectedCategories: LocationCategory[];
  isAdminPinMode?: boolean;
  onAdminMapClick?: (x: number, y: number) => void;
}

const CATEGORY_COLORS: Record<LocationCategory, string> = {
  hospital_ilegal: '#ef4444',
  mercado_ilegal: '#f59e0b',
  lavanderia_ilegal: '#9b59b6',
  desmanche: '#10b981',
  andarilho: '#00d2ff',
  local_possivel: '#38bdf8',
  outros: '#6b7280',
};

const CATEGORY_ICONS: Record<LocationCategory, string> = {
  hospital_ilegal: '🏥',
  mercado_ilegal: '🏪',
  lavanderia_ilegal: '🧼',
  desmanche: '🔧',
  andarilho: '🚶‍♂️',
  local_possivel: '⭕',
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

  // Floating Wanderer Tutorial Tip Balloon
  const [showWandererTutorial, setShowWandererTutorial] = useState(false);

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

    // Safety: ensure any previous map or leaflet instance attached to this container is cleanly unmounted
    if (mapRef.current) {
      try {
        mapRef.current.remove();
      } catch (e) {}
      mapRef.current = null;
    }
    if ((containerRef.current as any)._leaflet_id) {
      delete (containerRef.current as any)._leaflet_id;
    }

    const map = L.map(containerRef.current, {
      crs: L.CRS.Simple,
      minZoom: -10,
      maxZoom: 4,
      zoomSnap: 0.05,
      zoomDelta: 0.4,
      wheelPxPerZoomLevel: 80,
      maxBounds: extendedBounds,
      maxBoundsViscosity: 0.8,
      zoomControl: false,
      attributionControl: false,
      bounceAtZoomLimits: false,
      preferCanvas: true,
      fadeAnimation: true,
      markerZoomAnimation: false,
      inertia: true,
      inertiaDeceleration: 3000,
      inertiaMaxSpeed: 1500,
      easeLinearity: 0.2,
      // @ts-ignore
      tapTolerance: 15,
    });

    const overlay = L.imageOverlay(mapImageUrl, bounds, {
      className: 'gta-map-image-layer',
      interactive: false,
    }).addTo(map);
    overlayRef.current = overlay;

    map.on('zoom', () => {
      if (overlayRef.current) {
        overlayRef.current.setBounds(L.latLngBounds(bounds));
      }
    });

    overlay.on('load', () => {
      applyThemeToMapOverlay(mapTheme);
    });
    // Immediately apply in case already in DOM
    applyThemeToMapOverlay(mapTheme);

    const calculateCoverZoom = (): number => {
      try {
        const size = map.getSize();
        if (size && size.x > 0 && size.y > 0) {
          const calculated = map.getBoundsZoom(bounds, true);
          if (Number.isFinite(calculated)) {
            return calculated;
          }
        }
      } catch (e) {}
      return -0.4;
    };

    const updateZoomLimits = () => {
      if (!mapRef.current) return;
      const coverZoom = calculateCoverZoom();
      map.setMinZoom(coverZoom);
      if (map.getZoom() < coverZoom) {
        map.setZoom(coverZoom);
      }
    };

    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
      updateZoomLimits();
    };

    // Inicializa enquadrado em [500, 500] cobrindo toda a tela com zoom seguro
    map.setMinZoom(-10);
    const initialCoverZoom = calculateCoverZoom();
    map.setMinZoom(initialCoverZoom);
    map.setView([500, 500], initialCoverZoom);

    // Multi-stage invalidation to ensure Leaflet recalculates correctly across layout steps
    const timer1 = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
        updateZoomLimits();
      }
    }, 50);

    const timer2 = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
        updateZoomLimits();
      }
    }, 150);

    const timer3 = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
        updateZoomLimits();
      }
    }, 350);

    // ResizeObserver para detectar instantaneamente mudanças na largura da sidebar ou da tela
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(containerRef.current);
    }

    map.on('resize', handleResize);
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      window.addEventListener('orientationchange', handleResize);
    }

    // Otimização: Throttled update com requestAnimationFrame para não congelar o thread principal
    let lastCoordsX = -1;
    let lastCoordsY = -1;
    let coordsRafId: number | null = null;
    let lastCoordsTime = 0;

    const updateCoords = (latlng: L.LatLng, immediate = false) => {
      const x = Math.round(latlng.lng);
      const y = Math.round(latlng.lat);
      if (x < 0 || x > 1000 || y < 0 || y > 1000) return;
      if (x === lastCoordsX && y === lastCoordsY) return;

      lastCoordsX = x;
      lastCoordsY = y;

      const now = performance.now();
      if (immediate || now - lastCoordsTime > 75) {
        lastCoordsTime = now;
        setHoverCoords({ x, y });
      } else if (!coordsRafId) {
        coordsRafId = window.requestAnimationFrame(() => {
          coordsRafId = null;
          lastCoordsTime = performance.now();
          setHoverCoords({ x, y });
        });
      }
    };

    map.on('mousemove', (e: L.LeafletMouseEvent) => updateCoords(e.latlng));
    map.on('click', (e: L.LeafletMouseEvent) => {
      updateCoords(e.latlng, true);
      if (!isAdminPinMode) {
        onSelectLocation(null);
      }
    });

    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;
    mapRef.current = map;

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      if (coordsRafId) cancelAnimationFrame(coordsRafId);
      if (resizeObserver) resizeObserver.disconnect();
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
      }
      if (mapRef.current) {
        try {
          mapRef.current.off('resize', handleResize);
          mapRef.current.remove();
        } catch (e) {}
        mapRef.current = null;
      }
      if (containerRef.current && (containerRef.current as any)._leaflet_id) {
        delete (containerRef.current as any)._leaflet_id;
      }
    };
  }, []);

  // Update map image seamlessly when mapImageUrl changes without destroying Leaflet instance
  useEffect(() => {
    if (overlayRef.current && mapImageUrl) {
      overlayRef.current.setUrl(mapImageUrl);
      overlayRef.current.once('load', () => {
        applyThemeToMapOverlay(mapTheme);
      });
    }
  }, [mapImageUrl, mapTheme]);

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
          <div class="relative flex items-center justify-center pointer-events-auto cursor-pointer transition-transform duration-200 ${
            isSelected ? 'scale-115 z-50' : isConfirmedAndarilho ? 'scale-110 z-40' : 'scale-100 active:scale-110 z-20'
          }" style="width: 44px; height: 44px; transform-origin: center center;">
            ${
              isMostConfirmed
                ? `<div class="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#00d2ff] to-[#38bdf8] text-black font-black text-[9px] px-2 py-0.5 rounded-full border border-white shadow-xl flex items-center gap-0.5 z-30 whitespace-nowrap pointer-events-none">
                    👑 MAIS CONFIRMADO
                   </div>`
                : ''
            }
            ${
              isUnconfirmedPossivel
                ? `<div class="absolute inset-1 rounded-full border-2 border-[#00d2ff]/40 animate-ping pointer-events-none opacity-40"></div>`
                : ''
            }
            <div class="w-9 h-9 rounded-full flex items-center justify-center text-xs transition-all duration-300 ${
              isConfirmedAndarilho
                ? 'bg-gradient-to-tr from-[#0284c7] via-[#00d2ff] to-[#38bdf8] border-2 border-white ring-4 ring-[#00d2ff]/70 shadow-[0_0_20px_#00d2ff] text-white'
                : isUnconfirmedPossivel
                ? 'bg-[#060d1a] border-2 border-[#00d2ff] shadow-[0_0_14px_rgba(0,210,255,0.75)] text-[#38bdf8] hover:border-white'
                : isSelected
                ? 'border-2 border-white shadow-[0_0_22px_#00d2ff] ring-4 ring-[#38bdf8] animate-pulse'
                : 'border-2 border-black/80 shadow-black/80'
            }" style="${!isConfirmedAndarilho && !isUnconfirmedPossivel ? `background-color: ${color};` : ''}">
              <span class="drop-shadow-md text-xs leading-none select-none">${iconSymbol}</span>
            </div>
            
            ${
              hasConfirmations
                ? `<div class="absolute bottom-0 right-0 ${
                    isMostConfirmed ? 'bg-[#38bdf8] text-black font-black' : 'bg-[#00d2ff] text-black font-black'
                  } text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border border-white shadow-md leading-none pointer-events-none">
                    ${loc.confirmations_count || 1}
                   </div>`
                : ''
            }

            <div class="absolute top-11 left-1/2 -translate-x-1/2 hidden md:group-hover:block bg-[#030712]/95 text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border border-[#00d2ff]/40 whitespace-nowrap shadow-2xl z-50 pointer-events-none text-left">
              <div class="font-bold text-white">${loc.name} ${loc.confirmations_count ? `(${loc.confirmations_count} confirmações)` : isUnconfirmedPossivel ? '(Possível Local)' : ''}</div>
              ${
                loc.last_confirmed_by &&
                !loc.last_confirmed_by.includes('Comunidade RP') &&
                !loc.last_confirmed_by.startsWith('anon_') &&
                !loc.last_confirmed_by.startsWith('@anon_')
                  ? `<div class="text-[9px] text-[#38bdf8] font-mono font-bold mt-0.5">👤 Marcado por: ${
                      loc.last_confirmed_by.startsWith('@') ? loc.last_confirmed_by : `@${loc.last_confirmed_by}`
                    }${
                      loc.last_confirmed_at
                        ? ` às ${new Date(loc.last_confirmed_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                        : ''
                    }</div>`
                  : ''
              }
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      const numY = Number(loc.y);
      const numX = Number(loc.x);
      if (isNaN(numY) || isNaN(numX)) return;

      const marker = L.marker([numY, numX], { icon: customIcon, riseOnHover: true });

      const handleSelect = (e: any) => {
        if (e && e.originalEvent) {
          L.DomEvent.stopPropagation(e.originalEvent);
        }
        onSelectLocation(loc);
        if (mapRef.current) {
          const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
          const currentZoom = mapRef.current.getZoom();
          const targetZoom = isMobile
            ? Math.max(currentZoom, 0.5)
            : Math.max(currentZoom, 1.5);

          if (isMobile) {
            // Direct projection calculation to center marker above the bottom sheet
            const targetPoint = mapRef.current.project([loc.y, loc.x], targetZoom);
            const containerHeight = containerRef.current?.clientHeight || window.innerHeight;
            const shiftedPoint = targetPoint.add([0, containerHeight * 0.18]);
            const newCenter = mapRef.current.unproject(shiftedPoint, targetZoom);
            mapRef.current.setView(newCenter, targetZoom, { animate: true, duration: 0.35 });
          } else {
            mapRef.current.setView([loc.y, loc.x], targetZoom, { animate: true, duration: 0.35 });
          }
        }
      };

      marker.on('click', handleSelect);

      markersGroup.addLayer(marker);
    });
  }, [locations, selectedCategories, selectedLocation, onSelectLocation]);

  // Pan and zoom smoothly when a location is selected (via sidebar, search or click)
  useEffect(() => {
    if (selectedLocation && mapRef.current) {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const currentZoom = mapRef.current.getZoom();
      const targetZoom = isMobile ? Math.max(currentZoom, 0.5) : Math.max(currentZoom, 1.5);

      if (isMobile) {
        const targetPoint = mapRef.current.project([selectedLocation.y, selectedLocation.x], targetZoom);
        const containerHeight = containerRef.current?.clientHeight || window.innerHeight;
        const shiftedPoint = targetPoint.add([0, containerHeight * 0.18]);
        const newCenter = mapRef.current.unproject(shiftedPoint, targetZoom);
        mapRef.current.setView(newCenter, targetZoom, { animate: true, duration: 0.35 });
      } else {
        mapRef.current.setView([selectedLocation.y, selectedLocation.x], targetZoom, { animate: true, duration: 0.35 });
      }
    }
  }, [selectedLocation?.id]);

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
    if (mapRef.current) {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const currentZoom = mapRef.current.getZoom();
      const targetZoom = isMobile ? Math.max(currentZoom, 0.5) : Math.max(currentZoom, 1.5);

      if (isMobile) {
        const targetPoint = mapRef.current.project([loc.y, loc.x], targetZoom);
        const containerHeight = containerRef.current?.clientHeight || window.innerHeight;
        const shiftedPoint = targetPoint.add([0, containerHeight * 0.18]);
        const newCenter = mapRef.current.unproject(shiftedPoint, targetZoom);
        mapRef.current.setView(newCenter, targetZoom, { animate: true, duration: 0.35 });
      } else {
        mapRef.current.setView([loc.y, loc.x], targetZoom, { animate: true, duration: 0.35 });
      }
    }
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
  const handleResetView = () => {
    if (!mapRef.current) return;
    mapRef.current.setMinZoom(-10);
    const coverZoom = mapRef.current.getBoundsZoom(bounds, true);
    mapRef.current.setMinZoom(coverZoom);
    mapRef.current.setView([500, 500], coverZoom, { animate: true, duration: 0.35 });
  };
  const handleCenter = () => {
    if (!mapRef.current) return;
    mapRef.current.setMinZoom(-10);
    const coverZoom = mapRef.current.getBoundsZoom(bounds, true);
    mapRef.current.setMinZoom(coverZoom);
    if (selectedLocation) {
      mapRef.current.setView(
        [selectedLocation.y, selectedLocation.x],
        Math.max(mapRef.current.getZoom(), coverZoom + 0.6),
        { animate: true, duration: 0.35 }
      );
    } else {
      mapRef.current.setView([500, 500], coverZoom, { animate: true, duration: 0.35 });
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
    <div className={`relative w-full h-full overflow-hidden select-none ${mapTheme === 'dark' ? 'map-dark-theme bg-[#071526]' : 'map-light-theme bg-[#729eb3]'}`}>
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
          background-color: #071526 !important;
        }
        .map-light-theme .leaflet-image-layer,
        .map-light-theme .gta-map-image-layer,
        .map-light-theme .leaflet-overlay-pane img,
        .map-light-theme .leaflet-pane img {
          filter: none !important;
          transition: filter 0.35s ease !important;
        }
        .map-light-theme .leaflet-container {
          background-color: #729eb3 !important;
        }
        .leaflet-container {
          outline: none !important;
          touch-action: pan-x pan-y pinch-zoom !important;
          transform: translateZ(0);
          will-change: transform;
          user-select: none;
          -webkit-user-select: none;
        }
        .gta-map-image-layer,
        .leaflet-image-layer {
          object-fit: fill !important;
          max-width: none !important;
          max-height: none !important;
          image-rendering: auto;
        }
        .custom-map-pin-wrapper {
          will-change: transform;
          pointer-events: auto !important;
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

      {/* TOP LEFT: Quick Search & Floating Tip Balloon Trigger */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 max-w-[calc(100vw-8.5rem)]">
        <div className="relative w-44 sm:w-56 md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar pontos..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            className="w-full bg-[#030712]/90 backdrop-blur-md border border-[#00d2ff]/25 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00d2ff] shadow-2xl transition-all"
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

        {/* Botão de Dica do Andarilho */}
        <button
          onClick={() => setShowWandererTutorial((prev) => !prev)}
          className={`px-3 py-2 rounded-xl backdrop-blur-md border text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-2xl transition-all cursor-pointer whitespace-nowrap ${
            showWandererTutorial
              ? 'bg-[#00d2ff] text-slate-950 border-white shadow-[0_0_15px_#00d2ff]'
              : 'bg-[#030712]/90 text-[#00d2ff] border-[#00d2ff]/40 hover:bg-[#00d2ff]/20 hover:border-[#00d2ff]'
          }`}
          title="Ver como marcar o Andarilho"
        >
          <span>🎯</span>
          <span className="hidden sm:inline">Como Marcar</span>
          <span className="sm:hidden">Dica</span>
        </button>
      </div>

      {/* Floating Tutorial Balloon */}
      {showWandererTutorial && (
        <div className="absolute top-16 left-4 z-30 w-80 sm:w-96 max-w-[calc(100vw-2rem)] animate-fadeIn">
          <WandererTutorialCard
            defaultExpanded={true}
            onClose={() => setShowWandererTutorial(false)}
            isFloating={true}
          />
        </div>
      )}

      {/* TOP RIGHT: Live Coordinates HUD & Copy Action */}
      {hoverCoords && (
        <div
          onClick={handleCopyHoverCoords}
          className="absolute top-4 right-4 z-20 bg-[#030712]/90 backdrop-blur-md border border-[#00d2ff]/30 px-2.5 sm:px-3.5 py-1.5 rounded-xl shadow-2xl flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:border-[#00d2ff] transition-all text-[11px] sm:text-xs font-mono text-slate-300 group"
          title="Clique para copiar coordenadas GTA"
        >
          <Crosshair className="w-3.5 h-3.5 text-[#00d2ff] group-hover:animate-spin" />
          <span><strong className="text-white">{hoverCoords.x}</strong>, <strong className="text-white">{hoverCoords.y}</strong></span>
          <Copy className="w-3 h-3 text-slate-500 group-hover:text-[#38bdf8] transition-colors ml-0.5 hidden sm:inline" />
        </div>
      )}

      {/* Map Interactive Control Panel */}
      <div className={`absolute right-4 z-20 flex flex-col gap-2 transition-all duration-300 ${selectedLocation ? 'bottom-[48vh] md:bottom-6' : 'bottom-6'}`}>
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
