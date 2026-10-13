import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) || 'https://pdzytmdssswiyjwohvwn.supabase.co';
const SUPABASE_ANON_KEY = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkenl0bWRzc3N3aXlqd29odnduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1ODI0NjQsImV4cCI6MjEwNzE1ODQ2NH0.RxTwiHG5JRHK02u1eBx3cFXI_3fKYMrxuI2op846FME';

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    }
});

const DEFAULT_ADMIN_DISCORD_IDS = ['722320491767136346']; // Apenas MALACA7X é superadmin inato

let currentUser = null;
let currentProfile = null;
let isUserAuthorized = false;
let activeTab = 'dashboard';
let cachedUsers = [];
let cachedServers = [];
let cachedSystems = [];
let cachedWandererLocations = [];
let selectedWandererCity = 'all';
let wandererSearchFilter = '';
let editingWandererId = null;
let userSearchFilter = '';

const globalHubChannel = supabaseClient.channel('malaca_realtime_global_hub');

// Escuta em tempo real para sincronização entre janelas/abas
globalHubChannel
    .on('broadcast', { event: 'force_user_logout' }, async (payload) => {
        const p = payload?.payload;
        if (!p) return;
        const myDid = extractDiscordId(currentProfile) || currentProfile?.discord_id || '';
        const myId = currentProfile?.id || '';
        const sessDid = extractDiscordId(currentUser) || '';
        const sessId = currentUser?.id || '';
        if ((p.id && (myId === p.id || sessId === p.id)) ||
            (p.discordId && (myDid === p.discordId || sessDid === p.discordId))) {
            await forceSignOutDeletedSession('Sua conta foi excluída por um administrador. Sessão desconectada.');
        }
    })
    .on('broadcast', { event: 'user_deleted' }, async (payload) => {
        const p = payload?.payload;
        if (!p) return;
        const myDid = extractDiscordId(currentProfile) || currentProfile?.discord_id || '';
        const myId = currentProfile?.id || '';
        const sessDid = extractDiscordId(currentUser) || '';
        const sessId = currentUser?.id || '';
        if ((p.id && (myId === p.id || sessId === p.id)) ||
            (p.discordId && (myDid === p.discordId || sessDid === p.discordId))) {
            await forceSignOutDeletedSession('Sua conta foi excluída por um administrador. Sessão desconectada.');
        } else {
            loadUsersData();
        }
    })
    .on('broadcast', { event: 'user_permission_updated' }, (payload) => {
        if (payload?.payload?.userId === currentProfile?.id || payload?.payload?.discordId === currentProfile?.discord_id) {
            initPainel();
        } else {
            loadUsersData();
        }
    })
    .on('broadcast', { event: 'user_ban_updated' }, (payload) => {
        if (payload?.payload?.userId === currentProfile?.id || payload?.payload?.discordId === currentProfile?.discord_id) {
            initPainel();
        } else {
            loadUsersData();
        }
    })
    .on('broadcast', { event: 'wanderer_confirmed' }, () => {
        loadWandererLocations();
    })
    .on('broadcast', { event: 'wanderer_cycle_reset' }, () => {
        loadWandererLocations();
    })
    .on('broadcast', { event: 'entity_sync' }, (payload) => {
        if (payload?.payload?.entity === 'map_locations') {
            loadWandererLocations();
        }
    })
    .subscribe();

function getBannedListFromStorage() {
    try {
        return JSON.parse(localStorage.getItem('malaca_banned_discord_accounts') || '[]');
    } catch(e) {
        return [];
    }
}

function extractDiscordId(u) {
    if (!u) return '';
    if (u.discord_id && typeof u.discord_id === 'string' && u.discord_id.trim()) {
        return u.discord_id.trim();
    }
    if (Array.isArray(u.identities) && u.identities.length > 0) {
        const discordIdentity = u.identities.find(i => i.provider === 'discord') || u.identities[0];
        if (discordIdentity) {
            if (discordIdentity.id) return String(discordIdentity.id).trim();
            if (discordIdentity.identity_data) {
                if (discordIdentity.identity_data.provider_id) return String(discordIdentity.identity_data.provider_id).trim();
                if (discordIdentity.identity_data.sub) return String(discordIdentity.identity_data.sub).trim();
            }
        }
    }
    const meta = u.user_metadata || u.raw_user_meta_data || {};
    if (meta.provider_id) return String(meta.provider_id).trim();
    if (meta.sub && !String(meta.sub).includes('-')) return String(meta.sub).trim();
    if (meta.id && !String(meta.id).includes('-')) return String(meta.id).trim();

    if (u.id && typeof u.id === 'string' && /^\d{15,22}$/.test(u.id.trim())) {
        return u.id.trim();
    }
    if (u.sub && typeof u.sub === 'string' && /^\d{15,22}$/.test(u.sub.trim())) {
        return u.sub.trim();
    }
    return '';
}

async function getGlobalDeletedAccounts() {
    let list = [];
    try {
        const local = JSON.parse(localStorage.getItem('malaca_deleted_discord_accounts') || '[]');
        if (Array.isArray(local)) list = [...local];
    } catch(e) {}
    try {
        const { data } = await supabaseClient.from('platform_settings').select('disabled_systems').eq('id', 'deleted_accounts').maybeSingle();
        if (data && Array.isArray(data.disabled_systems)) {
            data.disabled_systems.forEach(id => {
                const clean = String(id || '').trim();
                if (clean && !list.includes(clean)) list.push(clean);
            });
            localStorage.setItem('malaca_deleted_discord_accounts', JSON.stringify(list));
        }
    } catch(e) {}
    return list;
}

function getDeletedListFromStorage() {
    try {
        return JSON.parse(localStorage.getItem('malaca_deleted_discord_accounts') || '[]');
    } catch(e) {
        return [];
    }
}

async function markGlobalDeletedAccount(id, discordId) {
    let list = await getGlobalDeletedAccounts();
    const cleanDid = (discordId && discordId !== '—' && discordId !== 'undefined') ? String(discordId).trim() : '';
    const cleanId = (id && id !== 'undefined') ? String(id).trim() : '';
    if (cleanDid && !list.includes(cleanDid)) list.push(cleanDid);
    if (cleanId && !list.includes(cleanId)) list.push(cleanId);
    
    localStorage.setItem('malaca_deleted_discord_accounts', JSON.stringify(list));
    
    try {
        await supabaseClient.from('platform_settings').upsert({
            id: 'deleted_accounts',
            disabled_systems: list,
            updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
    } catch(e) {
        console.warn('Erro ao salvar tombstone global no Supabase:', e);
    }
    return list;
}

async function forceSignOutDeletedSession(msg = '', shouldRedirect = false) {
    try {
        await supabaseClient.auth.signOut({ scope: 'global' });
    } catch(e) {}
    try {
        localStorage.removeItem('malaca_user_profile');
        localStorage.removeItem('malaca_admin_master_session');
        sessionStorage.removeItem('malaca_admin_master_session');
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const k = localStorage.key(i);
            if (k && (k.startsWith('sb-') || k.includes('supabase.auth.token') || k.includes('auth-token'))) {
                localStorage.removeItem(k);
            }
        }
        for (let i = sessionStorage.length - 1; i >= 0; i--) {
            const k = sessionStorage.key(i);
            if (k && (k.startsWith('sb-') || k.includes('supabase.auth.token') || k.includes('auth-token'))) {
                sessionStorage.removeItem(k);
            }
        }
    } catch(e) {}
    
    currentUser = null;
    currentProfile = null;
    isUserAuthorized = false;
    if (msg && shouldRedirect) alert(msg);
    if (shouldRedirect) window.location.replace('/');
}

function checkIsUserBanned(profile) {
    if (!profile) return false;
    const dId = extractDiscordId(profile) || profile.discord_id || '';
    if (dId && DEFAULT_ADMIN_DISCORD_IDS.includes(String(dId))) return false;
    if (profile.id && DEFAULT_ADMIN_DISCORD_IDS.includes(String(profile.id))) return false;
    if (profile.is_banned === true || profile.role === 'banned') return true;
    const bannedList = getBannedListFromStorage();
    if (dId && bannedList.includes(String(dId))) return true;
    if (profile.id && bannedList.includes(String(profile.id))) return true;
    return false;
}

// Verifica privilégios de administrador de forma permissiva e consistente
function checkIsAdmin(profile) {
    if (!profile) return false;
    if (checkIsUserBanned(profile)) return false;
    const dId = extractDiscordId(profile) || profile.discord_id || '';
    
    // 1. Fundador inato oficial
    if (dId && DEFAULT_ADMIN_DISCORD_IDS.includes(String(dId))) return true;
    if (profile.id && DEFAULT_ADMIN_DISCORD_IDS.includes(String(profile.id))) return true;
    
    // 2. Cargo explícito
    if (profile.is_admin === true || profile.role === 'admin' || profile.role === 'owner' || profile.role === 'founder') return true;
    
    // 3. Lista personalizada de administradores no cache local
    try {
        const customAdmins = JSON.parse(localStorage.getItem('malaca_admin_discord_accounts') || '[]');
        if (dId && customAdmins.includes(String(dId))) return true;
        if (profile.id && customAdmins.includes(String(profile.id))) return true;
    } catch(e) {}

    // 4. Sessão administrativa mestre
    if (sessionStorage.getItem('malaca_admin_master_session') === 'true' || localStorage.getItem('malaca_admin_master_session') === 'true') {
        return true;
    }

    return false;
}

function checkIsOwner(profile) {
    if (!profile) return false;
    const dId = extractDiscordId(profile) || profile.discord_id || '';
    return DEFAULT_ADMIN_DISCORD_IDS.includes(String(dId)) || DEFAULT_ADMIN_DISCORD_IDS.includes(String(profile.id || ''));
}

// Listener em tempo real para sincronização da sessão de autenticação Discord Supabase
supabaseClient.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED') {
        if (session && session.user) {
            currentUser = session.user;
            await initPainel();
        }
    }
});

