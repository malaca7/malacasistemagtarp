import { supabase } from '../lib/supabase';
import type { Server, System, MapLocation, Comment, Suggestion, SuggestionType, SuggestionStatus } from '../types';
import { getAnonymousUserId } from '../utils/anonymousId';

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
    link: 'mapa-interativo/',
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
    link: 'lockpick/',
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
    link: 'caixinha/',
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
    link: 'hacking/',
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

    // Andarilho - Todos os Locais Possíveis Exatos do Sistema Original
    { id: 'cda-and-1', server_id: 'cda-server-uuid', name: 'Andarilho - Grapeseed Norte', category: 'local_possivel', description: 'Possível localização do Andarilho em Grapeseed', x: 670, y: 700, color: '#a78bfa', is_active: true, confirmations_count: 18 },
    { id: 'cda-and-2', server_id: 'cda-server-uuid', name: 'Andarilho - Grapeseed Centro', category: 'local_possivel', description: 'Possível localização do Andarilho em Grapeseed', x: 520, y: 660, color: '#a78bfa', is_active: true, confirmations_count: 12 },
    { id: 'cda-and-3', server_id: 'cda-server-uuid', name: 'Andarilho - Grapeseed Leste', category: 'local_possivel', description: 'Possível localização do Andarilho em Grapeseed', x: 593, y: 723, color: '#a78bfa', is_active: true, confirmations_count: 9 },
    { id: 'cda-and-4', server_id: 'cda-server-uuid', name: 'Andarilho - Grapeseed Sul', category: 'local_possivel', description: 'Possível localização do Andarilho em Grapeseed', x: 570, y: 680, color: '#a78bfa', is_active: true, confirmations_count: 14 },
    { id: 'cda-and-5', server_id: 'cda-server-uuid', name: 'Andarilho - Grapeseed Oeste', category: 'local_possivel', description: 'Possível localização do Andarilho em Grapeseed', x: 568, y: 679, color: '#a78bfa', is_active: true, confirmations_count: 22 },
    { id: 'cda-and-6', server_id: 'cda-server-uuid', name: 'Andarilho - Bennys', category: 'local_possivel', description: 'Possível localização do Andarilho em Bennys', x: 433, y: 214, color: '#a78bfa', is_active: true, confirmations_count: 32 },
    { id: 'cda-and-7', server_id: 'cda-server-uuid', name: 'Andarilho - Bennys Pátio', category: 'local_possivel', description: 'Possível localização do Andarilho em Bennys', x: 535, y: 187, color: '#a78bfa', is_active: true, confirmations_count: 15 },
    { id: 'cda-and-8', server_id: 'cda-server-uuid', name: 'Andarilho - Porto Mecânica', category: 'local_possivel', description: 'Possível localização do Andarilho na Mecânica do Porto', x: 483, y: 64, color: '#a78bfa', is_active: true, confirmations_count: 28 },
    { id: 'cda-and-9', server_id: 'cda-server-uuid', name: 'Andarilho - Porto Galpão', category: 'local_possivel', description: 'Possível localização do Andarilho no Porto', x: 456, y: 109, color: '#a78bfa', is_active: true, confirmations_count: 20 },
    { id: 'cda-and-10', server_id: 'cda-server-uuid', name: 'Andarilho - Praia Calçadão', category: 'local_possivel', description: 'Possível localização do Andarilho na Praia', x: 345, y: 244, color: '#a78bfa', is_active: true, confirmations_count: 19 },
    { id: 'cda-and-11', server_id: 'cda-server-uuid', name: 'Andarilho - Praia Construção', category: 'local_possivel', description: 'Ao lado da lixeira, dentro da construção cercada de madeira na praia.', x: 333, y: 238, color: '#a78bfa', is_active: true, confirmations_count: 41 },
    { id: 'cda-and-12', server_id: 'cda-server-uuid', name: 'Andarilho - Praia Pier', category: 'local_possivel', description: 'Possível localização do Andarilho na Praia', x: 413, y: 188, color: '#a78bfa', is_active: true, confirmations_count: 17 },
    { id: 'cda-and-13', server_id: 'cda-server-uuid', name: 'Andarilho - Paleto Galinheiro', category: 'local_possivel', description: 'Possível localização do Andarilho em Paleto Galinheiro', x: 448, y: 823, color: '#a78bfa', is_active: true, confirmations_count: 25 },
    { id: 'cda-and-14', server_id: 'cda-server-uuid', name: 'Andarilho - Paleto Posto', category: 'local_possivel', description: 'Possível localização do Andarilho em Paleto', x: 578, y: 836, color: '#a78bfa', is_active: true, confirmations_count: 16 },
    { id: 'cda-and-15', server_id: 'cda-server-uuid', name: 'Andarilho - Paleto Leste', category: 'local_possivel', description: 'Possível localização do Andarilho em Paleto', x: 440, y: 840, color: '#a78bfa', is_active: true, confirmations_count: 14 }
  ],
  'valley-server-uuid': [
    { id: 'val-hosp-1', server_id: 'valley-server-uuid', name: 'Hospital Ilegal Valley', category: 'hospital_ilegal', description: 'Atendimento clandestino Valley', x: 440, y: 550, color: '#ef4444', is_active: true },
    { id: 'val-merc-1', server_id: 'valley-server-uuid', name: 'Mercado Ilegal Valley', category: 'mercado_ilegal', description: 'Mercado Ilegal Valley', x: 648, y: 431, color: '#f59e0b', is_active: true },
    { id: 'val-lav-1', server_id: 'valley-server-uuid', name: 'Lavanderia Ilegal Valley', category: 'lavanderia_ilegal', description: 'Lavanderia Valley', x: 209, y: 384, color: '#3b82f6', is_active: true },
    { id: 'val-desm-1', server_id: 'valley-server-uuid', name: 'Desmanche Valley', category: 'desmanche', description: 'Desmanche Valley', x: 421, y: 188, color: '#10b981', is_active: true },
    { id: 'val-and-1', server_id: 'valley-server-uuid', name: 'Andarilho Valley - Colinas', category: 'local_possivel', description: 'Localização reportada do Andarilho em Valley', x: 600, y: 600, color: '#a78bfa', is_active: true, confirmations_count: 27 },
  ],
  'los-santos-server-uuid': [
    { id: 'ls-hosp-1', server_id: 'los-santos-server-uuid', name: 'Hospital Ilegal Central', category: 'hospital_ilegal', description: 'Hospital Ilegal Los Santos', x: 440, y: 550, color: '#ef4444', is_active: true },
    { id: 'ls-desm-1', server_id: 'los-santos-server-uuid', name: 'Desmanche Los Santos', category: 'desmanche', description: 'Desmanche Los Santos', x: 421, y: 188, color: '#10b981', is_active: true },
  ]
};

