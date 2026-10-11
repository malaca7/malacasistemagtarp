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

const globalHubChannel = supabaseClient.channel('malaca_realtime_global_hub');

(function () {
    // Inject HTML Modal Container
    const modalHTML = `
    <div id="global-admin-modal" class="global-admin-overlay">
        <div class="global-admin-dialog">
            <div class="global-admin-header">
                <div class="global-admin-title-area">
                    <div class="global-admin-badge"><img src="/images/platform_icon.png" alt="MALACA ICON" style="width: 100%; height: 100%; object-fit: contain;"></div>
                    <div>
                        <h2 class="global-admin-title">Painel Administrativo — Malaca System GTARP</h2>
                        <span class="global-admin-subtitle">Gestão Global da Plataforma, Cidades & Sistemas</span>
                    </div>
                </div>
                <button class="global-admin-close" onclick="closeGlobalAdminModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <div id="global-admin-content" style="flex:1; display:flex; flex-direction:column; overflow:hidden;">
                <!-- Content inserted dynamically -->
            </div>
        </div>
    </div>

    <!-- Appearance Modal -->
    <div id="global-appearance-modal" class="global-admin-overlay">
        <div class="global-admin-dialog" style="max-width: 460px;">
            <div class="global-admin-header">
                <div class="global-admin-title-area">
                    <div class="global-admin-badge" style="background: rgba(0,210,255,0.2);"><i class="fa-solid fa-sliders" style="color: #00d2ff;"></i></div>
                    <div>
                        <h2 class="global-admin-title">Personalização Visual</h2>
                        <span class="global-admin-subtitle">Ajuste o tema, brilho e idioma da plataforma</span>
                    </div>
                </div>
                <button class="global-admin-close" onclick="closeAppearanceModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <div style="padding: 24px; display: flex; flex-direction: column; gap: 20px; background: #0D0D0D;">
                <!-- Temas -->
                <div>
                    <label style="font-size: 11px; font-weight: 800; color: #00d2ff; text-transform: uppercase; display: block; margin-bottom: 10px;"><i class="fa-solid fa-palette"></i> Tema Visual</label>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                        <button onclick="setGlobalTheme('escuro')" class="global-theme-btn" id="gtheme-escuro">Escuro (Padrão)</button>
                        <button onclick="setGlobalTheme('oled')" class="global-theme-btn" id="gtheme-oled">OLED (Black)</button>
                        <button onclick="setGlobalTheme('dracula')" class="global-theme-btn" id="gtheme-dracula">Dracula</button>
                        <button onclick="setGlobalTheme('cinza_escuro')" class="global-theme-btn" id="gtheme-cinza_escuro">Cinza Escuro</button>
                        <button onclick="setGlobalTheme('cinza_claro')" class="global-theme-btn" id="gtheme-cinza_claro">Cinza Claro</button>
                        <button onclick="setGlobalTheme('claro')" class="global-theme-btn" id="gtheme-claro">Claro</button>
                    </div>
                </div>

                <!-- Brilho -->
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <label style="font-size: 11px; font-weight: 800; color: #00d2ff; text-transform: uppercase;"><i class="fa-solid fa-sun"></i> Brilho da Tela</label>
                        <span id="g-brightness-val" style="font-size: 13px; font-weight: 900; color: #38bdf8;">100%</span>
                    </div>
                    <input type="range" min="0" max="150" value="100" id="g-brightness-slider" style="width: 100%; accent-color: #00d2ff; cursor: pointer;" oninput="updateGlobalBrightness(this.value)" ondblclick="updateGlobalBrightness(100)">
                    <span style="font-size: 10px; color: #94a3b8; display: block; margin-top: 4px;">Dica: dando dois cliques no controle ele volta para 100%.</span>
                </div>

                <!-- Idioma -->
                <div>
                    <label style="font-size: 11px; font-weight: 800; color: #00d2ff; text-transform: uppercase; display: block; margin-bottom: 10px;"><i class="fa-solid fa-language"></i> Idioma</label>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="setGlobalLang('pt')" class="global-theme-btn" id="glang-pt" style="flex:1;">🇧🇷 Português (BR)</button>
                        <button onclick="setGlobalLang('en')" class="global-theme-btn" id="glang-en" style="flex:1;">🇺🇸 English (EN)</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Discord Auth & Dashboard Modal -->
    <div id="global-discord-modal" class="global-admin-overlay">
        <div class="global-admin-dialog" style="max-width: 440px; height: auto; max-height: 90vh;">
            <div class="global-admin-header">
                <div class="global-admin-title-area">
                    <div class="global-admin-badge" style="background: rgba(88,101,242,0.2);"><i class="fa-brands fa-discord" style="color: #5865F2; font-size: 1.2rem;"></i></div>
                    <div>
                        <h2 class="global-admin-title" id="discord-modal-title">Autenticação Discord</h2>
                        <span class="global-admin-subtitle" id="discord-modal-subtitle">Login Exclusivo via OAuth2</span>
                    </div>
                </div>
                <button class="global-admin-close" onclick="closeDiscordModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div id="discord-modal-body" style="padding: 24px; background: #0D0D0D;">
                <!-- Dynamically rendered -->
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const DEFAULT_ADMIN_DISCORD_IDS = ['722320491767136346', '917826984778797087'];
    const DEFAULT_ADMIN_EMAILS = ['malaca@malacasystem.com', 'admin@malacasystem.com'];
    const DEFAULT_ADMIN_USERNAMES = ['malaca7', 'malaca', 'admin'];

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

    function checkAdminPermission(user) {
        if (!user) return false;
        const discordId = extractDiscordId(user);
        if (discordId && DEFAULT_ADMIN_DISCORD_IDS.includes(discordId)) {
            return true;
        }
        if (user.is_admin === true || user.role === 'admin') {
            return true;
        }
        const email = String(user.email || (user.user_metadata && user.user_metadata.email) || '').trim().toLowerCase();
        if (email && DEFAULT_ADMIN_EMAILS.includes(email)) {
            return true;
        }
        const username = String(
            user.username ||
            (user.user_metadata && (user.user_metadata.preferred_username || user.user_metadata.user_name || user.user_metadata.name || user.user_metadata.full_name)) ||
            ''
        ).trim().toLowerCase();
        if (username && DEFAULT_ADMIN_USERNAMES.includes(username)) {
            return true;
        }
        try {
            const customAdmins = JSON.parse(localStorage.getItem('malaca_admin_discord_accounts') || '[]');
            if (discordId && customAdmins.includes(discordId)) {
                return true;
            }
        } catch(e) {}
        return false;
    }

    function getSavedAdminState() {
        try {
            const stored = localStorage.getItem('malaca_user_profile');
            if (stored) {
                const u = JSON.parse(stored);
                if (checkAdminPermission(u)) return true;
            }
        } catch (e) {}
        return false;
    }

    function updateAdminUiVisibility(isAdmin) {
        const adminLinks = document.querySelectorAll('.hub-footer-admin-link');
        adminLinks.forEach(link => {
            if (isAdmin) {
                link.classList.add('is-admin-visible');
                link.style.display = 'inline-flex';
            } else {
                link.classList.remove('is-admin-visible');
                link.style.display = 'none';
            }
        });
    }

    let isAuthenticated = getSavedAdminState();
    updateAdminUiVisibility(isAuthenticated);

    window.openDiscordModal = function () {
        document.getElementById('global-discord-modal').classList.add('active');
        renderDiscordModalContent();
    };

    window.closeDiscordModal = function () {
        document.getElementById('global-discord-modal').classList.remove('active');
    };

    window.openGlobalAdminModal = async function () {
        const modal = document.getElementById('global-admin-modal');
        if (!modal) return;

        if (!isAuthenticated) {
            if (getSavedAdminState()) {
                isAuthenticated = true;
                updateAdminUiVisibility(true);
            } else {
                try {
                    const { data: { session } } = await supabaseClient.auth.getSession();
                    if (session && session.user && checkAdminPermission(session.user)) {
                        isAuthenticated = true;
                        updateAdminUiVisibility(true);
                    }
                } catch (e) {}
            }
        }

        modal.classList.add('active');
        renderAdminContent();
    };

    window.closeGlobalAdminModal = function () {
        const modal = document.getElementById('global-admin-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    };

    window.loginWithDiscordGlobal = async function () {
        const btn = document.querySelector('#discord-modal-body button');
        const originalContent = btn ? btn.innerHTML : '';
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Conectando ao Discord...`;
        }
        try {
            const redirectUrl = window.location.origin + window.location.pathname;
            const { error } = await supabaseClient.auth.signInWithOAuth({
                provider: 'discord',
                options: {
                    redirectTo: redirectUrl,
                    scopes: 'identify email'
                }
            });
            if (error) throw error;
        } catch (e) {
            console.error('Supabase Discord OAuth error:', e);
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = originalContent || `<i class="fa-brands fa-discord" style="font-size: 18px;"></i> ENTRAR COM O DISCORD`;
            }
            alert('Falha ao autenticar com o Discord: ' + (e.message || 'Verifique a conexão e tente novamente.'));
        }
    };

    window.logoutDiscordGlobal = async function () {
        try {
            await supabaseClient.auth.signOut();
        } catch(e) {
            console.warn('SignOut exception:', e);
        }
        localStorage.removeItem('malaca_user_profile');
        renderDiscordModalContent();
        syncDiscordNavButton();
        if (typeof checkSystemAuthProtection === 'function') checkSystemAuthProtection();
    };

    function renderDiscordModalContent() {
        const body = document.getElementById('discord-modal-body');
        const title = document.getElementById('discord-modal-title');
        const subtitle = document.getElementById('discord-modal-subtitle');
        if (!body) return;

        const stored = localStorage.getItem('malaca_user_profile');
        const user = stored ? JSON.parse(stored) : null;
        const isAdmin = user ? (user.is_admin === true || user.role === 'admin' || (typeof checkAdminPermission === 'function' && checkAdminPermission(user))) : false;

        if (user) {
            title.textContent = 'Dashboard do Usuário';
            subtitle.textContent = 'Perfil e Registro de Acesso';
            body.innerHTML = `
                <div style="display: flex; align-items: center; gap: 16px; padding: 16px; background: linear-gradient(135deg, #18181b 0%, #000000 100%); border-radius: 14px; border: 1px solid rgba(0,210,255,0.3); margin-bottom: 16px;">
                    <img src="${user.avatar_url}" style="width: 56px; height: 56px; border-radius: 50%; border: 2px solid ${isAdmin ? '#f59e0b' : '#38bdf8'}; object-fit: cover;" />
                    <div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <h4 style="font-size: 16px; font-weight: 900; color: #fff;">${user.full_name || user.username}</h4>
                            <span style="font-size: 9px; font-weight: 800; background: ${isAdmin ? 'rgba(245,158,11,0.2)' : 'rgba(88,101,242,0.2)'}; color: ${isAdmin ? '#fde68a' : '#5865F2'}; padding: 2px 6px; border-radius: 4px; border: 1px solid ${isAdmin ? 'rgba(245,158,11,0.4)' : 'rgba(88,101,242,0.4)'};">${isAdmin ? 'ADMIN' : 'VERIFICADO'}</span>
                        </div>
                        <span style="font-size: 12px; color: #38bdf8; font-weight: 700;">@${user.username}</span>
                        <div style="font-size: 10px; color: #94a3b8; margin-top: 2px; font-family: monospace;">ID: ${user.discord_id}</div>
                    </div>
                </div>

                ${isAdmin ? `
                    <div style="background: linear-gradient(135deg, rgba(88,101,242,0.18) 0%, rgba(0,210,255,0.12) 100%); border: 1px solid rgba(88,101,242,0.4); border-radius: 12px; padding: 14px; margin-bottom: 16px;">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <i class="fa-solid fa-shield-halved" style="color: #818cf8; font-size: 1rem;"></i>
                                <span style="font-size: 12px; font-weight: 800; color: #fff; text-transform: uppercase;">Acesso Administrativo</span>
                            </div>
                            <span style="font-size: 9px; font-weight: 900; background: rgba(88,101,242,0.3); color: #c7d2fe; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(88,101,242,0.5);">ADMINISTRADOR</span>
                        </div>
                        <p style="font-size: 11px; color: #94a3b8; line-height: 1.4; margin-bottom: 12px;">Sua conta possui acesso administrativo para gerenciar cidades, sistemas, usuários e configurações da plataforma.</p>
                        <button onclick="closeDiscordModal(); openGlobalAdminModal();" style="width: 100%; padding: 10px; border-radius: 8px; background: linear-gradient(135deg, #5865F2 0%, #2563eb 100%); color: #fff; font-size: 12px; font-weight: 900; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(88,101,242,0.35); transition: all 0.2s ease;">
                            <i class="fa-solid fa-gauge-high"></i> ACESSAR PAINEL ADMINISTRATIVO
                        </button>
                    </div>
                ` : ''}

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px;">
                    <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);">
                        <span style="font-size: 10px; color: #94a3b8; display: block; font-weight: 700;">DATA DE CADASTRO</span>
                        <span style="font-size: 12px; font-weight: 800; color: #fff; font-family: monospace;">${new Date(user.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);">
                        <span style="font-size: 10px; color: #94a3b8; display: block; font-weight: 700;">ÚLTIMO LOGIN</span>
                        <span style="font-size: 12px; font-weight: 800; color: #38bdf8; font-family: monospace;">${new Date(user.last_login_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                </div>

                <div style="padding: 12px; background: rgba(0,0,0,0.6); border: 1px solid rgba(0,210,255,0.2); border-radius: 10px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <span style="font-size: 11px; font-weight: 700; color: #cbd5e1;"><i class="fa-solid fa-shield-halved" style="color: #22c55e;"></i> Status da Conta</span>
                    <span style="font-size: 11px; font-weight: 900; color: #38bdf8; background: rgba(0,210,255,0.2); padding: 3px 10px; border-radius: 6px; border: 1px solid rgba(0,210,255,0.3);">${isAdmin ? 'ADMINISTRADOR' : 'VERIFICADO RP'}</span>
                </div>

                <button onclick="logoutDiscordGlobal()" style="width: 100%; padding: 12px; border-radius: 10px; background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.4); color: #fca5a5; font-size: 12px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <i class="fa-solid fa-right-from-bracket"></i> SAIR DA CONTA (LOGOUT)
                </button>
            `;
        } else {
            title.textContent = 'Autenticação Discord';
            subtitle.textContent = 'Login Exclusivo via OAuth2';
            body.innerHTML = `
                <div style="text-align: center; padding: 16px 0;">
                    <div style="width: 60px; height: 60px; border-radius: 50%; background: rgba(88,101,242,0.15); border: 2px solid #5865F2; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: #5865F2; font-size: 28px;">
                        <i class="fa-brands fa-discord"></i>
                    </div>
                    <h3 style="font-size: 18px; font-weight: 900; color: #fff; margin-bottom: 8px;">LOGIN COM DISCORD</h3>
                    <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin-bottom: 24px; max-width: 320px; margin-left: auto; margin-right: auto;">
                        Autenticação simples e segura. Sem e-mail ou senhas. Seu perfil será criado automaticamente no primeiro acesso.
                    </p>
                    <button onclick="loginWithDiscordGlobal()" style="width: 100%; padding: 14px; border-radius: 12px; background: #5865F2; color: #fff; font-size: 13px; font-weight: 800; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; shadow: 0 10px 25px rgba(88,101,242,0.3);">
                        <i class="fa-brands fa-discord" style="font-size: 18px;"></i> ENTRAR COM O DISCORD
                    </button>
                </div>
            `;
        }
    }

    function syncDiscordNavButton() {
        const stored = localStorage.getItem('malaca_user_profile');
        const user = stored ? JSON.parse(stored) : null;

        const navBtns = document.querySelectorAll('.hub-discord-btn');
        navBtns.forEach(btn => {
            if (user) {
                btn.innerHTML = `<img src="${user.avatar_url}" style="width: 20px; height: 20px; border-radius: 50%; border: 1px solid #38bdf8;" /> <span style="font-family: monospace;">${user.username}</span>`;
                btn.style.background = '#18181b';
                btn.style.borderColor = 'rgba(0,210,255,0.5)';
            } else {
                btn.innerHTML = `<i class="fa-brands fa-discord"></i> <span>ENTRAR</span>`;
                btn.style.background = '#5865F2';
                btn.style.borderColor = '#5865F2';
            }
        });
    }

    async function syncDiscordSession() {
        try {
            const { data: { session }, error: sessionErr } = await supabaseClient.auth.getSession();
            if (sessionErr) console.warn('Supabase getSession warning:', sessionErr);

            if (session && session.user) {
                const u = session.user;
                const meta = u.user_metadata || {};
                const discordId = extractDiscordId(u) || meta.provider_id || meta.sub || '';
                const username = meta.preferred_username || meta.user_name || meta.name || meta.full_name || 'Discord User';
                const fullName = meta.full_name || meta.global_name || meta.name || username;
                const avatarUrl = meta.avatar_url || meta.picture || 'https://cdn.discordapp.com/embed/avatars/0.png';
                const now = new Date().toISOString();
                const email = u.email || meta.email || '';
                const isAdmin = checkAdminPermission(u);

                if (isAdmin) {
                    isAuthenticated = true;
                }

                const profileData = {
                    id: u.id,
                    discord_id: String(discordId),
                    username: String(username),
                    full_name: String(fullName),
                    avatar_url: String(avatarUrl),
                    email: email || undefined,
                    is_admin: isAdmin,
                    role: isAdmin ? 'admin' : 'user',
                    last_login_at: now
                };

                const profile = {
                    ...profileData,
                    created_at: u.created_at || now
                };

                localStorage.setItem('malaca_user_profile', JSON.stringify(profile));
                updateAdminUiVisibility(isAdmin);

                // Upsert into Supabase profiles table asynchronously
                supabaseClient.from('profiles').upsert([profileData], { onConflict: 'id' }).then(() => {}).catch(err => {
                    console.warn('Supabase profiles sync warning:', err);
                });

                // Auto-open modal se o login foi iniciado para acessar o painel admin
                if (isAdmin && sessionStorage.getItem('malaca_open_admin_after_auth') === '1') {
                    sessionStorage.removeItem('malaca_open_admin_after_auth');
                    setTimeout(() => {
                        window.openGlobalAdminModal();
                    }, 100);
                }

                // Clean OAuth URL params if present
                if (typeof window !== 'undefined') {
                    if (window.location.hash.includes('access_token=') || window.location.search.includes('code=')) {
                        window.history.replaceState(null, '', window.location.pathname);
                    }
                }
            } else {
                const stored = localStorage.getItem('malaca_user_profile');
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored);
                        if (parsed.id && String(parsed.id).startsWith('mock-')) {
                            localStorage.removeItem('malaca_user_profile');
                            isAuthenticated = false;
                            updateAdminUiVisibility(false);
                        } else {
                            const isAdmin = checkAdminPermission(parsed);
                            if (isAdmin) isAuthenticated = true;
                            updateAdminUiVisibility(isAdmin);
                        }
                    } catch(e) {}
                } else {
                    isAuthenticated = false;
                    updateAdminUiVisibility(false);
                }
            }
        } catch (e) {
            console.warn('Supabase Session Sync Exception:', e);
        }
        syncDiscordNavButton();
    }

    supabaseClient.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED') {
            await syncDiscordSession();
            renderDiscordModalContent();
            if (session && session.user && checkAdminPermission(session.user)) {
                isAuthenticated = true;
                updateAdminUiVisibility(true);
                const modal = document.getElementById('global-admin-modal');
                if (modal && modal.classList.contains('active')) {
                    renderAdminContent();
                }
            }
            if (typeof checkSystemAuthProtection === 'function') checkSystemAuthProtection();
        } else if (event === 'SIGNED_OUT') {
            isAuthenticated = false;
            localStorage.removeItem('malaca_user_profile');
            updateAdminUiVisibility(false);
            syncDiscordNavButton();
            renderDiscordModalContent();
            const modal = document.getElementById('global-admin-modal');
            if (modal && modal.classList.contains('active')) {
                renderAdminContent();
            }
            if (typeof checkSystemAuthProtection === 'function') checkSystemAuthProtection();
        }
    });

    // Realtime Hub Broadcast Listeners
    globalHubChannel
        .on('broadcast', { event: 'servers_updated' }, (payload) => {
            if (payload?.payload?.servers && Array.isArray(payload.payload.servers)) {
                localStorage.setItem('malaca_custom_servers', JSON.stringify(payload.payload.servers));
                if (typeof window.loadCustomCities === 'function') window.loadCustomCities();
                renderAdminContent();
                const pathParts = window.location.pathname.split('/');
                const pathSlug = pathParts[2] || pathParts[1];
                if (pathSlug && typeof window.loadCitySystems === 'function') window.loadCitySystems(pathSlug);
            }
        })
        .on('broadcast', { event: 'systems_updated' }, (payload) => {
            if (payload?.payload?.systems && Array.isArray(payload.payload.systems)) {
                localStorage.setItem('malaca_custom_systems', JSON.stringify(payload.payload.systems));
                renderAdminContent();
                const pathParts = window.location.pathname.split('/');
                const pathSlug = pathParts[2] || pathParts[1];
                if (pathSlug && typeof window.loadCitySystems === 'function') window.loadCitySystems(pathSlug);
            }
        })
        .on('broadcast', { event: 'entity_sync' }, async (response) => {
            const ent = response?.payload?.entity;
            if (ent === 'servers') {
                await syncGlobalDatabaseData();
                renderAdminContent();
                if (typeof window.loadCustomCities === 'function') window.loadCustomCities();
            } else if (ent === 'systems') {
                await syncGlobalDatabaseData();
                renderAdminContent();
                const pathParts = window.location.pathname.split('/');
                const pathSlug = pathParts[2] || pathParts[1];
                if (pathSlug && typeof window.loadCitySystems === 'function') window.loadCitySystems(pathSlug);
            } else if (ent === 'settings') {
                checkGlobalAnnouncementBanner();
            }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'servers' }, async () => {
            await syncGlobalDatabaseData();
            renderAdminContent();
            if (typeof window.loadCustomCities === 'function') window.loadCustomCities();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'systems' }, async () => {
            await syncGlobalDatabaseData();
            renderAdminContent();
            const pathParts = window.location.pathname.split('/');
            const pathSlug = pathParts[2] || pathParts[1];
            if (pathSlug && typeof window.loadCitySystems === 'function') window.loadCitySystems(pathSlug);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'platform_settings' }, () => {
            checkGlobalAnnouncementBanner();
        })
        .on('broadcast', { event: 'settings_updated' }, () => {
            checkGlobalAnnouncementBanner();
        })
        .on('broadcast', { event: 'wanderer_cycle_reset' }, () => {
            localStorage.removeItem('cidade_alta_user_confirmations');
            localStorage.removeItem('malaca_wanderer_cycle_state');
        })
        .subscribe();

    async function syncGlobalDatabaseData() {
        try {
            const { data: dbServers } = await supabaseClient.from('servers').select('*').order('created_at', { ascending: true });
            if (dbServers && dbServers.length > 0) {
                localStorage.setItem('malaca_custom_servers', JSON.stringify(dbServers));
                if (typeof window.loadCustomCities === 'function') window.loadCustomCities();
            }
        } catch(e) {}

        try {
            const { data: dbSystems } = await supabaseClient.from('systems').select('*').order('created_at', { ascending: true });
            if (dbSystems && dbSystems.length > 0) {
                localStorage.setItem('malaca_custom_systems', JSON.stringify(dbSystems));
            }
        } catch(e) {}
    }

    document.addEventListener('DOMContentLoaded', () => {
        syncDiscordSession();
        syncGlobalDatabaseData();
    });
    syncDiscordSession();
    syncGlobalDatabaseData();

    window.openAppearanceModal = function () {
        document.getElementById('global-appearance-modal').classList.add('active');
        syncAppearanceState();
    };

    window.closeAppearanceModal = function () {
        document.getElementById('global-appearance-modal').classList.remove('active');
    };

    window.setGlobalTheme = function (theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('malaca_theme', theme);
        syncAppearanceState();
    };

    window.updateGlobalBrightness = function (val) {
        const num = Number(val);
        document.documentElement.style.filter = `brightness(${num}%)`;
        localStorage.setItem('malaca_brightness', String(num));
        const lbl = document.getElementById('g-brightness-val');
        if (lbl) lbl.textContent = `${num}%`;
        const slider = document.getElementById('g-brightness-slider');
        if (slider) slider.value = num;
    };

    window.setGlobalLang = function (lang) {
        localStorage.setItem('malaca_lang', lang);
        syncAppearanceState();
    };

    function syncAppearanceState() {
        const theme = localStorage.getItem('malaca_theme') || 'escuro';
        const bright = localStorage.getItem('malaca_brightness') || '100';
        const lang = localStorage.getItem('malaca_lang') || 'pt';

        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.style.filter = `brightness(${bright}%)`;

        ['escuro', 'oled', 'dracula', 'cinza_escuro', 'cinza_claro', 'claro'].forEach(t => {
            const btn = document.getElementById(`gtheme-${t}`);
            if (btn) {
                if (t === theme) {
                    btn.style.background = 'linear-gradient(135deg, #00d2ff 0%, #2563eb 100%)';
                    btn.style.color = '#fff';
                    btn.style.borderColor = '#38bdf8';
                } else {
                    btn.style.background = 'rgba(255,255,255,0.05)';
                    btn.style.color = '#94a3b8';
                    btn.style.borderColor = 'rgba(0,210,255,0.2)';
                }
            }
        });

        const bLbl = document.getElementById('g-brightness-val');
        if (bLbl) bLbl.textContent = `${bright}%`;
        const bSlider = document.getElementById('g-brightness-slider');
        if (bSlider) bSlider.value = bright;

        ['pt', 'en'].forEach(l => {
            const btn = document.getElementById(`glang-${l}`);
            if (btn) {
                if (l === lang) {
                    btn.style.background = 'linear-gradient(135deg, #00d2ff 0%, #2563eb 100%)';
                    btn.style.color = '#fff';
                    btn.style.borderColor = '#38bdf8';
                } else {
                    btn.style.background = 'rgba(255,255,255,0.05)';
                    btn.style.color = '#94a3b8';
                    btn.style.borderColor = 'rgba(0,210,255,0.2)';
                }
            }
        });
    }

    // Auto sync on load
    document.addEventListener('DOMContentLoaded', syncAppearanceState);
    syncAppearanceState();

    let activeTab = 'cities';
    let editingCityId = null;
    let editingSystemId = null;

    const defaultSystems = [
        { id: 'sys-mapa', name: 'MAPA INTERATIVO RP', slug: 'mapa-interativo', tag: 'CDA & VALLEY REALTIME', link: '/cidades/cda/mapa/', icon: 'fa-compass', is_active: true },
        { id: 'sys-lockpick', name: 'LOCKPICK SIMULATOR', slug: 'lockpick', tag: 'FIVEM LOCKPICK KIT', link: '/cidades/cda/lockpick/', icon: 'fa-key', is_active: true },
        { id: 'sys-caixinha', name: 'CAIXINHA ELETRÔNICO', slug: 'caixinha', tag: 'SAFE & ATM HACK', link: '/cidades/cda/caixinha/', icon: 'fa-vault', icon: 'fa-vault', is_active: true },
        { id: 'sys-hacking', name: 'HACKING DEVICE', slug: 'hacking', tag: 'CYBER HACK TERMINAL', link: '/cidades/cda/hacking/', icon: 'fa-microchip', is_active: true }
    ];

    const defaultServers = [
        { id: 'cda-server-uuid', slug: 'cda', name: 'Cidade Alta RP', subtitle: 'SERVIDORES CDA & VALLEY' },
        { id: 'valley-server-uuid', slug: 'valley', name: 'Valley RP', subtitle: 'VALLEY ROLEPLAY HUB' },
        { id: 'los-santos-server-uuid', slug: 'los-santos', name: 'Los Santos Central', subtitle: 'TREINAMENTO HEISTS & MINIJOGOS' }
    ];

    // Strictly filter and load systems for city pages
    window.loadCitySystems = function (citySlug) {
        const grid = document.getElementById('city-systems-grid');
        if (!grid) return;

        const rawServers = localStorage.getItem('malaca_custom_servers');
        let cityId = citySlug;
        if (rawServers) {
            try {
                const servers = JSON.parse(rawServers);
                const found = servers.find(s => s.slug.toLowerCase() === citySlug.toLowerCase());
                if (found) cityId = found.id;
            } catch(e) {}
        }

        const defaultSystems = [
            { id: 'sys-mapa', title: 'MAPA INTERATIVO RP', tag: 'REALTIME MAP', desc: 'Mapa interativo em tempo real com virada do Andarilho e pontos de interesse.', link: `/cidades/${citySlug}/mapa/`, icon: 'fa-compass', img: '/images/gta_map_bg.webp', city_ids: ['cda-server-uuid', 'valley-server-uuid', 'cda', 'valley'] },
            { id: 'sys-lockpick', title: 'LOCKPICK SIMULATOR', tag: 'LOCKPICK KIT', desc: 'Simulador oficial de arrombamento com travamento de pinos.', link: `/cidades/${citySlug}/lockpick/`, icon: 'fa-key', img: '/images/lockpick.jpg', city_ids: ['cda-server-uuid', 'los-santos-server-uuid', 'cda', 'los-santos'] },
            { id: 'sys-caixinha', title: 'CAIXINHA ELETRÔNICO', tag: 'ATM HACK', desc: 'Decodificador rápido de cofres e caixas eletrônicos.', link: `/cidades/${citySlug}/caixinha/`, icon: 'fa-vault', img: '/images/caixinha.jpg', city_ids: ['cda-server-uuid', 'los-santos-server-uuid', 'cda', 'los-santos'] },
            { id: 'sys-hacking', title: 'HACKING DEVICE', tag: 'CYBER TERMINAL', desc: 'Terminal de hacking estilo Cayo Perico com matrizes de caracteres.', link: `/cidades/${citySlug}/hacking/`, icon: 'fa-microchip', img: '/images/hacking.jpg', city_ids: ['cda-server-uuid', 'los-santos-server-uuid', 'cda', 'los-santos'] }
        ];

        const raw = localStorage.getItem('malaca_custom_systems');
        let systems = defaultSystems;

        if (raw) {
            try {
                const customSystems = JSON.parse(raw);
                if (Array.isArray(customSystems) && customSystems.length > 0) {
                    systems = customSystems.map(s => ({
                        id: s.id || `sys-${s.slug}`,
                        title: s.name,
                        tag: s.tag || 'SISTEMA RP',
                        desc: s.description || '',
                        link: `/cidades/${citySlug}/${s.slug || 'mapa'}/`,
                        icon: s.icon || 'fa-microchip',
                        img: s.image_url || '/images/gta_map_bg.webp',
                        city_ids: s.city_ids || []
                    }));
                }
            } catch(e) {}
        }

        // STRICT FILTER: System MUST have city_ids containing this city
        const activeSystems = systems.filter(sys => 
            sys.city_ids && sys.city_ids.length > 0 && 
            (sys.city_ids.includes(cityId) || sys.city_ids.includes(citySlug) || sys.city_ids.includes(`${citySlug}-server-uuid`))
        );

        const countTag = document.getElementById('systems-count-tag');
        if (countTag) countTag.textContent = `${activeSystems.length} SISTEMAS ATIVOS`;

        grid.innerHTML = '';
        if (activeSystems.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 40px; font-weight: 700;">Nenhum sistema vinculado a esta cidade no momento.</p>';
            return;
        }

        activeSystems.forEach(sys => {
            const card = document.createElement('a');
            card.href = sys.link;
            card.className = 'hub-city-card';
            card.innerHTML = `
                <div class="hub-city-card-header-clean">
                    <div class="hub-city-card-icon">
                        <i class="fa-solid ${sys.icon}"></i>
                    </div>
                    <span class="hub-city-card-tag"><i class="fa-solid ${sys.icon}"></i> ${sys.tag}</span>
                </div>
                <div class="hub-city-card-body">
                    <h4 class="hub-city-card-title">${sys.title}</h4>
                    <p class="hub-city-card-desc">${sys.desc}</p>
                    <div class="hub-city-card-btn">
                        <span>ABRIR SISTEMA</span>
                        <i class="fa-solid fa-arrow-right"></i>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    };

    function getActiveServers() {
        const raw = JSON.parse(localStorage.getItem('malaca_custom_servers') || '[]');
        return raw.length > 0 ? raw : defaultServers;
    }

    function getActiveSystems() {
        const raw = JSON.parse(localStorage.getItem('malaca_custom_systems') || '[]');
        return raw.length > 0 ? raw : defaultSystems;
    }

    window.loginAdminWithDiscord = function() {
        sessionStorage.setItem('malaca_open_admin_after_auth', '1');
        const redirectUrl = window.location.origin + window.location.pathname;
        supabaseClient.auth.signInWithOAuth({
            provider: 'discord',
            options: { redirectTo: redirectUrl, scopes: 'identify email' }
        });
    };

    function renderAdminContent() {
        const container = document.getElementById('global-admin-content');
        if (!container) return;

        if (!isAuthenticated) {
            const stored = localStorage.getItem('malaca_user_profile');
            let currentUser = null;
            try {
                if (stored) currentUser = JSON.parse(stored);
            } catch(e) {}

            const isAccessDenied = currentUser && !checkAdminPermission(currentUser);

            container.innerHTML = `
                <div class="global-admin-body">
                    <div class="global-admin-auth-box">
                        <i class="fa-brands fa-discord" style="font-size: 3rem; color: #5865F2; margin-bottom: 12px;"></i>
                        <h3 style="font-family: var(--font-header); font-size: 1.2rem; color: #fff; margin-bottom: 8px;">Autenticação Administrativa</h3>
                        <p style="font-size: 0.78rem; color: #8b9cb5; margin-bottom: 20px;">Acesse o painel de gestão através da sua conta autorizada do Discord.</p>
                        
                        ${isAccessDenied ? `
                            <div style="background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.4); border-radius: 12px; padding: 14px; margin-bottom: 16px; text-align: left;">
                                <div style="font-weight: 800; font-size: 12px; color: #f87171; display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                                    <i class="fa-solid fa-triangle-exclamation"></i> ACESSO ADMINISTRATIVO NÃO AUTORIZADO
                                </div>
                                <div style="font-size: 11px; color: #cbd5e1; line-height: 1.4;">
                                    A conta Discord <strong>@${currentUser.username || 'Usuário'}</strong> não está na lista de administradores oficiais desta plataforma.
                                </div>
                            </div>
                        ` : ''}

                        <button onclick="loginAdminWithDiscord()" style="width:100%; padding:14px; background:#5865F2; color:#fff; font-family:var(--font-header); font-weight:800; border:none; border-radius:12px; cursor:pointer; font-size:0.85rem; display:flex; align-items:center; justify-content:center; gap:10px; box-shadow:0 4px 16px rgba(88,101,242,0.3); transition:all 0.3s ease;">
                            <i class="fa-brands fa-discord" style="font-size:1.2rem;"></i> ${currentUser ? 'TROCAR DE CONTA DISCORD (ADMIN)' : 'ENTRAR COM DISCORD (ADMIN)'}
                        </button>

                        <details style="margin-top:20px; text-align:left;">
                            <summary style="font-size:0.72rem; color:#64748b; cursor:pointer; text-align:center;">Opção de emergência (Senha Mestra)</summary>
                            <form onsubmit="handleAdminLogin(event)" style="margin-top:12px;">
                                <label style="font-size: 0.7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Usuário</label>
                                <input type="text" id="admin-user-input" class="global-admin-input" placeholder="ex: malaca" required>
                                
                                <label style="font-size: 0.7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Senha</label>
                                <input type="password" id="admin-pass-input" class="global-admin-input" placeholder="Digite a senha" required>

                                <p id="admin-auth-err" style="color: #ff5252; font-size: 0.75rem; display: none; margin-bottom: 12px;">Usuário ou senha incorretos.</p>
                                
                                <button type="submit" class="global-admin-submit" style="margin-top:10px;">ENTRAR COM SENHA</button>
                            </form>
                        </details>
                    </div>
                </div>
            `;
        } else {
            const allServers = getActiveServers();
                   container.innerHTML = `
                <div class="global-admin-nav">
                    <button class="global-admin-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}" onclick="switchAdminTab('dashboard')"><i class="fa-solid fa-chart-pie"></i> Dashboard</button>
                    <button class="global-admin-nav-btn ${activeTab === 'users' ? 'active' : ''}" onclick="switchAdminTab('users')"><i class="fa-solid fa-users"></i> Usuários</button>
                    <button class="global-admin-nav-btn ${activeTab === 'andarilho' ? 'active' : ''}" onclick="switchAdminTab('andarilho')"><i class="fa-solid fa-person-walking"></i> Andarilho</button>
                    <button class="global-admin-nav-btn ${activeTab === 'cities' ? 'active' : ''}" onclick="switchAdminTab('cities')"><i class="fa-solid fa-city"></i> Cidades (${allServers.length})</button>
                    <button class="global-admin-nav-btn ${activeTab === 'systems' ? 'active' : ''}" onclick="switchAdminTab('systems')"><i class="fa-solid fa-layer-group"></i> Sistemas (${allSystems.length})</button>
                    <button class="global-admin-nav-btn ${activeTab === 'settings' ? 'active' : ''}" onclick="switchAdminTab('settings')"><i class="fa-solid fa-gear"></i> Opções Globais</button>
                    <button class="global-admin-nav-btn" onclick="logoutAdmin()" style="margin-left: auto; color: #ff5252;"><i class="fa-solid fa-right-from-bracket"></i> Sair</button>
                </div>
                <div class="global-admin-body" id="admin-tab-body">
                    ${renderTabBody(activeTab, allServers, allSystems)}
                </div>
            `;

            if (activeTab === 'dashboard') {
                loadAdminDashboardView();
            } else if (activeTab === 'users') {
                loadAdminUsersView();
            } else if (activeTab === 'andarilho') {
                loadAdminWandererListView();
            } else if (activeTab === 'settings') {
                loadAdminSettingsView();
            }
        }
    }

    window.switchAdminTab = function(tab) {
        activeTab = tab;
        renderAdminContent();
    };

    window.handleAdminLogin = function (e) {
        e.preventDefault();
        const user = document.getElementById('admin-user-input').value.trim();
        const pass = document.getElementById('admin-pass-input').value.trim();

        if ((user === 'malaca' && pass === '199425') || (user === 'admin' && (pass === 'cidadealta123' || pass === 'admin'))) {
            isAuthenticated = true;
            renderAdminContent();
        } else {
            document.getElementById('admin-auth-err').style.display = 'block';
        }
    };

    window.logoutAdmin = function () {
        isAuthenticated = false;
        renderAdminContent();
    };

    function renderTabBody(tab, servers, systems) {
        if (tab === 'dashboard') {
            return `
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px;" id="admin-dashboard-stats-grid">
                        <div style="background: rgba(15,20,32,0.6); padding: 18px; border-radius: 14px; border: 1px solid rgba(88,101,242,0.3);">
                            <span style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; display: block;">USUÁRIOS DISCORD</span>
                            <span style="font-size: 26px; font-weight: 900; color: #818cf8; font-family: monospace; display: block; margin: 4px 0;" id="dash-stat-users">—</span>
                            <span style="font-size: 11px; color: #64748b;" id="dash-stat-admins">— Administradores</span>
                        </div>
                        <div style="background: rgba(15,20,32,0.6); padding: 18px; border-radius: 14px; border: 1px solid rgba(0,210,255,0.3);">
                            <span style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; display: block;">CIDADES RP</span>
                            <span style="font-size: 26px; font-weight: 900; color: #38bdf8; font-family: monospace; display: block; margin: 4px 0;">${servers.length}</span>
                            <span style="font-size: 11px; color: #64748b;">CDA, Valley e Los Santos</span>
                        </div>
                        <div style="background: rgba(15,20,32,0.6); padding: 18px; border-radius: 14px; border: 1px solid rgba(0,210,255,0.3);">
                            <span style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; display: block;">SISTEMAS ATIVOS</span>
                            <span style="font-size: 26px; font-weight: 900; color: #00d2ff; font-family: monospace; display: block; margin: 4px 0;">${systems.length}</span>
                            <span style="font-size: 11px; color: #64748b;">Mapa, Lockpick, Caixinha, Hacking</span>
                        </div>
                        <div style="background: rgba(15,20,32,0.6); padding: 18px; border-radius: 14px; border: 1px solid rgba(245,158,11,0.3);">
                            <span style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; display: block;">CICLO DO ANDARILHO</span>
                            <span style="font-size: 16px; font-weight: 900; color: #fbbf24; display: block; margin: 8px 0 4px 0;">06:00 / 18:00</span>
                            <span style="font-size: 11px; color: #22c55e;">● Auto-Reset Ativo</span>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
                        <div style="background: rgba(15,20,32,0.5); padding: 18px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);">
                            <h5 style="color: #fff; font-size: 13px; font-weight: 800; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                                <i class="fa-solid fa-bolt" style="color: #00d2ff;"></i> Atalhos Administrativos
                            </h5>
                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                <button onclick="switchAdminTab('users')" style="padding: 10px; border-radius: 8px; background: rgba(88,101,242,0.15); border: 1px solid rgba(88,101,242,0.3); color: #c7d2fe; font-size: 12px; font-weight: 800; cursor: pointer; text-align: left; display: flex; align-items: center; justify-content: space-between;">
                                    <span><i class="fa-solid fa-user-shield"></i> Gerenciar Usuários & Cargos</span>
                                    <i class="fa-solid fa-arrow-right"></i>
                                </button>
                                <button onclick="switchAdminTab('andarilho')" style="padding: 10px; border-radius: 8px; background: rgba(0,210,255,0.15); border: 1px solid rgba(0,210,255,0.3); color: #7dd3fc; font-size: 12px; font-weight: 800; cursor: pointer; text-align: left; display: flex; align-items: center; justify-content: space-between;">
                                    <span><i class="fa-solid fa-person-walking"></i> Gerenciar Pontos do Andarilho</span>
                                    <i class="fa-solid fa-arrow-right"></i>
                                </button>
                                <button onclick="switchAdminTab('settings')" style="padding: 10px; border-radius: 8px; background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.3); color: #fde68a; font-size: 12px; font-weight: 800; cursor: pointer; text-align: left; display: flex; align-items: center; justify-content: space-between;">
                                    <span><i class="fa-solid fa-bullhorn"></i> Transmitir Anúncio Global</span>
                                    <i class="fa-solid fa-arrow-right"></i>
                                </button>
                            </div>
                        </div>

                        <div style="background: rgba(15,20,32,0.5); padding: 18px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);">
                            <h5 style="color: #fff; font-size: 13px; font-weight: 800; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                                <i class="fa-solid fa-server" style="color: #22c55e;"></i> Status dos Serviços & Sincronização
                            </h5>
                            <div style="display: flex; flex-direction: column; gap: 10px; font-size: 12px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                                    <span style="color: #94a3b8;">Sincronização em Tempo Real:</span>
                                    <span style="color: #22c55e; font-weight: 800;">● CONECTADO</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                                    <span style="color: #94a3b8;">Banco de Dados Supabase:</span>
                                    <span style="color: #38bdf8; font-weight: 800;">ONLINE</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="color: #94a3b8;">Autenticação Discord OAuth:</span>
                                    <span style="color: #818cf8; font-weight: 800;">ATIVO</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else if (tab === 'users') {
            return `
                <div style="display: flex; flex-direction: column; gap: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                        <h4 style="font-family: var(--font-header); color: #fff; font-size: 0.95rem; margin: 0;">
                            <i class="fa-solid fa-users" style="color: #5865F2;"></i> Gestão de Usuários & Administradores
                        </h4>
                        <div style="display: flex; gap: 8px; flex: 1; max-width: 400px;">
                            <input type="text" id="admin-user-search-input" class="global-admin-input" placeholder="Buscar por nome, username ou ID..." oninput="filterAdminUsersView(this.value)" style="margin:0; padding: 7px 12px; font-size: 12px;">
                            <button onclick="loadAdminUsersView()" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #cbd5e1; padding: 6px 12px; border-radius: 8px; font-size: 0.72rem; cursor: pointer; display: flex; align-items: center; gap: 6px; white-space: nowrap;">
                                <i class="fa-solid fa-rotate"></i> Atualizar
                            </button>
                        </div>
                    </div>
                    <div id="admin-users-list-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(310px, 1fr)); gap: 12px;">
                        <div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 40px; font-size: 0.8rem;">
                            <i class="fa-solid fa-spinner fa-spin" style="font-size: 1.5rem; color: #5865F2; display: block; margin-bottom: 8px;"></i>
                            Carregando usuários...
                        </div>
                    </div>
                </div>
            `;
        } else if (tab === 'andarilho') {
            return `
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    <!-- Ciclo do Andarilho & Reset Geral -->
                    <div style="background: linear-gradient(135deg, rgba(0,210,255,0.15) 0%, rgba(15,20,32,0.8) 100%); padding: 20px; border-radius: 14px; border: 1px solid rgba(0,210,255,0.3); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
                        <div>
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                                <i class="fa-solid fa-clock" style="color: #00d2ff;"></i>
                                <h4 style="font-family: var(--font-header); color: #fff; font-size: 0.95rem; margin: 0;">Controle do Ciclo do Andarilho</h4>
                                <span style="font-size: 9px; font-weight: 800; background: rgba(0,210,255,0.2); color: #38bdf8; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(0,210,255,0.4);">RESET ÀS 06:00 / 18:00</span>
                            </div>
                            <p style="font-size: 11px; color: #94a3b8; margin: 0; max-width: 550px;">O sistema reinicia automaticamente os votos da comunidade nesses horários. Você também pode forçar o reset manual para todas as telas.</p>
                        </div>
                        <button onclick="handleResetWandererCycle()" style="padding: 10px 18px; border-radius: 10px; background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: #fff; font-size: 11px; font-weight: 900; border: none; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(245,158,11,0.3);">
                            <i class="fa-solid fa-rotate"></i> ZERAR VOTOS GERAIS AGORA
                        </button>
                    </div>

                    <!-- Formulário de Criação / Edição de Marcação do Andarilho -->
                    <div style="background: rgba(15,20,32,0.6); padding: 20px; border-radius: 14px; border: 1px solid rgba(0,210,255,0.25);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                            <h4 style="font-family: var(--font-header); color: #fff; font-size: 0.9rem; margin: 0; display: flex; align-items: center; gap: 8px;" id="wand-form-title">
                                <i class="fa-solid fa-location-crosshairs" style="color: #00d2ff;"></i> Cadastrar Nova Marcação do Andarilho
                            </h4>
                            <button id="wand-cancel-edit-btn" onclick="cancelEditWandererPoint()" style="display: none; background: none; border: none; color: #ff5252; font-size: 11px; font-weight: 800; cursor: pointer;">Cancelar Edição</button>
                        </div>
                        <form onsubmit="handleSaveWandererPoint(event)" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                            <input type="hidden" id="wand-point-id" value="">
                            <div>
                                <label style="font-size: 11px; font-weight: 700; color: #94a3b8; display: block; margin-bottom: 4px;">Nome / Identificador *</label>
                                <input type="text" id="wand-point-name" class="global-admin-input" placeholder="Ex: Ponto 01 - Farmacinha de Paleto" required style="margin:0;">
                            </div>
                            <div>
                                <label style="font-size: 11px; font-weight: 700; color: #94a3b8; display: block; margin-bottom: 4px;">Cidade / Servidor</label>
                                <select id="wand-point-city" class="global-admin-input" style="margin:0;">
                                    ${servers.map(s => `<option value="${s.id}">${s.name} (${s.slug.toUpperCase()})</option>`).join('')}
                                </select>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                                <div>
                                    <label style="font-size: 11px; font-weight: 700; color: #94a3b8; display: block; margin-bottom: 4px;">Coord. X</label>
                                    <input type="number" step="0.1" id="wand-point-x" class="global-admin-input" placeholder="ex: 785.4" required style="margin:0;">
                                </div>
                                <div>
                                    <label style="font-size: 11px; font-weight: 700; color: #94a3b8; display: block; margin-bottom: 4px;">Coord. Y</label>
                                    <input type="number" step="0.1" id="wand-point-y" class="global-admin-input" placeholder="ex: 290.1" required style="margin:0;">
                                </div>
                            </div>
                            <div style="grid-column: 1 / -1;">
                                <label style="font-size: 11px; font-weight: 700; color: #94a3b8; display: block; margin-bottom: 4px;">Dica / Pista do Andarilho (Aparece no balão do mapa)</label>
                                <input type="text" id="wand-point-hint" class="global-admin-input" placeholder="Ex: Próximo à cerca de madeira na beira do penhasco, atrás do galpão." style="margin:0;">
                            </div>
                            <div style="grid-column: 1 / -1; display: flex; gap: 10px; margin-top: 4px;">
                                <button type="submit" class="global-admin-submit" style="width: auto; padding: 10px 24px;" id="wand-submit-btn">SALVAR MARCAÇÃO NO MAPA</button>
                            </div>
                        </form>
                    </div>

                    <!-- Lista de Todas as Marcações de Andarilho -->
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                            <h4 style="font-family: var(--font-header); color: #fff; font-size: 0.95rem; margin: 0;">
                                <i class="fa-solid fa-map-pin" style="color: #00d2ff;"></i> Marcações Cadastradas do Andarilho
                            </h4>
                            <div style="display: flex; gap: 8px;">
                                <input type="text" id="wand-search-input" class="global-admin-input" placeholder="Buscar por nome ou dica..." oninput="filterAdminWandererList(this.value)" style="margin:0; padding: 6px 12px; font-size: 12px; max-width: 250px;">
                                <select id="wand-filter-city-select" class="global-admin-input" onchange="filterAdminWandererByCity(this.value)" style="margin:0; padding: 6px 10px; font-size: 12px; width: auto;">
                                    <option value="all">Todas as Cidades</option>
                                    ${servers.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        <div id="admin-wanderer-list-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(310px, 1fr)); gap: 12px;">
                            <div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 30px; font-size: 0.8rem;">
                                <i class="fa-solid fa-spinner fa-spin" style="font-size: 1.5rem; color: #00d2ff; display: block; margin-bottom: 8px;"></i>
                                Carregando marcações do Andarilho...
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else if (tab === 'cities') {
            const editingCity = editingCityId ? servers.find(s => s.id === editingCityId) : null;
            return `
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    <!-- Formulário de Criação / Edição de Cidade -->
                    <div style="background: rgba(15,20,32,0.6); padding: 20px; border-radius: 14px; border: 1px solid rgba(0,210,255,0.25);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                            <h4 style="font-family: var(--font-header); color: #fff; font-size: 0.9rem; margin: 0; display: flex; align-items: center; gap: 8px;">
                                <i class="fa-solid fa-city" style="color: #00d2ff;"></i> ${editingCity ? 'Editar Servidor / Cidade' : 'Adicionar Novo Servidor / Cidade'}
                            </h4>
                            ${editingCity ? '<button onclick="cancelEditCity()" style="background: none; border: none; color: #ff5252; font-size: 11px; font-weight: 800; cursor: pointer;">Cancelar Edição</button>' : ''}
                        </div>
                        <form onsubmit="handleSaveCity(event)" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                            <div>
                                <label style="font-size: 11px; font-weight: 700; color: #94a3b8; display: block; margin-bottom: 4px;">Nome da Cidade / Servidor *</label>
                                <input type="text" id="city-form-name" class="global-admin-input" placeholder="Ex: Cidade Alta RP" value="${editingCity ? editingCity.name : ''}" required style="margin:0;">
                            </div>
                            <div>
                                <label style="font-size: 11px; font-weight: 700; color: #94a3b8; display: block; margin-bottom: 4px;">Slug URL *</label>
                                <input type="text" id="city-form-slug" class="global-admin-input" placeholder="ex: cda" value="${editingCity ? editingCity.slug : ''}" required style="margin:0;">
                            </div>
                            <div>
                                <label style="font-size: 11px; font-weight: 700; color: #94a3b8; display: block; margin-bottom: 4px;">Subtítulo / Descrição Curta</label>
                                <input type="text" id="city-form-sub" class="global-admin-input" placeholder="ex: SERVIDORES CDA & VALLEY" value="${editingCity ? (editingCity.subtitle || '') : ''}" style="margin:0;">
                            </div>
                            <div>
                                <label style="font-size: 11px; font-weight: 700; color: #94a3b8; display: block; margin-bottom: 4px;">Imagem de Banner (URL opcional)</label>
                                <input type="text" id="city-form-banner" class="global-admin-input" placeholder="ex: /images/cda_banner.jpg" value="${editingCity ? (editingCity.banner_image_url || '') : ''}" style="margin:0;">
                            </div>
                            <div style="grid-column: 1 / -1; display: flex; gap: 10px; margin-top: 4px;">
                                <button type="submit" class="global-admin-submit" style="width: auto; padding: 10px 24px;">${editingCity ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR CIDADE'}</button>
                            </div>
                        </form>
                    </div>

                    <!-- Lista de Cidades Cadastradas -->
                    <div>
                        <h4 style="font-family: var(--font-header); color: #fff; font-size: 0.95rem; margin-bottom: 12px;">
                            <i class="fa-solid fa-list-ol" style="color: #00d2ff;"></i> Cidades Ativas na Plataforma (${servers.length})
                        </h4>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            ${servers.map((s, idx) => `
                                <div style="background: rgba(15,20,32,0.5); padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
                                    <div style="display: flex; align-items: center; gap: 12px;">
                                        <div style="width: 28px; height: 28px; border-radius: 6px; background: rgba(0,210,255,0.1); border: 1px solid rgba(0,210,255,0.3); display: flex; align-items: center; justify-content: center; color: #38bdf8; font-weight: 900; font-size: 12px;">
                                            ${idx + 1}
                                        </div>
                                        <div>
                                            <div style="color: #fff; font-size: 14px; font-weight: 800;">${s.name} <span style="font-size: 11px; color: #38bdf8; font-family: monospace;">/${s.slug}/</span></div>
                                            <div style="color: #64748b; font-size: 11px;">${s.subtitle || 'Servidor RP'}</div>
                                        </div>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 6px;">
                                        <button onclick="moveCityUp(${idx})" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; width: 28px; height: 28px; border-radius: 6px; cursor: pointer;" title="Mover para Cima"><i class="fa-solid fa-arrow-up"></i></button>
                                        <button onclick="moveCityDown(${idx})" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; width: 28px; height: 28px; border-radius: 6px; cursor: pointer;" title="Mover para Baixo"><i class="fa-solid fa-arrow-down"></i></button>
                                        <button onclick="startEditCity('${s.id}')" style="background: rgba(0,210,255,0.15); border: 1px solid rgba(0,210,255,0.3); color: #38bdf8; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 800; cursor: pointer;"><i class="fa-solid fa-pen-to-square"></i> Editar</button>
                                        <button onclick="deleteCity('${s.id}', '${s.name}')" style="background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #f87171; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 800; cursor: pointer;"><i class="fa-solid fa-trash"></i> Excluir</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        } else if (tab === 'systems') {
            const editingSys = editingSystemId ? systems.find(s => s.id === editingSystemId) : null;
            return `
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    <!-- Formulário de Criação / Edição de Sistema -->
                    <div style="background: rgba(15,20,32,0.6); padding: 20px; border-radius: 14px; border: 1px solid rgba(0,210,255,0.25);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                            <h4 style="font-family: var(--font-header); color: #fff; font-size: 0.9rem; margin: 0; display: flex; align-items: center; gap: 8px;">
                                <i class="fa-solid fa-layer-group" style="color: #00d2ff;"></i> ${editingSys ? 'Editar Sistema RP' : 'Cadastrar Novo Sistema RP'}
                            </h4>
                            ${editingSys ? '<button onclick="cancelEditSystem()" style="background: none; border: none; color: #ff5252; font-size: 11px; font-weight: 800; cursor: pointer;">Cancelar Edição</button>' : ''}
                        </div>
                        <form onsubmit="handleSaveSystem(event)" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                            <div>
                                <label style="font-size: 11px; font-weight: 700; color: #94a3b8; display: block; margin-bottom: 4px;">Nome do Sistema *</label>
                                <input type="text" id="sys-form-name" class="global-admin-input" placeholder="Ex: Mapa Interativo" value="${editingSys ? editingSys.name : ''}" required style="margin:0;">
                            </div>
                            <div>
                                <label style="font-size: 11px; font-weight: 700; color: #94a3b8; display: block; margin-bottom: 4px;">Slug / Rota *</label>
                                <input type="text" id="sys-form-slug" class="global-admin-input" placeholder="ex: mapa-interativo" value="${editingSys ? (editingSys.slug || '') : ''}" required style="margin:0;">
                            </div>
                            <div>
                                <label style="font-size: 11px; font-weight: 700; color: #94a3b8; display: block; margin-bottom: 4px;">Tag / Badge</label>
                                <input type="text" id="sys-form-tag" class="global-admin-input" placeholder="ex: REALTIME GPS" value="${editingSys ? (editingSys.tag || '') : ''}" style="margin:0;">
                            </div>
                            <div>
                                <label style="font-size: 11px; font-weight: 700; color: #94a3b8; display: block; margin-bottom: 4px;">Link Direto (Opcional)</label>
                                <input type="text" id="sys-form-link" class="global-admin-input" placeholder="ex: /cidades/cda/mapa/" value="${editingSys ? (editingSys.link || '') : ''}" style="margin:0;">
                            </div>
                            <div style="grid-column: 1 / -1;">
                                <label style="font-size: 11px; font-weight: 700; color: #94a3b8; display: block; margin-bottom: 6px;">Cidades Vinculadas (Onde o sistema deve aparecer)</label>
                                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                                    ${servers.map(s => {
                                        const isChecked = editingSys ? (editingSys.city_ids && (editingSys.city_ids.includes(s.id) || editingSys.city_ids.includes(s.slug) || editingSys.city_ids.includes(`${s.slug}-server-uuid`))) : true;
                                        return `
                                            <label style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: #cbd5e1; cursor: pointer; background: rgba(255,255,255,0.04); padding: 6px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08);">
                                                <input type="checkbox" name="city-link-check" value="${s.id}" ${isChecked ? 'checked' : ''}>
                                                <span>${s.name} (${s.slug.toUpperCase()})</span>
                                            </label>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                            <div style="grid-column: 1 / -1; display: flex; gap: 10px; margin-top: 4px;">
                                <button type="submit" class="global-admin-submit" style="width: auto; padding: 10px 24px;">${editingSys ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR SISTEMA'}</button>
                            </div>
                        </form>
                    </div>

                    <!-- Lista de Sistemas Cadastrados -->
                    <div>
                        <h4 style="font-family: var(--font-header); color: #fff; font-size: 0.95rem; margin-bottom: 12px;">
                            <i class="fa-solid fa-list-check" style="color: #00d2ff;"></i> Sistemas Cadastrados (${systems.length})
                        </h4>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            ${systems.map((s, idx) => `
                                <div style="background: rgba(15,20,32,0.5); padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
                                    <div>
                                        <div style="color: #fff; font-size: 14px; font-weight: 800; display: flex; align-items: center; gap: 8px;">
                                            <i class="fa-solid ${s.icon || 'fa-microchip'}" style="color: #00d2ff;"></i>
                                            <span>${s.name}</span>
                                            <span style="font-size: 10px; font-weight: 800; background: rgba(0,210,255,0.15); color: #38bdf8; padding: 2px 6px; border-radius: 4px;">${s.tag || 'SISTEMA'}</span>
                                        </div>
                                        <div style="color: #64748b; font-size: 11px; margin-top: 2px;">Rota: ${s.link || s.slug}</div>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 6px;">
                                        <button onclick="moveSystemUp(${idx})" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; width: 28px; height: 28px; border-radius: 6px; cursor: pointer;" title="Mover para Cima"><i class="fa-solid fa-arrow-up"></i></button>
                                        <button onclick="moveSystemDown(${idx})" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; width: 28px; height: 28px; border-radius: 6px; cursor: pointer;" title="Mover para Baixo"><i class="fa-solid fa-arrow-down"></i></button>
                                        <button onclick="startEditSystem('${s.id}')" style="background: rgba(0,210,255,0.15); border: 1px solid rgba(0,210,255,0.3); color: #38bdf8; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 800; cursor: pointer;"><i class="fa-solid fa-pen-to-square"></i> Editar</button>
                                        <button onclick="deleteSystem('${s.id}', '${s.name}')" style="background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #f87171; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 800; cursor: pointer;"><i class="fa-solid fa-trash"></i> Excluir</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        } else if (tab === 'settings') {
            return `
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    <!-- Anúncio Global -->
                    <div style="background: rgba(15,20,32,0.6); padding: 20px; border-radius: 14px; border: 1px solid rgba(245,158,11,0.25);">
                        <h4 style="font-family: var(--font-header); color: #fff; font-size: 0.95rem; margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
                            <i class="fa-solid fa-bullhorn" style="color: #fbbf24;"></i> Transmissão de Anúncio Global
                        </h4>
                        <p style="font-size: 12px; color: #94a3b8; margin-bottom: 14px;">Exibe uma barra de alerta dourada no topo de todas as páginas da plataforma em tempo real.</p>
                        <form onsubmit="handleSaveGlobalAnnouncement(event)">
                            <div style="margin-bottom: 12px;">
                                <input type="text" id="setting-announcement-text" class="global-admin-input" placeholder="Ex: Novo simulador de Hacking liberado para todos os servidores!" style="margin:0;">
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                                <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #e2e8f0; cursor: pointer;">
                                    <input type="checkbox" id="setting-announcement-active">
                                    <span>Exibir anúncio no topo da plataforma</span>
                                </label>
                                <button type="submit" class="global-admin-submit" style="width: auto; padding: 8px 20px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #000; font-weight: 900;">SALVAR E TRANSMITIR</button>
                            </div>
                        </form>
                    </div>

                    <!-- Modo de Manutenção -->
                    <div style="background: rgba(15,20,32,0.6); padding: 20px; border-radius: 14px; border: 1px solid rgba(239,68,68,0.25);">
                        <h4 style="font-family: var(--font-header); color: #fff; font-size: 0.95rem; margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
                            <i class="fa-solid fa-triangle-exclamation" style="color: #f87171;"></i> Modo de Manutenção da Plataforma
                        </h4>
                        <p style="font-size: 12px; color: #94a3b8; margin-bottom: 14px;">Quando ativo, bloqueia acessos públicos e mantém os sistemas abertos apenas para administradores logados.</p>
                        <form onsubmit="handleSaveMaintenance(event)">
                            <div style="margin-bottom: 12px;">
                                <input type="text" id="setting-maint-msg" class="global-admin-input" placeholder="Mensagem de manutenção..." value="Plataforma em manutenção para atualização de sistemas." style="margin:0;">
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                                <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #e2e8f0; cursor: pointer;">
                                    <input type="checkbox" id="setting-maint-active">
                                    <span style="color: #fca5a5; font-weight: 700;">Ativar Modo de Manutenção</span>
                                </label>
                                <button type="submit" class="global-admin-submit" style="width: auto; padding: 8px 20px; background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.4); color: #fca5a5;">ATUALIZAR STATUS</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
        }
        return '';
    }


    // City Edit / Reorder / Delete Handlers
    window.startEditCity = function(id) {
        editingCityId = id;
        renderAdminContent();
    };

    window.cancelEditCity = function() {
        editingCityId = null;
        renderAdminContent();
    };

    window.handleSaveCity = async function(e) {
        e.preventDefault();
        const name = document.getElementById('city-form-name').value.trim();
        const slug = document.getElementById('city-form-slug').value.trim();
        const sub = document.getElementById('city-form-sub').value.trim();
        const banner = document.getElementById('city-form-banner').value.trim();

        let servers = getActiveServers();
        let targetCity = null;

        if (editingCityId) {
            servers = servers.map(s => {
                if (s.id === editingCityId) {
                    targetCity = { ...s, name, slug, subtitle: sub, banner_image_url: banner };
                    return targetCity;
                }
                return s;
            });
            editingCityId = null;
        } else {
            targetCity = {
                id: 'city-' + Date.now(),
                name,
                slug,
                subtitle: sub,
                banner_image_url: banner,
                description: 'Cidade cadastrada via Admin.',
                active: true,
            };
            servers.push(targetCity);
        }

        localStorage.setItem('malaca_custom_servers', JSON.stringify(servers));

        try {
            await supabaseClient.from('servers').upsert([targetCity], { onConflict: 'id' });
        } catch(e) {}

        globalHubChannel.send({
            type: 'broadcast',
            event: 'servers_updated',
            payload: { servers, targetCity },
        });
        globalHubChannel.send({
            type: 'broadcast',
            event: 'entity_sync',
            payload: { entity: 'servers', action: 'UPDATE', data: targetCity, timestamp: Date.now() },
        });

        alert('Cidade salva no banco de dados e sincronizada em tempo real com todos os usuários!');
        renderAdminContent();
        if (window.loadCustomCities) window.loadCustomCities();
    };

    window.moveCityUp = function(idx) {
        if (idx <= 0) return;
        let servers = getActiveServers();
        const temp = servers[idx - 1];
        servers[idx - 1] = servers[idx];
        servers[idx] = temp;
        localStorage.setItem('malaca_custom_servers', JSON.stringify(servers));

        globalHubChannel.send({
            type: 'broadcast',
            event: 'servers_updated',
            payload: { servers },
        });

        renderAdminContent();
        if (window.loadCustomCities) window.loadCustomCities();
    };

    window.moveCityDown = function(idx) {
        let servers = getActiveServers();
        if (idx >= servers.length - 1) return;
        const temp = servers[idx + 1];
        servers[idx + 1] = servers[idx];
        servers[idx] = temp;
        localStorage.setItem('malaca_custom_servers', JSON.stringify(servers));

        globalHubChannel.send({
            type: 'broadcast',
            event: 'servers_updated',
            payload: { servers },
        });

        renderAdminContent();
        if (window.loadCustomCities) window.loadCustomCities();
    };

    window.deleteCity = async function(id, name) {
        if (confirm(`Tem certeza que deseja excluir a cidade "${name}"?`)) {
            let servers = getActiveServers();
            servers = servers.filter(s => s.id !== id);
            localStorage.setItem('malaca_custom_servers', JSON.stringify(servers));

            try {
                await supabaseClient.from('servers').delete().eq('id', id);
            } catch(e) {}

            globalHubChannel.send({
                type: 'broadcast',
                event: 'servers_updated',
                payload: { servers, deletedId: id },
            });
            globalHubChannel.send({
                type: 'broadcast',
                event: 'entity_sync',
                payload: { entity: 'servers', action: 'DELETE', id: id, timestamp: Date.now() },
            });

            renderAdminContent();
            if (window.loadCustomCities) window.loadCustomCities();
        }
    };

    // System Edit / Reorder / Delete Handlers
    window.startEditSystem = function(id) {
        editingSystemId = id;
        renderAdminContent();
    };

    window.cancelEditSystem = function() {
        editingSystemId = null;
        renderAdminContent();
    };

    window.handleSaveSystem = async function(e) {
        e.preventDefault();
        const name = document.getElementById('sys-form-name').value.trim();
        const slug = document.getElementById('sys-form-slug').value.trim();
        const tag = document.getElementById('sys-form-tag').value.trim();
        const link = document.getElementById('sys-form-link').value.trim();
        const checked = Array.from(document.querySelectorAll('input[name="city-link-check"]:checked')).map(c => c.value);

        let systems = getActiveSystems();
        let targetSys = null;

        if (editingSystemId) {
            systems = systems.map(s => {
                if (s.id === editingSystemId) {
                    targetSys = { ...s, name, slug, tag, link, city_ids: checked };
                    return targetSys;
                }
                return s;
            });
            editingSystemId = null;
        } else {
            targetSys = {
                id: 'sys-' + Date.now(),
                name,
                slug,
                tag,
                link: link || `${slug}/`,
                city_ids: checked,
                is_active: true,
                description: 'Sistema cadastrado via Admin.',
                icon: 'fa-microchip',
            };
            systems.push(targetSys);
        }

        localStorage.setItem('malaca_custom_systems', JSON.stringify(systems));

        try {
            await supabaseClient.from('systems').upsert([targetSys], { onConflict: 'id' });
        } catch(e) {}

        globalHubChannel.send({
            type: 'broadcast',
            event: 'systems_updated',
            payload: { systems, targetSys },
        });
        globalHubChannel.send({
            type: 'broadcast',
            event: 'entity_sync',
            payload: { entity: 'systems', action: 'UPDATE', data: targetSys, timestamp: Date.now() },
        });

        alert('Sistema salvo no banco de dados e sincronizado em tempo real!');
        renderAdminContent();
    };

    window.moveSystemUp = function(idx) {
        if (idx <= 0) return;
        let systems = getActiveSystems();
        const temp = systems[idx - 1];
        systems[idx - 1] = systems[idx];
        systems[idx] = temp;
        localStorage.setItem('malaca_custom_systems', JSON.stringify(systems));

        globalHubChannel.send({
            type: 'broadcast',
            event: 'systems_updated',
            payload: { systems },
        });

        renderAdminContent();
    };

    window.moveSystemDown = function(idx) {
        let systems = getActiveSystems();
        if (idx >= systems.length - 1) return;
        const temp = systems[idx + 1];
        systems[idx + 1] = systems[idx];
        systems[idx] = temp;
        localStorage.setItem('malaca_custom_systems', JSON.stringify(systems));

        globalHubChannel.send({
            type: 'broadcast',
            event: 'systems_updated',
            payload: { systems },
        });

        renderAdminContent();
    };

    window.deleteSystem = async function(id, name) {
        if (confirm(`Tem certeza que deseja excluir o sistema "${name}"?`)) {
            let systems = getActiveSystems();
            systems = systems.filter(s => s.id !== id);
            localStorage.setItem('malaca_custom_systems', JSON.stringify(systems));

            try {
                await supabaseClient.from('systems').delete().eq('id', id);
            } catch(e) {}

            globalHubChannel.send({
                type: 'broadcast',
                event: 'systems_updated',
                payload: { systems, deletedId: id },
            });
            globalHubChannel.send({
                type: 'broadcast',
                event: 'entity_sync',
                payload: { entity: 'systems', action: 'DELETE', id: id, timestamp: Date.now() },
            });

            renderAdminContent();
        }
    };

    window.handleResetWandererCycle = async function() {
        if (confirm('Zerar votos do Andarilho e sincronizar todas as telas em tempo real?')) {
            localStorage.removeItem('cidade_alta_user_confirmations');
            localStorage.removeItem('malaca_wanderer_cycle_state');

            try {
                await supabaseClient.from('wanderer_confirmations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            } catch(e) {}

            globalHubChannel.send({
                type: 'broadcast',
                event: 'wanderer_cycle_reset',
                payload: { resetBy: 'admin', timestamp: Date.now() },
            });

            alert('Ciclo do Andarilho zerado com sucesso! Todas as telas conectadas foram atualizadas.');
        }
    };

    // Dashboard View Handler
    window.loadAdminDashboardView = async function() {
        const usersEl = document.getElementById('dash-stat-users');
        const adminsEl = document.getElementById('dash-stat-admins');
        if (!usersEl) return;

        let totalUsers = 0;
        let totalAdmins = 0;

        try {
            const { data } = await supabaseClient.from('profiles').select('id, is_admin, role');
            if (data && Array.isArray(data)) {
                totalUsers = data.length;
                totalAdmins = data.filter(u => u.is_admin || u.role === 'admin').length;
            }
        } catch(e) {}

        if (totalUsers === 0) {
            try {
                const cached = JSON.parse(localStorage.getItem('malaca_cached_profiles') || '[]');
                if (cached.length > 0) {
                    totalUsers = cached.length;
                    totalAdmins = cached.filter(u => u.is_admin || u.role === 'admin').length;
                }
            } catch(e) {}
        }

        usersEl.textContent = totalUsers > 0 ? String(totalUsers) : '1';
        if (adminsEl) adminsEl.textContent = `${Math.max(1, totalAdmins)} Administradores Ativos`;
    };

    // Admin Users Management View
    let adminUsersCache = [];
    window.loadAdminUsersView = async function() {
        const container = document.getElementById('admin-users-list-container');
        if (!container) return;
        try {
            const { data, error } = await supabaseClient.from('profiles').select('*').order('created_at', { ascending: false });
            if (error) console.warn('Supabase profiles fetch warning:', error);

            let users = Array.isArray(data) && data.length > 0 ? data : [];

            // Fallback / Merge with local cache
            try {
                const localProfiles = JSON.parse(localStorage.getItem('malaca_cached_profiles') || '[]');
                const currentProfile = JSON.parse(localStorage.getItem('malaca_user_profile') || 'null');
                if (currentProfile && !users.some(u => u.id === currentProfile.id || u.discord_id === currentProfile.discord_id)) {
                    users.unshift(currentProfile);
                }
                localProfiles.forEach(lp => {
                    if (!users.some(u => u.id === lp.id || u.discord_id === lp.discord_id)) {
                        users.push(lp);
                    }
                });
            } catch(e) {}

            // Save to cache
            adminUsersCache = users;
            localStorage.setItem('malaca_cached_profiles', JSON.stringify(users));

            renderAdminUsersList(users);
        } catch(e) {
            container.innerHTML = `<div style="grid-column: 1/-1; color: #f87171; font-size: 0.75rem; text-align: center; padding: 20px;">Falha ao carregar usuários: ${e.message}</div>`;
        }
    };

    function renderAdminUsersList(users) {
        const container = document.getElementById('admin-users-list-container');
        if (!container) return;

        if (!users || users.length === 0) {
            container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 30px; font-size: 0.8rem;">Nenhum usuário cadastrado ainda.</div>';
            return;
        }

        const customAdmins = JSON.parse(localStorage.getItem('malaca_admin_discord_accounts') || '[]');
        const customBanned = JSON.parse(localStorage.getItem('malaca_banned_discord_accounts') || '[]');

        container.innerHTML = users.map(u => {
            const discordId = String(u.discord_id || u.id || '');
            const isAdmin = u.is_admin || u.role === 'admin' || customAdmins.includes(discordId) || ['722320491767136346', '917826984778797087'].includes(discordId);
            const isBanned = u.is_banned === true || customBanned.includes(discordId);

            return `
                <div style="background: rgba(15,20,32,0.6); padding: 14px; border-radius: 12px; border: 1px solid ${isBanned ? 'rgba(239,68,68,0.5)' : isAdmin ? 'rgba(88,101,242,0.5)' : 'rgba(255,255,255,0.06)'}; display: flex; flex-direction: column; gap: 10px; position: relative;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <img src="${u.avatar_url || 'https://cdn.discordapp.com/embed/avatars/0.png'}" style="width: 44px; height: 44px; border-radius: 50%; border: 2px solid ${isAdmin ? '#5865F2' : '#38bdf8'}; object-fit: cover; flex-shrink: 0;" />
                        <div style="min-width: 0; flex: 1;">
                            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                                <h5 style="color: #fff; font-size: 0.85rem; font-weight: 800; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px;">${u.full_name || u.username}</h5>
                                ${isAdmin ? '<span style="font-size: 9px; font-weight: 800; background: rgba(88,101,242,0.25); color: #818cf8; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(88,101,242,0.5);">ADMIN</span>' : ''}
                                ${isBanned ? '<span style="font-size: 9px; font-weight: 800; background: rgba(239,68,68,0.25); color: #fca5a5; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(239,68,68,0.5);">BANIDO</span>' : ''}
                            </div>
                            <span style="color: #38bdf8; font-size: 0.72rem; font-weight: 700; display: block;">@${u.username}</span>
                            <div style="color: #64748b; font-size: 0.68rem; font-family: monospace;">ID Discord: ${discordId || '—'}</div>
                        </div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap;">
                        <button onclick="toggleAdminProfile('${u.id}', '${discordId}', ${isAdmin})" style="background: ${isAdmin ? 'rgba(245,158,11,0.15)' : 'rgba(88,101,242,0.15)'}; border: 1px solid ${isAdmin ? 'rgba(245,158,11,0.4)' : 'rgba(88,101,242,0.4)'}; color: ${isAdmin ? '#fde68a' : '#c7d2fe'}; padding: 5px 8px; border-radius: 6px; font-size: 0.68rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                            <i class="fa-solid fa-shield"></i> ${isAdmin ? 'Remover Admin' : 'Tornar Admin'}
                        </button>
                        <button onclick="toggleBanProfile('${u.id}', '${discordId}', ${isBanned})" style="background: ${isBanned ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}; border: 1px solid ${isBanned ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}; color: ${isBanned ? '#86efac' : '#fca5a5'}; padding: 5px 8px; border-radius: 6px; font-size: 0.68rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                            <i class="fa-solid fa-ban"></i> ${isBanned ? 'Desbanir' : 'Banir'}
                        </button>
                        <button onclick="deleteUserProfile('${u.id}', '${u.username || 'Usuário'}', '${discordId}')" style="background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.35); color: #f87171; padding: 5px 8px; border-radius: 6px; font-size: 0.68rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px;" title="Excluir Usuário">
                            <i class="fa-solid fa-trash"></i> Excluir
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    window.filterAdminUsersView = function(query) {
        const q = (query || '').toLowerCase().trim();
        if (!q) {
            renderAdminUsersList(adminUsersCache);
            return;
        }
        const filtered = adminUsersCache.filter(u => 
            (u.username && u.username.toLowerCase().includes(q)) ||
            (u.full_name && u.full_name.toLowerCase().includes(q)) ||
            (u.discord_id && String(u.discord_id).toLowerCase().includes(q)) ||
            (u.id && String(u.id).toLowerCase().includes(q))
        );
        renderAdminUsersList(filtered);
    };

    window.toggleAdminProfile = async function(id, discordId, currentIsAdmin) {
        const newAdmin = !currentIsAdmin;
        try {
            // Update Supabase
            try {
                await supabaseClient.from('profiles').update({ is_admin: newAdmin, role: newAdmin ? 'admin' : 'user' }).eq('id', id);
            } catch(e) {}

            // Update local admin lists
            let customAdmins = JSON.parse(localStorage.getItem('malaca_admin_discord_accounts') || '[]');
            if (newAdmin) {
                if (discordId && !customAdmins.includes(discordId)) customAdmins.push(discordId);
            } else {
                customAdmins = customAdmins.filter(d => d !== discordId && d !== id);
            }
            localStorage.setItem('malaca_admin_discord_accounts', JSON.stringify(customAdmins));

            // Update cached profiles
            let cached = JSON.parse(localStorage.getItem('malaca_cached_profiles') || '[]');
            cached = cached.map(u => (u.id === id || u.discord_id === discordId) ? { ...u, is_admin: newAdmin, role: newAdmin ? 'admin' : 'user' } : u);
            localStorage.setItem('malaca_cached_profiles', JSON.stringify(cached));

            // If it's current user
            const current = JSON.parse(localStorage.getItem('malaca_user_profile') || 'null');
            if (current && (current.id === id || current.discord_id === discordId)) {
                current.is_admin = newAdmin;
                current.role = newAdmin ? 'admin' : 'user';
                localStorage.setItem('malaca_user_profile', JSON.stringify(current));
            }

            globalHubChannel.send({
                type: 'broadcast',
                event: 'user_permission_updated',
                payload: { id, discordId, is_admin: newAdmin, role: newAdmin ? 'admin' : 'user' }
            });

            alert(`Permissão atualizada com sucesso para: ${newAdmin ? 'ADMINISTRADOR' : 'USUÁRIO'}`);
            loadAdminUsersView();
        } catch(e) {
            alert('Erro ao atualizar permissão: ' + e.message);
        }
    };

    window.toggleBanProfile = async function(id, discordId, currentIsBanned) {
        const newBanned = !currentIsBanned;
        try {
            // Update Supabase
            try {
                await supabaseClient.from('profiles').update({ is_banned: newBanned }).eq('id', id);
            } catch(e) {}

            // Update local banned accounts list
            let customBanned = JSON.parse(localStorage.getItem('malaca_banned_discord_accounts') || '[]');
            if (newBanned) {
                if (discordId && !customBanned.includes(discordId)) customBanned.push(discordId);
            } else {
                customBanned = customBanned.filter(d => d !== discordId && d !== id);
            }
            localStorage.setItem('malaca_banned_discord_accounts', JSON.stringify(customBanned));

            // Update cached profiles
            let cached = JSON.parse(localStorage.getItem('malaca_cached_profiles') || '[]');
            cached = cached.map(u => (u.id === id || u.discord_id === discordId) ? { ...u, is_banned: newBanned } : u);
            localStorage.setItem('malaca_cached_profiles', JSON.stringify(cached));

            // If it's current user
            const current = JSON.parse(localStorage.getItem('malaca_user_profile') || 'null');
            if (current && (current.id === id || current.discord_id === discordId)) {
                current.is_banned = newBanned;
                localStorage.setItem('malaca_user_profile', JSON.stringify(current));
            }

            globalHubChannel.send({
                type: 'broadcast',
                event: 'user_ban_updated',
                payload: { id, discordId, is_banned: newBanned }
            });

            alert(`Usuário ${newBanned ? 'BANIDO' : 'DESBANIDO'} com sucesso.`);
            loadAdminUsersView();
        } catch(e) {
            alert('Erro ao atualizar banimento: ' + e.message);
        }
    };

    window.deleteUserProfile = async function(id, username, discordId) {
        if (!confirm(`Deseja EXCLUIR permanentemente o usuário "${username}" (${discordId || id}) da plataforma? Esta ação não pode ser desfeita.`)) {
            return;
        }

        try {
            // Delete from Supabase
            try {
                await supabaseClient.from('profiles').delete().eq('id', id);
            } catch(e) {}

            // Clean local cache & permissions
            let cached = JSON.parse(localStorage.getItem('malaca_cached_profiles') || '[]');
            cached = cached.filter(u => u.id !== id && u.discord_id !== discordId);
            localStorage.setItem('malaca_cached_profiles', JSON.stringify(cached));

            let customAdmins = JSON.parse(localStorage.getItem('malaca_admin_discord_accounts') || '[]');
            customAdmins = customAdmins.filter(d => d !== discordId && d !== id);
            localStorage.setItem('malaca_admin_discord_accounts', JSON.stringify(customAdmins));

            let customBanned = JSON.parse(localStorage.getItem('malaca_banned_discord_accounts') || '[]');
            customBanned = customBanned.filter(d => d !== discordId && d !== id);
            localStorage.setItem('malaca_banned_discord_accounts', JSON.stringify(customBanned));

            // If deleting own profile
            const current = JSON.parse(localStorage.getItem('malaca_user_profile') || 'null');
            if (current && (current.id === id || current.discord_id === discordId)) {
                localStorage.removeItem('malaca_user_profile');
                syncDiscordNavButton();
            }

            globalHubChannel.send({
                type: 'broadcast',
                event: 'entity_sync',
                payload: { entity: 'profiles', action: 'DELETE', id: id, discordId: discordId, timestamp: Date.now() }
            });

            alert(`Usuário "${username}" foi excluído com sucesso!`);
            loadAdminUsersView();
        } catch(e) {
            alert('Erro ao excluir usuário: ' + e.message);
        }
    };

    // --- GESTÃO COMPLETA DE MARCAÇÕES DO ANDARILHO ---
    let wandererLocationsCache = [];
    let editingWandererPointId = null;

    const defaultWandererPoints = [
        { id: 'wand-1', name: 'Ponto 01 - Farol de El Gordo', city_id: 'cda-server-uuid', coords: { x: 3326.5, y: 5163.2 }, hint: 'Próximo à cerca de madeira na beira do penhasco, atrás do galpão.' },
        { id: 'wand-2', name: 'Ponto 02 - Galpão Abandonado Sandy', city_id: 'cda-server-uuid', coords: { x: 1729.8, y: 3314.1 }, hint: 'Dentro do galpão de madeira com telhado quebrado.' },
        { id: 'wand-3', name: 'Ponto 03 - Cabana do Monte Chiliad', city_id: 'cda-server-uuid', coords: { x: -442.1, y: 5972.4 }, hint: 'Atrás da cabana de montanha, perto dos pinheiros altos.' },
        { id: 'wand-4', name: 'Ponto 04 - Refúgio da Serraria Paleto', city_id: 'cda-server-uuid', coords: { x: -582.4, y: 5318.9 }, hint: 'Perto do empilhamento de toras de madeira na serraria.' },
        { id: 'wand-5', name: 'Ponto 05 - Píer de Del Perro', city_id: 'valley-server-uuid', coords: { x: -1642.3, y: -1014.2 }, hint: 'Debaixo da estrutura de madeira do píer próximo à praia.' },
        { id: 'wand-6', name: 'Ponto 06 - Cais de Los Santos', city_id: 'valley-server-uuid', coords: { x: 114.5, y: -2218.4 }, hint: 'Entre os contêineres azuis na doca sul.' }
    ];

    window.loadAdminWandererListView = async function() {
        const container = document.getElementById('admin-wanderer-list-container');
        if (!container) return;

        try {
            let locations = [];
            const { data, error } = await supabaseClient.from('wanderer_locations').select('*').order('created_at', { ascending: true });
            if (!error && Array.isArray(data) && data.length > 0) {
                locations = data;
            } else {
                const localCache = JSON.parse(localStorage.getItem('malaca_wanderer_custom_locations') || '[]');
                locations = localCache.length > 0 ? localCache : defaultWandererPoints;
            }

            wandererLocationsCache = locations;
            localStorage.setItem('malaca_wanderer_custom_locations', JSON.stringify(locations));
            renderAdminWandererList(locations);
        } catch(e) {
            container.innerHTML = `<div style="grid-column: 1/-1; color: #f87171; font-size: 0.75rem; text-align: center; padding: 20px;">Falha ao carregar marcações: ${e.message}</div>`;
        }
    };

    function renderAdminWandererList(list) {
        const container = document.getElementById('admin-wanderer-list-container');
        if (!container) return;

        if (!list || list.length === 0) {
            container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 30px; font-size: 0.8rem;">Nenhuma marcação encontrada.</div>';
            return;
        }

        const servers = getActiveServers();

        container.innerHTML = list.map(p => {
            const cityName = servers.find(s => s.id === p.city_id || s.slug === p.city_id)?.name || 'Cidade Alta RP';
            const cx = (p.coords && typeof p.coords.x !== 'undefined') ? p.coords.x : (p.x || 0);
            const cy = (p.coords && typeof p.coords.y !== 'undefined') ? p.coords.y : (p.y || 0);

            return `
                <div style="background: rgba(15,20,32,0.6); padding: 14px; border-radius: 12px; border: 1px solid rgba(0,210,255,0.25); display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                        <div>
                            <h5 style="color: #fff; font-size: 0.88rem; font-weight: 800; margin: 0; display: flex; align-items: center; gap: 6px;">
                                <i class="fa-solid fa-person-walking" style="color: #00d2ff;"></i> ${p.name}
                            </h5>
                            <span style="color: #38bdf8; font-size: 10px; font-weight: 700; background: rgba(0,210,255,0.12); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(0,210,255,0.3); display: inline-block; margin-top: 3px;">
                                <i class="fa-solid fa-city"></i> ${cityName}
                            </span>
                        </div>
                        <span style="font-family: monospace; font-size: 11px; color: #a5f3fc; background: rgba(0,0,0,0.4); padding: 3px 6px; border-radius: 4px; border: 1px solid rgba(0,210,255,0.2); white-space: nowrap;">
                            X: ${Number(cx).toFixed(1)} | Y: ${Number(cy).toFixed(1)}
                        </span>
                    </div>

                    <div style="background: rgba(0,0,0,0.3); padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); font-size: 11px; color: #cbd5e1; line-height: 1.4;">
                        <strong style="color: #fde68a; display: block; font-size: 10px; margin-bottom: 2px;"><i class="fa-solid fa-lightbulb"></i> DICA DO BALÃO:</strong>
                        ${p.hint || 'Sem dica cadastrada.'}
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.06); margin-top: 4px;">
                        <button onclick="forceConfirmWandererPoint('${p.id}')" style="background: linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(16,185,129,0.3) 100%); border: 1px solid #22c55e; color: #86efac; padding: 5px 9px; border-radius: 6px; font-size: 10px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px;" title="Forçar este ponto como ativo no ciclo agora">
                            <i class="fa-solid fa-bolt"></i> Ativar no Ciclo
                        </button>
                        <div style="display: flex; gap: 6px;">
                            <button onclick="startEditWandererPoint('${p.id}')" style="background: rgba(0,210,255,0.15); border: 1px solid rgba(0,210,255,0.3); color: #38bdf8; padding: 5px 9px; border-radius: 6px; font-size: 10px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                                <i class="fa-solid fa-pen"></i> Editar
                            </button>
                            <button onclick="deleteWandererPoint('${p.id}', '${p.name}')" style="background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #f87171; padding: 5px 9px; border-radius: 6px; font-size: 10px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                                <i class="fa-solid fa-trash"></i> Excluir
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    window.filterAdminWandererList = function(query) {
        const q = (query || '').toLowerCase().trim();
        const cityFilter = document.getElementById('wand-filter-city-select')?.value || 'all';
        let filtered = wandererLocationsCache;

        if (cityFilter !== 'all') {
            filtered = filtered.filter(p => p.city_id === cityFilter || p.city_id === `${cityFilter}-server-uuid`);
        }
        if (q) {
            filtered = filtered.filter(p => 
                (p.name && p.name.toLowerCase().includes(q)) ||
                (p.hint && p.hint.toLowerCase().includes(q))
            );
        }
        renderAdminWandererList(filtered);
    };

    window.filterAdminWandererByCity = function(cityId) {
        const q = document.getElementById('wand-search-input')?.value || '';
        window.filterAdminWandererList(q);
    };

    window.startEditWandererPoint = function(id) {
        const point = wandererLocationsCache.find(p => p.id === id);
        if (!point) return;

        editingWandererPointId = id;
        document.getElementById('wand-point-id').value = id;
        document.getElementById('wand-point-name').value = point.name || '';
        document.getElementById('wand-point-city').value = point.city_id || 'cda-server-uuid';

        const cx = (point.coords && typeof point.coords.x !== 'undefined') ? point.coords.x : (point.x || 0);
        const cy = (point.coords && typeof point.coords.y !== 'undefined') ? point.coords.y : (point.y || 0);
        document.getElementById('wand-point-x').value = cx;
        document.getElementById('wand-point-y').value = cy;
        document.getElementById('wand-point-hint').value = point.hint || '';

        document.getElementById('wand-form-title').innerHTML = `<i class="fa-solid fa-pen-to-square" style="color: #f59e0b;"></i> Editando: ${point.name}`;
        document.getElementById('wand-submit-btn').textContent = 'SALVAR ALTERAÇÕES DA MARCAÇÃO';
        document.getElementById('wand-cancel-edit-btn').style.display = 'inline-block';
        document.getElementById('wand-point-name').focus();
    };

    window.cancelEditWandererPoint = function() {
        editingWandererPointId = null;
        document.getElementById('wand-point-id').value = '';
        document.getElementById('wand-point-name').value = '';
        document.getElementById('wand-point-x').value = '';
        document.getElementById('wand-point-y').value = '';
        document.getElementById('wand-point-hint').value = '';

        document.getElementById('wand-form-title').innerHTML = `<i class="fa-solid fa-location-crosshairs" style="color: #00d2ff;"></i> Cadastrar Nova Marcação do Andarilho`;
        document.getElementById('wand-submit-btn').textContent = 'SALVAR MARCAÇÃO NO MAPA';
        document.getElementById('wand-cancel-edit-btn').style.display = 'none';
    };

    window.handleSaveWandererPoint = async function(e) {
        e.preventDefault();
        const id = document.getElementById('wand-point-id').value.trim() || `wand-${Date.now()}`;
        const name = document.getElementById('wand-point-name').value.trim();
        const city_id = document.getElementById('wand-point-city').value;
        const x = parseFloat(document.getElementById('wand-point-x').value);
        const y = parseFloat(document.getElementById('wand-point-y').value);
        const hint = document.getElementById('wand-point-hint').value.trim();

        const pointData = {
            id,
            name,
            city_id,
            coords: { x, y },
            hint,
            updated_at: new Date().toISOString()
        };

        try {
            // Upsert into Supabase
            try {
                await supabaseClient.from('wanderer_locations').upsert([pointData], { onConflict: 'id' });
            } catch(e) {}

            // Update local cache
            let list = wandererLocationsCache;
            const existingIdx = list.findIndex(p => p.id === id);
            if (existingIdx >= 0) {
                list[existingIdx] = pointData;
            } else {
                list.push(pointData);
            }
            wandererLocationsCache = list;
            localStorage.setItem('malaca_wanderer_custom_locations', JSON.stringify(list));

            // Broadcast to all map interactive screens
            globalHubChannel.send({
                type: 'broadcast',
                event: 'entity_sync',
                payload: { entity: 'wanderer_locations', action: 'UPDATE', data: pointData, timestamp: Date.now() }
            });
            globalHubChannel.send({
                type: 'broadcast',
                event: 'wanderer_locations_updated',
                payload: { locations: list, targetPoint: pointData }
            });

            alert('Marcação do Andarilho salva com sucesso e sincronizada no mapa em tempo real!');
            cancelEditWandererPoint();
            renderAdminWandererList(wandererLocationsCache);
        } catch(err) {
            alert('Erro ao salvar ponto do andarilho: ' + err.message);
        }
    };

    window.deleteWandererPoint = async function(id, name) {
        if (!confirm(`Deseja realmente EXCLUIR a marcação "${name}" do mapa?`)) return;

        try {
            try {
                await supabaseClient.from('wanderer_locations').delete().eq('id', id);
            } catch(e) {}

            let list = wandererLocationsCache.filter(p => p.id !== id);
            wandererLocationsCache = list;
            localStorage.setItem('malaca_wanderer_custom_locations', JSON.stringify(list));

            globalHubChannel.send({
                type: 'broadcast',
                event: 'entity_sync',
                payload: { entity: 'wanderer_locations', action: 'DELETE', id: id, timestamp: Date.now() }
            });
            globalHubChannel.send({
                type: 'broadcast',
                event: 'wanderer_locations_updated',
                payload: { locations: list, deletedId: id }
            });

            alert(`Marcação "${name}" excluída com sucesso!`);
            renderAdminWandererList(wandererLocationsCache);
        } catch(e) {
            alert('Erro ao excluir marcação: ' + e.message);
        }
    };

    window.forceConfirmWandererPoint = async function(id) {
        const point = wandererLocationsCache.find(p => p.id === id);
        if (!point) return;

        if (!confirm(`Deseja FORÇAR a ativação do "${point.name}" no ciclo atual para todos os usuários?`)) return;

        try {
            const currentProfile = JSON.parse(localStorage.getItem('malaca_user_profile') || '{}');
            const confirmation = {
                id: `conf-${Date.now()}`,
                location_id: id,
                city_id: point.city_id,
                user_id: currentProfile.id || 'admin',
                user_name: currentProfile.username || 'Admin Global',
                avatar_url: currentProfile.avatar_url || '',
                confirmed_at: new Date().toISOString()
            };

            try {
                await supabaseClient.from('wanderer_confirmations').insert([confirmation]);
            } catch(e) {}

            globalHubChannel.send({
                type: 'broadcast',
                event: 'wanderer_confirmed',
                payload: { locationId: id, cityId: point.city_id, confirmation, forcedByAdmin: true }
            });

            alert(`Ponto "${point.name}" ativado com sucesso no ciclo atual! Todas as telas conectadas já atualizaram a localização.`);
        } catch(e) {
            alert('Erro ao forçar ativação: ' + e.message);
        }
    };

    // Admin Settings View
    window.loadAdminSettingsView = async function() {
        try {
            const { data } = await supabaseClient.from('platform_settings').select('*').eq('id', 'default').maybeSingle();
            if (data) {
                const aText = document.getElementById('setting-announcement-text');
                const aActive = document.getElementById('setting-announcement-active');
                const mMsg = document.getElementById('setting-maint-msg');
                const mActive = document.getElementById('setting-maint-active');
                if (aText) aText.value = data.global_announcement || '';
                if (aActive) aActive.checked = !!data.announcement_active;
                if (mMsg) mMsg.value = data.maintenance_message || 'Plataforma em manutenção.';
                if (mActive) mActive.checked = !!data.maintenance_mode;
            }
        } catch(e) {}
    };

    window.handleSaveGlobalAnnouncement = async function(e) {
        e.preventDefault();
        const text = document.getElementById('setting-announcement-text').value.trim();
        const active = document.getElementById('setting-announcement-active').checked;
        try {
            await supabaseClient.from('platform_settings').upsert([{ id: 'default', global_announcement: text, announcement_active: active, updated_at: new Date().toISOString() }], { onConflict: 'id' });
            globalHubChannel.send({
                type: 'broadcast',
                event: 'settings_updated',
                payload: { global_announcement: text, announcement_active: active },
            });
            alert('Anúncio global salvo e transmitido com sucesso!');
            checkGlobalAnnouncementBanner();
        } catch(err) {
            alert('Erro ao salvar anúncio: ' + err.message);
        }
    };

    window.handleSaveMaintenance = async function(e) {
        e.preventDefault();
        const msg = document.getElementById('setting-maint-msg').value.trim();
        const active = document.getElementById('setting-maint-active').checked;
        try {
            await supabaseClient.from('platform_settings').upsert([{ id: 'default', maintenance_message: msg, maintenance_mode: active, updated_at: new Date().toISOString() }], { onConflict: 'id' });
            globalHubChannel.send({
                type: 'broadcast',
                event: 'settings_updated',
                payload: { maintenance_message: msg, maintenance_mode: active },
            });
            alert('Status de manutenção atualizado!');
        } catch(err) {
            alert('Erro ao salvar manutenção: ' + err.message);
        }
    };

    // Helper: Check if user is authenticated with a valid profile
    function isUserLoggedIn() {
        const stored = localStorage.getItem('malaca_user_profile');
        if (!stored) return false;
        try {
            const user = JSON.parse(stored);
            if (!user || !user.id || String(user.id).startsWith('mock-')) return false;
            return true;
        } catch(e) {
            return false;
        }
    }
    window.isUserLoggedIn = isUserLoggedIn;

    // Toast: Visual feedback when access is blocked
    function showAccessRestrictedToast(message) {
        let toast = document.getElementById('global-access-restricted-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'global-access-restricted-toast';
            toast.style.cssText = `
                position: fixed; bottom: 24px; right: 24px; z-index: 999999;
                background: linear-gradient(135deg, #090e17 0%, #030712 100%);
                border: 1px solid rgba(88, 101, 242, 0.6); border-radius: 14px;
                padding: 14px 20px; color: #fff; display: flex; align-items: center; gap: 14px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(88, 101, 242, 0.35);
                font-family: var(--font-header, sans-serif); font-size: 13px; font-weight: 700;
                transform: translateY(100px); opacity: 0; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                pointer-events: auto;
            `;
            document.body.appendChild(toast);
        }
        toast.innerHTML = `
            <div style="width: 34px; height: 34px; border-radius: 50%; background: rgba(88, 101, 242, 0.2); border: 1px solid #5865F2; display: flex; align-items: center; justify-content: center; color: #5865F2; font-size: 16px; flex-shrink: 0;">
                <i class="fa-brands fa-discord"></i>
            </div>
            <div>
                <div style="color: #fff; font-size: 12px; font-weight: 800; letter-spacing: 0.5px;">ACESSO RESTRITO A MEMBROS</div>
                <div style="color: #94a3b8; font-size: 11px; font-weight: 500; margin-top: 2px;">${message || 'Faça login com o Discord para acessar os sistemas.'}</div>
            </div>
        `;
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';

        clearTimeout(toast._timeout);
        toast._timeout = setTimeout(() => {
            toast.style.transform = 'translateY(100px)';
            toast.style.opacity = '0';
        }, 4000);
    }
    window.showAccessRestrictedToast = showAccessRestrictedToast;

    // Global Interceptor: Block unauthenticated users from clicking into systems
    document.addEventListener('click', (e) => {
        const target = e.target.closest('a') || e.target.closest('button.system-access-btn') || e.target.closest('.hub-city-card');
        if (!target) return;

        const href = (target.getAttribute('href') || target.dataset.link || '').toLowerCase();
        const isSystemCard = target.classList.contains('hub-city-card') || 
                             target.classList.contains('system-access-btn') ||
                             target.classList.contains('hub-city-card-btn');

        const isSystemTarget = href.includes('/sistemas') ||
                               href.includes('/mapa') ||
                               href.includes('/lockpick') ||
                               href.includes('/caixinha') ||
                               href.includes('/hacking') ||
                               href.includes('mapa-interativo');

        // Only intercept if target is a system and user is not logged in
        if ((isSystemCard || isSystemTarget) && !isUserLoggedIn()) {
            e.preventDefault();
            e.stopPropagation();
            showAccessRestrictedToast('Faça login com o Discord para acessar este sistema.');
            window.openDiscordModal();
        }
    }, true);

    // Authentication Guard for Simulator / Minigame / Systems Pages (Direct URL access)
    function checkSystemAuthProtection() {
        const path = window.location.pathname.toLowerCase();
        const isSystemPage = path.includes('/sistemas') ||
                             path.includes('/lockpick') ||
                             path.includes('/caixinha') ||
                             path.includes('/hacking') ||
                             path.includes('/mapa') ||
                             path.includes('/mapa-interativo');
        if (!isSystemPage) return;

        if (!isUserLoggedIn()) {
            let lockOverlay = document.getElementById('system-auth-guard-overlay');
            if (!lockOverlay) {
                lockOverlay = document.createElement('div');
                lockOverlay.id = 'system-auth-guard-overlay';
                lockOverlay.style.cssText = `
                    position: fixed; inset: 0; background: rgba(3, 7, 18, 0.95); backdrop-filter: blur(16px);
                    z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 20px;
                `;

                // Detect city context from URL or fallback
                let backUrl = '/cidades/';
                const matchCity = window.location.pathname.match(/\/cidades\/([^\/]+)\//);
                if (matchCity && matchCity[1]) {
                    backUrl = `/cidades/${matchCity[1]}/`;
                }

                lockOverlay.innerHTML = `
                    <div style="background: linear-gradient(135deg, #090e17 0%, #000000 100%); border: 1px solid rgba(88,101,242,0.4); border-radius: 20px; padding: 36px; max-width: 440px; width: 100%; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.9);">
                        <div style="width: 68px; height: 68px; border-radius: 50%; background: rgba(88,101,242,0.15); border: 2px solid #5865F2; display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; color: #5865F2; font-size: 32px; box-shadow: 0 0 25px rgba(88,101,242,0.3);">
                            <i class="fa-brands fa-discord"></i>
                        </div>
                        <span style="display: inline-block; padding: 4px 12px; border-radius: 20px; background: rgba(88,101,242,0.15); border: 1px solid rgba(88,101,242,0.3); color: #818cf8; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
                            SISTEMA RESTRITO • MALACA GTARP
                        </span>
                        <h3 style="font-family: var(--font-header, sans-serif); font-size: 1.25rem; font-weight: 900; color: #fff; margin-bottom: 10px; letter-spacing: 0.5px;">
                            AUTENTICAÇÃO NECESSÁRIA
                        </h3>
                        <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.6; margin-bottom: 24px;">
                            Para utilizar este sistema/simulador e acompanhar seus dados em tempo real, faça login com sua conta do Discord.
                        </p>
                        <button onclick="loginWithDiscordGlobal()" style="width: 100%; padding: 14px; border-radius: 12px; background: #5865F2; color: #fff; font-size: 0.85rem; font-weight: 800; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 8px 25px rgba(88,101,242,0.4); transition: all 0.2s ease;">
                            <i class="fa-brands fa-discord" style="font-size: 1.2rem;"></i> ENTRAR COM O DISCORD
                        </button>
                        <a href="${backUrl}" style="display: inline-flex; align-items: center; gap: 6px; margin-top: 18px; font-size: 0.8rem; color: #64748b; text-decoration: none; font-weight: 700; transition: color 0.2s;">
                            <i class="fa-solid fa-arrow-left"></i> Voltar para a Cidade
                        </a>
                    </div>
                `;
                document.body.appendChild(lockOverlay);
            }
        } else {
            const lockOverlay = document.getElementById('system-auth-guard-overlay');
            if (lockOverlay) lockOverlay.remove();
        }
    }

    // Global Announcement Banner Check
    async function checkGlobalAnnouncementBanner() {
        try {
            const { data } = await supabaseClient.from('platform_settings').select('*').eq('id', 'default').maybeSingle();
            let banner = document.getElementById('global-live-announcement-bar');
            if (data && data.announcement_active && data.global_announcement) {
                if (!banner) {
                    banner = document.createElement('div');
                    banner.id = 'global-live-announcement-bar';
                    banner.style.cssText = `
                        position: fixed; top: 0; left: 0; right: 0; background: linear-gradient(90deg, #f59e0b, #d97706);
                        color: #000; font-weight: 900; font-size: 0.78rem; padding: 8px 16px; text-align: center;
                        z-index: 99998; box-shadow: 0 4px 15px rgba(245,158,11,0.3); display: flex; align-items: center; justify-content: center; gap: 8px;
                    `;
                    document.body.prepend(banner);
                }
                banner.innerHTML = `<i class="fa-solid fa-bullhorn"></i> <span>${data.global_announcement}</span>`;
            } else if (banner) {
                banner.remove();
            }
        } catch(e) {}
    }

    // Auto-open modal if URL contains admin=true parameter & run guards
    document.addEventListener('DOMContentLoaded', () => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('admin') === 'true' || params.get('admin') === '1') {
            window.openGlobalAdminModal();
        }
        checkSystemAuthProtection();
        checkGlobalAnnouncementBanner();
        updateAdminUiVisibility(isAuthenticated);
    });
    checkSystemAuthProtection();
    checkGlobalAnnouncementBanner();
    updateAdminUiVisibility(isAuthenticated);
})();

