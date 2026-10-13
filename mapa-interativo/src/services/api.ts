import { supabase } from '../lib/supabase';
import type { Server, System, MapLocation, Comment, Suggestion, SuggestionType, SuggestionStatus, UserProfile, PlatformSettings, ConfirmedUser } from '../types';
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

const createOfficialLocations = (serverId: string, prefix: string): MapLocation[] => [
  // Hospitais Ilegais Fixos (4)
  { id: `${prefix}-hosp-1`, server_id: serverId, name: 'Hospital Ilegal #1 (Sandy Shores)', category: 'hospital_ilegal', description: 'Localização fixa do Hospital Ilegal na região central / Sandy Shores.', x: 440, y: 550, color: '#ef4444', is_active: true },
  { id: `${prefix}-hosp-2`, server_id: serverId, name: 'Hospital Ilegal #2 (Paleto Bay)', category: 'hospital_ilegal', description: 'Localização fixa do Hospital Ilegal em Paleto Bay.', x: 421, y: 825, color: '#ef4444', is_active: true },
  { id: `${prefix}-hosp-3`, server_id: serverId, name: 'Hospital Ilegal #3 (Leste)', category: 'hospital_ilegal', description: 'Localização fixa do Hospital Ilegal na zona leste.', x: 656, y: 269, color: '#ef4444', is_active: true },
  { id: `${prefix}-hosp-4`, server_id: serverId, name: 'Hospital Ilegal #4 (Porto)', category: 'hospital_ilegal', description: 'Localização fixa do Hospital Ilegal na área do Porto de Los Santos.', x: 556, y: 109, color: '#ef4444', is_active: true },

  // Mercado Ilegal Fixo (1)
  { id: `${prefix}-merc-1`, server_id: serverId, name: 'Mercado Ilegal Principal', category: 'mercado_ilegal', description: 'Localização fixa do Mercado Ilegal. Ponto de comércio e suprimentos clandestinos.', x: 648, y: 431, color: '#f59e0b', is_active: true },

  // Lavanderias Ilegais Fixas (3)
  { id: `${prefix}-lav-1`, server_id: serverId, name: 'Lavanderia Ilegal #1 (Chumash)', category: 'lavanderia_ilegal', description: 'Localização fixa da Lavanderia Ilegal na costa oeste de Chumash.', x: 209, y: 384, color: '#9b59b6', is_active: true },
  { id: `${prefix}-lav-2`, server_id: serverId, name: 'Lavanderia Ilegal #2 (Paleto Bay)', category: 'lavanderia_ilegal', description: 'Localização fixa da Lavanderia Ilegal ao norte em Paleto Bay.', x: 451, y: 841, color: '#9b59b6', is_active: true },
  { id: `${prefix}-lav-3`, server_id: serverId, name: 'Lavanderia Ilegal #3 (Cidade)', category: 'lavanderia_ilegal', description: 'Localização fixa da Lavanderia Ilegal na região urbana sul da cidade.', x: 465, y: 197, color: '#9b59b6', is_active: true },

  // Desmanches Fixos (5)
  { id: `${prefix}-desm-1`, server_id: serverId, name: 'Desmanche Bennys', category: 'desmanche', description: 'Localização fixa do Desmanche nas proximidades da Bennys / Cidade.', x: 421, y: 188, color: '#10b981', is_active: true },
  { id: `${prefix}-desm-2`, server_id: serverId, name: 'Desmanche Porto', category: 'desmanche', description: 'Localização fixa do Desmanche na área portuária.', x: 562, y: 119, color: '#10b981', is_active: true },
  { id: `${prefix}-desm-3`, server_id: serverId, name: 'Desmanche Sandy Shores', category: 'desmanche', description: 'Localização fixa do Desmanche na região de Sandy Shores.', x: 607, y: 635, color: '#10b981', is_active: true },
  { id: `${prefix}-desm-4`, server_id: serverId, name: 'Desmanche Grapeseed', category: 'desmanche', description: 'Localização fixa do Desmanche em Grapeseed.', x: 631, y: 709, color: '#10b981', is_active: true },
  { id: `${prefix}-desm-5`, server_id: serverId, name: 'Desmanche Paleto Bay', category: 'desmanche', description: 'Localização fixa do Desmanche em Paleto Bay.', x: 446, y: 844, color: '#10b981', is_active: true },

  // Andarilho - Locais Possíveis com confirmações zeradas a cada ciclo (06:00 e 18:00) (15)
  { id: `${prefix}-and-1`, server_id: serverId, name: 'Andarilho - Grapeseed Norte', category: 'local_possivel', description: 'Possível localização do Andarilho em Grapeseed. Muda de localização a cada 12 horas (06:00 e 18:00).', x: 670, y: 700, color: '#a78bfa', is_active: true, confirmations_count: 0 },
  { id: `${prefix}-and-2`, server_id: serverId, name: 'Andarilho - Grapeseed Centro', category: 'local_possivel', description: 'Possível localização do Andarilho em Grapeseed Centro. Muda de localização a cada 12 horas (06:00 e 18:00).', x: 520, y: 660, color: '#a78bfa', is_active: true, confirmations_count: 0 },
  { id: `${prefix}-and-3`, server_id: serverId, name: 'Andarilho - Grapeseed Leste', category: 'local_possivel', description: 'Possível localização do Andarilho em Grapeseed Leste. Muda de localização a cada 12 horas (06:00 e 18:00).', x: 593, y: 723, color: '#a78bfa', is_active: true, confirmations_count: 0 },
  { id: `${prefix}-and-4`, server_id: serverId, name: 'Andarilho - Grapeseed Sul', category: 'local_possivel', description: 'Possível localização do Andarilho em Grapeseed Sul. Muda de localização a cada 12 horas (06:00 e 18:00).', x: 570, y: 680, color: '#a78bfa', is_active: true, confirmations_count: 0 },
  { id: `${prefix}-and-5`, server_id: serverId, name: 'Andarilho - Grapeseed Oeste', category: 'local_possivel', description: 'Possível localização do Andarilho em Grapeseed Oeste. Muda de localização a cada 12 horas (06:00 e 18:00).', x: 568, y: 679, color: '#a78bfa', is_active: true, confirmations_count: 0 },
  { id: `${prefix}-and-6`, server_id: serverId, name: 'Andarilho - Bennys', category: 'local_possivel', description: 'Possível localização do Andarilho próximo à oficina Bennys. Muda de localização a cada 12 horas (06:00 e 18:00).', x: 433, y: 214, color: '#a78bfa', is_active: true, confirmations_count: 0 },
  { id: `${prefix}-and-7`, server_id: serverId, name: 'Andarilho - Bennys Pátio', category: 'local_possivel', description: 'Possível localização do Andarilho no pátio próximo à Bennys. Muda de localização a cada 12 horas (06:00 e 18:00).', x: 535, y: 187, color: '#a78bfa', is_active: true, confirmations_count: 0 },
  { id: `${prefix}-and-8`, server_id: serverId, name: 'Andarilho - Porto Mecânica', category: 'local_possivel', description: 'Possível localização do Andarilho na Mecânica do Porto. Muda de localização a cada 12 horas (06:00 e 18:00).', x: 483, y: 64, color: '#a78bfa', is_active: true, confirmations_count: 0 },
  { id: `${prefix}-and-9`, server_id: serverId, name: 'Andarilho - Porto Galpão', category: 'local_possivel', description: 'Possível localização do Andarilho nos galpões do Porto. Muda de localização a cada 12 horas (06:00 e 18:00).', x: 456, y: 109, color: '#a78bfa', is_active: true, confirmations_count: 0 },
  { id: `${prefix}-and-10`, server_id: serverId, name: 'Andarilho - Praia Calçadão', category: 'local_possivel', description: 'Possível localização do Andarilho na Praia. Muda de localização a cada 12 horas (06:00 e 18:00).', x: 345, y: 244, color: '#a78bfa', is_active: true, confirmations_count: 0 },
  { id: `${prefix}-and-11`, server_id: serverId, name: 'Andarilho - Praia Construção', category: 'local_possivel', description: 'Tem na praia tbm dentro de uma construção ao lado da lixeira, tem q pular dentro da construção (cercado de madeira). Muda a cada 12h.', x: 333, y: 238, color: '#a78bfa', is_active: true, confirmations_count: 0 },
  { id: `${prefix}-and-12`, server_id: serverId, name: 'Andarilho - Praia Pier', category: 'local_possivel', description: 'Possível localização do Andarilho na Praia próximo ao Pier. Muda de localização a cada 12 horas (06:00 e 18:00).', x: 413, y: 188, color: '#a78bfa', is_active: true, confirmations_count: 0 },
  { id: `${prefix}-and-13`, server_id: serverId, name: 'Andarilho - Paleto Galinheiro', category: 'local_possivel', description: 'Possível localização do Andarilho em Paleto Galinheiro. Muda de localização a cada 12 horas (06:00 e 18:00).', x: 448, y: 823, color: '#a78bfa', is_active: true, confirmations_count: 0 },
  { id: `${prefix}-and-14`, server_id: serverId, name: 'Andarilho - Paleto Leste', category: 'local_possivel', description: 'Possível localização do Andarilho em Paleto Leste. Muda de localização a cada 12 horas (06:00 e 18:00).', x: 578, y: 836, color: '#a78bfa', is_active: true, confirmations_count: 0 },
  { id: `${prefix}-and-15`, server_id: serverId, name: 'Andarilho - Paleto Norte', category: 'local_possivel', description: 'Possível localização do Andarilho em Paleto Norte. Muda de localização a cada 12 horas (06:00 e 18:00).', x: 440, y: 840, color: '#a78bfa', is_active: true, confirmations_count: 0 },
];