// Inicializa verificação de autenticação de forma instantânea e resiliente
async function initPainel() {
    const root = document.getElementById('painel-app-root');
    if (!root) return;

    // Intercepta erros OAuth
    const urlParams = new URLSearchParams(window.location.search);
    let hashParams = new URLSearchParams();
    if (window.location.hash && window.location.hash.includes('=')) {
        hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    }
    const oauthError = urlParams.get('error') || hashParams.get('error');
    const oauthErrorDesc = urlParams.get('error_description') || hashParams.get('error_description');

    if (oauthError || oauthErrorDesc) {
        window.history.replaceState(null, document.title, window.location.pathname);
        console.warn('OAuth Error no painel:', oauthError, oauthErrorDesc);
    }

    const hasOAuthTokens = window.location.hash.includes('access_token=') || window.location.search.includes('code=');

    // 1. RENDERIZAÇÃO INSTANTÂNEA OTIMISTA (Abre o painel em < 10ms se o usuário já estiver autenticado)
    let localProfile = null;
    try {
        const rawSaved = localStorage.getItem('malaca_user_profile');
        if (rawSaved) {
            const parsed = JSON.parse(rawSaved);
            if (parsed && typeof parsed === 'object') {
                if (checkIsAdmin(parsed)) {
                    localProfile = parsed;
                    currentProfile = localProfile;
                    isUserAuthorized = true;
                    // Se não estiver no meio do handshake de OAuth, monta a interface imediatamente!
                    if (!hasOAuthTokens) {
                        renderPainelDashboard(root);
                    }
                }
            }
        }
    } catch(e) {}

    // Se ainda não renderizou imediatamente, mostra o feedback de validação
    if (!localProfile) {
        root.innerHTML = `
            <div class="painel-gate-container">
                <div style="text-align: center; color: #94a3b8;">
                    <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 2.5rem; color: #00d2ff; margin-bottom: 16px;"></i>
                    <h3 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; margin-bottom: 8px;">
                        ${hasOAuthTokens ? 'Concluindo Autenticação Discord...' : 'Verificando Sessão de Administrador...'}
                    </h3>
                    <p style="font-size: 0.85rem;">Validando credenciais do Discord e permissões no Supabase.</p>
                </div>
            </div>
        `;
    }

    try {
        let { data: { session } } = await supabaseClient.auth.getSession();
        
        // Se há tokens na URL mas a sessão ainda não sincronizou, aguarda brevemente
        if (!session && hasOAuthTokens) {
            for (let i = 0; i < 6; i++) {
                await new Promise(r => setTimeout(r, 250));
                const check = await supabaseClient.auth.getSession();
                if (check.data?.session) {
                    session = check.data.session;
                    break;
                }
            }
        }

        let profile = localProfile;

        if (session && session.user) {
            currentUser = session.user;
            const discordId = extractDiscordId(session.user) || extractDiscordId(localProfile) || localProfile?.discord_id || '';
            const isFounder = DEFAULT_ADMIN_DISCORD_IDS.includes(String(discordId)) || DEFAULT_ADMIN_DISCORD_IDS.includes(String(session.user.id));
            
            // Se a conta constava como excluída, verifica se é login ativo ou sessão residual
            const deletedList = await getGlobalDeletedAccounts();
            const isDeletedTombstone = deletedList.includes(String(discordId)) || deletedList.includes(String(session.user.id));
            const hasExplicitLogin = hasOAuthTokens ||
                                     Boolean(sessionStorage.getItem('malaca_explicit_login_attempt')) ||
                                     Boolean(localStorage.getItem('malaca_explicit_login_attempt'));

            if (isDeletedTombstone) {
                if (hasExplicitLogin) {
                    // Usuário excluído se autenticando/cadastrando novamente de forma voluntária:
                    // Remove do tombstone e permite novo cadastro 100% LIMPO e isolado, SEM ligação aos dados da conta excluída
                    const filtered = deletedList.filter(d => d !== String(discordId) && d !== String(session.user.id));
                    localStorage.setItem('malaca_deleted_discord_accounts', JSON.stringify(filtered));
                    try {
                        await supabaseClient.from('platform_settings').upsert({
                            id: 'deleted_accounts',
                            disabled_systems: filtered,
                            updated_at: new Date().toISOString()
                        }, { onConflict: 'id' });
                    } catch(e) {}

                    sessionStorage.removeItem('malaca_explicit_login_attempt');
                    localStorage.removeItem('malaca_explicit_login_attempt');
                    localStorage.removeItem('malaca_admin_master_session');
                    sessionStorage.removeItem('malaca_admin_master_session');
                    localStorage.removeItem('malaca_user_profile');

                    // Remove privilégios administrativos antigos do cache
                    try {
                        let customAdmins = JSON.parse(localStorage.getItem('malaca_admin_discord_accounts') || '[]');
                        customAdmins = customAdmins.filter(d => d !== String(discordId) && d !== String(session.user.id));
                        localStorage.setItem('malaca_admin_discord_accounts', JSON.stringify(customAdmins));
                    } catch(e) {}

                    dbProfile = null;
                } else {
                    // Sessão residual antiga de antes da exclusão sem login ativo:
                    await forceSignOutDeletedSession('', false);
                    return;
                }
            }
            
            // Busca dados existentes no Supabase com validação segura de UUID
            let dbProfile = null;
            try {
                const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(session.user.id);
                const orConditions = [];
                if (isUuid) orConditions.push(`id.eq.${session.user.id}`);
                if (discordId) orConditions.push(`discord_id.eq.${discordId}`);
                if (orConditions.length > 0) {
                    const { data } = await supabaseClient
                        .from('profiles')
                        .select('id, discord_id, username, full_name, avatar_url, email, is_admin, role, created_at, last_login_at')
                        .or(orConditions.join(','))
                        .maybeSingle();
                    if (data) dbProfile = data;
                }
            } catch(e) {}

            let customAdmins = [];
            try { customAdmins = JSON.parse(localStorage.getItem('malaca_admin_discord_accounts') || '[]'); } catch(e) {}
            const isCustomAdmin = (discordId && customAdmins.includes(String(discordId))) || customAdmins.includes(String(session.user.id));

            const isAdmin = isFounder || isCustomAdmin || (dbProfile && (dbProfile.is_admin === true || dbProfile.role === 'admin')) || localProfile?.is_admin === true || localProfile?.role === 'admin';
            const userRole = isAdmin ? 'admin' : (dbProfile?.role || localProfile?.role || 'user');
            const now = new Date().toISOString();

            const meta = session.user.user_metadata || {};
            profile = {
                id: session.user.id,
                discord_id: String(discordId),
                username: meta.preferred_username || meta.global_name || meta.name || dbProfile?.username || localProfile?.username || 'Discord User',
                full_name: meta.full_name || meta.global_name || meta.name || dbProfile?.full_name || localProfile?.full_name || 'Usuário',
                avatar_url: meta.avatar_url || meta.picture || dbProfile?.avatar_url || localProfile?.avatar_url || 'https://cdn.discordapp.com/embed/avatars/0.png',
                email: session.user.email || dbProfile?.email,
                is_admin: isAdmin,
                role: userRole,
                created_at: dbProfile?.created_at || session.user.created_at || now,
                last_login_at: now
            };

            // Salva perfil limpo no Supabase de forma assíncrona
            const cleanUpsert = {
                id: session.user.id,
                discord_id: String(discordId),
                username: profile.username,
                full_name: profile.full_name,
                avatar_url: profile.avatar_url,
                email: profile.email || undefined,
                is_admin: isAdmin,
                role: userRole,
                last_login_at: now
            };
            supabaseClient.from('profiles').upsert([cleanUpsert], { onConflict: 'id' }).catch(() => {});

            // Limpa parâmetros OAuth da barra de endereço
            if (hasOAuthTokens) {
                window.history.replaceState(null, '', window.location.pathname);
            }
        }

        // Se não houver sessão direta no client, resgata a sessão salva localmente
        if (!profile) {
            const stored = localStorage.getItem('malaca_user_profile');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (parsed && typeof parsed === 'object') {
                        const discordId = extractDiscordId(parsed) || parsed.discord_id || '';
                        const isFounder = DEFAULT_ADMIN_DISCORD_IDS.includes(String(discordId)) || DEFAULT_ADMIN_DISCORD_IDS.includes(String(parsed.id || ''));
                        
                        let dbProfile = null;
                        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(parsed.id || ''));
                        const orConditions = [];
                        if (isUuid) orConditions.push(`id.eq.${parsed.id}`);
                        if (discordId) orConditions.push(`discord_id.eq.${discordId}`);
                        if (orConditions.length > 0) {
                            try {
                                const { data } = await supabaseClient
                                    .from('profiles')
                                    .select('id, discord_id, username, full_name, avatar_url, email, is_admin, role, created_at, last_login_at')
                                    .or(orConditions.join(','))
                                    .maybeSingle();
                                if (data) dbProfile = data;
                            } catch(e) {}
                        }

                        let customAdmins = [];
                        try { customAdmins = JSON.parse(localStorage.getItem('malaca_admin_discord_accounts') || '[]'); } catch(e) {}
                        const isCustomAdmin = (discordId && customAdmins.includes(String(discordId))) || (parsed.id && customAdmins.includes(String(parsed.id)));

                        const isAdmin = isFounder || isCustomAdmin || (dbProfile && (dbProfile.is_admin === true || dbProfile.role === 'admin')) || parsed.is_admin === true || parsed.role === 'admin';
                        const userRole = isAdmin ? 'admin' : (dbProfile?.role || parsed.role || 'user');

                        profile = {
                            ...parsed,
                            ...(dbProfile || {}),
                            discord_id: String(discordId || parsed.discord_id || ''),
                            username: dbProfile?.username || parsed.username || 'MALACA7X',
                            full_name: dbProfile?.full_name || parsed.full_name || parsed.username || 'Administrador',
                            avatar_url: dbProfile?.avatar_url || parsed.avatar_url || 'https://cdn.discordapp.com/embed/avatars/0.png',
                            is_admin: isAdmin,
                            role: userRole
                        };
                    }
                } catch(e) {
                    console.warn('Erro ao processar sessão salva no painel:', e);
                }
            }
        }

        currentProfile = profile;

        if (!profile) {
            renderLoginGate(root);
            return;
        }

        // Mantém sessão local sincronizada com o site
        localStorage.setItem('malaca_user_profile', JSON.stringify(profile));

        if (checkIsUserBanned(profile)) {
            renderBannedGate(root, profile);
            return;
        }

        if (!checkIsAdmin(profile)) {
            renderAccessDeniedGate(root, profile);
            return;
        }

        isUserAuthorized = true;
        // Se a interface ainda não foi montada, renderiza o dashboard
        if (!document.getElementById('painel-tab-content')) {
            renderPainelDashboard(root);
        }

    } catch (err) {
        console.error('Erro na inicialização do painel:', err);
        if (!localProfile) {
            renderLoginGate(root);
        }
    }
}

// TELA: Login com Discord OAuth OU Credenciais Master
function renderLoginGate(root) {
    root.innerHTML = `
        <div class="painel-gate-container">
            <div class="painel-gate-card">
                <div class="painel-gate-icon">
                    <i class="fa-solid fa-shield-halved"></i>
                </div>
                <h2 class="painel-gate-title">ACESSO ADMINISTRATIVO</h2>
                <p class="painel-gate-desc">
                    O <strong>Painel Administrativo do Malaca System GTARP</strong> é restrito a administradores autorizados. Faça login com o Discord ou utilize as credenciais master.
                </p>
                
                <button id="btn-login-discord-painel" class="btn-gate-primary" style="margin-bottom: 14px;">
                    <i class="fa-brands fa-discord" style="font-size: 1.2rem;"></i> ENTRAR COM O DISCORD
                </button>

                <div style="display: flex; align-items: center; gap: 12px; margin: 18px 0; color: #64748b; font-size: 11px; font-weight: 800;">
                    <div style="flex: 1; height: 1px; background: rgba(255,255,255,0.1);"></div>
                    <span>OU CREDENCIAIS MASTER</span>
                    <div style="flex: 1; height: 1px; background: rgba(255,255,255,0.1);"></div>
                </div>

                <form id="painel-master-login-form" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">
                    <div id="painel-master-error" style="display: none; background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.4); color: #fca5a5; padding: 8px 12px; border-radius: 8px; font-size: 12px; font-weight: 700;">
                        <i class="fa-solid fa-circle-exclamation"></i> Usuário ou senha master incorretos.
                    </div>
                    <div>
                        <input type="text" id="painel-master-user" placeholder="Usuário (ex: malaca ou admin)" style="width: 100%; padding: 10px 14px; background: rgba(0,0,0,0.5); border: 1px solid rgba(0,210,255,0.25); border-radius: 8px; color: #fff; font-size: 13px;" required />
                    </div>
                    <div>
                        <input type="password" id="painel-master-pass" placeholder="Senha master de administração" style="width: 100%; padding: 10px 14px; background: rgba(0,0,0,0.5); border: 1px solid rgba(0,210,255,0.25); border-radius: 8px; color: #fff; font-size: 13px;" required />
                    </div>
                    <button type="submit" class="btn-gate-primary" style="background: linear-gradient(135deg, #00d2ff, #2563eb); border: none;">
                        <i class="fa-solid fa-key"></i> ACESSAR COM SENHA MASTER
                    </button>
                </form>

                <a href="/" class="btn-gate-secondary">
                    <i class="fa-solid fa-arrow-left"></i> Voltar à Página Inicial
                </a>
            </div>
        </div>
    `;

    document.getElementById('btn-login-discord-painel')?.addEventListener('click', handleDiscordLogin);

    document.getElementById('painel-master-login-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const u = document.getElementById('painel-master-user')?.value.trim().toLowerCase();
        const p = document.getElementById('painel-master-pass')?.value.trim();
        const errEl = document.getElementById('painel-master-error');

        if ((u === 'malaca' && p === '199425') || (u === 'admin' && (p === 'cidadealta123' || p === 'admin')) || p === '199425') {
            sessionStorage.setItem('malaca_admin_master_session', 'true');
            localStorage.setItem('malaca_admin_master_session', 'true');
            currentProfile = {
                id: '722320491767136346',
                discord_id: '722320491767136346',
                username: 'MALACA7X',
                full_name: 'Administrador Principal',
                avatar_url: '/images/platform_icon.png',
                is_admin: true,
                role: 'admin'
            };
            localStorage.setItem('malaca_user_profile', JSON.stringify(currentProfile));
            isUserAuthorized = true;
            renderPainelDashboard(root);
        } else {
            if (errEl) errEl.style.display = 'block';
        }
    });
}

