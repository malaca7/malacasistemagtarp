import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  discord_id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  email?: string;
  character_name?: string;
  instagram?: string;
  twitch?: string;
  youtube?: string;
  twitter_x?: string;
  custom_bio?: string;
  is_admin?: boolean;
  role?: 'admin' | 'user';
  is_banned?: boolean;
  created_at: string;
  last_login_at: string;
  access_count?: number;
}

export const DEFAULT_ADMIN_DISCORD_IDS = [
  '722320491767136346', // Fundador & Administrador Principal Inato (MALACA7X)
];

export const extractDiscordId = (u: any): string => {
  if (!u) return '';
  // 1. Direct discord_id property (UserProfile object)
  if (u.discord_id && typeof u.discord_id === 'string' && u.discord_id.trim()) {
    return u.discord_id.trim();
  }
  // 2. Supabase identities array (most reliable in Supabase Auth!)
  if (Array.isArray(u.identities) && u.identities.length > 0) {
    const discordIdentity = u.identities.find((i: any) => i.provider === 'discord') || u.identities[0];
    if (discordIdentity?.id) return String(discordIdentity.id).trim();
    if (discordIdentity?.identity_data?.provider_id) return String(discordIdentity.identity_data.provider_id).trim();
    if (discordIdentity?.identity_data?.sub) return String(discordIdentity.identity_data.sub).trim();
  }
  // 3. User metadata fields
  const meta = u.user_metadata || u.raw_user_meta_data || {};
  if (meta.provider_id) return String(meta.provider_id).trim();
  if (meta.sub && !String(meta.sub).includes('-')) return String(meta.sub).trim();
  if (meta.id && !String(meta.id).includes('-')) return String(meta.id).trim();

  // 4. If u.id itself is a numeric Discord snowflake (15-22 digits, not a UUID)
  if (u.id && typeof u.id === 'string' && /^\d{15,22}$/.test(u.id.trim())) {
    return u.id.trim();
  }
  // 5. If u.sub is numeric Discord snowflake
  if (u.sub && typeof u.sub === 'string' && /^\d{15,22}$/.test(u.sub.trim())) {
    return u.sub.trim();
  }

  return '';
};

export const checkAdminPermission = (userOrProfile: any): boolean => {
  if (!userOrProfile) return false;

  const discordId = extractDiscordId(userOrProfile);

  // 1. Fundador oficial principal inato (nunca perde permissão)
  if (discordId && DEFAULT_ADMIN_DISCORD_IDS.includes(discordId)) {
    return true;
  }

  // Se o usuário estiver banido, perde qualquer privilégio administrativo
  if (userOrProfile.is_banned === true || userOrProfile.role === 'banned') {
    return false;
  }

  // 2. Cargo explícito vindo do banco de dados (promovido por outro administrador)
  if (userOrProfile.is_admin === true || userOrProfile.role === 'admin') {
    return true;
  }

  // 3. Lista personalizada de Discord IDs configurada pelo administrador no painel
  try {
    const customAdminsRaw = localStorage.getItem('malaca_admin_discord_accounts');
    if (customAdminsRaw) {
      const customAdmins: string[] = JSON.parse(customAdminsRaw);
      if (discordId && customAdmins.includes(discordId)) {
        return true;
      }
    }
  } catch (e) {}

  return false;
};

