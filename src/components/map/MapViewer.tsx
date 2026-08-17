import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapLocation } from '../../types';

interface MapViewerProps {
  mapImageUrl: string;
  locations: MapLocation[];
  selectedLocation: MapLocation | null;
  onSelectLocation: (location: MapLocation) => void;
  isAddingMarker?: boolean;
  onMapClickForNewMarker?: (coords: { x: number; y: number }) => void;
  newMarkerDraftCoords?: { x: number; y: number } | null;
  mostVotedAndarilhoId?: string | null;
}

// GTA RP style SVG icons — small, filled, bold
const getCategoryIconSvg = (iconName: string, color: string, size = 14): string => {
  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" stroke="none">`;

  switch (iconName) {
    case 'Cross':
      svgContent += `<path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7V2z"/>`;
      break;
    case 'ShoppingBag':
      svgContent += `<path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM7.16 14.26l.04-.12.96-1.74h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 20.07 3H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44C4.52 14.37 5.48 16 7 16h12v-2H7.42c-.14 0-.25-.11-.25-.25z"/>`;
      break;
    case 'DollarSign':
      svgContent += `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2v-1.93c-1.82-.24-3.34-1.16-3.47-2.93h1.9c.12.91.97 1.56 2.27 1.56 1.42 0 2.09-.68 2.09-1.51 0-.71-.49-1.2-1.95-1.56l-1.6-.38c-2.12-.5-3.12-1.55-3.12-3.09 0-1.73 1.33-2.89 3.17-3.15V5h2v1.99c1.81.29 3.01 1.37 3.09 2.96h-1.88c-.08-.85-.79-1.47-1.91-1.47-1.2 0-1.92.58-1.92 1.44 0 .66.47 1.08 1.92 1.44l1.44.34c2.35.56 3.32 1.54 3.32 3.17 0 1.86-1.37 3.02-3.34 3.22z"/>`;
      break;
    case 'Wrench':
      svgContent += `<path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>`;
      break;
    case 'UserCheck':
      svgContent += `<circle cx="12" cy="4.5" r="2.5"/><path d="M12 8c-1.65 0-3 .9-3 2l.77 5.38L7 18l1.5 1.5 3-3.5h1l3 3.5L17 18l-2.77-2.62L15 10c0-1.1-1.35-2-3-2z"/><path d="M9 22h1.5v-4l-1.5 1.5V22zm4.5 0H15v-2.5L13.5 18v4z"/>`;
      break;
    default:
      svgContent += `<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/>`;
      break;
  }
  svgContent += `</svg>`;
  return svgContent;
};