// TELA: Acesso Negado (com desbloqueio por Senha Master)
function renderAccessDeniedGate(root, profile) {
    root.innerHTML = `
        <div class="painel-gate-container">
            <div class="painel-gate-card">
                <div class="painel-gate-icon danger">
                    <i class="fa-solid fa-lock"></i>
                </div>
                <h2 class="painel-gate-title">ACESSO RESTRITO</h2>
                <p class="painel-gate-desc">
                    A conta <strong style="color: #fff;">@${profile.username || 'Usuário'}</strong> está conectada, mas não possui permissões administrativas ativas.
                </p>
                <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px; text-align: left;">
                    <img src="${profile.avatar_url || 'https://cdn.discordapp.com/embed/avatars/0.png'}" style="width: 42px; height: 42px; border-radius: 50%; object-fit: cover;" />
                    <div style="min-width: 0; flex: 1;">
                        <div style="color: #fff; font-weight: 800; font-size: 13px;">${profile.full_name || profile.username}</div>
                        <div style="color: #64748b; font-size: 11px;">ID Discord: ${profile.discord_id || '—'}</div>
                    </div>
                    <span class="badge-user">USUÁRIO</span>
                </div>

                <!-- Desbloqueio com Senha Master -->
                <form id="painel-unlock-master-form" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
                    <div id="painel-unlock-error" style="display: none; background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.4); color: #fca5a5; padding: 6px 10px; border-radius: 6px; font-size: 11px;">
                        Chave master incorreta.
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <input type="password" id="painel-unlock-pass" placeholder="Chave master de administração..." style="flex: 1; padding: 10px 14px; background: rgba(0,0,0,0.5); border: 1px solid rgba(0,210,255,0.3); border-radius: 8px; color: #fff; font-size: 13px;" required />
                        <button type="submit" class="btn-gate-primary" style="padding: 10px 16px; width: auto; background: linear-gradient(135deg, #00d2ff, #2563eb); border: none;">
                            <i class="fa-solid fa-unlock"></i> Liberar
                        </button>
                    </div>
                </form>

                <a href="/" class="btn-gate-secondary" style="margin-bottom: 10px;">
                    <i class="fa-solid fa-arrow-left"></i> Voltar para a Plataforma
                </a>
                <button id="btn-switch-account-painel" class="btn-gate-secondary">
                    <i class="fa-solid fa-arrow-right-from-bracket"></i> Conectar com Outra Conta Discord
                </button>
            </div>
        </div>
    `;

    document.getElementById('painel-unlock-master-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const p = document.getElementById('painel-unlock-pass')?.value.trim();
        const errEl = document.getElementById('painel-unlock-error');
        if (p === '199425' || p === 'cidadealta123' || p === 'admin') {
            profile.is_admin = true;
            profile.role = 'admin';
            localStorage.setItem('malaca_user_profile', JSON.stringify(profile));
            sessionStorage.setItem('malaca_admin_master_session', 'true');
            localStorage.setItem('malaca_admin_master_session', 'true');
            
            // Adiciona aos admins locais
            let customAdmins = JSON.parse(localStorage.getItem('malaca_admin_discord_accounts') || '[]');
            const dId = extractDiscordId(profile) || profile.discord_id;
            if (dId && !customAdmins.includes(dId)) {
                customAdmins.push(dId);
                localStorage.setItem('malaca_admin_discord_accounts', JSON.stringify(customAdmins));
            }
            isUserAuthorized = true;
            renderPainelDashboard(root);
        } else {
            if (errEl) errEl.style.display = 'block';
        }
    });

    document.getElementById('btn-switch-account-painel')?.addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
        localStorage.removeItem('malaca_user_profile');
        handleDiscordLogin();
    });
}

// TELA: Conta Suspensa / Banida
function renderBannedGate(root, profile) {
    root.innerHTML = `
        <div class="painel-gate-container">
            <div class="painel-gate-card" style="border-color: rgba(239,68,68,0.5);">
                <div class="painel-gate-icon danger">
                    <i class="fa-solid fa-ban"></i>
                </div>
                <h2 class="painel-gate-title" style="color: #ef4444;">ACESSO SUSPENSO</h2>
                <p class="painel-gate-desc">
                    Esta conta foi permanentemente banida da plataforma <strong>Malaca System GTARP</strong>. Todas as funções administrativas e operacionais estão revogadas.
                </p>
                <button id="btn-banned-logout-painel" class="btn-gate-primary" style="background: #ef4444;">
                    <i class="fa-solid fa-arrow-right-from-bracket"></i> DESCONECTAR CONTA
                </button>
            </div>
        </div>
    `;

    document.getElementById('btn-banned-logout-painel')?.addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
        localStorage.removeItem('malaca_user_profile');
        window.location.href = '/';
    });
}

// LOGIN COM DISCORD OAUTH
async function handleDiscordLogin() {
    try {
        const btn = document.getElementById('btn-login-discord-painel');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Redirecionando para o Discord...`;
        }
        sessionStorage.setItem('malaca_explicit_login_attempt', Date.now().toString());
        localStorage.setItem('malaca_explicit_login_attempt', Date.now().toString());
        let origin = window.location.origin;
        if (window.location.hostname.includes('cda.malaca.com.br') || window.location.hostname.includes('malaca.com.br')) {
            origin = 'https://cda.malaca.com.br';
        }
        const redirectUrl = origin + '/painel/';
        const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'discord',
            options: {
                redirectTo: redirectUrl,
                scopes: 'identify email'
            }
        });
        if (error) throw error;
    } catch (e) {
        alert('Erro ao conectar com o Discord: ' + (e.message || 'Tente novamente.'));
        const btn = document.getElementById('btn-login-discord-painel');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<i class="fa-brands fa-discord" style="font-size: 1.2rem;"></i> ENTRAR COM O DISCORD`;
        }
    }
}

// RENDERIZAÇÃO DO PAINEL COMPLETO
function renderPainelDashboard(root) {
    const isOwner = checkIsOwner(currentProfile);

    root.innerHTML = `
        <header class="painel-header">
            <div class="painel-brand">
                <div class="painel-brand-icon">
                    <img src="/images/platform_icon.png" alt="Malaca System" />
                </div>
                <div>
                    <div class="painel-brand-title">
                        MALACA SYSTEM GTARP <span class="painel-brand-badge">PAINEL</span>
                    </div>
                    <div class="painel-brand-sub">Central Global de Gestão & Governança</div>
                </div>
            </div>

            <div class="painel-header-actions">
                <a href="/" class="painel-btn-secondary" title="Retornar à plataforma pública">
                    <i class="fa-solid fa-arrow-left"></i> <span>VOLTAR AO SITE</span>
                </a>

                <div class="painel-admin-profile">
                    <img src="${currentProfile.avatar_url || 'https://cdn.discordapp.com/embed/avatars/0.png'}" class="painel-admin-avatar" alt="Avatar" />
                    <div class="painel-admin-info">
                        <span class="painel-admin-name">${currentProfile.username || 'Admin'}</span>
                        <span class="painel-admin-role">${isOwner ? 'SUPERADMIN • FUNDADOR' : 'ADMINISTRADOR'}</span>
                    </div>
                </div>

                <button id="btn-painel-logout" class="painel-btn-logout" title="Encerrar sessão de administrador">
                    <i class="fa-solid fa-right-from-bracket"></i> <span>SAIR</span>
                </button>
            </div>
        </header>

        <div class="painel-layout">
            <aside class="painel-sidebar">
                <div class="painel-nav-category">NAVEGAÇÃO PRINCIPAL</div>

                <button class="painel-nav-item ${activeTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">
                    <i class="fa-solid fa-chart-pie"></i>
                    <span>Dashboard</span>
                </button>

                <button class="painel-nav-item ${activeTab === 'users' ? 'active' : ''}" data-tab="users">
                    <i class="fa-solid fa-users"></i>
                    <span>Usuários & Cargos</span>
                    <span class="painel-nav-badge" id="badge-users-count">—</span>
                </button>

                <button class="painel-nav-item ${activeTab === 'andarilho' ? 'active' : ''}" data-tab="andarilho">
                    <i class="fa-solid fa-person-walking"></i>
                    <span>Andarilho & Mapa</span>
                    <span class="painel-nav-badge" id="badge-wanderer-count">—</span>
                </button>

                <div class="painel-nav-category">ECOSSISTEMA RP</div>

                <button class="painel-nav-item ${activeTab === 'cities' ? 'active' : ''}" data-tab="cities">
                    <i class="fa-solid fa-city"></i>
                    <span>Cidades / Servidores</span>
                    <span class="painel-nav-badge" id="badge-cities-count">—</span>
                </button>

                <button class="painel-nav-item ${activeTab === 'systems' ? 'active' : ''}" data-tab="systems">
                    <i class="fa-solid fa-layer-group"></i>
                    <span>Sistemas & Minijogos</span>
                    <span class="painel-nav-badge" id="badge-systems-count">—</span>
                </button>

                <div class="painel-nav-category">SISTEMA</div>

                <button class="painel-nav-item ${activeTab === 'settings' ? 'active' : ''}" data-tab="settings">
                    <i class="fa-solid fa-gear"></i>
                    <span>Configurações Globais</span>
                </button>
            </aside>

            <main class="painel-content" id="painel-tab-content">
                <!-- Conteúdo da aba ativa -->
            </main>
        </div>
    `;

    // Eventos de Navegação
    document.querySelectorAll('.painel-nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            if (tab) switchTab(tab);
        });
    });

    document.getElementById('btn-painel-logout')?.addEventListener('click', async () => {
        if (confirm('Deseja realmente encerrar a sessão de administrador?')) {
            await supabaseClient.auth.signOut();
            localStorage.removeItem('malaca_user_profile');
            window.location.href = '/';
        }
    });

    // Carrega dados iniciais e renderiza aba atual
    loadDashboardData();
    switchTab(activeTab);
}

function switchTab(tabName) {
    activeTab = tabName;
    document.querySelectorAll('.painel-nav-item').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });

    const container = document.getElementById('painel-tab-content');
    if (!container) return;

    if (tabName === 'dashboard') {
        renderDashboardView(container);
    } else if (tabName === 'users') {
        renderUsersView(container);
    } else if (tabName === 'andarilho') {
        renderWandererView(container);
    } else if (tabName === 'cities') {
        renderCitiesView(container);
    } else if (tabName === 'systems') {
        renderSystemsView(container);
    } else if (tabName === 'settings') {
        renderSettingsView(container);
    }
}

// CARREGAMENTO DOS DADOS GLOBAIS
async function loadDashboardData() {
    try {
        const { data: users } = await supabaseClient.from('profiles').select('*').order('created_at', { ascending: false });
        if (users) {
            cachedUsers = users;
            const badgeUsers = document.getElementById('badge-users-count');
            if (badgeUsers) badgeUsers.textContent = users.length;
        }

        const { data: servers } = await supabaseClient.from('servers').select('*').order('created_at', { ascending: true });
        if (servers) {
            cachedServers = servers;
            const badgeCities = document.getElementById('badge-cities-count');
            if (badgeCities) badgeCities.textContent = servers.length;
        }

        const { data: systems } = await supabaseClient.from('systems').select('*').order('created_at', { ascending: true });
        if (systems) {
            cachedSystems = systems;
            const badgeSystems = document.getElementById('badge-systems-count');
            if (badgeSystems) badgeSystems.textContent = systems.length;
        }

        await loadWandererLocations();

        if (activeTab === 'dashboard') {
            const container = document.getElementById('painel-tab-content');
            if (container) renderDashboardView(container);
        } else if (activeTab === 'users') {
            renderUsersList();
        } else if (activeTab === 'andarilho') {
            const container = document.getElementById('painel-tab-content');
            if (container) renderWandererView(container);
        }
    } catch (e) {
        console.warn('Erro ao carregar dados do dashboard:', e);
    }
}

