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

export interface ConfirmedUser {
  user_id?: string;
  discord_id?: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  character_name?: string;
  instagram?: string;
  twitch?: string;
  youtube?: string;
  twitter_x?: string;
  confirmed_at: string;
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
  last_confirmed_by?: string;
  last_confirmed_at?: string;
  confirmed_users?: ConfirmedUser[];
}

export interface WandererConfirmation {
  id: string;
  location_id: string;
  anonymous_user_id: string;
  created_at?: string;
  user_id?: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  character_name?: string;
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
  admin_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile {
  id: string;
  discord_id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  email?: string;
  is_admin?: boolean;
  role?: 'admin' | 'moderator' | 'user' | 'vip';
  is_banned?: boolean;
  created_at?: string;
  last_login_at?: string;
  character_name?: string;
  instagram?: string;
  twitch?: string;
  youtube?: string;
  twitter_x?: string;
  custom_bio?: string;
}

export interface PlatformSettings {
  maintenance_mode: boolean;
  maintenance_message: string;
  global_announcement: string;
  announcement_active: boolean;
  announcement_type?: 'info' | 'warning' | 'alert' | 'success';
  disabled_systems: string[];
  require_auth_for_interactive_map?: boolean;
}

