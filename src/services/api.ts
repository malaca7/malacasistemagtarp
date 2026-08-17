import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  Server, 
  MapLocation, 
  Comment, 
  Suggestion, 
  ServerSlug, 
  LocationCategory,
  SuggestionStatus
} from '../types';
import { getAnonymousUserId } from '../utils/anonymousUser';

// OPTIMIZED HIGH QUALITY WEBP MAP IMAGE (2.1MB vs 20.1MB)
const MAP_IMAGE_URL = '/images/mapa_cda_optimized.webp';

// MOCK INITIAL DATA MATCHING MAPA-CDA.VERCEL.APP EXACTLY
const INITIAL_SERVERS: Server[] = [
  {
    id: 'cda-server-001',
    name: 'Cidade Alta (CDA)',
    slug: 'cda',
    active: true,
    map_image_url: MAP_IMAGE_URL,
    created_at: new Date().toISOString()
  },
  {
    id: 'valley-server-002',
    name: 'Valley RP',
    slug: 'valley',
    active: true,
    map_image_url: MAP_IMAGE_URL,
    created_at: new Date().toISOString()
  }
];

const INITIAL_LOCATIONS: MapLocation[] = [
  // =========================================================================
  // CDA LOCATIONS — EXACT COORDINATES FROM MAPA-CDA.VERCEL.APP
  // =========================================================================

  // 🏥 HOSPITAIS ILEGAIS (#e74c3c)
  {
    id: 'loc-cda-hosp-1',
    server_id: 'cda-server-001',
    name: 'Hospital Ilegal Sandy',
    category: 'Hospital Ilegal',
    description: 'Localização fixa do Hospital Ilegal em Sandy Shores.',
    x: 440,
    y: 450,
    icon: 'Cross',
    color: '#e74c3c',
    is_active: true,
    confirmations_count: 0
  },
  {
    id: 'loc-cda-hosp-2',
    server_id: 'cda-server-001',
    name: 'Hospital Ilegal Paleto',
    category: 'Hospital Ilegal',
    description: 'Localização fixa do Hospital Ilegal em Paleto Bay.',
    x: 421,
    y: 175,
    icon: 'Cross',
    color: '#e74c3c',
    is_active: true,
    confirmations_count: 0
  },
  {
    id: 'loc-cda-hosp-3',
    server_id: 'cda-server-001',
    name: 'Hospital Ilegal El Burro',
    category: 'Hospital Ilegal',
    description: 'Localização fixa do Hospital Ilegal em El Burro Heights / Cypress.',
    x: 656,
    y: 731,
    icon: 'Cross',
    color: '#e74c3c',
    is_active: true,
    confirmations_count: 0
  },
  {
    id: 'loc-cda-hosp-4',
    server_id: 'cda-server-001',
    name: 'Hospital Ilegal Porto',
    category: 'Hospital Ilegal',
    description: 'Localização fixa do Hospital Ilegal na zona portuária ao sul.',
    x: 556,
    y: 891,
    icon: 'Cross',
    color: '#e74c3c',
    is_active: true,
    confirmations_count: 0
  },

  // 🏪 MERCADO ILEGAL (#e74c3c)
  {
    id: 'loc-cda-merc-1',
    server_id: 'cda-server-001',
    name: 'Mercado Ilegal Mirror Park',
    category: 'Mercado Ilegal',
    description: 'Localização fixa do Mercado Ilegal no Mirror Park.',
    x: 648,
    y: 569,
    icon: 'ShoppingBag',
    color: '#e74c3c',
    is_active: true,
    confirmations_count: 0
  },

  // 🧼 LAVANDERIAS ILEGAIS (#9b59b6)
  {
    id: 'loc-cda-lav-1',
    server_id: 'cda-server-001',
    name: 'Lavanderia Ilegal Chumash',
    category: 'Lavanderia Ilegal',
    description: 'Localização fixa da Lavanderia Ilegal na costa oeste (Chumash).',
    x: 209,
    y: 616,
    icon: 'DollarSign',
    color: '#9b59b6',
    is_active: true,
    confirmations_count: 0
  },
  {
    id: 'loc-cda-lav-2',
    server_id: 'cda-server-001',
    name: 'Lavanderia Ilegal Paleto',
    category: 'Lavanderia Ilegal',
    description: 'Localização fixa da Lavanderia Ilegal em Paleto Bay.',
    x: 451,
    y: 159,
    icon: 'DollarSign',
    color: '#9b59b6',
    is_active: true,
    confirmations_count: 0
  },
  {
    id: 'loc-cda-lav-3',
    server_id: 'cda-server-001',
    name: 'Lavanderia Ilegal La Puerta',
    category: 'Lavanderia Ilegal',
    description: 'Localização fixa da Lavanderia Ilegal perto do canal de La Puerta.',
    x: 465,
    y: 803,
    icon: 'DollarSign',
    color: '#9b59b6',
    is_active: true,
    confirmations_count: 0
  },

  // 🔧 DESMANCHES (#f39c12)
  {
    id: 'loc-cda-desm-1',
    server_id: 'cda-server-001',
    name: 'Desmanche Del Perro',
    category: 'Desmanche',
    description: 'Localização fixa do Desmanche perto da Praia Del Perro.',
    x: 421,
    y: 812,
    icon: 'Wrench',
    color: '#f39c12',
    is_active: true,
    confirmations_count: 0
  },
  {
    id: 'loc-cda-desm-2',
    server_id: 'cda-server-001',
    name: 'Desmanche Porto',
    category: 'Desmanche',
    description: 'Localização fixa do Desmanche nos galpões do Porto.',
    x: 562,
    y: 881,
    icon: 'Wrench',
    color: '#f39c12',
    is_active: true,
    confirmations_count: 0
  },
  {
    id: 'loc-cda-desm-3',
    server_id: 'cda-server-001',
    name: 'Desmanche Alamo',
    category: 'Desmanche',
    description: 'Localização fixa do Desmanche perto do lago Alamo Sea.',
    x: 607,
    y: 365,
    icon: 'Wrench',
    color: '#f39c12',
    is_active: true,
    confirmations_count: 0
  },
  {
    id: 'loc-cda-desm-4',
    server_id: 'cda-server-001',
    name: 'Desmanche Grapeseed',
    category: 'Desmanche',
    description: 'Localização fixa do Desmanche na área rural de Grapeseed.',
    x: 631,
    y: 291,
    icon: 'Wrench',
    color: '#f39c12',
    is_active: true,
    confirmations_count: 0
  },
  {
    id: 'loc-cda-desm-5',
    server_id: 'cda-server-001',
    name: 'Desmanche Paleto',
    category: 'Desmanche',
    description: 'Localização fixa do Desmanche nos galpões de Paleto Bay.',
    x: 446,
    y: 156,
    icon: 'Wrench',
    color: '#f39c12',
    is_active: true,
    confirmations_count: 0
  },

  // 🚶 ANDARILHO — LOCAIS POSSÍVEIS (EXACT COORDINATES FROM SCRIPT.JS) (#3498db)
  {
    id: 'loc-cda-and-1',
    server_id: 'cda-server-001',
    name: 'Andarilho - Grapeseed Leste',
    category: 'Andarilho',
    description: 'Local possível do Andarilho em Grapeseed Leste.',
    x: 670,
    y: 300,
    icon: 'UserCheck',
    color: '#3498db',
    is_active: true,
    confirmations_count: 14
  },
  {
    id: 'loc-cda-and-2',
    server_id: 'cda-server-001',
    name: 'Andarilho - Grapeseed Centro',
    category: 'Andarilho',
    description: 'Local possível do Andarilho em Grapeseed.',
    x: 520,
    y: 340,
    icon: 'UserCheck',
    color: '#3498db',
    is_active: true,
    confirmations_count: 5
  },
  {
    id: 'loc-cda-and-3',
    server_id: 'cda-server-001',
    name: 'Andarilho - Grapeseed Norte',
    category: 'Andarilho',
    description: 'Local possível do Andarilho em Grapeseed Norte.',
    x: 593,
    y: 277,
    icon: 'UserCheck',
    color: '#3498db',
    is_active: true,
    confirmations_count: 2
  },
  {
    id: 'loc-cda-and-4',
    server_id: 'cda-server-001',
    name: 'Andarilho - Grapeseed',
    category: 'Andarilho',
    description: 'Local possível do Andarilho em Grapeseed.',
    x: 570,
    y: 320,
    icon: 'UserCheck',
    color: '#3498db',
    is_active: true,
    confirmations_count: 3
  },
  {
    id: 'loc-cda-and-5',
    server_id: 'cda-server-001',
    name: 'Andarilho - Bennys',
    category: 'Andarilho',
    description: 'Local possível do Andarilho perto da oficina Bennys.',
    x: 433,
    y: 786,
    icon: 'UserCheck',
    color: '#3498db',
    is_active: true,
    confirmations_count: 1
  },
  {
    id: 'loc-cda-and-6',
    server_id: 'cda-server-001',
    name: 'Andarilho - Porto Mecânica',
    category: 'Andarilho',
    description: 'Local possível do Andarilho perto da mecânica do Porto.',
    x: 483,
    y: 936,
    icon: 'UserCheck',
    color: '#3498db',
    is_active: true,
    confirmations_count: 0
  },
  {
    id: 'loc-cda-and-7',
    server_id: 'cda-server-001',
    name: 'Andarilho - Porto',
    category: 'Andarilho',
    description: 'Local possível do Andarilho nos galpões do Porto.',
    x: 456,
    y: 891,
    icon: 'UserCheck',
    color: '#3498db',
    is_active: true,
    confirmations_count: 0
  },
  {
    id: 'loc-cda-and-8',
    server_id: 'cda-server-001',
    name: 'Andarilho - Bennys Sul',
    category: 'Andarilho',
    description: 'Local possível do Andarilho em Bennys Sul.',
    x: 535,
    y: 813,
    icon: 'UserCheck',
    color: '#3498db',
    is_active: true,
    confirmations_count: 0
  },
  {
    id: 'loc-cda-and-9',
    server_id: 'cda-server-001',
    name: 'Andarilho - Praia',
    category: 'Andarilho',
    description: 'Local possível do Andarilho perto do calçadão da Praia.',
    x: 345,
    y: 756,
    icon: 'UserCheck',
    color: '#3498db',
    is_active: true,
    confirmations_count: 1
  },
  {
    id: 'loc-cda-and-10',
    server_id: 'cda-server-001',
    name: 'Andarilho - Praia (Construção)',
    category: 'Andarilho',
    description: 'Dentro de uma construção ao lado da lixeira (tem que pular o cercado de madeira).',
    x: 333,
    y: 762,
    icon: 'UserCheck',
    color: '#3498db',
    is_active: true,
    confirmations_count: 2
  },
  {
    id: 'loc-cda-and-11',
    server_id: 'cda-server-001',
    name: 'Andarilho - Praia Del Perro',
    category: 'Andarilho',
    description: 'Local possível do Andarilho em Del Perro.',
    x: 413,
    y: 812,
    icon: 'UserCheck',
    color: '#3498db',
    is_active: true,
    confirmations_count: 0
  },
  {
    id: 'loc-cda-and-12',
    server_id: 'cda-server-001',
    name: 'Andarilho - Paleto Galinheiro',
    category: 'Andarilho',
    description: 'Local possível do Andarilho perto do galinheiro em Paleto.',
    x: 448,
    y: 177,
    icon: 'UserCheck',
    color: '#3498db',
    is_active: true,
    confirmations_count: 4
  },
  {
    id: 'loc-cda-and-13',
    server_id: 'cda-server-001',
    name: 'Andarilho - Paleto Leste',
    category: 'Andarilho',
    description: 'Local possível do Andarilho em Paleto Leste.',
    x: 578,
    y: 164,
    icon: 'UserCheck',
    color: '#3498db',
    is_active: true,
    confirmations_count: 0
  },
  {
    id: 'loc-cda-and-14',
    server_id: 'cda-server-001',
    name: 'Andarilho - Paleto Centro',
    category: 'Andarilho',
    description: 'Local possível do Andarilho em Paleto Centro.',
    x: 440,
    y: 160,
    icon: 'UserCheck',
    color: '#3498db',
    is_active: true,
    confirmations_count: 1
  },
  {
    id: 'loc-cda-and-15',
    server_id: 'cda-server-001',
    name: 'Andarilho - Grapeseed Sul',
    category: 'Andarilho',
    description: 'Local possível do Andarilho em Grapeseed Sul.',
    x: 568,
    y: 321,
    icon: 'UserCheck',
    color: '#3498db',
    is_active: true,
    confirmations_count: 0
  },

  // ==========================================
  // VALLEY LOCATIONS (VALLEY RP)
  // ==========================================
  {
    id: 'loc-val-hosp-1',
    server_id: 'valley-server-002',
    name: 'Hospital Ilegal Paleto',
    category: 'Hospital Ilegal',
    description: 'Hospital Ilegal em Paleto Bay (Valley).',
    x: 421,
    y: 175,
    icon: 'Cross',
    color: '#e74c3c',
    is_active: true,
    confirmations_count: 0
  },
  {
    id: 'loc-val-merc-1',
    server_id: 'valley-server-002',
    name: 'Mercado Ilegal Mirror Park',
    category: 'Mercado Ilegal',
    description: 'Mercado Ilegal no Mirror Park (Valley).',
    x: 648,
    y: 569,
    icon: 'ShoppingBag',
    color: '#e74c3c',
    is_active: true,
    confirmations_count: 0
  },
  {
    id: 'loc-val-lav-1',
    server_id: 'valley-server-002',
    name: 'Lavanderia Ilegal Paleto',
    category: 'Lavanderia Ilegal',
    description: 'Lavanderia Ilegal em Paleto Bay (Valley).',
    x: 451,
    y: 159,
    icon: 'DollarSign',
    color: '#9b59b6',
    is_active: true,
    confirmations_count: 0
  },
  {
    id: 'loc-val-desm-1',
    server_id: 'valley-server-002',
    name: 'Desmanche Porto',
    category: 'Desmanche',
    description: 'Desmanche na área portuária (Valley).',
    x: 562,
    y: 881,
    icon: 'Wrench',
    color: '#f39c12',
    is_active: true,
    confirmations_count: 0
  },
  {
    id: 'loc-val-and-1',
    server_id: 'valley-server-002',
    name: 'Andarilho - Grapeseed',
    category: 'Andarilho',
    description: 'Ponto do Andarilho em Grapeseed (Valley).',
    x: 670,
    y: 300,
    icon: 'UserCheck',
    color: '#3498db',
    is_active: true,
    confirmations_count: 8
  },
  {
    id: 'loc-val-and-2',
    server_id: 'valley-server-002',
    name: 'Andarilho - Porto',
    category: 'Andarilho',
    description: 'Ponto do Andarilho no Porto (Valley).',
    x: 456,
    y: 891,
    icon: 'UserCheck',
    color: '#3498db',
    is_active: true,
    confirmations_count: 3
  }
];