// ABA 1: DASHBOARD
function renderDashboardView(container) {
    const totalUsers = cachedUsers.length || 0;
    const totalAdmins = cachedUsers.filter(u => u.is_admin === true || DEFAULT_ADMIN_DISCORD_IDS.includes(u.discord_id)).length;
    const totalBanned = cachedUsers.filter(u => checkIsUserBanned(u)).length;
    const totalServers = cachedServers.length || 3;
    const totalSystems = cachedSystems.length || 4;

    container.innerHTML = `
        <div class="painel-page-title-area">
            <div>
                <h1 class="painel-page-title">VISÃO GERAL DA PLATAFORMA</h1>
                <p class="painel-page-desc">Métricas consolidadas, integridade de sistemas e controle em tempo real.</p>
            </div>
            <button class="painel-btn-secondary" onclick="window.painelRefreshData()">
                <i class="fa-solid fa-rotate"></i> Atualizar Dados
            </button>
        </div>

        <div class="painel-stats-grid">
            <div class="painel-stat-card">
                <div class="painel-stat-label"><i class="fa-solid fa-users" style="color: #38bdf8;"></i> Total de Usuários</div>
                <div class="painel-stat-value" style="color: #38bdf8;">${totalUsers}</div>
                <div class="painel-stat-sub">${totalAdmins} Administradores • ${totalBanned} Banidos</div>
            </div>

            <div class="painel-stat-card">
                <div class="painel-stat-label"><i class="fa-solid fa-city" style="color: #ffc046;"></i> Cidades Ativas</div>
                <div class="painel-stat-value" style="color: #ffc046;">${totalServers}</div>
                <div class="painel-stat-sub">CDA, Valley GG, Los Santos</div>
            </div>

            <div class="painel-stat-card">
                <div class="painel-stat-label"><i class="fa-solid fa-layer-group" style="color: #10b981;"></i> Sistemas e Minijogos</div>
                <div class="painel-stat-value" style="color: #10b981;">${totalSystems}</div>
                <div class="painel-stat-sub">Mapa, Lockpick, Caixinha, Hacking</div>
            </div>

            <div class="painel-stat-card">
                <div class="painel-stat-label"><i class="fa-solid fa-person-walking" style="color: #8b5cf6;"></i> Ciclo do Andarilho</div>
                <div class="painel-stat-value" style="font-size: 1.5rem; color: #c084fc; margin-top: 14px;">06:00 / 18:00</div>
                <div class="painel-stat-sub">Viradas diárias ativas</div>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
            <div class="painel-card">
                <div class="painel-card-header">
                    <h3 class="painel-card-title"><i class="fa-solid fa-bolt" style="color: #00d2ff;"></i> Ações Rápidas de Gestão</h3>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px;">
                    <button class="painel-btn-secondary" style="padding: 16px; flex-direction: column; text-align: center; gap: 8px;" onclick="window.painelSwitchTab('users')">
                        <i class="fa-solid fa-user-shield" style="font-size: 24px; color: #38bdf8;"></i>
                        <span style="font-weight: 800;">Gerenciar Usuários</span>
                        <span style="font-size: 11px; color: #64748b;">Promover, rebaixar ou banir</span>
                    </button>
                    <button class="painel-btn-secondary" style="padding: 16px; flex-direction: column; text-align: center; gap: 8px;" onclick="window.painelSwitchTab('andarilho')">
                        <i class="fa-solid fa-location-dot" style="font-size: 24px; color: #fbbf24;"></i>
                        <span style="font-weight: 800;">Virada do Andarilho</span>
                        <span style="font-size: 11px; color: #64748b;">Alterar locais e ciclos</span>
                    </button>
                    <button class="painel-btn-secondary" style="padding: 16px; flex-direction: column; text-align: center; gap: 8px;" onclick="window.painelSwitchTab('cities')">
                        <i class="fa-solid fa-server" style="font-size: 24px; color: #10b981;"></i>
                        <span style="font-weight: 800;">Cidades / Servidores</span>
                        <span style="font-size: 11px; color: #64748b;">Adicionar ou editar</span>
                    </button>
                </div>
            </div>

            <div class="painel-card">
                <div class="painel-card-header">
                    <h3 class="painel-card-title"><i class="fa-solid fa-circle-check" style="color: #10b981;"></i> Status do Hub</h3>
                </div>
                <div style="display: flex; flex-direction: column; gap: 12px; font-size: 13px;">
                    <div style="display: flex; justify-content: space-between; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                        <span style="color: #94a3b8;">Banco de Dados:</span>
                        <span style="color: #10b981; font-weight: 800;">Online (Supabase)</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                        <span style="color: #94a3b8;">Canal Realtime:</span>
                        <span style="color: #10b981; font-weight: 800;">Conectado</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                        <span style="color: #94a3b8;">Superadmin:</span>
                        <span style="color: #ffc046; font-weight: 800;">MALACA7X</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #94a3b8;">URL do Painel:</span>
                        <span style="color: #38bdf8; font-weight: 800; font-family: monospace;">/painel/</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ABA 2: USUÁRIOS
function renderUsersView(container) {
    container.innerHTML = `
        <div class="painel-page-title-area">
            <div>
                <h1 class="painel-page-title">GESTÃO DE USUÁRIOS & ADMINS</h1>
                <p class="painel-page-desc">Controle rigoroso de privilégios, promoções, banimentos e auditoria de perfis.</p>
            </div>
            <div style="display: flex; gap: 12px; align-items: center;">
                <div class="painel-search-box">
                    <i class="fa-solid fa-magnifying-glass" style="color: #64748b;"></i>
                    <input type="text" id="painel-user-search" class="painel-search-input" placeholder="Buscar por nick, nome ou ID Discord..." value="${userSearchFilter}" />
                </div>
                <button class="painel-btn-secondary" onclick="window.painelRefreshData()">
                    <i class="fa-solid fa-rotate"></i>
                </button>
            </div>
        </div>

        <div class="painel-card">
            <div id="painel-users-list-container" class="painel-users-grid">
                <div style="padding: 40px; text-align: center; color: #64748b; grid-column: 1 / -1;">
                    <i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 12px; display: block;"></i>
                    Carregando lista de usuários do Supabase...
                </div>
            </div>
        </div>
    `;

    document.getElementById('painel-user-search')?.addEventListener('input', (e) => {
        userSearchFilter = e.target.value.toLowerCase().trim();
        renderUsersList();
    });

    loadUsersData();
}

async function loadUsersData() {
    try {
        const { data, error } = await supabaseClient.from('profiles').select('*').order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) {
            const deletedList = getDeletedListFromStorage();
            cachedUsers = data.filter(u => {
                const dId = String(u.discord_id || '').trim();
                const uId = String(u.id || '').trim();
                return !deletedList.includes(dId) && !deletedList.includes(uId);
            });
            const badgeUsers = document.getElementById('badge-users-count');
            if (badgeUsers) badgeUsers.textContent = cachedUsers.length;
        }
    } catch (e) {}
    renderUsersList();
}

function renderUsersList() {
    const list = document.getElementById('painel-users-list-container');
    if (!list) return;

    let users = cachedUsers;
    if (userSearchFilter) {
        users = users.filter(u => {
            const name = (u.full_name || '').toLowerCase();
            const uname = (u.username || '').toLowerCase();
            const did = (u.discord_id || '').toLowerCase();
            return name.includes(userSearchFilter) || uname.includes(userSearchFilter) || did.includes(userSearchFilter);
        });
    }

    if (users.length === 0) {
        list.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #64748b; grid-column: 1 / -1;">
                <i class="fa-solid fa-user-slash" style="font-size: 32px; margin-bottom: 12px; display: block; color: #475569;"></i>
                Nenhum usuário encontrado com os termos pesquisados.
            </div>
        `;
        return;
    }

    list.innerHTML = users.map(u => {
        const dId = String(u.discord_id || '').trim();
        const isOwner = DEFAULT_ADMIN_DISCORD_IDS.includes(dId) || DEFAULT_ADMIN_DISCORD_IDS.includes(String(u.id || ''));
        const isAdmin = u.is_admin === true || isOwner;
        const isBanned = checkIsUserBanned(u);

        const safeId = String(u.id || '').replace(/'/g, "\\'");
        const safeDid = String(dId || '').replace(/'/g, "\\'");

        let badgeHtml = '';
        if (isOwner) {
            badgeHtml = `<span class="badge-fundador"><i class="fa-solid fa-crown"></i> FUNDADOR</span>`;
        } else if (isBanned) {
            badgeHtml = `<span class="badge-banido"><i class="fa-solid fa-ban"></i> BANIDO</span>`;
        } else if (isAdmin) {
            badgeHtml = `<span class="badge-admin"><i class="fa-solid fa-shield"></i> ADMIN</span>`;
        } else {
            badgeHtml = `<span class="badge-user">USUÁRIO</span>`;
        }

        return `
            <div class="painel-user-card" id="user-card-${u.id}">
                <div class="painel-user-header">
                    <img src="${u.avatar_url || 'https://cdn.discordapp.com/embed/avatars/0.png'}" class="painel-user-avatar" alt="Avatar" />
                    <div class="painel-user-details">
                        <div class="painel-user-name">
                            <span>${u.full_name || u.username || 'Sem Nome'}</span>
                            ${badgeHtml}
                        </div>
                        <div class="painel-user-username">@${u.username || 'discord_user'}</div>
                        <div class="painel-user-meta">ID Discord: ${dId || '—'}</div>
                    </div>
                </div>

                <div class="painel-user-actions">
                    ${isOwner ? `
                        <button class="btn-action btn-promote" disabled style="opacity: 0.6; cursor: not-allowed; width: 100%;">
                            <i class="fa-solid fa-lock"></i> SUPERADMIN INATO
                        </button>
                    ` : `
                        ${isAdmin ? `
                            <button class="btn-action btn-demote" onclick="window.painelToggleAdmin('${safeId}', '${safeDid}', false)">
                                <i class="fa-solid fa-user-minus"></i> REMOVER ADMIN
                            </button>
                        ` : `
                            <button class="btn-action btn-promote" onclick="window.painelToggleAdmin('${safeId}', '${safeDid}', true)">
                                <i class="fa-solid fa-user-shield"></i> PROMOVER ADMIN
                            </button>
                        `}

                        ${isBanned ? `
                            <button class="btn-action btn-unban" onclick="window.painelToggleBan('${safeId}', '${safeDid}', false)">
                                <i class="fa-solid fa-check"></i> DESBANIR
                            </button>
                        ` : `
                            <button class="btn-action btn-ban" onclick="window.painelToggleBan('${safeId}', '${safeDid}', true)">
                                <i class="fa-solid fa-ban"></i> BANIR
                            </button>
                        `}

                        <button class="btn-delete" title="Excluir Perfil" onclick="window.painelDeleteUser('${safeId}', '${safeDid}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

// Toast flutuante de feedback moderno no painel
function showPainelToast(msg, type = 'success') {
    const existing = document.getElementById('painel-floating-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'painel-floating-toast';
    const bg = type === 'error' ? 'rgba(239, 68, 68, 0.95)' : type === 'warning' ? 'rgba(245, 158, 11, 0.95)' : 'rgba(16, 185, 129, 0.95)';
    const icon = type === 'error' ? 'fa-triangle-exclamation' : type === 'warning' ? 'fa-circle-exclamation' : 'fa-circle-check';
    toast.style.cssText = `position: fixed; top: 24px; left: 50%; transform: translateX(-50%); background: ${bg}; color: #ffffff; padding: 12px 24px; border-radius: 12px; font-weight: 800; font-size: 13px; z-index: 999999; box-shadow: 0 10px 30px rgba(0,0,0,0.5); backdrop-filter: blur(10px); display: flex; align-items: center; gap: 10px; transition: all 0.3s ease;`;
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${msg}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, -10px)';
        setTimeout(() => toast.remove(), 350);
    }, 3500);
}

// AÇÃO: Alternar Permissão de Administrador
window.painelToggleAdmin = async function(userId, discordId, makeAdmin) {
    const cleanDiscordId = (discordId && discordId !== '—' && discordId !== 'undefined') ? String(discordId).trim() : '';
    const cleanUserId = (userId && userId !== 'undefined') ? String(userId).trim() : '';

    if ((cleanDiscordId && DEFAULT_ADMIN_DISCORD_IDS.includes(cleanDiscordId)) || 
        (cleanUserId && DEFAULT_ADMIN_DISCORD_IDS.includes(cleanUserId))) {
        if (!makeAdmin) {
            showPainelToast('O Fundador Superadmin não pode ser rebaixado.', 'warning');
            return;
        }
    }

    try {
        const updateData = { 
            is_admin: makeAdmin, 
            role: makeAdmin ? 'admin' : 'user' 
        };
        if (makeAdmin) {
            updateData.is_banned = false;
        }

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanUserId);

        // 1. Atualizar com segurança no Supabase
        let updateOk = false;
        if (isUuid) {
            const { error: uuidErr } = await supabaseClient.from('profiles').update(updateData).eq('id', cleanUserId);
            if (!uuidErr) updateOk = true;
        }
        if (cleanDiscordId) {
            const { error: dErr } = await supabaseClient.from('profiles').update(updateData).eq('discord_id', cleanDiscordId);
            if (!dErr) updateOk = true;
        }
        if (!updateOk && cleanUserId) {
            await supabaseClient.from('profiles').update(updateData).eq('id', cleanUserId);
        }

        // 2. Atualizar lista de administradores no localStorage
        let customAdmins = JSON.parse(localStorage.getItem('malaca_admin_discord_accounts') || '[]');
        const targetId = cleanDiscordId || cleanUserId;
        if (makeAdmin) {
            if (targetId && !customAdmins.includes(targetId)) customAdmins.push(targetId);
            if (cleanUserId && !customAdmins.includes(cleanUserId)) customAdmins.push(cleanUserId);
        } else {
            customAdmins = customAdmins.filter(d => d !== cleanDiscordId && d !== cleanUserId);
        }
        localStorage.setItem('malaca_admin_discord_accounts', JSON.stringify(customAdmins));

        // Se promovido a admin, remover de banidos locais
        if (makeAdmin) {
            let customBanned = getBannedListFromStorage();
            customBanned = customBanned.filter(d => d !== cleanDiscordId && d !== cleanUserId);
            localStorage.setItem('malaca_banned_discord_accounts', JSON.stringify(customBanned));
        }

        // 3. Atualizar cache local malaca_cached_profiles
        try {
            let cached = JSON.parse(localStorage.getItem('malaca_cached_profiles') || '[]');
            cached = cached.map(u => {
                if (u.id === cleanUserId || (cleanDiscordId && u.discord_id === cleanDiscordId)) {
                    return { 
                        ...u, 
                        is_admin: makeAdmin, 
                        role: makeAdmin ? 'admin' : 'user',
                        ...(makeAdmin ? { is_banned: false } : {})
                    };
                }
                return u;
            });
            localStorage.setItem('malaca_cached_profiles', JSON.stringify(cached));
        } catch(e) {}

        // 4. Se for o próprio perfil logado
        try {
            const myStored = localStorage.getItem('malaca_user_profile');
            if (myStored) {
                const parsed = JSON.parse(myStored);
                if (parsed.id === cleanUserId || (cleanDiscordId && parsed.discord_id === cleanDiscordId)) {
                    parsed.is_admin = makeAdmin;
                    parsed.role = makeAdmin ? 'admin' : 'user';
                    if (makeAdmin) parsed.is_banned = false;
                    localStorage.setItem('malaca_user_profile', JSON.stringify(parsed));
                }
            }
        } catch(e) {}

        // 5. Atualizar cache em memória cachedUsers
        cachedUsers = cachedUsers.map(u => {
            if (u.id === cleanUserId || (cleanDiscordId && u.discord_id === cleanDiscordId)) {
                return { 
                    ...u, 
                    is_admin: makeAdmin, 
                    role: makeAdmin ? 'admin' : 'user',
                    ...(makeAdmin ? { is_banned: false } : {})
                };
            }
            return u;
        });

        // 6. Notificar outras abas/plataforma via broadcast
        try {
            globalHubChannel.send({
                type: 'broadcast',
                event: 'user_permission_updated',
                payload: { userId: cleanUserId, discordId: cleanDiscordId, isAdmin: makeAdmin }
            });
        } catch(e) {}

        renderUsersList();
        showPainelToast(`Usuário ${makeAdmin ? 'PROMOVIDO A ADMINISTRADOR' : 'REMOVIDO DA ADMINISTRAÇÃO'} com sucesso!`);
    } catch (e) {
        showPainelToast('Falha ao atualizar permissões de administrador: ' + (e.message || e), 'error');
    }
};

// AÇÃO: Alternar Banimento
window.painelToggleBan = async function(userId, discordId, makeBanned) {
    const cleanDiscordId = (discordId && discordId !== '—' && discordId !== 'undefined') ? String(discordId).trim() : '';
    const cleanUserId = (userId && userId !== 'undefined') ? String(userId).trim() : '';

    if ((cleanDiscordId && DEFAULT_ADMIN_DISCORD_IDS.includes(cleanDiscordId)) || 
        (cleanUserId && DEFAULT_ADMIN_DISCORD_IDS.includes(cleanUserId))) {
        showPainelToast('O Fundador Superadmin não pode ser banido.', 'warning');
        return;
    }

    const actionText = makeBanned ? 'banir' : 'desbanir';
    if (!confirm(`Tem certeza que deseja ${actionText.toUpperCase()} este usuário?`)) return;

    try {
        const updateData = { 
            is_banned: makeBanned,
            role: makeBanned ? 'banned' : 'user',
            ...(makeBanned ? { is_admin: false } : {})
        };

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanUserId);

        // 1. Atualizar no Supabase com resiliência
        try {
            if (isUuid) {
                const res = await supabaseClient.from('profiles').update(updateData).eq('id', cleanUserId);
                if (res.error && (res.error.message || '').includes('is_banned')) {
                    delete updateData.is_banned;
                    await supabaseClient.from('profiles').update(updateData).eq('id', cleanUserId);
                }
            }
            if (cleanDiscordId) {
                const resD = await supabaseClient.from('profiles').update(updateData).eq('discord_id', cleanDiscordId);
                if (resD.error && (resD.error.message || '').includes('is_banned')) {
                    delete updateData.is_banned;
                    await supabaseClient.from('profiles').update(updateData).eq('discord_id', cleanDiscordId);
                }
            }
        } catch(dbErr) {
            console.warn('Erro ao sincronizar banimento no banco:', dbErr);
        }

        // 2. Atualizar lista permanente de banidos no localStorage
        let customBanned = getBannedListFromStorage();
        if (makeBanned) {
            if (cleanDiscordId && !customBanned.includes(cleanDiscordId)) customBanned.push(cleanDiscordId);
            if (cleanUserId && !customBanned.includes(cleanUserId)) customBanned.push(cleanUserId);
        } else {
            customBanned = customBanned.filter(d => d !== cleanDiscordId && d !== cleanUserId);
        }
        localStorage.setItem('malaca_banned_discord_accounts', JSON.stringify(customBanned));

        // 3. Se banido, remover também da lista de admins locais
        if (makeBanned) {
            let customAdmins = JSON.parse(localStorage.getItem('malaca_admin_discord_accounts') || '[]');
            customAdmins = customAdmins.filter(d => d !== cleanDiscordId && d !== cleanUserId);
            localStorage.setItem('malaca_admin_discord_accounts', JSON.stringify(customAdmins));
        }

        // 4. Atualizar cache de perfis malaca_cached_profiles
        try {
            let cached = JSON.parse(localStorage.getItem('malaca_cached_profiles') || '[]');
            cached = cached.map(u => {
                if (u.id === cleanUserId || (cleanDiscordId && u.discord_id === cleanDiscordId)) {
                    return { 
                        ...u, 
                        is_banned: makeBanned,
                        is_admin: makeBanned ? false : u.is_admin,
                        role: makeBanned ? 'banned' : (u.is_admin ? 'admin' : 'user')
                    };
                }
                return u;
            });
            localStorage.setItem('malaca_cached_profiles', JSON.stringify(cached));
        } catch(e) {}

        // 5. Atualizar perfil da sessão ativa se for o próprio
        try {
            const myStored = localStorage.getItem('malaca_user_profile');
            if (myStored) {
                const parsed = JSON.parse(myStored);
                if (parsed.id === cleanUserId || (cleanDiscordId && parsed.discord_id === cleanDiscordId)) {
                    parsed.is_banned = makeBanned;
                    if (makeBanned) {
                        parsed.is_admin = false;
                        parsed.role = 'banned';
                    }
                    localStorage.setItem('malaca_user_profile', JSON.stringify(parsed));
                }
            }
        } catch(e) {}

        // 6. Atualizar cache em memória cachedUsers
        cachedUsers = cachedUsers.map(u => {
            if (u.id === cleanUserId || (cleanDiscordId && u.discord_id === cleanDiscordId)) {
                return { 
                    ...u, 
                    is_banned: makeBanned,
                    is_admin: makeBanned ? false : u.is_admin,
                    role: makeBanned ? 'banned' : (u.is_admin ? 'admin' : 'user')
                };
            }
            return u;
        });

        // 7. Notificar outras abas/plataforma via broadcast
        try {
            globalHubChannel.send({
                type: 'broadcast',
                event: 'user_ban_updated',
                payload: { userId: cleanUserId, discordId: cleanDiscordId, isBanned: makeBanned }
            });
        } catch(e) {}

        renderUsersList();
        showPainelToast(`Usuário ${makeBanned ? 'BANIDO' : 'DESBANIDO'} com sucesso!`, makeBanned ? 'warning' : 'success');
    } catch (e) {
        showPainelToast('Falha ao alterar banimento: ' + (e.message || e), 'error');
    }
};

