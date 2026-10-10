import { supabase } from '../lib/supabase';
import type { Server, System, MapLocation, Comment, Suggestion, SuggestionType, SuggestionStatus, UserProfile, AccessLog, PlatformSettings } from '../types';
import { getAnonymousUserId } from '../utils/anonymousId';
import {
  calculateWandererCycle,
  getLocalWandererCycleState,
  saveLocalWandererCycleState,
  type StoredWandererCycleState,
} from '../utils/wandererCycle';
import { RealtimeSync } from './realtimeSync';

// Default Fallback Cities when DB or localStorage is empty
const DEFAULT_SERVERS: Server[] = [
  {
    id: 'cda-server-uuid',
    name: 'CIDADE ALTA RP',
    slug: 'cda',
    subtitle: 'SERVIDORES CDA & VALLEY',
    description: 'Mapa Interativo em tempo real para os servidores CDA e VALLEY com virada do Andarilho, além de Lockpick, Caixinha e Hacking.',
    banner_image_url: '/images/hero_banner.jpg',
    map_image_url: '/images/mapa_cda_optimized.webp',
    active: true,
  },
  {
    id: 'los-santos-server-uuid',
    name: 'LOS SANTOS CENTRAL',
    slug: 'los-santos',
    subtitle: 'TREINAMENTO HEISTS & MINIJOGOS',
    description: 'Central de treinamento de reflexos para invasão de cofres de registradoras, fechaduras de 32 pinos e terminais de segurança.',
    banner_image_url: '/images/gta_map_bg.webp',
    map_image_url: '/images/mapa_cda_optimized.webp',
    active: true,
  },
  {
    id: 'valley-server-uuid',
    name: 'VALLEY RP',
    slug: 'valley',
    subtitle: 'VALLEY ROLEPLAY HUB',
    description: 'Servidor Valley com rastreamento de pontos ilegais, lavanderia e localizações do andarilho.',
    banner_image_url: '/images/bg_wallpaper.jpg',
    map_image_url: '/images/mapa_cda_optimized.webp',
    active: true,
  },
];

// Default Fallback Systems
const DEFAULT_SYSTEMS: System[] = [
  {
    id: 'sys-mapa',
    name: 'MAPA INTERATIVO',
    slug: 'mapa',
    tag: 'REALTIME TRACKER',
    description: 'Mapa interativo colaborativo em tempo real com rastreamento de Hospitais, Desmanches, Mercados e virada do Andarilho.',
    icon: 'fa-compass',
    image_url: '/images/gta_map_bg.webp',
    link: '/cidades/cda/mapa/',
    city_ids: ['cda-server-uuid', 'valley-server-uuid', 'los-santos-server-uuid'],
    is_active: true,
  },
  {
    id: 'sys-lockpick',
    name: 'LOCKPICK SIMULATOR',
    slug: 'lockpick',
    tag: 'DOOR & VEHICLE LOCK',
    description: 'Simulador de arrombamento de portas de veículos e estabelecimentos com fechaduras de 32 pinos.',
    icon: 'fa-key',
    image_url: '/images/lockpick.jpg',
    link: '/cidades/cda/lockpick/',
    city_ids: ['cda-server-uuid', 'los-santos-server-uuid'],
    is_active: true,
  },
  {
    id: 'sys-caixinha',
    name: 'CAIXINHA ELETRÔNICO',
    slug: 'caixinha',
    tag: 'ATM & SAFE CRACK',
    description: 'Pratique a velocidade de digitação para arrombamento de caixas registradoras e cofres.',
    icon: 'fa-vault',
    image_url: '/images/caixinha.jpg',
    link: '/cidades/cda/caixinha/',
    city_ids: ['cda-server-uuid', 'los-santos-server-uuid'],
    is_active: true,
  },
  {
    id: 'sys-hacking',
    name: 'HACKING DEVICE',
    slug: 'hacking',
    tag: 'CYBER TERMINAL',
    description: 'Terminal de invasão cyberpunk com matrizes de caracteres, streaks e tempo limite.',
    icon: 'fa-microchip',
    image_url: '/images/hacking.jpg',
    link: '/cidades/cda/hacking/',
    city_ids: ['cda-server-uuid', 'los-santos-server-uuid'],
    is_active: true,
  },
];