// Local storage helpers for persistence
const getLocalServers = (): Server[] => {
  try {
    const raw = localStorage.getItem('malaca_custom_servers');
    if (raw) return JSON.parse(raw);
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
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_SYSTEMS;
};

const saveLocalSystems = (systems: System[]) => {
  try {
    localStorage.setItem('malaca_custom_systems', JSON.stringify(systems));
  } catch {}
};

const getLocalConfirmedIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem('cidade_alta_user_confirmations');
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
};

const saveLocalConfirmedIds = (set: Set<string>) => {
  try {
    localStorage.setItem('cidade_alta_user_confirmations', JSON.stringify(Array.from(set)));
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
      await supabase.from('servers').insert([
        {
          name: newCity.name,
          slug: newCity.slug,
          map_image_url: newCity.map_image_url,
          active: newCity.active,
        },
      ]);
    } catch {}
    return newCity;
  },

  async updateCity(id: string, updates: Partial<Server>): Promise<boolean> {
    const current = getLocalServers();
    const index = current.findIndex((c) => c.id === id || c.slug === id);
    if (index !== -1) {
      current[index] = { ...current[index], ...updates };
      saveLocalServers(current);
    }
    try {
      await supabase.from('servers').update(updates).eq('id', id);
    } catch {}
    return true;
  },

  async deleteCity(id: string): Promise<boolean> {
    const current = getLocalServers();
    const filtered = current.filter((c) => c.id !== id && c.slug !== id);
    saveLocalServers(filtered);
    try {
      await supabase.from('servers').delete().eq('id', id);
    } catch {}
    return true;
  },

  // Fetch Systems
  async fetchSystems(): Promise<System[]> {
    return getLocalSystems();
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
    return newSys;
  },

  async updateSystem(id: string, updates: Partial<System>): Promise<boolean> {
    const current = getLocalSystems();
    const index = current.findIndex((s) => s.id === id);
    if (index !== -1) {
      current[index] = { ...current[index], ...updates };
      saveLocalSystems(current);
    }
    return true;
  },

  async deleteSystem(id: string): Promise<boolean> {
    const current = getLocalSystems();
    const filtered = current.filter((s) => s.id !== id);
    saveLocalSystems(filtered);
    return true;
  },

  // Fetch Locations with confirmations
  async fetchLocations(serverId: string): Promise<MapLocation[]> {
    const anonId = getAnonymousUserId();
    const localConfirmedSet = getLocalConfirmedIds();

    try {
      const { data: locations, error } = await supabase
        .from('map_locations')
        .select('*')
        .eq('server_id', serverId)
        .eq('is_active', true);

      const baseLocations = error || !locations || locations.length === 0 
        ? MOCK_LOCATIONS[serverId] || [] 
        : locations;

      const { data: confirmations } = await supabase
        .from('wanderer_confirmations')
        .select('location_id, anonymous_user_id');

      const counts: Record<string, number> = {};
      const userConfirmedSet = new Set<string>(localConfirmedSet);

      if (confirmations) {
        confirmations.forEach((c) => {
          counts[c.location_id] = (counts[c.location_id] || 0) + 1;
          if (c.anonymous_user_id === anonId) {
            userConfirmedSet.add(c.location_id);
          }
        });
      }

      return baseLocations.map((loc) => {
        const isLocallyConfirmed = localConfirmedSet.has(loc.id);
        const remoteCount = counts[loc.id] || 0;
        const totalCount = (loc.confirmations_count || 0) + remoteCount + (isLocallyConfirmed && !remoteCount ? 1 : 0);

        return {
          ...loc,
          confirmations_count: totalCount,
          user_confirmed: userConfirmedSet.has(loc.id),
        };
      });
    } catch {
      const baseLocations = MOCK_LOCATIONS[serverId] || [];
      return baseLocations.map((loc) => ({
        ...loc,
        confirmations_count: (loc.confirmations_count || 0) + (localConfirmedSet.has(loc.id) ? 1 : 0),
        user_confirmed: localConfirmedSet.has(loc.id),
      }));
    }
  },

  // Confirm Wanderer Location
  async addWandererConfirmation(locationId: string): Promise<boolean> {
    const anonId = getAnonymousUserId();
    const localSet = getLocalConfirmedIds();
    localSet.add(locationId);
    saveLocalConfirmedIds(localSet);

    try {
      await supabase.from('wanderer_confirmations').insert({
        location_id: locationId,
        anonymous_user_id: anonId,
      });
    } catch {}
    return true;
  },

  // Remove Wanderer Confirmation
  async removeWandererConfirmation(locationId: string): Promise<boolean> {
    const anonId = getAnonymousUserId();
    const localSet = getLocalConfirmedIds();
    localSet.delete(locationId);
    saveLocalConfirmedIds(localSet);

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

    try {
      const { error } = await supabase.from('comments').insert({
        server_id: comment.server_id,
        location_id: comment.location_id || null,
        anonymous_user_id: anonId,
        nickname: cleanNickname.substring(0, 30),
        content: cleanContent.substring(0, 500),
      });
      return !error;
    } catch {
      return false;
    }
  },

  async deleteComment(id: string): Promise<boolean> {
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

    try {
      const { error } = await supabase.from('suggestions').insert({
        server_id: suggestion.server_id,
        location_id: suggestion.location_id || null,
        anonymous_user_id: anonId,
        nickname: cleanNickname.substring(0, 30),
        type: suggestion.type,
        content: cleanContent.substring(0, 1000),
        status: 'nova',
      });
      return !error;
    } catch {
      return false;
    }
  },

  // Realtime Subscriptions
  subscribeToComments(serverId: string, onNewComment: (comment: Comment) => void) {
    return supabase
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
  },

  subscribeToConfirmations(onChange: () => void) {
    return supabase
      .channel('wanderer_confirmations_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wanderer_confirmations',
        },
        () => {
          onChange();
        }
      )
      .subscribe();
  },

  // Admin Location Actions
  async createLocation(location: Omit<MapLocation, 'id'>): Promise<MapLocation | null> {
    try {
      const { data, error } = await supabase.from('map_locations').insert([location]).select().single();
      if (error) return null;
      return data;
    } catch {
      return null;
    }
  },

  async updateLocation(id: string, updates: Partial<MapLocation>): Promise<boolean> {
    try {
      const { error } = await supabase.from('map_locations').update(updates).eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  async deleteLocation(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('map_locations').delete().eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  async updateSuggestionStatus(id: string, status: SuggestionStatus): Promise<boolean> {
    try {
      const { error } = await supabase.from('suggestions').update({ status }).eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  async resetWandererCycle(): Promise<boolean> {
    try {
      localStorage.removeItem('cidade_alta_user_confirmations');
    } catch {}

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
};