// AÇÃO: Excluir Usuário
window.painelDeleteUser = async function(userId, discordId) {
    const cleanDiscordId = (discordId && discordId !== '—' && discordId !== 'undefined') ? String(discordId).trim() : '';
    const cleanUserId = (userId && userId !== 'undefined') ? String(userId).trim() : '';

    if ((cleanDiscordId && DEFAULT_ADMIN_DISCORD_IDS.includes(cleanDiscordId)) ||
        (cleanUserId && DEFAULT_ADMIN_DISCORD_IDS.includes(cleanUserId))) {
        showPainelToast('O Fundador Superadmin não pode ser excluído.', 'warning');
        return;
    }

    if (!confirm('Deseja realmente EXCLUIR este usuário da plataforma? Esta ação é definitiva.')) return;

    try {
        // 1. Grava no tombstone global no Supabase e no cache local
        await markGlobalDeletedAccount(cleanUserId, cleanDiscordId);

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanUserId);

        // 2. Deletar do Supabase profiles com segurança
        let deleteOk = false;
        if (isUuid) {
            const { error: uuidErr } = await supabaseClient.from('profiles').delete().eq('id', cleanUserId);
            if (!uuidErr) deleteOk = true;
        }
        if (cleanDiscordId) {
            const { error: dErr } = await supabaseClient.from('profiles').delete().eq('discord_id', cleanDiscordId);
            if (!dErr) deleteOk = true;
        }
        if (!deleteOk && cleanUserId) {
            await supabaseClient.from('profiles').delete().eq('id', cleanUserId);
        }

        try {
            if (isUuid) await supabaseClient.from('wanderer_confirmations').delete().eq('user_id', cleanUserId);
        } catch(e) {}

        // 3. Limpar de todos os caches locais
        try {
            let cached = JSON.parse(localStorage.getItem('malaca_cached_profiles') || '[]');
            cached = cached.filter(u => u.id !== cleanUserId && u.discord_id !== cleanDiscordId && u.discord_id !== cleanUserId);
            localStorage.setItem('malaca_cached_profiles', JSON.stringify(cached));

            let customAdmins = JSON.parse(localStorage.getItem('malaca_admin_discord_accounts') || '[]');
            customAdmins = customAdmins.filter(d => d !== cleanDiscordId && d !== cleanUserId);
            localStorage.setItem('malaca_admin_discord_accounts', JSON.stringify(customAdmins));

            let customBanned = JSON.parse(localStorage.getItem('malaca_banned_discord_accounts') || '[]');
            customBanned = customBanned.filter(d => d !== cleanDiscordId && d !== cleanUserId);
            localStorage.setItem('malaca_banned_discord_accounts', JSON.stringify(customBanned));

            // Se for o próprio perfil logado nesta sessão
            const myStored = localStorage.getItem('malaca_user_profile');
            if (myStored) {
                const parsed = JSON.parse(myStored);
                if (parsed.id === cleanUserId || parsed.discord_id === cleanDiscordId) {
                    await forceSignOutDeletedSession('Sua conta foi excluída com sucesso.');
                    return;
                }
            }
        } catch(e) {}

        // 4. Atualizar em memória e tela
        cachedUsers = cachedUsers.filter(u => u.id !== cleanUserId && (cleanDiscordId ? u.discord_id !== cleanDiscordId : true));
        const badgeUsers = document.getElementById('badge-users-count');
        if (badgeUsers) badgeUsers.textContent = cachedUsers.length;

        // 5. Notificar via broadcast realtime para desconectar imediatamente em qualquer dispositivo
        try {
            globalHubChannel.send({
                type: 'broadcast',
                event: 'force_user_logout',
                payload: { id: cleanUserId, discordId: cleanDiscordId, timestamp: Date.now() }
            });
            globalHubChannel.send({
                type: 'broadcast',
                event: 'user_deleted',
                payload: { id: cleanUserId, discordId: cleanDiscordId }
            });
            globalHubChannel.send({
                type: 'broadcast',
                event: 'entity_sync',
                payload: { entity: 'profiles', action: 'DELETE', id: cleanUserId, discordId: cleanDiscordId, timestamp: Date.now() }
            });
        } catch(e) {}

        renderUsersList();
        showPainelToast('Usuário excluído com sucesso da plataforma.');
    } catch (e) {
        showPainelToast('Falha ao excluir usuário: ' + (e.message || e), 'error');
    }
};

// ==========================================================================
// ABA 3: ANDARILHO & MAPA — GESTÃO AVANÇADA COM SELETOR DE CIDADE
// ==========================================================================

function getWandererCycleInfo() {
    const now = new Date();
    // Horário oficial de Brasília (UTC-3)
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    const brTime = new Date(utcTime - 3 * 3600000);
    const brHours = brTime.getHours();
    const isMorning = brHours >= 6 && brHours < 18;

    const next = new Date(brTime);
    next.setMinutes(0, 0, 0);
    if (isMorning) {
        next.setHours(18);
    } else {
        if (brHours >= 18) {
            next.setDate(next.getDate() + 1);
        }
        next.setHours(6);
    }

    const diffMs = Math.max(0, next.getTime() - brTime.getTime());
    const diffH = Math.floor(diffMs / 3600000);
    const diffM = Math.floor((diffMs % 3600000) / 60000);
    const diffS = Math.floor((diffMs % 60000) / 1000);

    return {
        isMorning,
        cycleLabel: isMorning ? 'Ciclo da Manhã (06:00 - 18:00)' : 'Ciclo da Noite (18:00 - 06:00)',
        formattedStartTime: isMorning ? '06:00' : '18:00',
        formattedEndTime: isMorning ? '18:00 (Brasília)' : '06:00 (Brasília)',
        formattedTimeLeft: `${String(diffH).padStart(2, '0')}h ${String(diffM).padStart(2, '0')}m ${String(diffS).padStart(2, '0')}s`
    };
}