const MOCK_LOCATIONS: Record<string, MapLocation[]> = {
  'cda-server-uuid': [
    // Hospitais Ilegais Fixos
    { id: 'cda-hosp-1', server_id: 'cda-server-uuid', name: 'Hospital Ilegal #1', category: 'hospital_ilegal', description: 'Localização fixa do Hospital Ilegal', x: 440, y: 550, color: '#ef4444', is_active: true },
    { id: 'cda-hosp-2', server_id: 'cda-server-uuid', name: 'Hospital Ilegal #2 (Paleto)', category: 'hospital_ilegal', description: 'Localização fixa do Hospital Ilegal em Paleto', x: 421, y: 825, color: '#ef4444', is_active: true },
    { id: 'cda-hosp-3', server_id: 'cda-server-uuid', name: 'Hospital Ilegal #3 (Leste)', category: 'hospital_ilegal', description: 'Localização fixa do Hospital Ilegal Leste', x: 656, y: 269, color: '#ef4444', is_active: true },
    { id: 'cda-hosp-4', server_id: 'cda-server-uuid', name: 'Hospital Ilegal #4 (Porto)', category: 'hospital_ilegal', description: 'Localização fixa do Hospital Ilegal no Porto', x: 556, y: 109, color: '#ef4444', is_active: true },

    // Mercado Ilegal Fixo
    { id: 'cda-merc-1', server_id: 'cda-server-uuid', name: 'Mercado Ilegal Principal', category: 'mercado_ilegal', description: 'Localização fixa do Mercado Ilegal', x: 648, y: 431, color: '#f59e0b', is_active: true },

    // Lavanderias Ilegais Fixas
    { id: 'cda-lav-1', server_id: 'cda-server-uuid', name: 'Lavanderia Ilegal #1', category: 'lavanderia_ilegal', description: 'Localização fixa da Lavanderia Ilegal', x: 209, y: 384, color: '#3b82f6', is_active: true },
    { id: 'cda-lav-2', server_id: 'cda-server-uuid', name: 'Lavanderia Ilegal #2 (Paleto)', category: 'lavanderia_ilegal', description: 'Localização fixa da Lavanderia Ilegal em Paleto', x: 451, y: 841, color: '#3b82f6', is_active: true },
    { id: 'cda-lav-3', server_id: 'cda-server-uuid', name: 'Lavanderia Ilegal #3 (Cidade)', category: 'lavanderia_ilegal', description: 'Localização fixa da Lavanderia Ilegal na Cidade', x: 465, y: 197, color: '#3b82f6', is_active: true },

    // Desmanches Fixos
    { id: 'cda-desm-1', server_id: 'cda-server-uuid', name: 'Desmanche Bennys', category: 'desmanche', description: 'Localização fixa do Desmanche Bennys', x: 421, y: 188, color: '#10b981', is_active: true },
    { id: 'cda-desm-2', server_id: 'cda-server-uuid', name: 'Desmanche Porto', category: 'desmanche', description: 'Localização fixa do Desmanche Porto', x: 562, y: 119, color: '#10b981', is_active: true },
    { id: 'cda-desm-3', server_id: 'cda-server-uuid', name: 'Desmanche Sandy Shores', category: 'desmanche', description: 'Localização fixa do Desmanche Sandy Shores', x: 607, y: 635, color: '#10b981', is_active: true },
    { id: 'cda-desm-4', server_id: 'cda-server-uuid', name: 'Desmanche Grapeseed', category: 'desmanche', description: 'Localização fixa do Desmanche Grapeseed', x: 631, y: 709, color: '#10b981', is_active: true },
    { id: 'cda-desm-5', server_id: 'cda-server-uuid', name: 'Desmanche Paleto', category: 'desmanche', description: 'Localização fixa do Desmanche Paleto', x: 446, y: 844, color: '#10b981', is_active: true },

    // Andarilho - Locais Possíveis com confirmações zeradas a cada ciclo (06:00 e 18:00)
    { id: 'cda-and-1', server_id: 'cda-server-uuid', name: 'Andarilho - Grapeseed Norte', category: 'local_possivel', description: 'Possível localização do Andarilho em Grapeseed', x: 670, y: 700, color: '#a78bfa', is_active: true, confirmations_count: 0 },
    { id: 'cda-and-2', server_id: 'cda-server-uuid', name: 'Andarilho - Grapeseed Centro', category: 'local_possivel', description: 'Possível localização do Andarilho em Grapeseed', x: 520, y: 660, color: '#a78bfa', is_active: true, confirmations_count: 0 },
    { id: 'cda-and-3', server_id: 'cda-server-uuid', name: 'Andarilho - Grapeseed Leste', category: 'local_possivel', description: 'Possível localização do Andarilho em Grapeseed', x: 593, y: 723, color: '#a78bfa', is_active: true, confirmations_count: 0 },
    { id: 'cda-and-4', server_id: 'cda-server-uuid', name: 'Andarilho - Grapeseed Sul', category: 'local_possivel', description: 'Possível localização do Andarilho em Grapeseed', x: 570, y: 680, color: '#a78bfa', is_active: true, confirmations_count: 0 },
    { id: 'cda-and-5', server_id: 'cda-server-uuid', name: 'Andarilho - Grapeseed Oeste', category: 'local_possivel', description: 'Possível localização do Andarilho em Grapeseed', x: 568, y: 679, color: '#a78bfa', is_active: true, confirmations_count: 0 },
    { id: 'cda-and-6', server_id: 'cda-server-uuid', name: 'Andarilho - Bennys', category: 'local_possivel', description: 'Possível localização do Andarilho em Bennys', x: 433, y: 214, color: '#a78bfa', is_active: true, confirmations_count: 0 },
    { id: 'cda-and-7', server_id: 'cda-server-uuid', name: 'Andarilho - Bennys Pátio', category: 'local_possivel', description: 'Possível localização do Andarilho em Bennys', x: 535, y: 187, color: '#a78bfa', is_active: true, confirmations_count: 0 },
    { id: 'cda-and-8', server_id: 'cda-server-uuid', name: 'Andarilho - Porto Mecânica', category: 'local_possivel', description: 'Possível localização do Andarilho na Mecânica do Porto', x: 483, y: 64, color: '#a78bfa', is_active: true, confirmations_count: 0 },
    { id: 'cda-and-9', server_id: 'cda-server-uuid', name: 'Andarilho - Porto Galpão', category: 'local_possivel', description: 'Possível localização do Andarilho no Porto', x: 456, y: 109, color: '#a78bfa', is_active: true, confirmations_count: 0 },
    { id: 'cda-and-10', server_id: 'cda-server-uuid', name: 'Andarilho - Praia Calçadão', category: 'local_possivel', description: 'Possível localização do Andarilho na Praia', x: 345, y: 244, color: '#a78bfa', is_active: true, confirmations_count: 0 },
    { id: 'cda-and-11', server_id: 'cda-server-uuid', name: 'Andarilho - Praia Construção', category: 'local_possivel', description: 'Ao lado da lixeira, dentro da construção cercada de madeira na praia.', x: 333, y: 238, color: '#a78bfa', is_active: true, confirmations_count: 0 },
    { id: 'cda-and-12', server_id: 'cda-server-uuid', name: 'Andarilho - Praia Pier', category: 'local_possivel', description: 'Possível localização do Andarilho na Praia', x: 413, y: 188, color: '#a78bfa', is_active: true, confirmations_count: 0 },
    { id: 'cda-and-13', server_id: 'cda-server-uuid', name: 'Andarilho - Paleto Galinheiro', category: 'local_possivel', description: 'Possível localização do Andarilho em Paleto Galinheiro', x: 448, y: 823, color: '#a78bfa', is_active: true, confirmations_count: 0 },
    { id: 'cda-and-14', server_id: 'cda-server-uuid', name: 'Andarilho - Paleto Posto', category: 'local_possivel', description: 'Possível localização do Andarilho em Paleto', x: 578, y: 836, color: '#a78bfa', is_active: true, confirmations_count: 0 },
    { id: 'cda-and-15', server_id: 'cda-server-uuid', name: 'Andarilho - Paleto Leste', category: 'local_possivel', description: 'Possível localização do Andarilho em Paleto', x: 440, y: 840, color: '#a78bfa', is_active: true, confirmations_count: 0 }
  ],
  'valley-server-uuid': [
    { id: 'val-hosp-1', server_id: 'valley-server-uuid', name: 'Hospital Ilegal Valley', category: 'hospital_ilegal', description: 'Atendimento clandestino Valley', x: 440, y: 550, color: '#ef4444', is_active: true },
    { id: 'val-merc-1', server_id: 'valley-server-uuid', name: 'Mercado Ilegal Valley', category: 'mercado_ilegal', description: 'Mercado Ilegal Valley', x: 648, y: 431, color: '#f59e0b', is_active: true },
    { id: 'val-lav-1', server_id: 'valley-server-uuid', name: 'Lavanderia Ilegal Valley', category: 'lavanderia_ilegal', description: 'Lavanderia Valley', x: 209, y: 384, color: '#3b82f6', is_active: true },
    { id: 'val-desm-1', server_id: 'valley-server-uuid', name: 'Desmanche Valley', category: 'desmanche', description: 'Desmanche Valley', x: 421, y: 188, color: '#10b981', is_active: true },
    { id: 'val-and-1', server_id: 'valley-server-uuid', name: 'Andarilho Valley - Colinas', category: 'local_possivel', description: 'Localização reportada do Andarilho em Valley', x: 600, y: 600, color: '#a78bfa', is_active: true, confirmations_count: 0 },
  ],
  'los-santos-server-uuid': [
    { id: 'ls-hosp-1', server_id: 'los-santos-server-uuid', name: 'Hospital Ilegal Central', category: 'hospital_ilegal', description: 'Hospital Ilegal Los Santos', x: 440, y: 550, color: '#ef4444', is_active: true },
    { id: 'ls-desm-1', server_id: 'los-santos-server-uuid', name: 'Desmanche Los Santos', category: 'desmanche', description: 'Desmanche Los Santos', x: 421, y: 188, color: '#10b981', is_active: true },
  ]
};