const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'comm-1',
    server_id: 'cda-server-001',
    location_id: 'loc-cda-and-1',
    anonymous_user_id: 'anon_demo_1',
    nickname: 'FalcãoRP',
    content: 'Andarilho tá no Grapeseed Leste mesmo! Acabei de pegar o blueprint lá!',
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    location_name: 'Andarilho - Grapeseed Leste'
  },
  {
    id: 'comm-2',
    server_id: 'cda-server-001',
    location_id: 'loc-cda-hosp-1',
    anonymous_user_id: 'anon_demo_2',
    nickname: 'Dr_Zero',
    content: 'Médico tá de plantão agora de tarde em Sandy. Pode vir encostar.',
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    location_name: 'Hospital Ilegal Sandy'
  }
];

const INITIAL_SUGGESTIONS: Suggestion[] = [
  {
    id: 'sug-1',
    server_id: 'cda-server-001',
    location_id: null,
    anonymous_user_id: 'anon_demo_3',
    nickname: 'Peaky_Blinder',
    type: 'Novo NPC',
    content: 'Adicionar a localização do novo Comprador de Jóias perto do banco de Alta Street.',
    status: 'Em análise',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  }
];

// Helper for local storage persistence
function getStoredData<T>(key: string, initial: T): T {
  try {
    const item = localStorage.getItem(`cidade_alta_${key}`);
    return item ? JSON.parse(item) : initial;
  } catch (e) {
    return initial;
  }
}