function getOfficialWandererLocations() {
    return [
        // CDA
        { id: 'cda-and-1', server_id: 'cda-server-uuid', name: 'Andarilho - Grapeseed Norte', category: 'local_possivel', description: 'Possível localização do Andarilho em Grapeseed. Muda de localização a cada 12 horas (06:00 e 18:00).', x: 670, y: 700, color: '#a78bfa', is_active: true, confirmations_count: 0 },
        { id: 'cda-and-2', server_id: 'cda-server-uuid', name: 'Andarilho - Grapeseed Centro', category: 'local_possivel', description: 'Possível localização do Andarilho em Grapeseed Centro. Muda de localização a cada 12 horas (06:00 e 18:00).', x: 520, y: 660, color: '#a78bfa', is_active: true, confirmations_count: 0 },
        { id: 'cda-and-3', server_id: 'cda-server-uuid', name: 'Andarilho - Grapeseed Leste', category: 'local_possivel', description: 'Possível localização do Andarilho em Grapeseed Leste.', x: 593, y: 723, color: '#a78bfa', is_active: true, confirmations_count: 0 },
        { id: 'cda-and-4', server_id: 'cda-server-uuid', name: 'Andarilho - Grapeseed Sul', category: 'local_possivel', description: 'Possível localização do Andarilho em Grapeseed Sul.', x: 570, y: 680, color: '#a78bfa', is_active: true, confirmations_count: 0 },
        { id: 'cda-and-5', server_id: 'cda-server-uuid', name: 'Andarilho - Grapeseed Oeste', category: 'local_possivel', description: 'Possível localização do Andarilho em Grapeseed Oeste.', x: 568, y: 679, color: '#a78bfa', is_active: true, confirmations_count: 0 },
        { id: 'cda-and-6', server_id: 'cda-server-uuid', name: 'Andarilho - Bennys', category: 'local_possivel', description: 'Possível localização do Andarilho próximo à oficina Bennys.', x: 433, y: 214, color: '#a78bfa', is_active: true, confirmations_count: 0 },
        { id: 'cda-and-7', server_id: 'cda-server-uuid', name: 'Andarilho - Bennys Pátio', category: 'local_possivel', description: 'Possível localização do Andarilho no pátio próximo à Bennys.', x: 535, y: 187, color: '#a78bfa', is_active: true, confirmations_count: 0 },
        { id: 'cda-and-8', server_id: 'cda-server-uuid', name: 'Andarilho - Porto Mecânica', category: 'local_possivel', description: 'Possível localização do Andarilho na Mecânica do Porto.', x: 483, y: 64, color: '#a78bfa', is_active: true, confirmations_count: 0 },
        { id: 'cda-and-9', server_id: 'cda-server-uuid', name: 'Andarilho - Porto Galpão', category: 'local_possivel', description: 'Possível localização do Andarilho nos galpões do Porto.', x: 456, y: 109, color: '#a78bfa', is_active: true, confirmations_count: 0 },
        { id: 'cda-and-10', server_id: 'cda-server-uuid', name: 'Andarilho - Praia Calçadão', category: 'local_possivel', description: 'Possível localização do Andarilho na Praia.', x: 345, y: 244, color: '#a78bfa', is_active: true, confirmations_count: 0 },
        { id: 'cda-and-11', server_id: 'cda-server-uuid', name: 'Andarilho - Praia Construção', category: 'local_possivel', description: 'Dentro de uma construção ao lado da lixeira, cercado de madeira.', x: 333, y: 238, color: '#a78bfa', is_active: true, confirmations_count: 0 },
        { id: 'cda-and-12', server_id: 'cda-server-uuid', name: 'Andarilho - Praia Pier', category: 'local_possivel', description: 'Possível localização do Andarilho na Praia próximo ao Pier.', x: 413, y: 188, color: '#a78bfa', is_active: true, confirmations_count: 0 },
        { id: 'cda-and-13', server_id: 'cda-server-uuid', name: 'Andarilho - Paleto Galinheiro', category: 'local_possivel', description: 'Possível localização do Andarilho em Paleto Galinheiro.', x: 448, y: 823, color: '#a78bfa', is_active: true, confirmations_count: 0 },
        { id: 'cda-and-14', server_id: 'cda-server-uuid', name: 'Andarilho - Paleto Leste', category: 'local_possivel', description: 'Possível localização do Andarilho em Paleto Leste.', x: 578, y: 836, color: '#a78bfa', is_active: true, confirmations_count: 0 },
        { id: 'cda-and-15', server_id: 'cda-server-uuid', name: 'Andarilho - Paleto Norte', category: 'local_possivel', description: 'Possível localização do Andarilho em Paleto Norte.', x: 440, y: 840, color: '#a78bfa', is_active: true, confirmations_count: 0 },
        // VALLEY
        { id: 'val-and-1', server_id: 'valley-server-uuid', name: 'Andarilho - Valley Grapeseed Norte', category: 'local_possivel', description: 'Possível localização do Andarilho no servidor Valley GG.', x: 670, y: 700, color: '#a78bfa', is_active: true, confirmations_count: 0 },
        { id: 'val-and-2', server_id: 'valley-server-uuid', name: 'Andarilho - Valley Centro', category: 'local_possivel', description: 'Possível localização do Andarilho no servidor Valley GG.', x: 520, y: 660, color: '#a78bfa', is_active: true, confirmations_count: 0 },
        { id: 'val-and-3', server_id: 'valley-server-uuid', name: 'Andarilho - Valley Bennys', category: 'local_possivel', description: 'Possível localização do Andarilho próximo à Bennys no Valley.', x: 433, y: 214, color: '#a78bfa', is_active: true, confirmations_count: 0 },
        { id: 'val-and-4', server_id: 'valley-server-uuid', name: 'Andarilho - Valley Praia', category: 'local_possivel', description: 'Possível localização do Andarilho na orla da praia Valley.', x: 345, y: 244, color: '#a78bfa', is_active: true, confirmations_count: 0 },
        { id: 'val-and-5', server_id: 'valley-server-uuid', name: 'Andarilho - Valley Paleto', category: 'local_possivel', description: 'Possível localização do Andarilho em Paleto Bay no Valley.', x: 448, y: 823, color: '#a78bfa', is_active: true, confirmations_count: 0 },
        // LOS SANTOS
        { id: 'ls-and-1', server_id: 'los-santos-server-uuid', name: 'Andarilho - Los Santos Legion Square', category: 'local_possivel', description: 'Localização do Andarilho em Los Santos RP.', x: 440, y: 550, color: '#a78bfa', is_active: true, confirmations_count: 0 },
        { id: 'ls-and-2', server_id: 'los-santos-server-uuid', name: 'Andarilho - Los Santos Pier', category: 'local_possivel', description: 'Localização do Andarilho no Del Perro Pier.', x: 350, y: 230, color: '#a78bfa', is_active: true, confirmations_count: 0 }
    ];
}

async function loadWandererLocations() {
    try {
        const { data: dbLocs } = await supabaseClient
            .from('map_locations')
            .select('*')
            .in('category', ['andarilho', 'local_possivel'])
            .order('created_at', { ascending: false });

        let locs = [];
        if (dbLocs && dbLocs.length > 0) {
            locs = dbLocs;
        }

        const defaults = getOfficialWandererLocations();
        let custom = [];
        try {
            custom = JSON.parse(localStorage.getItem('malaca_custom_locations') || '[]');
        } catch(e) {}

        const map = new Map();
        defaults.forEach(l => map.set(l.id, l));
        custom.filter(l => l.category === 'andarilho' || l.category === 'local_possivel').forEach(l => map.set(l.id, l));
        locs.forEach(l => map.set(l.id, { ...map.get(l.id), ...l }));

        cachedWandererLocations = Array.from(map.values());

        const badge = document.getElementById('badge-wanderer-count');
        if (badge) badge.textContent = cachedWandererLocations.length;
    } catch (e) {
        console.warn('Erro ao carregar locais do Andarilho:', e);
    }
}

function getCityMeta(serverId) {
    const sId = String(serverId || '').toLowerCase();
    if (sId.includes('cda') || sId === 'cda-server-uuid') return { name: 'Cidade Alta (CDA)', slug: 'cda', color: '#00d2ff' };
    if (sId.includes('valley') || sId === 'valley-server-uuid') return { name: 'Valley RP', slug: 'valley', color: '#10b981' };
    if (sId.includes('los-santos') || sId.includes('santos') || sId === 'los-santos-server-uuid') return { name: 'Los Santos', slug: 'los-santos', color: '#fbbf24' };
    const found = cachedServers.find(s => s.id === serverId || s.slug === serverId);
    if (found) return { name: found.name, slug: found.slug, color: '#a855f7' };
    return { name: 'Cidade RP', slug: 'cda', color: '#00d2ff' };
}