// Aliases para compatibilidade total entre slugs e UUIDs
MOCK_LOCATIONS['cda'] = MOCK_LOCATIONS['cda-server-uuid'];
MOCK_LOCATIONS['valley'] = MOCK_LOCATIONS['valley-server-uuid'];
MOCK_LOCATIONS['los-santos'] = MOCK_LOCATIONS['los-santos-server-uuid'];

export const getLocationsForServer = (serverId?: string): MapLocation[] => {
  if (!serverId) {
    return MOCK_LOCATIONS['cda-server-uuid'] || [];
  }
  if (MOCK_LOCATIONS[serverId] && MOCK_LOCATIONS[serverId].length > 0) {
    return MOCK_LOCATIONS[serverId];
  }
  const clean = serverId.toLowerCase().trim();
  if (clean === 'cda' || clean === 'cda-server-uuid' || clean.includes('cda') || clean.includes('alta')) {
    return MOCK_LOCATIONS['cda-server-uuid'] || [];
  }
  if (clean === 'valley' || clean === 'valley-server-uuid' || clean.includes('valley')) {
    return MOCK_LOCATIONS['valley-server-uuid'] || [];
  }
  if (clean === 'los-santos' || clean === 'los-santos-server-uuid' || clean.includes('santos')) {
    return MOCK_LOCATIONS['los-santos-server-uuid'] || [];
  }
  return MOCK_LOCATIONS['cda-server-uuid'] || Object.values(MOCK_LOCATIONS)[0] || [];
};