function setStoredData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`cidade_alta_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error('LocalStorage write failed:', e);
  }
}

// FORCE RE-SEED WITH OPTIMIZED 2.1MB WEBP IMAGE
setStoredData('servers', INITIAL_SERVERS);
setStoredData('locations', INITIAL_LOCATIONS);

if (!localStorage.getItem('cidade_alta_confirmations')) {
  setStoredData('confirmations', [
    { location_id: 'loc-cda-and-1', anonymous_user_id: 'anon_demo_initial' }
  ]);
}
if (!localStorage.getItem('cidade_alta_comments')) {
  setStoredData('comments', INITIAL_COMMENTS);
}
if (!localStorage.getItem('cidade_alta_suggestions')) {
  setStoredData('suggestions', INITIAL_SUGGESTIONS);
}

export const ApiService = {
  // SERVERS
  async getServers(): Promise<Server[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('servers').select('*').eq('active', true);
      if (!error && data && data.length > 0) return data as Server[];
    }
    return getStoredData<Server[]>('servers', INITIAL_SERVERS);
  },

  async saveServer(server: Partial<Server>): Promise<Server> {
    if (isSupabaseConfigured && supabase) {
      if (server.id) {
        const { data } = await supabase.from('servers').update(server).eq('id', server.id).select().single();
        if (data) return data as Server;
      } else {
        const { data } = await supabase.from('servers').insert(server).select().single();
        if (data) return data as Server;
      }
    }
    const servers = getStoredData<Server[]>('servers', INITIAL_SERVERS);
    if (server.id) {
      const idx = servers.findIndex(s => s.id === server.id);
      if (idx !== -1) {
        servers[idx] = { ...servers[idx], ...server };
        setStoredData('servers', servers);
        return servers[idx];
      }
    }
    const newServer: Server = {
      id: `server-${Date.now()}`,
      name: server.name || 'Novo Servidor',
      slug: (server.slug || 'novo') as ServerSlug,
      active: true,
      map_image_url: server.map_image_url || MAP_IMAGE_URL,
      created_at: new Date().toISOString()
    };
    servers.push(newServer);
    setStoredData('servers', servers);
    return newServer;
  },

  // LOCATIONS
  async getLocations(serverId: string): Promise<MapLocation[]> {
    const anonId = getAnonymousUserId();

    if (isSupabaseConfigured && supabase) {
      const { data: locations, error } = await supabase
        .from('map_locations')
        .select('*')
        .eq('server_id', serverId)
        .eq('is_active', true);

      if (!error && locations) {
        // Fetch confirmations
        const { data: confirmations } = await supabase.from('wanderer_confirmations').select('location_id, anonymous_user_id');
        
        const counts: Record<string, number> = {};
        const userHasConfirmed: Record<string, boolean> = {};

        (confirmations || []).forEach(c => {
          counts[c.location_id] = (counts[c.location_id] || 0) + 1;
          if (c.anonymous_user_id === anonId) {
            userHasConfirmed[c.location_id] = true;
          }
        });

        return locations.map(loc => ({
          ...loc,
          confirmations_count: counts[loc.id] || 0,
          user_has_confirmed: Boolean(userHasConfirmed[loc.id])
        })) as MapLocation[];
      }
    }

    // LocalStorage Fallback
    const allLocs = getStoredData<MapLocation[]>('locations', INITIAL_LOCATIONS);
    const confirmations = getStoredData<{ location_id: string; anonymous_user_id: string }[]>('confirmations', []);

    return allLocs
      .filter(l => l.server_id === serverId && l.is_active)
      .map(loc => {
        const locConfs = confirmations.filter(c => c.location_id === loc.id);
        const userConfirmed = locConfs.some(c => c.anonymous_user_id === anonId);
        return {
          ...loc,
          confirmations_count: loc.confirmations_count !== undefined ? (loc.confirmations_count + locConfs.length) : locConfs.length,
          user_has_confirmed: userConfirmed
        };
      });
  },

  async saveLocation(location: Partial<MapLocation>): Promise<MapLocation> {
    if (isSupabaseConfigured && supabase) {
      if (location.id) {
        const { data } = await supabase.from('map_locations').update(location).eq('id', location.id).select().single();
        if (data) return data as MapLocation;
      } else {
        const { data } = await supabase.from('map_locations').insert(location).select().single();
        if (data) return data as MapLocation;
      }
    }

    const locations = getStoredData<MapLocation[]>('locations', INITIAL_LOCATIONS);
    if (location.id) {
      const idx = locations.findIndex(l => l.id === location.id);
      if (idx !== -1) {
        locations[idx] = { ...locations[idx], ...location, updated_at: new Date().toISOString() };
        setStoredData('locations', locations);
        return locations[idx];
      }
    }

    const newLoc: MapLocation = {
      id: `loc-${Date.now()}`,
      server_id: location.server_id || 'cda-server-001',
      name: location.name || 'Novo Ponto',
      category: location.category || 'Outros',
      description: location.description || '',
      x: location.x || 500,
      y: location.y || 500,
      icon: location.icon || 'MapPin',
      color: location.color || '#f43f5e',
      image_url: location.image_url || '',
      is_active: true,
      confirmations_count: 0,
      user_has_confirmed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    locations.push(newLoc);
    setStoredData('locations', locations);
    return newLoc;
  },

  async deleteLocation(locationId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('map_locations').delete().eq('id', locationId);
    }
    const locations = getStoredData<MapLocation[]>('locations', INITIAL_LOCATIONS);
    const updated = locations.filter(l => l.id !== locationId);
    setStoredData('locations', updated);
    return true;
  },

  // WANDERER CONFIRMATIONS
  async toggleWandererConfirmation(locationId: string): Promise<{ confirmed: boolean; count: number }> {
    const anonId = getAnonymousUserId();

    if (isSupabaseConfigured && supabase) {
      // Check existing
      const { data: existing } = await supabase
        .from('wanderer_confirmations')
        .select('id')
        .eq('location_id', locationId)
        .eq('anonymous_user_id', anonId)
        .maybeSingle();

      if (existing) {
        await supabase.from('wanderer_confirmations').delete().eq('id', existing.id);
      } else {
        await supabase.from('wanderer_confirmations').insert({
          location_id: locationId,
          anonymous_user_id: anonId
        });
      }

      const { count } = await supabase
        .from('wanderer_confirmations')
        .select('*', { count: 'exact', head: true })
        .eq('location_id', locationId);

      return { confirmed: !existing, count: count || 0 };
    }

    // LocalStorage
    const confirmations = getStoredData<{ location_id: string; anonymous_user_id: string }[]>('confirmations', []);
    const idx = confirmations.findIndex(c => c.location_id === locationId && c.anonymous_user_id === anonId);

    let confirmed = false;
    if (idx !== -1) {
      confirmations.splice(idx, 1);
      confirmed = false;
    } else {
      confirmations.push({ location_id: locationId, anonymous_user_id: anonId });
      confirmed = true;
    }
    setStoredData('confirmations', confirmations);

    const count = confirmations.filter(c => c.location_id === locationId).length;
    return { confirmed, count };
  },

  // COMMENTS
  async getComments(serverId: string, locationId?: string | null): Promise<Comment[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('comments').select('*, map_locations(name)').eq('server_id', serverId).order('created_at', { ascending: false });
      if (locationId) {
        query = query.eq('location_id', locationId);
      }
      const { data } = await query;
      if (data) {
        return data.map((c: any) => ({
          ...c,
          location_name: c.map_locations?.name || undefined
        }));
      }
    }

    const comments = getStoredData<Comment[]>('comments', INITIAL_COMMENTS);
    return comments
      .filter(c => c.server_id === serverId && (!locationId || c.location_id === locationId))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async addComment(comment: { server_id: string; location_id?: string | null; nickname: string; content: string }): Promise<Comment> {
    const anonId = getAnonymousUserId();

    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('comments').insert({
        server_id: comment.server_id,
        location_id: comment.location_id || null,
        anonymous_user_id: anonId,
        nickname: comment.nickname,
        content: comment.content
      }).select().single();
      if (data) return data as Comment;
    }

    const comments = getStoredData<Comment[]>('comments', INITIAL_COMMENTS);
    const locations = getStoredData<MapLocation[]>('locations', INITIAL_LOCATIONS);
    const loc = comment.location_id ? locations.find(l => l.id === comment.location_id) : null;

    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      server_id: comment.server_id,
      location_id: comment.location_id || null,
      anonymous_user_id: anonId,
      nickname: comment.nickname,
      content: comment.content,
      created_at: new Date().toISOString(),
      location_name: loc?.name
    };
    comments.unshift(newComment);
    setStoredData('comments', comments);
    return newComment;
  },

  async deleteComment(commentId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('comments').delete().eq('id', commentId);
    }
    const comments = getStoredData<Comment[]>('comments', INITIAL_COMMENTS);
    const updated = comments.filter(c => c.id !== commentId);
    setStoredData('comments', updated);
    return true;
  },

  // SUGGESTIONS
  async getSuggestions(serverId?: string): Promise<Suggestion[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('suggestions').select('*').order('created_at', { ascending: false });
      if (serverId) query = query.eq('server_id', serverId);
      const { data } = await query;
      if (data) return data as Suggestion[];
    }

    const suggestions = getStoredData<Suggestion[]>('suggestions', INITIAL_SUGGESTIONS);
    if (serverId) return suggestions.filter(s => s.server_id === serverId);
    return suggestions;
  },

  async addSuggestion(suggestion: { server_id: string; location_id?: string | null; nickname: string; type: any; content: string }): Promise<Suggestion> {
    const anonId = getAnonymousUserId();

    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('suggestions').insert({
        server_id: suggestion.server_id,
        location_id: suggestion.location_id || null,
        anonymous_user_id: anonId,
        nickname: suggestion.nickname,
        type: suggestion.type,
        content: suggestion.content,
        status: 'Nova'
      }).select().single();
      if (data) return data as Suggestion;
    }

    const suggestions = getStoredData<Suggestion[]>('suggestions', INITIAL_SUGGESTIONS);
    const newSug: Suggestion = {
      id: `sug-${Date.now()}`,
      server_id: suggestion.server_id,
      location_id: suggestion.location_id || null,
      anonymous_user_id: anonId,
      nickname: suggestion.nickname,
      type: suggestion.type,
      content: suggestion.content,
      status: 'Nova',
      created_at: new Date().toISOString()
    };
    suggestions.unshift(newSug);
    setStoredData('suggestions', suggestions);
    return newSug;
  },

  async updateSuggestionStatus(suggestionId: string, status: SuggestionStatus): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('suggestions').update({ status }).eq('id', suggestionId);
    }
    const suggestions = getStoredData<Suggestion[]>('suggestions', INITIAL_SUGGESTIONS);
    const idx = suggestions.findIndex(s => s.id === suggestionId);
    if (idx !== -1) {
      suggestions[idx].status = status;
      setStoredData('suggestions', suggestions);
    }
    return true;
  }
};