function renderWandererView(container) {
    const cycle = getWandererCycleInfo();
    const servers = cachedServers.length > 0 ? cachedServers : [
        { id: 'cda-server-uuid', slug: 'cda', name: 'Cidade Alta (CDA)' },
        { id: 'valley-server-uuid', slug: 'valley', name: 'Valley GG' },
        { id: 'los-santos-server-uuid', slug: 'los-santos', name: 'Los Santos RP' }
    ];

    const totalVotes = cachedWandererLocations.reduce((acc, l) => acc + (l.confirmations_count || 0), 0);

    // Contagem por cidade para as pills
    const countAll = cachedWandererLocations.length;
    const countCda = cachedWandererLocations.filter(l => String(l.server_id).includes('cda')).length;
    const countValley = cachedWandererLocations.filter(l => String(l.server_id).includes('valley')).length;
    const countLS = cachedWandererLocations.filter(l => String(l.server_id).includes('santos') || String(l.server_id).includes('ls')).length;

    // Filtragem ativa
    const filteredLocations = cachedWandererLocations.filter(l => {
        let matchCity = true;
        if (selectedWandererCity !== 'all') {
            const sId = String(l.server_id).toLowerCase();
            const filterId = String(selectedWandererCity).toLowerCase();
            matchCity = sId === filterId || sId.includes(filterId) || (filterId.includes('cda') && sId.includes('cda')) || (filterId.includes('valley') && sId.includes('valley')) || (filterId.includes('santos') && sId.includes('santos'));
        }
        let matchText = true;
        if (wandererSearchFilter) {
            const q = wandererSearchFilter.toLowerCase();
            matchText = (l.name && l.name.toLowerCase().includes(q)) || (l.description && l.description.toLowerCase().includes(q));
        }
        return matchCity && matchText;
    });

    const editingLoc = editingWandererId ? cachedWandererLocations.find(l => l.id === editingWandererId) : null;

    container.innerHTML = `
        <div class="painel-page-title-area">
            <div>
                <h1 class="painel-page-title">GESTÃO DE ANDARILHOS & VIRADA</h1>
                <p class="painel-page-desc">Controle em tempo real de ciclos diários, horários de virada, marcações e confirmações por cidade.</p>
            </div>
            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                <button class="painel-btn-secondary" onclick="window.painelResetWandererCycle()" title="Zerar votos e sincronizar virada com todos os usuários">
                    <i class="fa-solid fa-clock-rotate-left" style="color: #fbbf24;"></i> <span>Zerar Votos / Virada</span>
                </button>
                <button class="painel-btn-secondary" onclick="window.painelRefreshWandererData()">
                    <i class="fa-solid fa-rotate"></i> <span>Atualizar</span>
                </button>
            </div>
        </div>

        <!-- SELETOR PROMINENTE DE CIDADE (PILLS COM CONTADORES) -->
        <div style="margin-bottom: 20px;">
            <div style="font-size: 11px; font-weight: 800; color: #00d2ff; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                <i class="fa-solid fa-location-crosshairs"></i> SELECIONE A CIDADE PARA GESTÃO:
            </div>
            <div class="painel-city-selector">
                <button class="painel-city-btn ${selectedWandererCity === 'all' ? 'active' : ''}" onclick="window.painelSelectWandererCity('all')">
                    <i class="fa-solid fa-globe"></i> Todas as Cidades <span class="painel-city-badge">${countAll}</span>
                </button>
                <button class="painel-city-btn ${selectedWandererCity.includes('cda') ? 'active' : ''}" onclick="window.painelSelectWandererCity('cda-server-uuid')">
                    <i class="fa-solid fa-city"></i> Cidade Alta (CDA) <span class="painel-city-badge">${countCda}</span>
                </button>
                <button class="painel-city-btn ${selectedWandererCity.includes('valley') ? 'active' : ''}" onclick="window.painelSelectWandererCity('valley-server-uuid')">
                    <i class="fa-solid fa-mountain"></i> Valley RP <span class="painel-city-badge">${countValley}</span>
                </button>
                <button class="painel-city-btn ${selectedWandererCity.includes('santos') || selectedWandererCity.includes('ls') ? 'active' : ''}" onclick="window.painelSelectWandererCity('los-santos-server-uuid')">
                    <i class="fa-solid fa-building"></i> Los Santos RP <span class="painel-city-badge">${countLS}</span>
                </button>
            </div>
        </div>

        <!-- HERO BANNER: CICLO VIGENTE & AUTOMATIZAÇÃO -->
        <div class="painel-wanderer-hero">
            <div class="painel-wanderer-hero-header">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 36px; height: 36px; border-radius: 10px; background: rgba(0,210,255,0.2); border: 1px solid rgba(0,210,255,0.5); display: flex; align-items: center; justify-content: center; color: #00d2ff; font-size: 16px;">
                        <i class="fa-solid fa-clock"></i>
                    </div>
                    <div>
                        <h3 style="font-family: var(--font-heading); color: #fff; font-size: 1.15rem; margin: 0;">${cycle.cycleLabel}</h3>
                        <span style="font-size: 11px; color: #38bdf8; font-weight: 700;">Virada Automática às 06:00 e 18:00 (Horário de Brasília)</span>
                    </div>
                </div>
                <div style="display: flex; gap: 8px;">
                    <a href="/cidades/cda/mapa/" target="_blank" class="painel-btn-secondary" style="font-size: 11px; padding: 6px 12px;">
                        <i class="fa-solid fa-map"></i> Mapa CDA
                    </a>
                    <a href="/cidades/valley/mapa/" target="_blank" class="painel-btn-secondary" style="font-size: 11px; padding: 6px 12px;">
                        <i class="fa-solid fa-map"></i> Mapa Valley
                    </a>
                </div>
            </div>

            <div class="painel-cycle-stats-row">
                <div class="painel-cycle-stat-box">
                    <div class="painel-cycle-stat-title"><i class="fa-solid fa-hourglass-start" style="color: #00d2ff;"></i> Próxima Virada Em</div>
                    <div class="painel-cycle-stat-number" style="color: #38bdf8;">${cycle.formattedTimeLeft}</div>
                    <div class="painel-cycle-stat-hint">Auto-reset programado às ${cycle.formattedEndTime}</div>
                </div>

                <div class="painel-cycle-stat-box">
                    <div class="painel-cycle-stat-title"><i class="fa-solid fa-check-to-slot" style="color: #10b981;"></i> Votos Registrados no Ciclo</div>
                    <div class="painel-cycle-stat-number" style="color: #10b981;">${totalVotes} votos</div>
                    <div class="painel-cycle-stat-hint">Confirmados pela comunidade em tempo real</div>
                </div>

                <div class="painel-cycle-stat-box">
                    <div class="painel-cycle-stat-title"><i class="fa-solid fa-map-pin" style="color: #ffc046;"></i> Marcações Ativas</div>
                    <div class="painel-cycle-stat-number" style="color: #ffc046;">${cachedWandererLocations.filter(l => (l.confirmations_count || 0) >= 1).length} pontos</div>
                    <div class="painel-cycle-stat-hint">Visíveis para jogadores no mapa interativo</div>
                </div>
            </div>
        </div>

        <!-- FORMULÁRIO DE CRIAÇÃO / EDIÇÃO DE MARCAÇÃO -->
        <div class="painel-card" id="painel-wanderer-form-card" style="border-color: rgba(0,210,255,0.35);">
            <div class="painel-card-header">
                <h3 class="painel-card-title">
                    <i class="fa-solid ${editingLoc ? 'fa-pen-to-square' : 'fa-compass'}" style="color: #00d2ff;"></i>
                    ${editingLoc ? `Editar Marcação: "${editingLoc.name}"` : 'Cadastrar Nova Marcação do Andarilho'}
                </h3>
                ${editingLoc ? `
                    <button class="painel-btn-secondary" onclick="window.painelCancelEditWanderer()" style="color: #ef4444; border-color: rgba(239,68,68,0.3);">
                        <i class="fa-solid fa-xmark"></i> Cancelar Edição
                    </button>
                ` : ''}
            </div>

            <form id="painel-wanderer-form" onsubmit="window.painelSaveWandererLocation(event)">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-bottom: 14px;">
                    <div>
                        <label style="font-size: 11px; font-weight: 800; color: #94a3b8; display: block; margin-bottom: 6px; text-transform: uppercase;">
                            Nome / Identificador *
                        </label>
                        <input type="text" id="w-form-name" required placeholder="Ex: Andarilho - Paleto Bay Galinheiro" value="${editingLoc ? editingLoc.name : ''}" style="width: 100%; padding: 10px 14px; background: rgba(0,0,0,0.6); border: 1px solid rgba(0,210,255,0.25); border-radius: 10px; color: #fff; font-size: 13px; outline: none;" />
                    </div>

                    <div>
                        <label style="font-size: 11px; font-weight: 800; color: #94a3b8; display: block; margin-bottom: 6px; text-transform: uppercase;">
                            Cidade / Servidor *
                        </label>
                        <select id="w-form-city" style="width: 100%; padding: 10px 14px; background: rgba(0,0,0,0.6); border: 1px solid rgba(0,210,255,0.25); border-radius: 10px; color: #fff; font-size: 13px; outline: none;">
                            ${servers.map(s => {
                                const selected = editingLoc ? (editingLoc.server_id === s.id || editingLoc.server_id === s.slug) : (selectedWandererCity !== 'all' ? (selectedWandererCity === s.id || selectedWandererCity.includes(s.slug)) : s.slug === 'cda');
                                return `<option value="${s.id}" ${selected ? 'selected' : ''}>${s.name}</option>`;
                            }).join('')}
                        </select>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                        <div>
                            <label style="font-size: 11px; font-weight: 800; color: #94a3b8; display: block; margin-bottom: 6px; text-transform: uppercase;">Coord. X *</label>
                            <input type="number" step="0.1" id="w-form-x" required placeholder="ex: 448.2" value="${editingLoc ? editingLoc.x : ''}" style="width: 100%; padding: 10px 12px; background: rgba(0,0,0,0.6); border: 1px solid rgba(0,210,255,0.25); border-radius: 10px; color: #fff; font-size: 13px; outline: none;" />
                        </div>
                        <div>
                            <label style="font-size: 11px; font-weight: 800; color: #94a3b8; display: block; margin-bottom: 6px; text-transform: uppercase;">Coord. Y *</label>
                            <input type="number" step="0.1" id="w-form-y" required placeholder="ex: 823.5" value="${editingLoc ? editingLoc.y : ''}" style="width: 100%; padding: 10px 12px; background: rgba(0,0,0,0.6); border: 1px solid rgba(0,210,255,0.25); border-radius: 10px; color: #fff; font-size: 13px; outline: none;" />
                        </div>
                    </div>
                </div>

                <div style="margin-bottom: 16px;">
                    <label style="font-size: 11px; font-weight: 800; color: #94a3b8; display: block; margin-bottom: 6px; text-transform: uppercase;">
                        Dica / Pista do Andarilho (Exibida no balão do mapa para jogadores)
                    </label>
                    <input type="text" id="w-form-hint" placeholder="Ex: Atrás da cerca de madeira ao lado do galinheiro abandonado em Paleto Bay." value="${editingLoc ? (editingLoc.description || '') : ''}" style="width: 100%; padding: 10px 14px; background: rgba(0,0,0,0.6); border: 1px solid rgba(0,210,255,0.25); border-radius: 10px; color: #fff; font-size: 13px; outline: none;" />
                </div>

                <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                    <button type="submit" class="btn-gate-primary" style="width: auto; padding: 10px 24px; font-size: 12px; border: none; background: linear-gradient(135deg, #00d2ff, #2563eb);">
                        <i class="fa-solid ${editingLoc ? 'fa-check' : 'fa-plus'}"></i>
                        ${editingLoc ? 'SALVAR ALTERAÇÕES DA MARCAÇÃO' : 'CADASTRAR MARCAÇÃO NO MAPA'}
                    </button>
                    ${editingLoc ? `
                        <button type="button" class="painel-btn-secondary" onclick="window.painelCancelEditWanderer()">
                            Cancelar
                        </button>
                    ` : ''}
                </div>
            </form>
        </div>

        <!-- LISTA E GERENCIAMENTO DE MARCAÇÕES -->
        <div style="margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 10px; flex: 1; max-width: 420px;">
                <div class="painel-search-box" style="width: 100%;">
                    <i class="fa-solid fa-magnifying-glass" style="color: #64748b;"></i>
                    <input type="text" class="painel-search-input" placeholder="Filtrar por nome ou dica..." value="${wandererSearchFilter}" oninput="window.painelFilterWanderer(this.value)" />
                </div>
            </div>

            <div style="font-size: 12px; color: #94a3b8; font-weight: 700;">
                Exibindo <strong style="color: #00d2ff;">${filteredLocations.length}</strong> de <strong>${cachedWandererLocations.length}</strong> marcações
            </div>
        </div>

        <div class="painel-wanderer-grid">
            ${filteredLocations.length === 0 ? `
                <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: #64748b; background: rgba(10,16,32,0.5); border-radius: 16px; border: 1px dashed rgba(255,255,255,0.1);">
                    <i class="fa-solid fa-location-dot" style="font-size: 2rem; color: #00d2ff; margin-bottom: 12px; display: block;"></i>
                    Nenhuma marcação do Andarilho encontrada com os filtros selecionados.
                </div>
            ` : filteredLocations.map(loc => {
                const meta = getCityMeta(loc.server_id);
                const isConfirmed = (loc.confirmations_count || 0) >= 1;

                return `
                    <div class="painel-wanderer-card ${isConfirmed ? 'active-cycle' : ''}" id="w-card-${loc.id}">
                        <div>
                            <div class="painel-wanderer-card-header">
                                <span class="painel-wanderer-city-tag" style="border-color: ${meta.color}; color: ${meta.color}; background: rgba(0,210,255,0.1);">
                                    ${meta.name}
                                </span>
                                <span class="painel-wanderer-coords">
                                    X: ${loc.x} | Y: ${loc.y}
                                </span>
                            </div>

                            <div style="margin: 10px 0 6px 0;">
                                <div class="painel-wanderer-title">${loc.name}</div>
                            </div>

                            ${loc.description ? `
                                <div class="painel-wanderer-hint">
                                    <strong style="color: #e2e8f0;">💡 Dica:</strong> ${loc.description}
                                </div>
                            ` : ''}

                            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 10px; font-size: 11px;">
                                <span style="font-weight: 800; color: ${isConfirmed ? '#10b981' : '#94a3b8'};">
                                    <i class="fa-solid fa-users" style="font-size: 10px;"></i> Votos no Ciclo: ${loc.confirmations_count || 0}
                                </span>
                                ${isConfirmed ? `
                                    <span style="color: #10b981; font-weight: 900; display: inline-flex; align-items: center; gap: 4px;">
                                        <i class="fa-solid fa-circle-check"></i> ATIVO NO CICLO
                                    </span>
                                ` : `
                                    <span style="color: #64748b; font-weight: 700;">
                                        Ponto Sugerido
                                    </span>
                                `}
                            </div>
                        </div>

                        <div class="painel-wanderer-actions">
                            <button class="btn-wanderer-confirm ${isConfirmed ? 'is-active' : ''}" onclick="window.painelSetActiveWanderer('${loc.id}')" title="Marcar como localização oficial do Andarilho neste ciclo">
                                <i class="fa-solid fa-check-double"></i> ${isConfirmed ? 'Confirmado' : 'Ativar no Ciclo'}
                            </button>

                            <div style="display: flex; gap: 6px; align-items: center;">
                                <button class="btn-action" onclick="window.painelEditWanderer('${loc.id}')" title="Editar Marcação" style="padding: 7px 10px;">
                                    <i class="fa-solid fa-pen-to-square"></i>
                                </button>
                                <button class="btn-delete" onclick="window.painelDeleteWanderer('${loc.id}', '${loc.name.replace(/'/g, "\\'")}')" title="Excluir Marcação" style="padding: 7px 10px;">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Window Handlers para ações do Andarilho no Painel
window.painelSelectWandererCity = function(cityId) {
    selectedWandererCity = cityId;
    const container = document.getElementById('painel-tab-content');
    if (container) renderWandererView(container);
};

window.painelFilterWanderer = function(text) {
    wandererSearchFilter = text.trim();
    const container = document.getElementById('painel-tab-content');
    if (container) renderWandererView(container);
};

window.painelRefreshWandererData = async function() {
    showPainelToast('Atualizando dados do Andarilho...');
    await loadWandererLocations();
    const container = document.getElementById('painel-tab-content');
    if (container) renderWandererView(container);
    showPainelToast('Dados do Andarilho sincronizados com sucesso!');
};