export const AuthService = {
  // Initiates Discord OAuth2 Login (No password/email)
  loginWithDiscord: async () => {
    try {
      let origin = window.location.origin;
      if (window.location.hostname.includes('cda.malaca.com.br') || window.location.hostname.includes('malaca.com.br')) {
        origin = 'https://cda.malaca.com.br';
      }
      const redirectUrl = origin + window.location.pathname;
      sessionStorage.setItem('malaca_explicit_login_attempt', Date.now().toString());
      localStorage.setItem('malaca_explicit_login_attempt', Date.now().toString());
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
        return AuthService.getSavedProfile();
      }

      const user = session.user;
      const metadata = user.user_metadata || {};
      const discordId = extractDiscordId(user) || metadata.provider_id || metadata.sub || user.id;
      const username = metadata.preferred_username || metadata.user_name || metadata.name || metadata.full_name || 'Discord User';
      const fullName = metadata.full_name || metadata.global_name || metadata.name || username;
      const avatarUrl = metadata.avatar_url || metadata.picture || 'https://cdn.discordapp.com/embed/avatars/0.png';
      const email = user.email || metadata.email || '';
      // Resgatar dados existentes no Supabase (incluindo is_admin, role e is_banned para checar permissões)
      let existingProfile: any = null;
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        if (data) existingProfile = data;
      } catch (err) {}

      // Se a conta constava como excluída, verifica se o usuário está logando/cadastrando ativamente
      let customDeleted: string[] = [];
      try {
        customDeleted = JSON.parse(localStorage.getItem('malaca_deleted_discord_accounts') || '[]');
      } catch (e) {}

      try {
        const { data: ps } = await supabase
          .from('platform_settings')
          .select('disabled_systems')
          .eq('id', 'deleted_accounts')
          .maybeSingle();
        if (ps && Array.isArray(ps.disabled_systems)) {
          ps.disabled_systems.forEach(d => {
            const clean = String(d || '').trim();
            if (clean && !customDeleted.includes(clean)) customDeleted.push(clean);
          });
          localStorage.setItem('malaca_deleted_discord_accounts', JSON.stringify(customDeleted));
        }
      } catch (e) {}

      const isDeletedTombstone = customDeleted.includes(String(discordId)) || customDeleted.includes(String(user.id));
      const hasOAuthParams = typeof window !== 'undefined' && (
        window.location.hash.includes('access_token=') ||
        window.location.search.includes('code=') ||
        Boolean(sessionStorage.getItem('malaca_explicit_login_attempt')) ||
        Boolean(localStorage.getItem('malaca_explicit_login_attempt'))
      );

      if (isDeletedTombstone) {
        if (hasOAuthParams) {
          // O usuário optou deliberadamente por CADASTRAR/LOGAR novamente com a conta Discord:
          // Permite novo cadastro 100% LIMPO e isolado, SEM ligação aos dados ou privilégios da conta excluída
          customDeleted = customDeleted.filter(d => d !== String(discordId) && d !== String(user.id));
          localStorage.setItem('malaca_deleted_discord_accounts', JSON.stringify(customDeleted));
          try {
            await supabase.from('platform_settings').upsert({
              id: 'deleted_accounts',
              disabled_systems: customDeleted,
              updated_at: new Date().toISOString()
            }, { onConflict: 'id' });
          } catch (e) {}

          sessionStorage.removeItem('malaca_explicit_login_attempt');
          localStorage.removeItem('malaca_explicit_login_attempt');
          sessionStorage.removeItem('malaca_admin_master_session');
          localStorage.removeItem('malaca_admin_master_session');
          localStorage.removeItem('malaca_user_profile');

          // Limpa permissões antigas do cache
          try {
            let customAdmins = JSON.parse(localStorage.getItem('malaca_admin_discord_accounts') || '[]');
            customAdmins = customAdmins.filter((d: string) => d !== String(discordId) && d !== String(user.id));
            localStorage.setItem('malaca_admin_discord_accounts', JSON.stringify(customAdmins));
          } catch (e) {}

          // Sem qualquer ligação aos dados antigos da conta excluída
          existingProfile = null;
        } else {
          // Sessão residual antiga de antes da exclusão sem login ativo:
          // Desconecta a sessão residual silenciosamente sem recriar nada no banco
          localStorage.removeItem('malaca_user_profile');
          localStorage.removeItem('malaca_admin_master_session');
          sessionStorage.removeItem('malaca_admin_master_session');
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const k = localStorage.key(i);
            if (k && (k.startsWith('sb-') || k.includes('auth-token'))) {
              localStorage.removeItem(k);
            }
          }
          for (let i = sessionStorage.length - 1; i >= 0; i--) {
            const k = sessionStorage.key(i);
            if (k && (k.startsWith('sb-') || k.includes('auth-token'))) {
              sessionStorage.removeItem(k);
            }
          }
          try { await supabase.auth.signOut({ scope: 'global' }); } catch (e) {}
          window.dispatchEvent(new Event('auth_state_changed'));
          return null;
        }
      }

      // Regra de Permissões Estrita:
      // 1. Superadmin inato oficial: Apenas o Fundador (722320491767136346)
      // 2. Banimento: Contas banidas perdem qualquer privilégio de administrador e são bloqueadas
      // 3. Usuários promovidos por outro administrador no banco de dados
      // 4. Todo novo cadastro é estritamente usuário comum (is_admin = false, role = 'user')
      const isOfficialFounder = DEFAULT_ADMIN_DISCORD_IDS.includes(String(discordId)) || DEFAULT_ADMIN_DISCORD_IDS.includes(String(user.id));
      let customBanned: string[] = [];
      try {
        customBanned = JSON.parse(localStorage.getItem('malaca_banned_discord_accounts') || '[]');
      } catch (e) {}

      let customAdmins: string[] = [];
      try {
        customAdmins = JSON.parse(localStorage.getItem('malaca_admin_discord_accounts') || '[]');
      } catch (e) {}
      const isCustomAdmin = customAdmins.includes(String(discordId)) || customAdmins.includes(String(user.id));

      const isBanned = Boolean(!isOfficialFounder && (existingProfile?.is_banned === true || existingProfile?.role === 'banned' || customBanned.includes(String(discordId))));
      const isPromotedAdmin = Boolean(!isBanned && (existingProfile?.is_admin === true || existingProfile?.role === 'admin'));
      const isAdmin = isOfficialFounder || isPromotedAdmin || isCustomAdmin;
      const userRole = isBanned ? ('user' as const) : (isAdmin ? ('admin' as const) : ('user' as const));
      const now = new Date().toISOString();

      // Se existir cache local, usar como fallback secundário
      const localCached = AuthService.getSavedProfile();

      const characterName = existingProfile?.character_name || localCached?.character_name || '';
      const instagram = existingProfile?.instagram || localCached?.instagram || '';
      const twitch = existingProfile?.twitch || localCached?.twitch || '';
      const youtube = existingProfile?.youtube || localCached?.youtube || '';
      const twitterX = existingProfile?.twitter_x || localCached?.twitter_x || '';
      const customBio = existingProfile?.custom_bio || localCached?.custom_bio || '';

      // Base guaranteed schema columns (compatibilidade 100% com PostgREST)
      const cleanDbProfile: any = {
        id: user.id,
        discord_id: String(discordId),
        username: String(username),
        full_name: String(fullName),
        avatar_url: String(avatarUrl),
        email: email || undefined,
        is_admin: isAdmin,
        role: isBanned ? 'banned' : userRole,
        last_login_at: now,
      };

      // Safely upsert into Supabase profiles table
      try {
        const { error: upsertErr } = await supabase
          .from('profiles')
          .upsert([cleanDbProfile], { onConflict: 'id' });
        
        if (upsertErr) {
          console.warn('Supabase profiles clean upsert note:', upsertErr);
        } else {
          // Tentar salvar campos adicionais caso as colunas existam no schema cache
          const extraFields: any = {};
          if (characterName) extraFields.character_name = characterName;
          if (instagram) extraFields.instagram = instagram;
          if (twitch) extraFields.twitch = twitch;
          if (youtube) extraFields.youtube = youtube;
          if (twitterX) extraFields.twitter_x = twitterX;
          if (customBio) extraFields.custom_bio = customBio;
          if (isBanned) extraFields.is_banned = isBanned;

          if (Object.keys(extraFields).length > 0) {
            try {
              await supabase.from('profiles').update(extraFields).eq('id', user.id);
            } catch (e) {}
          }
        }
      } catch (err) {
        console.warn('Supabase profiles upsert exception:', err);
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
        character_name: characterName,
        instagram,
        twitch,
        youtube,
        twitter_x: twitterX,
        custom_bio: customBio,
        is_admin: isAdmin,
        role: userRole,
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
      // Guarantee correct permission status
      const discordId = extractDiscordId(parsed);
      const isOfficialFounder = Boolean(discordId && DEFAULT_ADMIN_DISCORD_IDS.includes(discordId));
      let customBanned: string[] = [];
      try {
        customBanned = JSON.parse(localStorage.getItem('malaca_banned_discord_accounts') || '[]');
      } catch (e) {}

      if (!isOfficialFounder && (parsed.is_banned === true || customBanned.includes(discordId))) {
        parsed.is_banned = true;
        parsed.is_admin = false;
        parsed.role = 'user';
        return parsed;
      }

      if (isOfficialFounder) {
        if (!parsed.is_admin || parsed.role !== 'admin') {
          parsed.is_admin = true;
          parsed.role = 'admin';
          localStorage.setItem('malaca_user_profile', JSON.stringify(parsed));
        }
      } else {
        const isAdmin = checkAdminPermission(parsed);
        if (parsed.is_admin !== isAdmin) {
          parsed.is_admin = isAdmin;
          parsed.role = isAdmin ? 'admin' : 'user';
          localStorage.setItem('malaca_user_profile', JSON.stringify(parsed));
        }
      }
      return parsed;
    } catch (e) {
      return null;
    }
  },

  // Update Profile fields (character_name, redes sociais, bio)
  updateProfile: async (updates: Partial<UserProfile>): Promise<UserProfile | null> => {
    try {
      const current = AuthService.getSavedProfile();
      if (!current) return null;

      const updated: UserProfile = {
        ...current,
        ...updates,
      };

      localStorage.setItem('malaca_user_profile', JSON.stringify(updated));

      try {
        await supabase
          .from('profiles')
          .update({
            character_name: updated.character_name || '',
            instagram: updated.instagram || '',
            twitch: updated.twitch || '',
            youtube: updated.youtube || '',
            twitter_x: updated.twitter_x || '',
            custom_bio: updated.custom_bio || '',
          })
          .eq('id', current.id);
      } catch (e) {
        console.warn('Erro ao atualizar profiles no Supabase:', e);
      }

      window.dispatchEvent(new CustomEvent('auth_profile_updated', { detail: updated }));
      window.dispatchEvent(new Event('auth_state_changed'));

      return updated;
    } catch (e) {
      console.error('Error updating profile:', e);
      return null;
    }
  },

  // Quick login by Discord ID or Username
  loginWithDiscordIdOrUsername: async (identifier: string): Promise<UserProfile | null> => {
    try {
      const val = identifier.trim();
      if (!val) return null;

      let found: any = null;
      const { data } = await supabase
        .from('profiles')
        .select('id, discord_id, username, full_name, avatar_url, email, is_admin, role, created_at, last_login_at')
        .or(`discord_id.eq.${val},username.ilike.${val}`)
        .limit(1);

      if (data && data.length > 0) {
        found = data[0];
      } else if (DEFAULT_ADMIN_DISCORD_IDS.includes(val)) {
        found = {
          id: 'founder-' + val,
          discord_id: val,
          username: 'MALACA7X',
          full_name: 'MALACA7X',
          avatar_url: 'https://cdn.discordapp.com/embed/avatars/0.png',
          is_admin: true,
          role: 'admin',
          created_at: new Date().toISOString(),
          last_login_at: new Date().toISOString(),
        };
      }

      if (!found) return null;

      const dId = extractDiscordId(found);
      const isOfficial = Boolean(dId && DEFAULT_ADMIN_DISCORD_IDS.includes(dId));
      const isAdmin = isOfficial || found.is_admin === true || found.role === 'admin';
      const now = new Date().toISOString();

      const userProfile: UserProfile = {
        id: found.id,
        discord_id: String(found.discord_id),
        username: found.username,
        full_name: found.full_name || found.username,
        avatar_url: found.avatar_url || 'https://cdn.discordapp.com/embed/avatars/0.png',
        email: found.email,
        is_admin: isAdmin,
        role: isAdmin ? 'admin' : (found.role || 'user'),
        created_at: found.created_at || now,
        last_login_at: now,
      };

      localStorage.setItem('malaca_user_profile', JSON.stringify(userProfile));
      AuthService.logAccessSession(userProfile.id, userProfile.discord_id, userProfile.username);
      window.dispatchEvent(new CustomEvent('auth_profile_updated', { detail: userProfile }));
      window.dispatchEvent(new Event('auth_state_changed'));

      return userProfile;
    } catch (e) {
      console.error('Error logging in directly:', e);
      return null;
    }
  },

  // Direct Player Registration
  registerPlayerDirect: async (params: {
    username: string;
    fullName: string;
    discordId?: string;
    avatarUrl?: string;
  }): Promise<UserProfile | null> => {
    try {
      const now = new Date().toISOString();
      const dId = params.discordId?.trim() || ('72' + Math.floor(1000000000000000 + Math.random() * 9000000000000000));
      const isOfficial = DEFAULT_ADMIN_DISCORD_IDS.includes(dId);

      let authUserId: string | null = null;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) authUserId = session.user.id;
      } catch (e) {}

      const userProfile: UserProfile = {
        id: authUserId || ('player-' + Date.now()),
        discord_id: dId,
        username: params.username.trim(),
        full_name: params.fullName.trim(),
        avatar_url: params.avatarUrl || 'https://cdn.discordapp.com/embed/avatars/0.png',
        is_admin: isOfficial,
        role: isOfficial ? 'admin' : 'user',
        created_at: now,
        last_login_at: now,
      };

      localStorage.setItem('malaca_user_profile', JSON.stringify(userProfile));

      if (authUserId) {
        const cleanDb = {
          id: authUserId,
          discord_id: dId,
          username: userProfile.username,
          full_name: userProfile.full_name,
          avatar_url: userProfile.avatar_url,
          is_admin: isOfficial,
          role: isOfficial ? 'admin' : 'user',
          last_login_at: now,
        };
        try {
          await supabase.from('profiles').upsert([cleanDb], { onConflict: 'id' });
        } catch (e) {}
      }

      AuthService.logAccessSession(userProfile.id, userProfile.discord_id, userProfile.username);
      window.dispatchEvent(new CustomEvent('auth_profile_updated', { detail: userProfile }));
      window.dispatchEvent(new Event('auth_state_changed'));

      return userProfile;
    } catch (e) {
      console.error('Error registering direct player:', e);
      return null;
    }
  },

  async handleForceLogout(targetId?: string, targetDiscordId?: string) {
    const raw = localStorage.getItem('malaca_user_profile');
    if (!raw) return;
    try {
      const profile = JSON.parse(raw);
      const myId = String(profile.id || '');
      const myDid = String(profile.discord_id || '');
      const tId = String(targetId || '');
      const tDid = String(targetDiscordId || '');

      const isMatch = (tId && myId === tId) || (tDid && myDid === tDid);
      if (isMatch) {
        localStorage.removeItem('malaca_user_profile');
        localStorage.removeItem('malaca_admin_master_session');
        sessionStorage.removeItem('malaca_admin_master_session');
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const k = localStorage.key(i);
          if (k && (k.startsWith('sb-') || k.includes('auth-token'))) {
            localStorage.removeItem(k);
          }
        }
        for (let i = sessionStorage.length - 1; i >= 0; i--) {
          const k = sessionStorage.key(i);
          if (k && (k.startsWith('sb-') || k.includes('auth-token'))) {
            sessionStorage.removeItem(k);
          }
        }
        try { await supabase.auth.signOut({ scope: 'global' }); } catch (e) {}
        window.dispatchEvent(new Event('auth_state_changed'));
        alert('Sua conta foi excluída por um administrador. Sua sessão foi desconectada.');
        window.location.replace('/');
      }
    } catch (e) {}
  },
};
