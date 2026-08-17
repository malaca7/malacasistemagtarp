export type PlatformModule = 
  | 'home'
  | 'map' 
  | 'caixinha' 
  | 'hacking' 
  | 'lockpick' 
  | 'calculator' 
  | 'tables';

export type ServerSlug = 'cda' | 'valley';

export interface Server {
  id: string;
  name: string;
  slug: ServerSlug;
  active: boolean;
  map_image_url: string;
  created_at?: string;
}

export type LocationCategory = 
  | 'Hospital Ilegal'
  | 'Mercado Ilegal'
  | 'Lavanderia Ilegal'
  | 'Desmanche'
  | 'Andarilho'
  | 'Local Possível'
  | 'Outros';

export interface MapLocation {
  id: string;
  server_id: string;
  name: string;
  category: LocationCategory;
  description: string;
  x: number; // 0 - 1000 relative coordinate
  y: number; // 0 - 1000 relative coordinate
  icon: string;
  color: string;
  image_url?: string;
  is_active: boolean;
  confirmations_count?: number;
  user_has_confirmed?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WandererConfirmation {
  id: string;
  location_id: string;
  anonymous_user_id: string;
  created_at: string;
}

export interface WandererCycle {
  id: string;
  server_id: string;
  started_at: string;
  ends_at: string;
  status: 'ACTIVE' | 'EXPIRED';
}

export interface Comment {
  id: string;
  server_id: string;
  location_id?: string | null;
  anonymous_user_id: string;
  nickname: string;
  content: string;
  created_at: string;
  location_name?: string;
}

export type SuggestionType = 
  | 'Novo NPC'
  | 'Novo local'
  | 'Correção de localização'
  | 'Alteração de informação'
  | 'Nova funcionalidade'
  | 'Outro';

export type SuggestionStatus = 
  | 'Nova'
  | 'Em análise'
  | 'Aceita'
  | 'Recusada'
  | 'Implementada';

export interface Suggestion {
  id: string;
  server_id: string;
  location_id?: string | null;
  anonymous_user_id: string;
  nickname: string;
  type: SuggestionType;
  content: string;
  status: SuggestionStatus;
  created_at: string;
  updated_at?: string;
}

export interface CategoryFilter {
  category: LocationCategory;
  label: string;
  icon: string;
  color: string;
  enabled: boolean;
}