// Local storage helpers for persistence
const getLocalCustomLocations = (): MapLocation[] => {
  try {
    const raw = localStorage.getItem('malaca_custom_locations');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
};

const saveLocalCustomLocations = (locs: MapLocation[]) => {
  try {
    localStorage.setItem('malaca_custom_locations', JSON.stringify(locs));
  } catch {}
};
const getLocalServers = (): Server[] => {
  try {
    const raw = localStorage.getItem('malaca_custom_servers');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_SERVERS;
};

const saveLocalServers = (servers: Server[]) => {
  try {
    localStorage.setItem('malaca_custom_servers', JSON.stringify(servers));
  } catch {}
};

const getLocalSystems = (): System[] => {
  try {
    const raw = localStorage.getItem('malaca_custom_systems');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_SYSTEMS;
};

const saveLocalSystems = (systems: System[]) => {
  try {
    localStorage.setItem('malaca_custom_systems', JSON.stringify(systems));
  } catch {}
};


export const ApiService = {
  // Fetch Servers / Cities
  async fetchServers(): Promise<Server[]> {
    const local = getLocalServers();
    try {
      const { data, error } = await supabase.from('servers').select('*').eq('active', true);
      if (error || !data || data.length === 0) {
        return local;
      }
      // Merge Remote & Local servers
      const map = new Map<string, Server>();
      local.forEach((s) => map.set(s.id, s));
      data.forEach((s) => map.set(s.id, { ...map.get(s.id), ...s }));
      return Array.from(map.values());
    } catch {
      return local;
    }
  },

  // City Management (Admin)
  async createCity(city: Omit<Server, 'id'>): Promise<Server> {
    const newCity: Server = {
      ...city,
      id: `city-${Date.now()}`,
      active: city.active ?? true,
    };
    const current = getLocalServers();
    const updated = [newCity, ...current];
    saveLocalServers(updated);

    try {
      const { data } = await supabase
        .from('servers')
        .insert([
          {
            name: newCity.name,
            slug: newCity.slug,
            subtitle: newCity.subtitle,
            description: newCity.description,
            banner_image_url: newCity.banner_image_url,
            map_image_url: newCity.map_image_url,
            active: newCity.active,
          },
        ])
        .select()
        .single();
      if (data) {
        Object.assign(newCity, data);
      }
    } catch {}

    RealtimeSync.broadcastEntityChange('servers', 'INSERT', newCity, newCity.id);
    return newCity;
  },

  async updateCity(id: string, updates: Partial<Server>): Promise<boolean> {
    const current = getLocalServers();
    const index = current.findIndex((c) => c.id === id || c.slug === id);
    if (index !== -1) {
      current[index] = { ...current[index], ...updates };
      saveLocalServers(current);
    }

    RealtimeSync.broadcastEntityChange('servers', 'UPDATE', updates, id);

    try {
      await supabase.from('servers').update(updates).eq('id', id);
    } catch {}
    return true;
  },

  async deleteCity(id: string): Promise<boolean> {
    const current = getLocalServers();
    const filtered = current.filter((c) => c.id !== id && c.slug !== id);
    saveLocalServers(filtered);

    RealtimeSync.broadcastEntityChange('servers', 'DELETE', undefined, id);

    try {
      await supabase.from('servers').delete().eq('id', id);
    } catch {}
    return true;
  },

  // Fetch Systems
  async fetchSystems(): Promise<System[]> {
    const local = getLocalSystems();
    try {
      const { data, error } = await supabase.from('systems').select('*').eq('is_active', true);
      if (error || !data || data.length === 0) {
        return local;
      }
      const map = new Map<string, System>();
      local.forEach((s) => map.set(s.id, s));
      data.forEach((s) => map.set(s.id, { ...map.get(s.id), ...s }));
      return Array.from(map.values());
    } catch {
      return local;
    }
  },

  // Systems Management (Admin)
  async createSystem(system: Omit<System, 'id'>): Promise<System> {
    const newSys: System = {
      ...system,
      id: `sys-${Date.now()}`,
      is_active: system.is_active ?? true,
    };
    const current = getLocalSystems();
    const updated = [newSys, ...current];
    saveLocalSystems(updated);

    try {
      const { data } = await supabase
        .from('systems')
        .insert([
          {
            name: newSys.name,
            slug: newSys.slug,
            tag: newSys.tag,
            description: newSys.description,
            icon: newSys.icon,
            image_url: newSys.image_url,
            link: newSys.link,
            city_ids: newSys.city_ids || [],
            is_active: newSys.is_active,
          },
        ])
        .select()
        .single();
      if (data) {
        Object.assign(newSys, data);
      }
    } catch {}

    RealtimeSync.broadcastEntityChange('systems', 'INSERT', newSys, newSys.id);
    return newSys;
  },

  async updateSystem(id: string, updates: Partial<System>): Promise<boolean> {
    const current = getLocalSystems();
    const index = current.findIndex((s) => s.id === id);
    if (index !== -1) {
      current[index] = { ...current[index], ...updates };
      saveLocalSystems(current);
    }

    RealtimeSync.broadcastEntityChange('systems', 'UPDATE', updates, id);

    try {
      await supabase.from('systems').update(updates).eq('id', id);
    } catch {}
    return true;
  },

  async deleteSystem(id: string): Promise<boolean> {
    const current = getLocalSystems();
    const filtered = current.filter((s) => s.id !== id);
    saveLocalSystems(filtered);

    RealtimeSync.broadcastEntityChange('systems', 'DELETE', undefined, id);

    try {
      await supabase.from('systems').delete().eq('id', id);
    } catch {}
    return true;
  },

  // Fetch Locations with confirmations (Filtradas estritamente pelo ciclo ativo das 06:00 / 18:00)
  async fetchLocations(serverId: string): Promise<MapLocation[]> {
    const anonId = getAnonymousUserId();
    const cycleState = getLocalWandererCycleState();
    const currentCycle = calculateWandererCycle();
    const realtimeCounts = RealtimeSync.getAggregatedCounts();

    try {
      const { data: locations, error } = await supabase
        .from('map_locations')
        .select('*')
        .eq('server_id', serverId)
        .eq('is_active', true);

      let baseLocations = error || !locations || locations.length === 0 
        ? getLocationsForServer(serverId) 
        : locations;

      // Mescla com locais customizados salvos localmente
      const customLocs = getLocalCustomLocations().filter(
        (l) => l.server_id === serverId || l.server_id === 'cda-server-uuid' || serverId === 'cda'
      );
      if (customLocs.length > 0) {
        const idMap = new Map<string, MapLocation>();
        baseLocations.forEach((l) => idMap.set(l.id, l));
        customLocs.forEach((l) => idMap.set(l.id, l));
        baseLocations = Array.from(idMap.values());
      }

      // Busca apenas confirmações registradas a partir do início do ciclo atual (06:00 ou 18:00)
      const { data: confirmations } = await supabase
        .from('wanderer_confirmations')
        .select('location_id, anonymous_user_id, created_at')
        .gte('created_at', currentCycle.startTime.toISOString());

      const remoteCounts: Record<string, number> = {};
      const userConfirmedSet = new Set<string>(cycleState.userConfirmedIds);

      if (confirmations) {
        confirmations.forEach((c) => {
          remoteCounts[c.location_id] = (remoteCounts[c.location_id] || 0) + 1;
          if (c.anonymous_user_id === anonId) {
            userConfirmedSet.add(c.location_id);
          }
        });
      }

      return baseLocations.map((loc) => {
        const isWanderer = loc.category === 'andarilho' || loc.category === 'local_possivel';
        const isLocallyConfirmed = userConfirmedSet.has(loc.id);
        const remoteCount = remoteCounts[loc.id] || 0;
        const localCycleCount = cycleState.counts[loc.id] || 0;
        const liveCount = realtimeCounts[loc.id] || 0;

        // Se for marcação do Andarilho, combina contagem remota, realtime coletiva e local
        const totalCount = isWanderer
          ? Math.max(remoteCount, localCycleCount, liveCount) + (isLocallyConfirmed && !remoteCount && !localCycleCount && !liveCount ? 1 : 0)
          : (loc.confirmations_count || 0);

        return {
          ...loc,
          confirmations_count: totalCount,
          user_confirmed: isLocallyConfirmed,
        };
      });
    } catch {
      let baseLocations = getLocationsForServer(serverId);
      const customLocs = getLocalCustomLocations().filter(
        (l) => l.server_id === serverId || l.server_id === 'cda-server-uuid' || serverId === 'cda'
      );
      if (customLocs.length > 0) {
        const idMap = new Map<string, MapLocation>();
        baseLocations.forEach((l) => idMap.set(l.id, l));
        customLocs.forEach((l) => idMap.set(l.id, l));
        baseLocations = Array.from(idMap.values());
      }
      const userConfirmedSet = new Set<string>(cycleState.userConfirmedIds);

      return baseLocations.map((loc) => {
        const isWanderer = loc.category === 'andarilho' || loc.category === 'local_possivel';
        const isLocallyConfirmed = userConfirmedSet.has(loc.id);
        const localCount = cycleState.counts[loc.id] || 0;
        const liveCount = realtimeCounts[loc.id] || 0;
        const totalCount = isWanderer
          ? Math.max(localCount, liveCount) + (isLocallyConfirmed && !localCount && !liveCount ? 1 : 0)
          : (loc.confirmations_count || 0);

        return {
          ...loc,
          confirmations_count: totalCount,
          user_confirmed: isLocallyConfirmed,
        };
      });
    }
  },

  // Confirm Wanderer Location (com Broadcast instantâneo e Presence para todas as telas)
  async addWandererConfirmation(locationId: string, serverId?: string): Promise<boolean> {
    const anonId = getAnonymousUserId();
    const cycleState = getLocalWandererCycleState();

    if (!cycleState.userConfirmedIds.includes(locationId)) {
      cycleState.userConfirmedIds.push(locationId);
    }
    cycleState.counts[locationId] = (cycleState.counts[locationId] || 0) + 1;
    saveLocalWandererCycleState(cycleState);

    // Atualiza Presença Realtime no Supabase para sincronizar com todos os usuários ativos
    RealtimeSync.syncPresence(cycleState.userConfirmedIds);

    // Broadcast em tempo real para todas as telas/abas
    RealtimeSync.broadcastVoteChange('vote_added', locationId, serverId, cycleState.counts[locationId]);

    try {
      await supabase.from('wanderer_confirmations').insert({
        location_id: locationId,
        anonymous_user_id: anonId,
      });
    } catch {}
    return true;
  },

  // Remove Wanderer Confirmation (com Broadcast instantâneo e Presence para todas as telas)
  async removeWandererConfirmation(locationId: string, serverId?: string): Promise<boolean> {
    const anonId = getAnonymousUserId();
    const cycleState = getLocalWandererCycleState();

    cycleState.userConfirmedIds = cycleState.userConfirmedIds.filter((id) => id !== locationId);
    cycleState.counts[locationId] = Math.max(0, (cycleState.counts[locationId] || 1) - 1);
    saveLocalWandererCycleState(cycleState);

    // Atualiza Presença Realtime no Supabase
    RealtimeSync.syncPresence(cycleState.userConfirmedIds);

    // Broadcast em tempo real para todas as telas/abas
    RealtimeSync.broadcastVoteChange('vote_removed', locationId, serverId, cycleState.counts[locationId]);

    try {
      await supabase
        .from('wanderer_confirmations')
        .delete()
        .eq('location_id', locationId)
        .eq('anonymous_user_id', anonId);
    } catch {}
    return true;
  },

  // Comments
  async fetchComments(serverId?: string, locationId?: string): Promise<Comment[]> {
    try {
      let query = supabase.from('comments').select('*').order('created_at', { ascending: false }).limit(50);
      if (serverId) query = query.eq('server_id', serverId);
      if (locationId) query = query.eq('location_id', locationId);

      const { data, error } = await query;
      if (error || !data) return [];
      return data;
    } catch {
      return [];
    }
  },

  async addComment(comment: {
    server_id: string;
    location_id?: string;
    nickname: string;
    content: string;
  }): Promise<boolean> {
    const anonId = getAnonymousUserId();
    const cleanContent = comment.content.replace(/<[^>]*>?/gm, '').trim();
    const cleanNickname = comment.nickname.replace(/<[^>]*>?/gm, '').trim();

    if (!cleanContent || !cleanNickname) return false;

    const payload = {
      server_id: comment.server_id,
      location_id: comment.location_id || null,
      anonymous_user_id: anonId,
      nickname: cleanNickname.substring(0, 30),
      content: cleanContent.substring(0, 500),
      created_at: new Date().toISOString(),
    };

    RealtimeSync.broadcastEntityChange('comments', 'INSERT', payload, undefined, comment.server_id);

    try {
      const { error } = await supabase.from('comments').insert(payload);
      return !error;
    } catch {
      return false;
    }
  },

  async deleteComment(id: string): Promise<boolean> {
    RealtimeSync.broadcastEntityChange('comments', 'DELETE', undefined, id);
    try {
      const { error } = await supabase.from('comments').delete().eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  // Suggestions
  async fetchSuggestions(serverId?: string): Promise<Suggestion[]> {
    try {
      let query = supabase.from('suggestions').select('*').order('created_at', { ascending: false });
      if (serverId && serverId !== 'all') {
        query = query.eq('server_id', serverId);
      }

      const { data, error } = await query;
      if (error || !data) return [];
      return data;
    } catch {
      return [];
    }
  },

  async addSuggestion(suggestion: {
    server_id: string;
    location_id?: string;
    nickname: string;
    type: SuggestionType;
    content: string;
  }): Promise<boolean> {
    const anonId = getAnonymousUserId();
    const cleanContent = suggestion.content.replace(/<[^>]*>?/gm, '').trim();
    const cleanNickname = suggestion.nickname.replace(/<[^>]*>?/gm, '').trim();

    if (!cleanContent || !cleanNickname) return false;

    const payload = {
      server_id: suggestion.server_id,
      location_id: suggestion.location_id || null,
      anonymous_user_id: anonId,
      nickname: cleanNickname.substring(0, 30),
      type: suggestion.type,
      content: cleanContent.substring(0, 1000),
      status: 'nova' as const,
      created_at: new Date().toISOString(),
    };

    RealtimeSync.broadcastEntityChange('suggestions', 'INSERT', payload, undefined, suggestion.server_id);

    try {
      const { error } = await supabase.from('suggestions').insert(payload);
      return !error;
    } catch {
      return false;
    }
  },

  // Realtime Subscriptions
  subscribeToComments(serverId: string, onNewComment: (comment: Comment) => void) {
    const unsub = RealtimeSync.onCommentsChange((payload) => {
      if (payload.action === 'INSERT' && payload.data) {
        if (!serverId || payload.data.server_id === serverId) {
          onNewComment(payload.data as Comment);
        }
      }
    });

    const channel = supabase
      .channel(`comments:${serverId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `server_id=eq.${serverId}`,
        },
        (payload) => {
          onNewComment(payload.new as Comment);
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        unsub();
        channel.unsubscribe();
      },
    };
  },

  subscribeToConfirmations(onChange: (payload?: any) => void) {
    const unsubChange = RealtimeSync.onWandererChange((payload) => {
      onChange(payload);
    });
    const unsubReset = RealtimeSync.onCycleReset(() => {
      onChange();
    });

    return {
      unsubscribe: () => {
        unsubChange();
        unsubReset();
      },
    };
  },

  // Admin Location Actions
  async createLocation(location: Omit<MapLocation, 'id'>): Promise<MapLocation | null> {
    const newLoc: MapLocation = {
      ...location,
      id: `loc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      confirmations_count: 0,
      user_confirmed: false,
    };
    const currentCustom = getLocalCustomLocations();
    saveLocalCustomLocations([...currentCustom, newLoc]);

    RealtimeSync.broadcastEntityChange('locations', 'INSERT', newLoc, newLoc.id, newLoc.server_id);

    try {
      const { data, error } = await supabase.from('map_locations').insert([location]).select().single();
      if (!error && data) {
        RealtimeSync.broadcastEntityChange('locations', 'INSERT', data, data.id, data.server_id);
        return data;
      }
    } catch {}
    return newLoc;
  },

  async updateLocation(id: string, updates: Partial<MapLocation>): Promise<boolean> {
    const currentCustom = getLocalCustomLocations();
    const index = currentCustom.findIndex((l) => l.id === id);
    if (index !== -1) {
      currentCustom[index] = { ...currentCustom[index], ...updates };
      saveLocalCustomLocations(currentCustom);
    }

    RealtimeSync.broadcastEntityChange('locations', 'UPDATE', updates, id);

    try {
      const { error } = await supabase.from('map_locations').update(updates).eq('id', id);
      return !error;
    } catch {
      return true;
    }
  },

  async deleteLocation(id: string): Promise<boolean> {
    const currentCustom = getLocalCustomLocations().filter((l) => l.id !== id);
    saveLocalCustomLocations(currentCustom);

    RealtimeSync.broadcastEntityChange('locations', 'DELETE', undefined, id);

    try {
      const { error } = await supabase.from('map_locations').delete().eq('id', id);
      return !error;
    } catch {
      return true;
    }
  },

  async updateSuggestionStatus(id: string, status: SuggestionStatus): Promise<boolean> {
    RealtimeSync.broadcastEntityChange('suggestions', 'UPDATE', { status }, id);
    try {
      const { error } = await supabase.from('suggestions').update({ status }).eq('id', id);
      return !error;
    } catch {
      return true;
    }
  },

  async deleteSuggestion(id: string): Promise<boolean> {
    RealtimeSync.broadcastEntityChange('suggestions', 'DELETE', undefined, id);
    try {
      const { error } = await supabase.from('suggestions').delete().eq('id', id);
      return !error;
    } catch {
      return true;
    }
  },

  async resetWandererCycle(reason: string = 'manual_admin'): Promise<boolean> {
    const current = calculateWandererCycle();
    const fresh: StoredWandererCycleState = {
      cycleKey: current.cycleKey,
      userConfirmedIds: [],
      counts: {},
    };
    saveLocalWandererCycleState(fresh);

    try {
      localStorage.removeItem('cidade_alta_user_confirmations');
    } catch {}

    // Transmite instantaneamente para todas as telas/dispositivos
    RealtimeSync.broadcastCycleReset(reason);

    try {
      const { error } = await supabase
        .from('wanderer_confirmations')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) {
        console.warn('Supabase reset cycle warning (RLS or offline):', error);
      }
    } catch (e) {
      console.warn('Supabase reset cycle exception:', e);
    }

    return true;
  },

  // --- Profiles & Users Management ---
  async fetchProfiles(): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && Array.isArray(data) && data.length > 0) {
        localStorage.setItem('malaca_cached_profiles', JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn('fetchProfiles db error, using local fallback:', e);
    }

    // Local fallback
    try {
      const cached = localStorage.getItem('malaca_cached_profiles');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const myProfile = localStorage.getItem('malaca_user_profile');
      if (myProfile) {
        return [JSON.parse(myProfile)];
      }
    } catch {}
    return [];
  },

  async updateProfile(id: string, updates: Partial<UserProfile>): Promise<boolean> {
    RealtimeSync.broadcastEntityChange('profiles', 'UPDATE', updates, id);

    try {
      const { error } = await supabase.from('profiles').update(updates).eq('id', id);
      if (!error) {
        try {
          const cached = localStorage.getItem('malaca_cached_profiles');
          if (cached) {
            const list: UserProfile[] = JSON.parse(cached);
            const updated = list.map(u => u.id === id ? { ...u, ...updates } : u);
            localStorage.setItem('malaca_cached_profiles', JSON.stringify(updated));
          }
          const myProfile = localStorage.getItem('malaca_user_profile');
          if (myProfile) {
            const parsed = JSON.parse(myProfile);
            if (parsed.id === id) {
              localStorage.setItem('malaca_user_profile', JSON.stringify({ ...parsed, ...updates }));
            }
          }
        } catch {}
        return true;
      }
    } catch {}
    return false;
  },

  async deleteProfile(id: string): Promise<boolean> {
    RealtimeSync.broadcastEntityChange('profiles', 'DELETE', undefined, id);
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  // --- Access Logs ---
  async fetchAccessLogs(limitCount: number = 50): Promise<AccessLog[]> {
    try {
      const { data, error } = await supabase
        .from('access_logs')
        .select('*')
        .order('logged_at', { ascending: false })
        .limit(limitCount);
      if (!error && Array.isArray(data)) {
        return data;
      }
    } catch (e) {
      console.warn('fetchAccessLogs error:', e);
    }
    return [];
  },

  async clearAccessLogs(): Promise<boolean> {
    try {
      await supabase.from('access_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch {}
    return true;
  },

  // --- Platform Settings ---
  async fetchPlatformSettings(): Promise<PlatformSettings> {
    const defaultSettings: PlatformSettings = {
      maintenance_mode: false,
      maintenance_message: 'Plataforma em manutenção programada para melhorias.',
      global_announcement: '',
      announcement_active: false,
      announcement_type: 'info',
      disabled_systems: [],
      require_auth_for_interactive_map: false,
    };

    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      if (!error && data) {
        localStorage.setItem('malaca_platform_settings', JSON.stringify(data));
        return { ...defaultSettings, ...data };
      }
    } catch {}

    try {
      const stored = localStorage.getItem('malaca_platform_settings');
      if (stored) return { ...defaultSettings, ...JSON.parse(stored) };
    } catch {}

    return defaultSettings;
  },

  async updatePlatformSettings(settings: Partial<PlatformSettings>): Promise<boolean> {
    const current = await this.fetchPlatformSettings();
    const updated = { ...current, ...settings, id: 'default', updated_at: new Date().toISOString() };
    
    try {
      localStorage.setItem('malaca_platform_settings', JSON.stringify(updated));
    } catch {}

    RealtimeSync.broadcastEntityChange('settings', 'UPDATE', updated, 'default');

    try {
      const { error } = await supabase
        .from('platform_settings')
        .upsert([updated], { onConflict: 'id' });
      return !error;
    } catch {
      return true;
    }
  },
};