const MOCK_LOCATIONS: Record<string, MapLocation[]> = {
  'cda-server-uuid': createOfficialLocations('cda-server-uuid', 'cda'),
  'valley-server-uuid': createOfficialLocations('valley-server-uuid', 'val'),
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

      // Busca confirmações registradas a partir do início do ciclo atual (06:00 ou 18:00)
      let confirmations: any[] | null = null;
      try {
        const { data, error } = await supabase
          .from('wanderer_confirmations')
          .select('location_id, anonymous_user_id, created_at, user_id, username, full_name, avatar_url, character_name, instagram, twitch, youtube, twitter_x')
          .gte('created_at', currentCycle.startTime.toISOString())
          .order('created_at', { ascending: false });
        if (error) {
          const fallbackRes = await supabase
            .from('wanderer_confirmations')
            .select('location_id, anonymous_user_id, created_at')
            .gte('created_at', currentCycle.startTime.toISOString())
            .order('created_at', { ascending: false });
          confirmations = fallbackRes.data;
        } else {
          confirmations = data;
        }
      } catch {
        confirmations = null;
      }

      const remoteCounts: Record<string, number> = {};
      const latestConfirmationsMap: Record<string, { username: string; confirmed_at: string }> = {
        ...(cycleState.latestConfirmations || {}),
      };
      const confirmedUsersMap: Record<string, ConfirmedUser[]> = {};
      const userConfirmedSet = new Set<string>(cycleState.userConfirmedIds);

      if (confirmations) {
        // Dispara limpeza preventiva no Supabase para registros legados com Comunidade RP
        (async () => {
          try {
            await supabase
              .from('wanderer_confirmations')
              .delete()
              .or('username.ilike.%Comunidade RP%,anonymous_user_id.ilike.%Comunidade RP%');
          } catch {}
        })();

        confirmations.forEach((c) => {
          const rawId = c.anonymous_user_id || '';
          const rawUsername = c.username || '';

          // REJEITA completamente registros fictícios, anônimos não identificados ou legados com Comunidade RP
          if (
            rawUsername.includes('Comunidade RP') ||
            rawId.includes('Comunidade RP') ||
            rawUsername === '@Comunidade RP' ||
            (!c.user_id && !c.username && rawId.startsWith('anon_'))
          ) {
            return;
          }

          // Identifica o autor real (sempre com @ e priorizando perfil real de jogador)
          const parsedName = c.username
            ? (c.username.startsWith('@') ? c.username : `@${c.username}`)
            : (rawId.startsWith('@') ? rawId : null);

          // Se não houver nome válido de jogador, não processa como confirmação real
          if (!parsedName || parsedName.includes('Comunidade RP') || parsedName.startsWith('anon_') || parsedName.startsWith('@anon_')) {
            return;
          }

          remoteCounts[c.location_id] = (remoteCounts[c.location_id] || 0) + 1;
          const isUserMatch =
            rawId === anonId ||
            (rawId.startsWith('@') && cycleState.userConfirmedIds.includes(c.location_id)) ||
            (c.user_id && cycleState.userConfirmedIds.includes(c.location_id));
          if (isUserMatch) {
            userConfirmedSet.add(c.location_id);
          }

          if (!latestConfirmationsMap[c.location_id]) {
            latestConfirmationsMap[c.location_id] = {
              username: parsedName,
              confirmed_at: c.created_at,
            };
          }

          if (!confirmedUsersMap[c.location_id]) {
            confirmedUsersMap[c.location_id] = [];
          }
          if (!confirmedUsersMap[c.location_id].some((u) => u.username === parsedName || (c.user_id && u.user_id === c.user_id))) {
            confirmedUsersMap[c.location_id].push({
              user_id: c.user_id,
              username: parsedName,
              full_name: c.full_name || parsedName,
              avatar_url: c.avatar_url || 'https://cdn.discordapp.com/embed/avatars/0.png',
              character_name: c.character_name || '',
              instagram: c.instagram || '',
              twitch: c.twitch || '',
              youtube: c.youtube || '',
              twitter_x: c.twitter_x || '',
              confirmed_at: c.created_at,
            });
          }
        });
      }

      return baseLocations.map((loc) => {
        const isWanderer = loc.category === 'andarilho' || loc.category === 'local_possivel';
        const isLocallyConfirmed = userConfirmedSet.has(loc.id);

        let mergedUsers: ConfirmedUser[] | undefined = undefined;
        let latestConf: { username: string; confirmed_at: string } | undefined = undefined;

        if (isWanderer) {
          const list = [...(confirmedUsersMap[loc.id] || [])];
          const localList = (cycleState.confirmedUsersByLocation && cycleState.confirmedUsersByLocation[loc.id]) || [];
          localList.forEach((lu: ConfirmedUser) => {
            if (
              lu.username &&
              !lu.username.includes('Comunidade RP') &&
              !lu.username.startsWith('anon_') &&
              !lu.username.startsWith('@anon_') &&
              !list.some((u) => u.username === lu.username || (lu.user_id && u.user_id === lu.user_id))
            ) {
              list.push(lu);
            }
          });
          mergedUsers = list.length > 0 ? list : undefined;

          // Define último confirmado exclusivamente de usuários reais
          const rawLatest = latestConfirmationsMap[loc.id];
          if (
            rawLatest?.username &&
            !rawLatest.username.includes('Comunidade RP') &&
            !rawLatest.username.startsWith('anon_') &&
            !rawLatest.username.startsWith('@anon_')
          ) {
            latestConf = rawLatest;
          } else if (mergedUsers && mergedUsers.length > 0) {
            latestConf = {
              username: mergedUsers[0].username,
              confirmed_at: mergedUsers[0].confirmed_at || new Date().toISOString(),
            };
          }
        }

        // Para o Andarilho, a contagem reflete exclusivamente as confirmações reais
        const realCount = mergedUsers ? mergedUsers.length : (isLocallyConfirmed ? 1 : 0);
        const totalCount = isWanderer ? realCount : (loc.confirmations_count || 0);

        return {
          ...loc,
          confirmations_count: totalCount,
          user_confirmed: isLocallyConfirmed,
          last_confirmed_by: latestConf?.username,
          last_confirmed_at: latestConf?.confirmed_at,
          confirmed_users: mergedUsers,
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

        let validLocalUsers: ConfirmedUser[] | undefined = undefined;
        let validLatest: string | undefined = undefined;

        if (isWanderer) {
          const localUsers = cycleState.confirmedUsersByLocation ? cycleState.confirmedUsersByLocation[loc.id] : undefined;
          const filtered = localUsers?.filter(
            (u) =>
              u.username &&
              !u.username.includes('Comunidade RP') &&
              !u.username.startsWith('anon_') &&
              !u.username.startsWith('@anon_')
          );
          validLocalUsers = filtered && filtered.length > 0 ? filtered : undefined;

          const rawLatest = cycleState.latestConfirmations ? cycleState.latestConfirmations[loc.id] : undefined;
          if (
            rawLatest?.username &&
            !rawLatest.username.includes('Comunidade RP') &&
            !rawLatest.username.startsWith('anon_') &&
            !rawLatest.username.startsWith('@anon_')
          ) {
            validLatest = rawLatest.username;
          } else if (validLocalUsers && validLocalUsers.length > 0) {
            validLatest = validLocalUsers[0].username;
          }
        }

        const realCount = validLocalUsers ? validLocalUsers.length : (isLocallyConfirmed ? 1 : 0);
        const totalCount = isWanderer ? realCount : (loc.confirmations_count || 0);

        return {
          ...loc,
          confirmations_count: totalCount,
          user_confirmed: isLocallyConfirmed,
          last_confirmed_by: validLatest,
          last_confirmed_at: cycleState.latestConfirmations?.[loc.id]?.confirmed_at,
          confirmed_users: validLocalUsers,
        };
      });
    }
  },

  // Confirm Wanderer Location (com Broadcast instantâneo e Presence para todas as telas)
  async addWandererConfirmation(
    locationId: string,
    serverId?: string,
    user?: UserProfile | any | null
  ): Promise<boolean> {
    const rawUsername = user?.username || user?.full_name;
    if (!rawUsername || rawUsername.includes('Comunidade RP') || rawUsername.startsWith('anon_')) {
      console.warn('Confirmação do Andarilho recusada: requer usuário real logado.');
      return false;
    }
    const authorTag = `@${rawUsername.replace(/^@/, '')}`;
    const cycleState = getLocalWandererCycleState();
    const nowIso = new Date().toISOString();

    if (!cycleState.userConfirmedIds.includes(locationId)) {
      cycleState.userConfirmedIds.push(locationId);
    }
    cycleState.counts[locationId] = (cycleState.counts[locationId] || 0) + 1;
    if (!cycleState.latestConfirmations) cycleState.latestConfirmations = {};
    cycleState.latestConfirmations[locationId] = {
      username: authorTag,
      confirmed_at: nowIso,
    };

    if (!cycleState.confirmedUsersByLocation) {
      cycleState.confirmedUsersByLocation = {};
    }
    if (!cycleState.confirmedUsersByLocation[locationId]) {
      cycleState.confirmedUsersByLocation[locationId] = [];
    }

    const confirmedUserEntry: ConfirmedUser = {
      user_id: user?.id,
      discord_id: user?.discord_id,
      username: authorTag,
      full_name: user?.full_name || authorTag,
      avatar_url: user?.avatar_url || 'https://cdn.discordapp.com/embed/avatars/0.png',
      character_name: user?.character_name || '',
      instagram: user?.instagram || '',
      twitch: user?.twitch || '',
      youtube: user?.youtube || '',
      twitter_x: user?.twitter_x || '',
      confirmed_at: nowIso,
    };

    cycleState.confirmedUsersByLocation[locationId] = cycleState.confirmedUsersByLocation[locationId].filter(
      (u: ConfirmedUser) => u.username !== authorTag && (user?.id ? u.user_id !== user.id : true)
    );
    cycleState.confirmedUsersByLocation[locationId].unshift(confirmedUserEntry);

    saveLocalWandererCycleState(cycleState);

    // Atualiza Presença Realtime no Supabase para sincronizar com todos os usuários ativos
    RealtimeSync.syncPresence(cycleState.userConfirmedIds);

    // Broadcast em tempo real para todas as telas/abas
    RealtimeSync.broadcastVoteChange('vote_added', locationId, serverId, cycleState.counts[locationId], {
      username: authorTag,
      confirmed_at: nowIso,
    }, confirmedUserEntry);

    try {
      await supabase.from('wanderer_confirmations').insert({
        location_id: locationId,
        anonymous_user_id: authorTag,
        user_id: user?.id || null,
        username: authorTag,
        full_name: user?.full_name || authorTag,
        avatar_url: user?.avatar_url || null,
        character_name: user?.character_name || null,
        instagram: user?.instagram || null,
        twitch: user?.twitch || null,
        youtube: user?.youtube || null,
        twitter_x: user?.twitter_x || null,
      });
    } catch {}
    return true;
  },

  // Remove Wanderer Confirmation (com Broadcast instantâneo e Presence para todas as telas)
  async removeWandererConfirmation(
    locationId: string,
    serverId?: string,
    user?: UserProfile | any | null
  ): Promise<boolean> {
    const rawUsername = user?.username || user?.full_name;
    if (!rawUsername) {
      return false;
    }
    const authorTag = `@${rawUsername.replace(/^@/, '')}`;
    const cycleState = getLocalWandererCycleState();

    cycleState.userConfirmedIds = cycleState.userConfirmedIds.filter((id) => id !== locationId);
    cycleState.counts[locationId] = Math.max(0, (cycleState.counts[locationId] || 1) - 1);
    if (cycleState.latestConfirmations && cycleState.latestConfirmations[locationId]?.username === authorTag) {
      delete cycleState.latestConfirmations[locationId];
    }
    if (cycleState.confirmedUsersByLocation && cycleState.confirmedUsersByLocation[locationId]) {
      cycleState.confirmedUsersByLocation[locationId] = cycleState.confirmedUsersByLocation[locationId].filter(
        (u: ConfirmedUser) => u.username !== authorTag && (user?.id ? u.user_id !== user.id : true)
      );
    }
    saveLocalWandererCycleState(cycleState);

    // Atualiza Presença Realtime no Supabase
    RealtimeSync.syncPresence(cycleState.userConfirmedIds);

    // Broadcast em tempo real para todas as telas/abas
    RealtimeSync.broadcastVoteChange('vote_removed', locationId, serverId, cycleState.counts[locationId], undefined, {
      username: authorTag,
      user_id: user?.id,
    });

    try {
      await supabase
        .from('wanderer_confirmations')
        .delete()
        .eq('location_id', locationId)
        .or(`anonymous_user_id.eq.${authorTag},anonymous_user_id.eq.${getAnonymousUserId()}${user?.id ? `,user_id.eq.${user.id}` : ''}`);
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
      const deletedList: string[] = JSON.parse(localStorage.getItem('malaca_deleted_discord_accounts') || '[]');
      if (!error && Array.isArray(data)) {
        const filtered = data.filter(u => !deletedList.includes(String(u.discord_id)) && !deletedList.includes(String(u.id)));
        localStorage.setItem('malaca_cached_profiles', JSON.stringify(filtered));
        return filtered;
      }
    } catch (e) {
      console.warn('fetchProfiles db error, using local fallback:', e);
    }

    // Local fallback
    try {
      const deletedList: string[] = JSON.parse(localStorage.getItem('malaca_deleted_discord_accounts') || '[]');
      const cached = localStorage.getItem('malaca_cached_profiles');
      if (cached) {
        const parsed: UserProfile[] = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(u => !deletedList.includes(String(u.discord_id)) && !deletedList.includes(String(u.id)));
        }
      }
      const myProfile = localStorage.getItem('malaca_user_profile');
      if (myProfile) {
        const parsed = JSON.parse(myProfile);
        if (!deletedList.includes(String(parsed.discord_id)) && !deletedList.includes(String(parsed.id))) {
          return [parsed];
        }
      }
    } catch {}
    return [];
  },

  async updateProfile(id: string, updates: Partial<UserProfile>): Promise<boolean> {
    RealtimeSync.broadcastEntityChange('profiles', 'UPDATE', updates, id);

    // 1. Tentar atualizar no Supabase com fallback seguro para is_banned
    try {
      const dbUpdates: any = { ...updates };
      if (updates.is_banned === true) {
        dbUpdates.role = 'banned';
        dbUpdates.is_admin = false;
      } else if (updates.is_banned === false && dbUpdates.role === 'banned') {
        dbUpdates.role = 'user';
      }
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      let res;
      if (isUuid) {
        res = await supabase.from('profiles').update(dbUpdates).eq('id', id);
      } else {
        res = await supabase.from('profiles').update(dbUpdates).eq('discord_id', id);
      }

      if (res && res.error && (res.error.message || '').includes('is_banned')) {
        delete dbUpdates.is_banned;
        if (isUuid) {
          await supabase.from('profiles').update(dbUpdates).eq('id', id);
        } else {
          await supabase.from('profiles').update(dbUpdates).eq('discord_id', id);
        }
      }
    } catch (e) {
      console.warn('Supabase updateProfile warn:', e);
    }

    // 2. Garantir sincronização imediata no cache de perfis
    try {
      const cached = localStorage.getItem('malaca_cached_profiles');
      let targetDiscordId = '';
      if (cached) {
        const list: UserProfile[] = JSON.parse(cached);
        const updated = list.map(u => {
          if (u.id === id || u.discord_id === id) {
            targetDiscordId = u.discord_id || targetDiscordId;
            return { ...u, ...updates };
          }
          return u;
        });
        localStorage.setItem('malaca_cached_profiles', JSON.stringify(updated));
      }

      // Se for a conta da sessão ativa
      const myProfile = localStorage.getItem('malaca_user_profile');
      if (myProfile) {
        const parsed = JSON.parse(myProfile);
        if (parsed.id === id || parsed.discord_id === id) {
          targetDiscordId = parsed.discord_id || targetDiscordId;
          const merged = { ...parsed, ...updates };
          localStorage.setItem('malaca_user_profile', JSON.stringify(merged));
        }
      }

      // Gerenciar listas especiais de Admin e Banidos
      const targetIdToSync = targetDiscordId || id;

      if (targetDiscordId && targetDiscordId !== id) {
        try {
          await supabase.from('profiles').update(updates).eq('discord_id', targetDiscordId);
        } catch (e) {}
      }

      // Gestão de Cargo Admin
      if (updates.is_admin === true || (updates.role as string) === 'admin') {
        const admins = JSON.parse(localStorage.getItem('malaca_admin_discord_accounts') || '[]');
        if (!admins.includes(targetIdToSync)) {
          admins.push(targetIdToSync);
          localStorage.setItem('malaca_admin_discord_accounts', JSON.stringify(admins));
        }
      } else if (updates.is_admin === false || ((updates.role as string) && (updates.role as string) !== 'admin')) {
        const admins = JSON.parse(localStorage.getItem('malaca_admin_discord_accounts') || '[]');
        const filtered = admins.filter((a: string) => a !== targetIdToSync && a !== id);
        localStorage.setItem('malaca_admin_discord_accounts', JSON.stringify(filtered));
      }

      // Gestão de Banimento
      if (updates.is_banned === true) {
        const banned = JSON.parse(localStorage.getItem('malaca_banned_discord_accounts') || '[]');
        if (!banned.includes(targetIdToSync)) {
          banned.push(targetIdToSync);
          localStorage.setItem('malaca_banned_discord_accounts', JSON.stringify(banned));
        }
        // Se banido, remover de administradores
        const admins = JSON.parse(localStorage.getItem('malaca_admin_discord_accounts') || '[]');
        const filtered = admins.filter((a: string) => a !== targetIdToSync && a !== id);
        localStorage.setItem('malaca_admin_discord_accounts', JSON.stringify(filtered));
      } else if (updates.is_banned === false) {
        const banned = JSON.parse(localStorage.getItem('malaca_banned_discord_accounts') || '[]');
        const filtered = banned.filter((b: string) => b !== targetIdToSync && b !== id);
        localStorage.setItem('malaca_banned_discord_accounts', JSON.stringify(filtered));
      }

      // Disparar broadcast em tempo real para sincronização entre abas
      try {
        const globalHub = supabase.channel('malaca_realtime_global_hub');
        if (updates.is_admin !== undefined) {
          globalHub.send({
            type: 'broadcast',
            event: 'user_permission_updated',
            payload: { id, discordId: targetIdToSync, is_admin: updates.is_admin, role: updates.role || (updates.is_admin ? 'admin' : 'user') }
          });
        }
        if (updates.is_banned !== undefined) {
          globalHub.send({
            type: 'broadcast',
            event: 'user_ban_updated',
            payload: { id, discordId: targetIdToSync, is_banned: updates.is_banned }
          });
        }
      } catch(e) {}
    } catch (err) {
      console.warn('Local updateProfile sync error:', err);
    }

    return true;
  },

  async deleteProfile(id: string): Promise<boolean> {
    RealtimeSync.broadcastEntityChange('profiles', 'DELETE', undefined, id);

    // 1. Grava no tombstone global no Supabase e local
    try {
      const deletedList: string[] = JSON.parse(localStorage.getItem('malaca_deleted_discord_accounts') || '[]');
      if (!deletedList.includes(id)) {
        deletedList.push(id);
        localStorage.setItem('malaca_deleted_discord_accounts', JSON.stringify(deletedList));
      }

      const { data: ps } = await supabase
        .from('platform_settings')
        .select('disabled_systems')
        .eq('id', 'deleted_accounts')
        .maybeSingle();
      const arr = Array.isArray(ps?.disabled_systems) ? ps.disabled_systems : [];
      if (!arr.includes(id)) arr.push(id);
      await supabase.from('platform_settings').upsert({
        id: 'deleted_accounts',
        disabled_systems: arr,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
    } catch {}

    // 2. Tentar deletar no Supabase com seguranca
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUuid) {
        await supabase.from('profiles').delete().eq('id', id);
      } else {
        await supabase.from('profiles').delete().eq('discord_id', id);
      }
      try {
        await supabase.from('wanderer_confirmations').delete().eq('user_id', id);
      } catch {}
    } catch (e) {
      console.warn('Supabase deleteProfile warn:', e);
    }

    // 3. Remover do cache e de todas as listas locais
    try {
      const cached = localStorage.getItem('malaca_cached_profiles');
      if (cached) {
        const list: UserProfile[] = JSON.parse(cached);
        const filtered = list.filter(u => u.id !== id && u.discord_id !== id);
        localStorage.setItem('malaca_cached_profiles', JSON.stringify(filtered));
      }

      const admins = JSON.parse(localStorage.getItem('malaca_admin_discord_accounts') || '[]');
      const filteredAdmins = admins.filter((a: string) => a !== id);
      localStorage.setItem('malaca_admin_discord_accounts', JSON.stringify(filteredAdmins));

      const banned = JSON.parse(localStorage.getItem('malaca_banned_discord_accounts') || '[]');
      const filteredBanned = banned.filter((b: string) => b !== id);
      localStorage.setItem('malaca_banned_discord_accounts', JSON.stringify(filteredBanned));

      const myProfile = localStorage.getItem('malaca_user_profile');
      if (myProfile) {
        const parsed = JSON.parse(myProfile);
        if (parsed.id === id || parsed.discord_id === id) {
          localStorage.removeItem('malaca_user_profile');
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const k = localStorage.key(i);
            if (k && (k.startsWith('sb-') || k.includes('auth-token'))) {
              localStorage.removeItem(k);
            }
          }
          try { await supabase.auth.signOut({ scope: 'global' }); } catch(e) {}
        }
      }
    } catch {}

    // 4. Enviar broadcast para deslogar a sessão do usuário em tempo real
    try {
      supabase.channel('malaca_realtime_global_hub').send({
        type: 'broadcast',
        event: 'force_user_logout',
        payload: { id, discordId: id, timestamp: Date.now() },
      });
    } catch {}

    return true;
  },

  // --- Wanderer Points Management ---
  async forceConfirmWandererLocation(locationId: string, serverId: string = 'cda-server-uuid', adminUsername: string = 'Administrador'): Promise<boolean> {
    const cycleState = getLocalWandererCycleState();
    const nowIso = new Date().toISOString();

    const updatedCounts = { ...(cycleState.counts || {}), [locationId]: (cycleState.counts?.[locationId] || 0) + 10 };
    const updatedLatest = {
      ...(cycleState.latestConfirmations || {}),
      [locationId]: {
        username: `@${adminUsername}`,
        confirmed_at: nowIso,
      },
    };

    saveLocalWandererCycleState({
      ...cycleState,
      counts: updatedCounts,
      latestConfirmations: updatedLatest,
      userConfirmedIds: Array.from(new Set([...cycleState.userConfirmedIds, locationId])),
    });

    RealtimeSync.broadcastEntityChange('locations', 'UPDATE', {
      location_id: locationId,
      server_id: serverId,
      username: adminUsername,
      confirmed_at: nowIso,
    });

    try {
      await supabase.from('wanderer_confirmations').insert([{
        location_id: locationId,
        anonymous_user_id: `@${adminUsername}`,
        username: adminUsername,
        created_at: nowIso,
      }]);
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

