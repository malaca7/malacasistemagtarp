import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  discord_id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  email?: string;
  is_admin?: boolean;
  role?: 'admin' | 'user';
  created_at: string;
  last_login_at: string;
  access_count?: number;
}

const DEFAULT_ADMIN_EMAILS = [
  'rogeriomalaquiasjr@gmail.com',
  'rogeriosantanajr@gmail.com',
];

const DEFAULT_ADMIN_USERNAMES = [
  'malaca',
  'malaquias',
  'malaca7',
];

export const DEFAULT_ADMIN_DISCORD_IDS = [
  '722320491767136346', // Administrador Solicitado
  '917826984778797087', // malaca7
];

export const checkAdminPermission = (userOrProfile: any): boolean => {
  if (!userOrProfile) return false;

  // Extrair ID do Discord garantindo tipagem consistente
  const discordId = String(
    userOrProfile.discord_id ||
    userOrProfile.id ||
    userOrProfile.user_metadata?.provider_id ||
    userOrProfile.user_metadata?.sub ||
    ''
  ).trim();

  // Apenas IDs oficiais e explicitamente designados possuem privilégio administrativo
  if (discordId && DEFAULT_ADMIN_DISCORD_IDS.includes(discordId)) {
    return true;
  }

  // Lista personalizada configurada pelo administrador no painel
  try {
    const customAdminsRaw = localStorage.getItem('malaca_admin_discord_accounts');
    if (customAdminsRaw) {
      const customAdmins: string[] = JSON.parse(customAdminsRaw);
      if (discordId && customAdmins.includes(discordId)) {
        return true;
      }
    }
  } catch (e) {}

  // Todos os novos usuários cadastrados são comuns por padrão
  return false;
};

export const AuthService = {
  // Initiates Discord OAuth2 Login (No password/email)
  loginWithDiscord: async () => {
    try {
      const redirectUrl = window.location.origin + window.location.pathname;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: redirectUrl,
          scopes: 'identify email',
        },
      });
      if (error) {
        console.error('Erro ao iniciar login via Discord:', error.message);
        throw error;
      }
      return data;
    } catch (err: any) {
      console.error('Discord Auth Error:', err);
      alert('Falha ao autenticar com Discord: ' + (err.message || 'Verifique sua conexão e tente novamente.'));
      throw err;
    }
  },

  // Syncs Discord User metadata to database on login & logs access
  syncDiscordUser: async (): Promise<UserProfile | null> => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.warn('Supabase getSession error:', sessionError);
      }

      if (!session || !session.user) {
        const stored = localStorage.getItem('malaca_user_profile');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            // If stored profile was a mock user, invalidate it
            if (parsed.id && String(parsed.id).startsWith('mock-')) {
              localStorage.removeItem('malaca_user_profile');
              return null;
            }
            if (parsed.id && parsed.discord_id) {
              return parsed;
            }
          } catch (e) {}
        }
        return null;
      }

      const user = session.user;
      const metadata = user.user_metadata || {};
      const discordId = metadata.provider_id || metadata.sub || user.id;
      const username = metadata.preferred_username || metadata.user_name || metadata.name || metadata.full_name || 'Discord User';
      const fullName = metadata.full_name || metadata.global_name || metadata.name || username;
      const avatarUrl = metadata.avatar_url || metadata.picture || 'https://cdn.discordapp.com/embed/avatars/0.png';
      const email = user.email || metadata.email || '';
      const isAdmin = checkAdminPermission(user);
      const now = new Date().toISOString();

      const profileData = {
        id: user.id,
        discord_id: String(discordId),
        username: String(username),
        full_name: String(fullName),
        avatar_url: String(avatarUrl),
        email: email || undefined,
        is_admin: isAdmin,
        role: isAdmin ? ('admin' as const) : ('user' as const),
        last_login_at: now,
      };

      // Safely upsert into Supabase profiles table
      try {
        await supabase
          .from('profiles')
          .upsert([profileData], { onConflict: 'id' });
      } catch (err) {
        console.warn('Supabase profiles upsert warning (table may need schema setup):', err);
      }

      // Check sessions count in access_logs
      let accessCount = 1;
      try {
        const { count } = await supabase
          .from('access_logs')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);
        if (count !== null && count !== undefined) {
          accessCount = Math.max(1, count);
        }
      } catch (e) {}

      const finalProfile: UserProfile = {
        id: user.id,
        discord_id: String(discordId),
        username: String(username),
        full_name: String(fullName),
        avatar_url: String(avatarUrl),
        email,
        is_admin: isAdmin,
        role: isAdmin ? 'admin' : 'user',
        created_at: user.created_at || now,
        last_login_at: now,
        access_count: accessCount,
      };

      localStorage.setItem('malaca_user_profile', JSON.stringify(finalProfile));

      // Clean OAuth URL hash or search params for clean browser address bar
      if (typeof window !== 'undefined') {
        if (window.location.hash.includes('access_token=') || window.location.search.includes('code=')) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      }

      return finalProfile;
    } catch (e) {
      console.error('Error syncing user:', e);
      const stored = localStorage.getItem('malaca_user_profile');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.id && !String(parsed.id).startsWith('mock-')) return parsed;
        } catch (err) {}
      }
      return null;
    }
  },

  // Record a dedicated login event into access_logs
  logAccessSession: async (userId: string, discordId: string, username: string) => {
    try {
      await supabase.from('access_logs').insert([
        {
          user_id: userId,
          discord_id: String(discordId),
          username: String(username),
          user_agent: navigator.userAgent,
          logged_at: new Date().toISOString(),
        },
      ]);
    } catch (e) {
      console.warn('access_logs insertion warning:', e);
    }
  },

  // Logout
  logout: async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('SignOut error:', e);
    }
    localStorage.removeItem('malaca_user_profile');
    window.location.reload();
  },

  // Gets profile from storage
  getSavedProfile: (): UserProfile | null => {
    try {
      const stored = localStorage.getItem('malaca_user_profile');
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      if (parsed.id && String(parsed.id).startsWith('mock-')) {
        localStorage.removeItem('malaca_user_profile');
        return null;
      }
      return parsed;
    } catch (e) {
      return null;
    }
  },
};
