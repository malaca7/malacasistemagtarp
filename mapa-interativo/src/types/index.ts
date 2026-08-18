export type LocationCategory =
  | 'hospital_ilegal'
  | 'mercado_ilegal'
  | 'lavanderia_ilegal'
  | 'desmanche'
  | 'andarilho'
  | 'local_possivel'
  | 'outros';

export type SuggestionType =
  | 'novo_npc'
  | 'novo_local'
  | 'correcao_localizacao'
  | 'alteracao_informacao'
  | 'nova_funcionalidade'
  | 'outro';

export type SuggestionStatus =
  | 'nova'
  | 'em_analise'
  | 'aceita'
  | 'recusada'
  | 'implementada';

export interface Server {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  map_image_url: string;
  subtitle?: string;
  description?: string;
  banner_image_url?: string;
  created_at?: string;
}

export interface System {
  id: string;
  name: string;
  slug: string;
  tag: string;
  description: string;
  icon: string;
  image_url: string;
  link: string;
  city_ids: string[];
  is_active: boolean;
  created_at?: string;
}

export interface MapLocation {
  id: string;
  server_id: string;
  name: string;
  category: LocationCategory;
  description?: string;
  x: number;
  y: number;
  icon?: string;
  color?: string;
  image_url?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  confirmations_count?: number;
  user_confirmed?: boolean;
}

export interface WandererConfirmation {
  id: string;
  location_id: string;
  anonymous_user_id: string;
  created_at?: string;
}

export interface WandererCycle {
  id: string;
  server_id: string;
  started_at: string;
  ends_at: string;
  status: string;
}

export interface Comment {
  id: string;
  server_id: string;
  location_id?: string;
  anonymous_user_id: string;
  nickname: string;
  content: string;
  created_at?: string;
}

export interface Suggestion {
  id: string;
  server_id: string;
  location_id?: string;
  anonymous_user_id: string;
  nickname: string;
  type: SuggestionType;
  content: string;
  status: SuggestionStatus;
  created_at?: string;
  updated_at?: string;
}