window.painelEditWanderer = function(locId) {
    editingWandererId = locId;
    const container = document.getElementById('painel-tab-content');
    if (container) renderWandererView(container);
    document.getElementById('painel-wanderer-form-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

window.painelCancelEditWanderer = function() {
    editingWandererId = null;
    const container = document.getElementById('painel-tab-content');
    if (container) renderWandererView(container);
};

window.painelSaveWandererLocation = async function(e) {
    e.preventDefault();
    const name = document.getElementById('w-form-name')?.value.trim();
    const server_id = document.getElementById('w-form-city')?.value;
    const x = parseFloat(document.getElementById('w-form-x')?.value);
    const y = parseFloat(document.getElementById('w-form-y')?.value);
    const hint = document.getElementById('w-form-hint')?.value.trim();

    if (!name || isNaN(x) || isNaN(y)) {
        showPainelToast('Preencha os campos obrigatórios corretamente.', 'warning');
        return;
    }

    try {
        if (editingWandererId) {
            // Atualização
            const updates = {
                name,
                server_id,
                x,
                y,
                description: hint,
                category: 'andarilho',
                is_active: true
            };

            await supabaseClient.from('map_locations').update(updates).eq('id', editingWandererId);

            // Atualiza cache local
            cachedWandererLocations = cachedWandererLocations.map(l => l.id === editingWandererId ? { ...l, ...updates } : l);
            try {
                let custom = JSON.parse(localStorage.getItem('malaca_custom_locations') || '[]');
                custom = custom.map(l => l.id === editingWandererId ? { ...l, ...updates } : l);
                localStorage.setItem('malaca_custom_locations', JSON.stringify(custom));
            } catch(e) {}

            globalHubChannel.send({
                type: 'broadcast',
                event: 'entity_sync',
                payload: { entity: 'map_locations', action: 'UPDATE', data: { id: editingWandererId, ...updates } }
            });

            editingWandererId = null;
            showPainelToast(`Marcação "${name}" atualizada com sucesso!`);
        } else {
            // Criação
            const newPoint = {
                id: 'and-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
                name,
                server_id,
                category: 'andarilho',
                description: hint,
                x,
                y,
                color: '#a78bfa',
                is_active: true,
                confirmations_count: 0,
                created_at: new Date().toISOString()
            };

            const { data } = await supabaseClient.from('map_locations').insert([newPoint]).select().maybeSingle();
            const savedPoint = data || newPoint;

            cachedWandererLocations.unshift(savedPoint);

            try {
                let custom = JSON.parse(localStorage.getItem('malaca_custom_locations') || '[]');
                custom.unshift(savedPoint);
                localStorage.setItem('malaca_custom_locations', JSON.stringify(custom));
            } catch(e) {}

            globalHubChannel.send({
                type: 'broadcast',
                event: 'entity_sync',
                payload: { entity: 'map_locations', action: 'INSERT', data: savedPoint }
            });

            showPainelToast(`Marcação "${name}" adicionada ao mapa com sucesso!`);
        }

        const container = document.getElementById('painel-tab-content');
        if (container) renderWandererView(container);
    } catch (err) {
        showPainelToast('Falha ao salvar marcação: ' + (err.message || err), 'error');
    }
};

window.painelSetActiveWanderer = async function(locId) {
    const loc = cachedWandererLocations.find(l => l.id === locId);
    if (!loc) return;

    try {
        const newCount = 5; // Define confirmação oficial de admin
        await supabaseClient.from('map_locations').update({ confirmations_count: newCount, is_active: true }).eq('id', locId);

        loc.confirmations_count = newCount;

        // Atualiza cache local
        try {
            let custom = JSON.parse(localStorage.getItem('malaca_custom_locations') || '[]');
            custom = custom.map(l => l.id === locId ? { ...l, confirmations_count: newCount } : l);
            localStorage.setItem('malaca_custom_locations', JSON.stringify(custom));
        } catch(e) {}

        // Broadcast Realtime instantâneo para todos os mapas abertos
        globalHubChannel.send({
            type: 'broadcast',
            event: 'wanderer_confirmed',
            payload: { locationId: locId, serverId: loc.server_id, timestamp: Date.now() }
        });
        globalHubChannel.send({
            type: 'broadcast',
            event: 'entity_sync',
            payload: { entity: 'map_locations', action: 'UPDATE', data: { id: locId, confirmations_count: newCount } }
        });

        const container = document.getElementById('painel-tab-content');
        if (container) renderWandererView(container);

        showPainelToast(`Marcação "${loc.name}" ATIVADA como localização oficial do Andarilho neste ciclo!`);
    } catch (err) {
        showPainelToast('Erro ao ativar marcação: ' + (err.message || err), 'error');
    }
};

window.painelDeleteWanderer = async function(locId, locName) {
    if (!confirm(`Deseja realmente remover a marcação "${locName}" do Andarilho?`)) return;

    try {
        await supabaseClient.from('map_locations').delete().eq('id', locId);

        cachedWandererLocations = cachedWandererLocations.filter(l => l.id !== locId);

        try {
            let custom = JSON.parse(localStorage.getItem('malaca_custom_locations') || '[]');
            custom = custom.filter(l => l.id !== locId);
            localStorage.setItem('malaca_custom_locations', JSON.stringify(custom));
        } catch(e) {}

        globalHubChannel.send({
            type: 'broadcast',
            event: 'entity_sync',
            payload: { entity: 'map_locations', action: 'DELETE', id: locId }
        });

        const container = document.getElementById('painel-tab-content');
        if (container) renderWandererView(container);

        showPainelToast(`Marcação "${locName}" excluída com sucesso!`);
    } catch (err) {
        showPainelToast('Falha ao excluir marcação: ' + (err.message || err), 'error');
    }
};

window.painelResetWandererCycle = async function() {
    if (!confirm('Deseja realmente ZERAR todos os votos do ciclo do Andarilho e forçar uma virada imediata para todos os jogadores?')) return;

    try {
        // Zera contagens no banco
        await supabaseClient.from('map_locations').update({ confirmations_count: 0 }).in('category', ['andarilho', 'local_possivel']);
        
        try {
            await supabaseClient.from('wanderer_confirmations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        } catch(e) {}

        cachedWandererLocations.forEach(l => l.confirmations_count = 0);

        try {
            let custom = JSON.parse(localStorage.getItem('malaca_custom_locations') || '[]');
            custom = custom.map(l => ({ ...l, confirmations_count: 0 }));
            localStorage.setItem('malaca_custom_locations', JSON.stringify(custom));
        } catch(e) {}

        // Broadcast Realtime de Reset do Ciclo
        globalHubChannel.send({
            type: 'broadcast',
            event: 'wanderer_cycle_reset',
            payload: { timestamp: Date.now() }
        });

        const container = document.getElementById('painel-tab-content');
        if (container) renderWandererView(container);

        showPainelToast('Ciclo do Andarilho reiniciado com sucesso! Todos os votos foram zerados.');
    } catch (err) {
        showPainelToast('Erro ao zerar ciclo: ' + (err.message || err), 'error');
    }
};

window.painelTriggerCycleChange = function() {
    window.painelResetWandererCycle();
};

// ABA 4: CIDADES / SERVIDORES
function renderCitiesView(container) {
    const servers = cachedServers.length > 0 ? cachedServers : [
        { id: 'cda-server-uuid', slug: 'cda', name: 'CIDADE ALTA RP (CDA)', subtitle: 'SERVIDORES OFICIAIS', description: 'Mapa Interativo em tempo real para os servidores CDA e VALLEY com virada do Andarilho, além de Lockpick, Caixinha e Hacking.' },
        { id: 'valley-server-uuid', slug: 'valley', name: 'VALLEY RP', subtitle: 'SERVIDOR VALLEY GG', description: 'Mapa completo e ferramentas dedicadas para a comunidade do servidor Valley GG.' },
        { id: 'ls-server-uuid', slug: 'los-santos', name: 'LOS SANTOS ROLEPLAY', subtitle: 'SERVIDOR MULTI-CIDADE', description: 'Hub de simuladores e mapas para servidores tradicionais de Los Santos.' }
    ];

    container.innerHTML = `
        <div class="painel-page-title-area">
            <div>
                <h1 class="painel-page-title">CIDADES & SERVIDORES</h1>
                <p class="painel-page-desc">Gerenciamento dos servidores integrados ao ecossistema Malaca System GTARP.</p>
            </div>
        </div>

        <div class="painel-users-grid">
            ${servers.map(s => `
                <div class="painel-card" style="margin-bottom: 0;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                        <span class="badge-admin" style="font-family: monospace;">/${s.slug}/</span>
                        <span style="font-size: 10px; color: #10b981; font-weight: 800;"><i class="fa-solid fa-circle" style="font-size: 8px;"></i> ATIVO</span>
                    </div>
                    <h3 style="font-family: var(--font-heading); font-size: 1.15rem; color: #fff; margin-bottom: 4px;">${s.name}</h3>
                    <p style="color: #ffc046; font-size: 11px; font-weight: 700; margin-bottom: 12px;">${s.subtitle || 'SERVIDOR RP'}</p>
                    <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin-bottom: 16px;">${s.description || 'Sem descrição cadastrada.'}</p>
                    <div style="display: flex; gap: 8px;">
                        <a href="/cidades/${s.slug}/" target="_blank" class="painel-btn-secondary" style="flex: 1; justify-content: center;">
                            <i class="fa-solid fa-arrow-up-right-from-square"></i> Acessar Cidade
                        </a>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ABA 5: SISTEMAS & MINIJOGOS
function renderSystemsView(container) {
    const systems = [
        { id: 'sys-mapa', name: 'MAPA INTERATIVO RP', desc: 'Rastreamento colaborativo em tempo real de hospitais, desmanches, mercado ilegal e virada do Andarilho.', url: '/cidades/cda/mapa/' },
        { id: 'sys-lockpick', name: 'LOCKPICK SIMULATOR', desc: 'Simulador de arrombamento de veículos e portas com sistema de 32 pinos mecânicos.', url: '/cidades/cda/lockpick/' },
        { id: 'sys-caixinha', name: 'CAIXINHA ELETRÔNICO', desc: 'Minijogo de reflexos e velocidade de digitação para arrombamento de caixas registradoras.', url: '/cidades/cda/caixinha/' },
        { id: 'sys-hacking', name: 'HACKING DEVICE', desc: 'Decodificador de segurança cibernética estilo Cayo Perico com matriz de sequências numéricas.', url: '/cidades/cda/hacking/' }
    ];

    container.innerHTML = `
        <div class="painel-page-title-area">
            <div>
                <h1 class="painel-page-title">SISTEMAS & MINIJOGOS</h1>
                <p class="painel-page-desc">Módulos de simulação e treinamento para a comunidade de GTA Roleplay.</p>
            </div>
        </div>

        <div class="painel-users-grid">
            ${systems.map(sys => `
                <div class="painel-card" style="margin-bottom: 0;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                        <span class="badge-admin">MÓDULO ATIVO</span>
                        <span style="font-size: 11px; color: #ffc046; font-weight: 800;">5.0 ⭐</span>
                    </div>
                    <h3 style="font-family: var(--font-heading); font-size: 1.15rem; color: #fff; margin-bottom: 8px;">${sys.name}</h3>
                    <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin-bottom: 16px;">${sys.desc}</p>
                    <a href="${sys.url}" target="_blank" class="painel-btn-secondary" style="width: 100%; justify-content: center;">
                        <i class="fa-solid fa-play"></i> Testar Sistema
                    </a>
                </div>
            `).join('')}
        </div>
    `;
}

// ABA 6: CONFIGURAÇÕES GLOBAIS
function renderSettingsView(container) {
    container.innerHTML = `
        <div class="painel-page-title-area">
            <div>
                <h1 class="painel-page-title">CONFIGURAÇÕES GLOBAIS</h1>
                <p class="painel-page-desc">Parâmetros de infraestrutura, sincronização de dados e manutenção.</p>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
            <div class="painel-card">
                <div class="painel-card-header">
                    <h3 class="painel-card-title"><i class="fa-solid fa-broom" style="color: #00d2ff;"></i> Manutenção de Cache</h3>
                </div>
                <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin-bottom: 20px;">
                    Limpar o cache local recarrega todas as configurações do Supabase (cidades, sistemas, perfis) forçando uma nova sincronização com o banco.
                </p>
                <button class="btn-gate-primary" style="background: linear-gradient(135deg, #00d2ff, #2563eb);" onclick="window.painelClearCaches()">
                    <i class="fa-solid fa-rotate"></i> Limpar Caches da Plataforma
                </button>
            </div>

            <div class="painel-card">
                <div class="painel-card-header">
                    <h3 class="painel-card-title"><i class="fa-solid fa-database" style="color: #10b981;"></i> Informações de Conexão</h3>
                </div>
                <div style="display: flex; flex-direction: column; gap: 10px; font-size: 12px;">
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #94a3b8;">Endpoint Supabase:</span>
                        <span style="color: #fff; font-family: monospace;">${SUPABASE_URL}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #94a3b8;">ID Superadmin:</span>
                        <span style="color: #ffc046; font-family: monospace;">722320491767136346</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #94a3b8;">Sessão Ativa:</span>
                        <span style="color: #10b981;">Autenticado via OAuth2</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

window.painelClearCaches = function() {
    localStorage.removeItem('malaca_custom_servers');
    localStorage.removeItem('malaca_custom_systems');
    localStorage.removeItem('malaca_admin_users_cache');
    alert('Caches da plataforma limpos com sucesso! Dados sincronizados.');
    loadDashboardData();
};

window.painelRefreshData = function() {
    loadDashboardData();
};

window.painelSwitchTab = function(tab) {
    switchTab(tab);
};

// Inicialização ao carregar a página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPainel);
} else {
    initPainel();
}
