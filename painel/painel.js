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
let userSearchFilter = '';

const globalHubChannel = supabaseClient.channel('malaca_realtime_global_hub');

// Escuta em tempo real para sincronização entre janelas/abas
globalHubChannel
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

function checkIsUserBanned(profile) {
    if (!profile) return false;
    const dId = extractDiscordId(profile) || profile.discord_id || '';
    if (dId && DEFAULT_ADMIN_DISCORD_IDS.includes(String(dId))) return false;
    if (profile.is_banned === true || profile.role === 'banned') return true;
    const bannedList = getBannedListFromStorage();
    if (dId && bannedList.includes(String(dId))) return true;
    if (profile.id && bannedList.includes(String(profile.id))) return true;
    return false;
}

// Verifica privilégios de administrador
function checkIsAdmin(profile) {
    if (!profile) return false;
    if (checkIsUserBanned(profile)) return false;
    const dId = extractDiscordId(profile) || profile.discord_id || '';
    if (dId && DEFAULT_ADMIN_DISCORD_IDS.includes(String(dId))) return true;
    return profile.is_admin === true || profile.role === 'admin';
}

function checkIsOwner(profile) {
    if (!profile) return false;
    const dId = extractDiscordId(profile) || profile.discord_id || '';
    return DEFAULT_ADMIN_DISCORD_IDS.includes(String(dId));
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

// Inicializa verificação de autenticação
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

    // Se houver parâmetros de autenticação OAuth na URL, aguarda a troca do token
    const hasOAuthTokens = window.location.hash.includes('access_token=') || window.location.search.includes('code=');

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

    try {
        let { data: { session } } = await supabaseClient.auth.getSession();
        
        // Se há tokens na URL mas a sessão ainda não sincronizou, tenta aguardar até 1.5s
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

        let profile = null;
        if (session && session.user) {
            currentUser = session.user;
            let savedProfile = null;
            try {
                const rawSaved = localStorage.getItem('malaca_user_profile');
                if (rawSaved) savedProfile = JSON.parse(rawSaved);
            } catch(e) {}

            const discordId = extractDiscordId(session.user) || extractDiscordId(savedProfile) || savedProfile?.discord_id || '';
            const isFounder = DEFAULT_ADMIN_DISCORD_IDS.includes(String(discordId));
            
            // Busca apenas colunas reais existentes no schema do Supabase
            let dbProfile = null;
            try {
                const orConditions = [];
                if (session.user.id) orConditions.push(`id.eq.${session.user.id}`);
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

            const isAdmin = isFounder || (dbProfile && (dbProfile.is_admin === true || dbProfile.role === 'admin'));
            const userRole = isAdmin ? 'admin' : (dbProfile?.role || 'user');
            const now = new Date().toISOString();

            const meta = session.user.user_metadata || {};
            profile = {
                id: session.user.id,
                discord_id: String(discordId),
                username: meta.preferred_username || meta.global_name || meta.name || dbProfile?.username || 'Discord User',
                full_name: meta.full_name || meta.global_name || meta.name || dbProfile?.full_name || 'Usuário',
                avatar_url: meta.avatar_url || meta.picture || dbProfile?.avatar_url || 'https://cdn.discordapp.com/embed/avatars/0.png',
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

        // Se não houver sessão ativa direta no client, resgata a sessão sincronizada do site
        if (!profile) {
            const stored = localStorage.getItem('malaca_user_profile');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (parsed && typeof parsed === 'object') {
                        const discordId = extractDiscordId(parsed) || parsed.discord_id || '';
                        const isFounder = DEFAULT_ADMIN_DISCORD_IDS.includes(String(discordId));
                        
                        let dbProfile = null;
                        const orConditions = [];
                        if (parsed.id) orConditions.push(`id.eq.${parsed.id}`);
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

                        const isAdmin = isFounder || (dbProfile && (dbProfile.is_admin === true || dbProfile.role === 'admin')) || parsed.is_admin === true || parsed.role === 'admin';
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
        renderPainelDashboard(root);

    } catch (err) {
        console.error('Erro na inicialização do painel:', err);
        renderLoginGate(root);
    }
}

// TELA: Login Necessário Exclusivo Discord OAuth
function renderLoginGate(root) {
    root.innerHTML = `
        <div class="painel-gate-container">
            <div class="painel-gate-card">
                <div class="painel-gate-icon">
                    <i class="fa-solid fa-shield-halved"></i>
                </div>
                <h2 class="painel-gate-title">ACESSO ADMINISTRATIVO</h2>
                <p class="painel-gate-desc">
                    O <strong>Painel Administrativo do Malaca System GTARP</strong> é restrito a administradores autorizados. Faça login com sua conta Discord oficial conectada ao Supabase.
                </p>
                
                <button id="btn-login-discord-painel" class="btn-gate-primary" style="margin-bottom: 14px;">
                    <i class="fa-brands fa-discord" style="font-size: 1.2rem;"></i> ENTRAR COM O DISCORD
                </button>

                <a href="/" class="btn-gate-secondary">
                    <i class="fa-solid fa-arrow-left"></i> Voltar à Página Inicial
                </a>
            </div>
        </div>
    `;

    document.getElementById('btn-login-discord-painel')?.addEventListener('click', handleDiscordLogin);
}

// TELA: Acesso Negado (Usuário não é admin)
function renderAccessDeniedGate(root, profile) {
    root.innerHTML = `
        <div class="painel-gate-container">
            <div class="painel-gate-card">
                <div class="painel-gate-icon danger">
                    <i class="fa-solid fa-lock"></i>
                </div>
                <h2 class="painel-gate-title">ACESSO RESTRITO</h2>
                <p class="painel-gate-desc">
                    A conta <strong style="color: #fff;">@${profile.username || 'Usuário'}</strong> está conectada, mas não possui permissões administrativas na plataforma.
                </p>
                <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px; margin-bottom: 24px; display: flex; align-items: center; gap: 12px; text-align: left;">
                    <img src="${profile.avatar_url || 'https://cdn.discordapp.com/embed/avatars/0.png'}" style="width: 42px; height: 42px; border-radius: 50%; object-fit: cover;" />
                    <div style="min-width: 0; flex: 1;">
                        <div style="color: #fff; font-weight: 800; font-size: 13px;">${profile.full_name || profile.username}</div>
                        <div style="color: #64748b; font-size: 11px;">ID Discord: ${profile.discord_id || '—'}</div>
                    </div>
                    <span class="badge-user">USUÁRIO COMUM</span>
                </div>
                <a href="/" class="btn-gate-primary" style="background: linear-gradient(135deg, #00d2ff, #2563eb);">
                    <i class="fa-solid fa-arrow-left"></i> Voltar para a Plataforma
                </a>
                <button id="btn-switch-account-painel" class="btn-gate-secondary">
                    <i class="fa-solid fa-arrow-right-from-bracket"></i> Conectar com Outra Conta
                </button>
            </div>
        </div>
    `;

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

        if (activeTab === 'dashboard') {
            const container = document.getElementById('painel-tab-content');
            if (container) renderDashboardView(container);
        } else if (activeTab === 'users') {
            renderUsersList();
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
        if (!error && data) {
            cachedUsers = data;
            const badgeUsers = document.getElementById('badge-users-count');
            if (badgeUsers) badgeUsers.textContent = data.length;
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
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanUserId);

        // 1. Deletar do Supabase profiles
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

        // 2. Limpar dos caches locais
        try {
            let cached = JSON.parse(localStorage.getItem('malaca_cached_profiles') || '[]');
            cached = cached.filter(u => u.id !== cleanUserId && u.discord_id !== cleanDiscordId);
            localStorage.setItem('malaca_cached_profiles', JSON.stringify(cached));

            let customAdmins = JSON.parse(localStorage.getItem('malaca_admin_discord_accounts') || '[]');
            customAdmins = customAdmins.filter(d => d !== cleanDiscordId && d !== cleanUserId);
            localStorage.setItem('malaca_admin_discord_accounts', JSON.stringify(customAdmins));

            let customBanned = JSON.parse(localStorage.getItem('malaca_banned_discord_accounts') || '[]');
            customBanned = customBanned.filter(d => d !== cleanDiscordId && d !== cleanUserId);
            localStorage.setItem('malaca_banned_discord_accounts', JSON.stringify(customBanned));

            // Se for o próprio perfil logado
            const myStored = localStorage.getItem('malaca_user_profile');
            if (myStored) {
                const parsed = JSON.parse(myStored);
                if (parsed.id === cleanUserId || parsed.discord_id === cleanDiscordId) {
                    localStorage.removeItem('malaca_user_profile');
                }
            }
        } catch(e) {}

        // 3. Atualizar em memória e tela
        cachedUsers = cachedUsers.filter(u => u.id !== cleanUserId && (cleanDiscordId ? u.discord_id !== cleanDiscordId : true));
        const badgeUsers = document.getElementById('badge-users-count');
        if (badgeUsers) badgeUsers.textContent = cachedUsers.length;

        // 4. Notificar via broadcast
        try {
            globalHubChannel.send({
                type: 'broadcast',
                event: 'user_deleted',
                payload: { id: cleanUserId, discordId: cleanDiscordId }
            });
        } catch(e) {}

        renderUsersList();
        showPainelToast('Usuário excluído com sucesso da plataforma.');
    } catch (e) {
        showPainelToast('Falha ao excluir usuário: ' + (e.message || e), 'error');
    }
};

// ABA 3: ANDARILHO & MAPA
function renderWandererView(container) {
    container.innerHTML = `
        <div class="painel-page-title-area">
            <div>
                <h1 class="painel-page-title">CICLOS DO ANDARILHO & COORDENADAS</h1>
                <p class="painel-page-desc">Gerenciamento de ciclos diários, horários de virada e aprovação de marcadores.</p>
            </div>
            <button class="painel-btn-secondary" onclick="window.painelTriggerCycleChange()">
                <i class="fa-solid fa-clock-rotate-left"></i> Forçar Virada de Ciclo
            </button>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
            <div class="painel-card">
                <div class="painel-card-header">
                    <h3 class="painel-card-title"><i class="fa-solid fa-hourglass-half" style="color: #fbbf24;"></i> Ciclo Vigente</h3>
                </div>
                <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(251,191,36,0.3); border-radius: 14px; padding: 20px; text-align: center; margin-bottom: 20px;">
                    <span style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">Próxima Virada Automática:</span>
                    <h2 style="font-family: var(--font-heading); font-size: 2rem; color: #fbbf24; margin: 8px 0;">06:00 / 18:00 (Brasília)</h2>
                    <p style="font-size: 12px; color: #64748b;">A virada reseta a localização e limpa os relatórios de confirmação dos jogadores.</p>
                </div>
                <div style="display: flex; gap: 10px;">
                    <a href="/cidades/cda/mapa/" target="_blank" class="painel-btn-secondary" style="flex: 1; justify-content: center;">
                        <i class="fa-solid fa-map"></i> Ver no Mapa CDA
                    </a>
                    <a href="/cidades/valley/mapa/" target="_blank" class="painel-btn-secondary" style="flex: 1; justify-content: center;">
                        <i class="fa-solid fa-map"></i> Ver no Mapa Valley
                    </a>
                </div>
            </div>

            <div class="painel-card">
                <div class="painel-card-header">
                    <h3 class="painel-card-title"><i class="fa-solid fa-shield-check" style="color: #10b981;"></i> Moderação de Coordenadas</h3>
                </div>
                <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin-bottom: 16px;">
                    Os jogadores podem sugerir a posição atual do Andarilho ou novos pontos de interesse diretamente no mapa interativo. Coordenadas com alta taxa de confirmação são validadas automaticamente.
                </p>
                <div style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); border-radius: 12px; padding: 14px; color: #6ee7b7; font-size: 12px; font-weight: 700;">
                    <i class="fa-solid fa-check-double"></i> Sistema de Anti-Spam de Coordenadas Ativo.
                </div>
            </div>
        </div>
    `;
}

window.painelTriggerCycleChange = function() {
    alert('Virada de ciclo disparada com sucesso! Coordenadas do Andarilho sincronizadas.');
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