export const MapViewer: React.FC<MapViewerProps> = React.memo(({
  mapImageUrl,
  locations,
  selectedLocation,
  onSelectLocation,
  isAddingMarker = false,
  onMapClickForNewMarker,
  newMarkerDraftCoords,
  mostVotedAndarilhoId
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const draftMarkerRef = useRef<L.Marker | null>(null);

  // Map Bounds (0-1000 relative coordinate system)
  const bounds: L.LatLngBoundsExpression = [[0, 0], [1000, 1000]];

  // Function to ensure map fills 100% of container width & height with NO side borders
  const fitMapCover = () => {
    if (!mapContainerRef.current || !leafletMapRef.current) return;
    const container = mapContainerRef.current;
    const map = leafletMapRef.current;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;

    map.invalidateSize();

    // Compute zoom required to cover BOTH width and height completely
    const zoomW = Math.log2(w / 1000);
    const zoomH = Math.log2(h / 1000);
    const coverZoom = Math.max(zoomW, zoomH);

    map.setMinZoom(coverZoom);
    map.setZoom(coverZoom);
    map.panTo([500, 500], { animate: false });
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        crs: L.CRS.Simple,
        minZoom: 0,
        maxZoom: 4,
        zoomControl: false,
        attributionControl: false,
        doubleClickZoom: true,
        scrollWheelZoom: true,
        zoomSnap: 0.1,
        zoomDelta: 0.5
      });

      leafletMapRef.current = map;

      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;
    }

    const map = leafletMapRef.current;

    // Remove existing image overlays
    map.eachLayer((layer) => {
      if (layer instanceof L.ImageOverlay) {
        map.removeLayer(layer);
      }
    });

    // Add map image overlay
    L.imageOverlay(mapImageUrl, bounds, {
      opacity: 1,
      className: 'map-image-overlay'
    }).addTo(map);

    // Initial cover fit
    setTimeout(() => {
      fitMapCover();
    }, 50);

    // Click handler for adding new marker
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (isAddingMarker && onMapClickForNewMarker) {
        const x = Math.round(e.latlng.lng);
        const y = Math.round(1000 - e.latlng.lat);
        if (x >= 0 && x <= 1000 && y >= 0 && y <= 1000) {
          onMapClickForNewMarker({ x, y });
        }
      }
    };

    map.off('click');
    map.on('click', handleMapClick);

    // ResizeObserver to re-cover map whenever window/container resizes
    const observer = new ResizeObserver(() => {
      fitMapCover();
    });
    observer.observe(mapContainerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [mapImageUrl, isAddingMarker, onMapClickForNewMarker]);

  // Pan to selected location
  useEffect(() => {
    if (selectedLocation && leafletMapRef.current) {
      const lat = 1000 - selectedLocation.y;
      const lng = selectedLocation.x;
      const currentZoom = leafletMapRef.current.getZoom();
      const minZoom = leafletMapRef.current.getMinZoom();
      const targetZoom = Math.max(currentZoom, minZoom + 0.8, 1.2);
      leafletMapRef.current.flyTo([lat, lng], targetZoom, { duration: 0.8 });
    }
  }, [selectedLocation]);

  // Store marker instances to avoid destroying and recreating them on every render
  const markerInstancesRef = useRef<Map<string, L.Marker>>(new Map());

  // Update Markers
  useEffect(() => {
    if (!leafletMapRef.current || !markersGroupRef.current) return;

    const markersGroup = markersGroupRef.current;
    const currentMarkerMap = markerInstancesRef.current;
    const newLocationIds = new Set(locations.map(loc => loc.id));

    // Remove markers that are no longer in the locations array
    for (const [id, marker] of currentMarkerMap.entries()) {
      if (!newLocationIds.has(id)) {
        markersGroup.removeLayer(marker);
        currentMarkerMap.delete(id);
      }
    }

    locations.forEach((loc) => {
      const lat = 1000 - loc.y;
      const lng = loc.x;

      const isSelected = selectedLocation?.id === loc.id;
      const isMostVoted = loc.id === mostVotedAndarilhoId;
      const isAndarilho = loc.category === 'Andarilho';

      const hasConfirmations = (loc.confirmations_count || 0) > 0;
      const isAndarilhoUnconfirmed = isAndarilho && !hasConfirmations && !isMostVoted;

      // Small compact icons like the real GTA radar blips
      const s = isSelected ? 24 : 18;
      const iconSvg = getCategoryIconSvg(loc.icon, '#fff', isSelected ? 14 : 10);

      const markerOpacity = isAndarilhoUnconfirmed ? 0.3 : 1;

      // Minimal pulse for most-voted only
      let pulseHtml = '';
      if (isMostVoted) {
        pulseHtml = `<div style="position:absolute;inset:-4px;border-radius:50%;background:${loc.color};opacity:0.35;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>`;
      }

      const html = `
        <div style="position:relative;cursor:pointer;opacity:${markerOpacity};transition:all 0.2s ease;${isSelected ? 'z-index:50;' : 'z-index:10;'}"
             onmouseover="this.style.opacity='1';this.style.transform='scale(1.3)'"
             onmouseout="this.style.opacity='${markerOpacity}';this.style.transform='scale(1)'">
          ${pulseHtml}
          <div style="
            width:${s}px;
            height:${s}px;
            border-radius:50%;
            background:${loc.color};
            border:${isSelected ? 2 : 1.5}px solid rgba(255,255,255,${isSelected ? 1 : 0.8});
            display:flex;
            align-items:center;
            justify-content:center;
            box-shadow:0 1px 6px rgba(0,0,0,0.5)${isSelected ? `,0 0 0 2px rgba(255,255,255,0.3)` : ''};
          ">
            ${iconSvg}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: html,
        iconSize: [s, s],
        iconAnchor: [s / 2, s / 2]
      });

      let marker = currentMarkerMap.get(loc.id);

      if (marker) {
        // Update existing marker
        marker.setLatLng([lat, lng]);
        marker.setIcon(customIcon);
        
        // Re-bind tooltip to ensure content/offset is correct
        marker.unbindTooltip();
        marker.bindTooltip(loc.name, {
          direction: 'top',
          offset: [0, -(s / 2 + 4)],
          className: 'gta-marker-tooltip',
          opacity: 0.95
        });

        // Ensure the click handler uses the latest closure variables (onSelectLocation/loc)
        marker.off('click');
        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          onSelectLocation(loc);
        });
      } else {
        // Create new marker
        marker = L.marker([lat, lng], { icon: customIcon });

        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          onSelectLocation(loc);
        });

        marker.bindTooltip(loc.name, {
          direction: 'top',
          offset: [0, -(s / 2 + 4)],
          className: 'gta-marker-tooltip',
          opacity: 0.95
        });

        markersGroup.addLayer(marker);
        currentMarkerMap.set(loc.id, marker);
      }
    });
  }, [locations, selectedLocation, mostVotedAndarilhoId, onSelectLocation]);

  // Draft marker for admin placement
  useEffect(() => {
    if (!leafletMapRef.current) return;

    if (draftMarkerRef.current) {
      leafletMapRef.current.removeLayer(draftMarkerRef.current);
      draftMarkerRef.current = null;
    }

    if (newMarkerDraftCoords) {
      const lat = 1000 - newMarkerDraftCoords.y;
      const lng = newMarkerDraftCoords.x;

      const draftIcon = L.divIcon({
        className: 'custom-draft-marker',
        html: `
          <div style="width:24px;height:24px;border-radius:50%;background:#10b981;color:#fff;display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,0.9);box-shadow:0 0 0 3px rgba(16,185,129,0.4),0 2px 8px rgba(0,0,0,0.5);animation:bounce 1s infinite;font-size:14px;font-weight:900;">
            +
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([lat, lng], { icon: draftIcon, draggable: true }).addTo(leafletMapRef.current);

      marker.on('dragend', (e) => {
        const newPos = e.target.getLatLng();
        const x = Math.round(newPos.lng);
        const y = Math.round(1000 - newPos.lat);
        if (onMapClickForNewMarker) {
          onMapClickForNewMarker({ x, y });
        }
      });

      draftMarkerRef.current = marker;
    }
  }, [newMarkerDraftCoords, onMapClickForNewMarker]);

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden select-none">
      <div ref={mapContainerRef} className="w-full h-full z-0 cursor-grab active:cursor-grabbing" />
    </div>
  );
});
