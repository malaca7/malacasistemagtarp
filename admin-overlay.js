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

    window.openDiscordModal = function () {
        document.getElementById('global-discord-modal').classList.add('active');
        renderDiscordModalContent();
    };

    window.closeDiscordModal = function () {
        document.getElementById('global-discord-modal').classList.remove('active');
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
    };

    function renderDiscordModalContent() {
        const body = document.getElementById('discord-modal-body');
        const title = document.getElementById('discord-modal-title');
        const subtitle = document.getElementById('discord-modal-subtitle');
        if (!body) return;

        const stored = localStorage.getItem('malaca_user_profile');
        const user = stored ? JSON.parse(stored) : null;

        if (user) {
            title.textContent = 'Dashboard do Usuário';
            subtitle.textContent = 'Perfil e Registro de Acesso';
            body.innerHTML = `
                <div style="display: flex; align-items: center; gap: 16px; padding: 16px; background: linear-gradient(135deg, #18181b 0%, #000000 100%); border-radius: 14px; border: 1px solid rgba(0,210,255,0.3); margin-bottom: 20px;">
                    <img src="${user.avatar_url}" style="width: 56px; height: 56px; border-radius: 50%; border: 2px solid #38bdf8;" />
                    <div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <h4 style="font-size: 16px; font-weight: 900; color: #fff;">${user.full_name || user.username}</h4>
                            <span style="font-size: 9px; font-weight: 800; background: rgba(88,101,242,0.2); color: #5865F2; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(88,101,242,0.4);">VERIFICADO</span>
                        </div>
                        <span style="font-size: 12px; color: #38bdf8; font-weight: 700;">@${user.username}</span>
                        <div style="font-size: 10px; color: #94a3b8; margin-top: 2px; font-family: monospace;">ID: ${user.discord_id}</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
                    <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);">
                        <span style="font-size: 10px; color: #94a3b8; display: block; font-weight: 700;">DATA DE CADASTRO</span>
                        <span style="font-size: 12px; font-weight: 800; color: #fff; font-family: monospace;">${new Date(user.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);">
                        <span style="font-size: 10px; color: #94a3b8; display: block; font-weight: 700;">ÚLTIMO LOGIN</span>
                        <span style="font-size: 12px; font-weight: 800; color: #38bdf8; font-family: monospace;">${new Date(user.last_login_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                </div>

                <div style="padding: 12px; background: rgba(0,0,0,0.6); border: 1px solid rgba(0,210,255,0.2); border-radius: 10px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <span style="font-size: 11px; font-weight: 700; color: #cbd5e1;"><i class="fa-solid fa-shield-halved" style="color: #22c55e;"></i> Sessões Registradas</span>
                    <span style="font-size: 12px; font-weight: 900; color: #38bdf8; background: rgba(0,210,255,0.2); padding: 3px 10px; border-radius: 6px; border: 1px solid rgba(0,210,255,0.3);">${user.access_count || 1} acessos</span>
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
                const discordId = meta.provider_id || meta.sub || u.id;
                const username = meta.preferred_username || meta.user_name || meta.name || meta.full_name || 'Discord User';
                const fullName = meta.full_name || meta.global_name || meta.name || username;
                const avatarUrl = meta.avatar_url || meta.picture || 'https://cdn.discordapp.com/embed/avatars/0.png';
                const now = new Date().toISOString();
                const email = u.email || meta.email || '';
                const isAdmin = typeof checkAdminPermission === 'function' ? checkAdminPermission(u) : false;

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

                // Check access logs count
                let accessCount = 1;
                try {
                    const { count } = await supabaseClient
                        .from('access_logs')
                        .select('id', { count: 'exact', head: true })
                        .eq('user_id', u.id);
                    if (count !== null && count !== undefined) {
                        accessCount = Math.max(1, count);
                    }
                } catch(e) {}

                const profile = {
                    ...profileData,
                    created_at: u.created_at || now,
                    access_count: accessCount
                };

                localStorage.setItem('malaca_user_profile', JSON.stringify(profile));

                // Upsert into Supabase profiles table asynchronously
                supabaseClient.from('profiles').upsert([profileData], { onConflict: 'id' }).then(() => {}).catch(err => {
                    console.warn('Supabase profiles sync warning:', err);
                });

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
                        }
                    } catch(e) {}
                }
            }
        } catch (e) {
            console.warn('Supabase Session Sync Exception:', e);
        }
        syncDiscordNavButton();
    }

    supabaseClient.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session && session.user) {
            const u = session.user;
            const meta = u.user_metadata || {};
            const discordId = meta.provider_id || meta.sub || u.id;
            const username = meta.preferred_username || meta.user_name || meta.name || meta.full_name || 'Discord User';
            supabaseClient.from('access_logs').insert([{
                user_id: u.id,
                discord_id: String(discordId),
                username: String(username),
                logged_at: new Date().toISOString(),
                user_agent: navigator.userAgent
            }]).then(() => {}).catch(() => {});
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED') {
            await syncDiscordSession();
            renderDiscordModalContent();
        } else if (event === 'SIGNED_OUT') {
            localStorage.removeItem('malaca_user_profile');
            syncDiscordNavButton();
            renderDiscordModalContent();
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        syncDiscordSession();
    });
    syncDiscordSession();

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

    let isAuthenticated = false;
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

    window.openGlobalAdminModal = function () {
        const modal = document.getElementById('global-admin-modal');
        if (modal) {
            modal.classList.add('active');
            renderAdminContent();
        }
    };

    window.closeGlobalAdminModal = function () {
        const modal = document.getElementById('global-admin-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    };

    function getActiveServers() {
        const raw = JSON.parse(localStorage.getItem('malaca_custom_servers') || '[]');
        return raw.length > 0 ? raw : defaultServers;
    }

    function getActiveSystems() {
        const raw = JSON.parse(localStorage.getItem('malaca_custom_systems') || '[]');
        return raw.length > 0 ? raw : defaultSystems;
    }

    function checkAdminPermission(user) {
        if (!user) return false;
        if (user.is_admin === true || user.role === 'admin' || user.user_metadata?.is_admin === true) return true;

        const discordId = String(user.discord_id || user.id || user.user_metadata?.sub || user.user_metadata?.provider_id || '');
        const defaultDiscordIds = ['722320491767136346', '917826984778797087'];
        if (discordId && defaultDiscordIds.includes(discordId)) return true;

        const email = (user.email || user.user_metadata?.email || '').toLowerCase();
        const username = (user.username || user.user_metadata?.name || user.user_metadata?.full_name || user.user_metadata?.preferred_username || '').toLowerCase();

        const defaultEmails = ['rogeriomalaquiasjr@gmail.com', 'rogeriosantanajr@gmail.com'];
        const defaultUsernames = ['malaca', 'malaquias', 'malaca7'];

        if (email && defaultEmails.some(e => email.includes(e))) return true;
        if (username && defaultUsernames.some(u => username.includes(u))) return true;

        try {
            const customAdmins = JSON.parse(localStorage.getItem('malaca_admin_discord_accounts') || '[]');
            if ((discordId && customAdmins.includes(discordId)) || (email && customAdmins.includes(email)) || (username && customAdmins.includes(username))) {
                return true;
            }
        } catch(e) {}

        return false;
    }

    window.loginAdminWithDiscord = function() {
        const redirectUrl = window.location.origin + window.location.pathname;
        supabaseClient.auth.signInWithOAuth({
            provider: 'discord',
            options: { redirectTo: redirectUrl, scopes: 'identify email' }
        });
    };

    supabaseClient.auth.getSession().then(({ data: { session } }) => {
        if (session && session.user && checkAdminPermission(session.user)) {
            isAuthenticated = true;
        }
    });

    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (session && session.user && checkAdminPermission(session.user)) {
            isAuthenticated = true;
            const modal = document.getElementById('global-admin-modal');
            if (modal && modal.classList.contains('active')) {
                renderAdminContent();
            }
        }
    });

    function renderAdminContent() {
        const container = document.getElementById('global-admin-content');
        if (!isAuthenticated) {
            container.innerHTML = `
                <div class="global-admin-body">
                    <div class="global-admin-auth-box">
                        <i class="fa-brands fa-discord" style="font-size: 3rem; color: #5865F2; margin-bottom: 12px;"></i>
                        <h3 style="font-family: var(--font-header); font-size: 1.2rem; color: #fff; margin-bottom: 8px;">Autenticação Administrativa</h3>
                        <p style="font-size: 0.78rem; color: #8b9cb5; margin-bottom: 20px;">Acesse o painel de gestão através da sua conta autorizada do Discord.</p>
                        
                        <button onclick="loginAdminWithDiscord()" style="width:100%; padding:14px; background:#5865F2; color:#fff; font-family:var(--font-header); font-weight:800; border:none; border-radius:12px; cursor:pointer; font-size:0.85rem; display:flex; align-items:center; justify-content:center; gap:10px; box-shadow:0 4px 16px rgba(88,101,242,0.3); transition:all 0.3s ease;">
                            <i class="fa-brands fa-discord" style="font-size:1.2rem;"></i> ENTRAR COM DISCORD (ADMIN)
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
            const allSystems = getActiveSystems();

            container.innerHTML = `
                <div class="global-admin-nav">
                    <button class="global-admin-nav-btn ${activeTab === 'users' ? 'active' : ''}" onclick="switchAdminTab('users')"><i class="fa-solid fa-users"></i> Usuários</button>
                    <button class="global-admin-nav-btn ${activeTab === 'access_logs' ? 'active' : ''}" onclick="switchAdminTab('access_logs')"><i class="fa-solid fa-chart-line"></i> Acessos</button>
                    <button class="global-admin-nav-btn ${activeTab === 'settings' ? 'active' : ''}" onclick="switchAdminTab('settings')"><i class="fa-solid fa-gear"></i> Opções Globais</button>
                    <button class="global-admin-nav-btn ${activeTab === 'cities' ? 'active' : ''}" onclick="switchAdminTab('cities')"><i class="fa-solid fa-city"></i> Cidades (${allServers.length})</button>
                    <button class="global-admin-nav-btn ${activeTab === 'systems' ? 'active' : ''}" onclick="switchAdminTab('systems')"><i class="fa-solid fa-layer-group"></i> Sistemas (${allSystems.length})</button>
                    <button class="global-admin-nav-btn ${activeTab === 'andarilho' ? 'active' : ''}" onclick="switchAdminTab('andarilho')"><i class="fa-solid fa-person-walking"></i> Andarilho</button>
                    <button class="global-admin-nav-btn" onclick="logoutAdmin()" style="margin-left: auto; color: #ff5252;"><i class="fa-solid fa-right-from-bracket"></i> Sair</button>
                </div>
                <div class="global-admin-body" id="admin-tab-body">
                    ${renderTabBody(activeTab, allServers, allSystems)}
                </div>
            `;

            if (activeTab === 'users') {
                loadAdminUsersView();
            } else if (activeTab === 'access_logs') {
                loadAdminLogsView();
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
        if (tab === 'users') {
            return `
                <div style="display: flex; flex-direction: column; gap: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h4 style="font-family: var(--font-header); color: #fff; font-size: 0.95rem; margin: 0;">
                            <i class="fa-solid fa-users" style="color: #5865F2;"></i> Gestão de Usuários & Administradores
                        </h4>
                        <button onclick="loadAdminUsersView()" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #cbd5e1; padding: 6px 12px; border-radius: 8px; font-size: 0.72rem; cursor: pointer; display: flex; items-center; gap: 6px;">
                            <i class="fa-solid fa-rotate"></i> Atualizar
                        </button>
                    </div>
                    <div id="admin-users-list-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 12px;">
                        <div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 40px; font-size: 0.8rem;">
                            <i class="fa-solid fa-spinner fa-spin" style="font-size: 1.5rem; color: #5865F2; display: block; margin-bottom: 8px;"></i>
                            Carregando usuários do Supabase...
                        </div>
                    </div>
                </div>
            `;
        } else if (tab === 'access_logs') {
            return `
                <div style="display: flex; flex-direction: column; gap: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h4 style="font-family: var(--font-header); color: #fff; font-size: 0.95rem; margin: 0;">
                            <i class="fa-solid fa-chart-line" style="color: #22c55e;"></i> Auditoria de Acessos Recentes
                        </h4>
                        <button onclick="loadAdminLogsView()" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #cbd5e1; padding: 6px 12px; border-radius: 8px; font-size: 0.72rem; cursor: pointer; display: flex; items-center; gap: 6px;">
                            <i class="fa-solid fa-rotate"></i> Atualizar
                        </button>
                    </div>
                    <div id="admin-logs-list-container" style="background: rgba(15,20,32,0.6); border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); overflow: hidden;">
                        <div style="text-align: center; color: #94a3b8; padding: 40px; font-size: 0.8rem;">
                            <i class="fa-solid fa-spinner fa-spin" style="font-size: 1.5rem; color: #22c55e; display: block; margin-bottom: 8px;"></i>
                            Carregando logs de acesso...
                        </div>
                    </div>
                </div>
            `;
        } else if (tab === 'settings') {
            return `
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    <!-- Anúncio Global -->
                    <div style="background: rgba(15,20,32,0.6); padding: 20px; border-radius: 14px; border: 1px solid rgba(245,158,11,0.3);">
                        <h4 style="font-family: var(--font-header); color: #fff; font-size: 0.9rem; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                            <i class="fa-solid fa-bullhorn" style="color: #f59e0b;"></i> Anúncio Global da Plataforma
                        </h4>
                        <p style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 12px;">Transmita mensagens em tempo real no topo do site para todos os usuários.</p>
                        <form onsubmit="handleSaveGlobalAnnouncement(event)" style="display: flex; flex-direction: column; gap: 10px;">
                            <textarea id="setting-announcement-text" class="global-admin-input" rows="2" placeholder="Digite o anúncio global..." style="margin:0; resize: vertical;"></textarea>
                            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                                <label style="display: flex; align-items: center; gap: 8px; font-size: 0.78rem; color: #cbd5e1; cursor: pointer;">
                                    <input type="checkbox" id="setting-announcement-active" style="width: 16px; height: 16px; accent-color: #f59e0b;">
                                    Ativar Banner de Anúncio
                                </label>
                                <button type="submit" class="global-admin-submit" style="width: auto; padding: 8px 20px; background: #f59e0b; color: #000; font-weight: 800;">SALVAR E TRANSMITIR</button>
                            </div>
                        </form>
                    </div>

                    <!-- Modo Manutenção -->
                    <div style="background: rgba(15,20,32,0.6); padding: 20px; border-radius: 14px; border: 1px solid rgba(239,68,68,0.3);">
                        <h4 style="font-family: var(--font-header); color: #fff; font-size: 0.9rem; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                            <i class="fa-solid fa-triangle-exclamation" style="color: #ef4444;"></i> Modo de Manutenção
                        </h4>
                        <form onsubmit="handleSaveMaintenance(event)" style="display: flex; flex-direction: column; gap: 10px;">
                            <input type="text" id="setting-maint-msg" class="global-admin-input" placeholder="Mensagem de manutenção..." value="Plataforma em manutenção para melhorias no servidor." style="margin:0;">
                            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                                <label style="display: flex; align-items: center; gap: 8px; font-size: 0.78rem; color: #cbd5e1; cursor: pointer;">
                                    <input type="checkbox" id="setting-maint-active" style="width: 16px; height: 16px; accent-color: #ef4444;">
                                    Ativar Modo de Manutenção Geral
                                </label>
                                <button type="submit" class="global-admin-submit" style="width: auto; padding: 8px 20px; background: #ef4444; color: #fff; font-weight: 800;">APLICAR MANUTENÇÃO</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
        } else if (tab === 'cities') {
            const editCity = editingCityId ? servers.find(s => s.id === editingCityId) : null;
            return `
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    <div style="background: rgba(15,20,32,0.6); padding: 20px; border-radius: 14px; border: 1px solid rgba(255,102,0,0.2);">
                        <h4 style="font-family: var(--font-header); color: #fff; font-size: 0.9rem; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                            <span><i class="fa-solid ${editCity ? 'fa-pen' : 'fa-plus'}" style="color: #ff6600;"></i> ${editCity ? `Editar Cidade "${editCity.name}"` : 'Criar Nova Cidade'}</span>
                            ${editCity ? `<button onclick="cancelEditCity()" style="background:none; border:none; color:#ff5252; font-size:0.75rem; cursor:pointer;">Cancelar Edição</button>` : ''}
                        </h4>
                        <form onsubmit="handleSaveCity(event)" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                            <input type="text" id="city-form-name" class="global-admin-input" placeholder="Nome da Cidade (ex: CDA RP)" value="${editCity ? editCity.name : ''}" required style="margin:0;">
                            <input type="text" id="city-form-slug" class="global-admin-input" placeholder="Slug / Rota (ex: cda)" value="${editCity ? editCity.slug : ''}" required style="margin:0;">
                            <input type="text" id="city-form-sub" class="global-admin-input" placeholder="Subtítulo (ex: SERVIDOR OFICIAL)" value="${editCity ? (editCity.subtitle || '') : ''}" style="margin:0;">
                            <input type="text" id="city-form-banner" class="global-admin-input" placeholder="URL da Imagem Banner" value="${editCity ? (editCity.banner_image_url || '') : ''}" style="margin:0;">
                            <button type="submit" class="global-admin-submit" style="grid-column: 1 / -1; justify-self: start; width: auto; padding: 10px 24px;">${editCity ? 'Atualizar Cidade' : 'Salvar Nova Cidade'}</button>
                        </form>
                    </div>

                    <h4 style="font-family: var(--font-header); color: #fff; font-size: 0.9rem;">Cidades Cadastradas (${servers.length})</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 12px;">
                        ${servers.map((s, idx) => `
                            <div style="background: rgba(15,20,32,0.4); padding: 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <div style="display: flex; flex-direction: column; gap: 2px;">
                                        <button onclick="moveCityUp(${idx})" ${idx === 0 ? 'disabled style="opacity:0.3"' : ''} style="background: rgba(255,255,255,0.05); border: none; color: #fff; padding: 2px 6px; border-radius: 4px; cursor: pointer;"><i class="fa-solid fa-arrow-up" style="font-size:0.65rem;"></i></button>
                                        <button onclick="moveCityDown(${idx})" ${idx === servers.length - 1 ? 'disabled style="opacity:0.3"' : ''} style="background: rgba(255,255,255,0.05); border: none; color: #fff; padding: 2px 6px; border-radius: 4px; cursor: pointer;"><i class="fa-solid fa-arrow-down" style="font-size:0.65rem;"></i></button>
                                    </div>
                                    <div>
                                        <h5 style="color: #fff; font-size: 0.85rem; font-weight: 800;">${s.name}</h5>
                                        <span style="color: #ff6600; font-size: 0.7rem; font-family: monospace;">/${s.slug}/</span>
                                    </div>
                                </div>
                                <div style="display: flex; items-center; gap: 6px;">
                                    <button onclick="startEditCity('${s.id}')" style="background: rgba(255,102,0,0.1); border: 1px solid rgba(255,102,0,0.3); color: #ff6600; padding: 6px 10px; border-radius: 6px; font-size: 0.7rem; cursor: pointer;" title="Editar"><i class="fa-solid fa-pen"></i></button>
                                    <button onclick="deleteCity('${s.id}', '${s.name}')" style="background: rgba(255,82,82,0.1); border: 1px solid rgba(255,82,82,0.3); color: #ff5252; padding: 6px 10px; border-radius: 6px; font-size: 0.7rem; cursor: pointer;" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } else if (tab === 'systems') {
            const editSys = editingSystemId ? systems.find(s => s.id === editingSystemId) : null;
            return `
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    <div style="background: rgba(15,20,32,0.6); padding: 20px; border-radius: 14px; border: 1px solid rgba(255,102,0,0.2);">
                        <h4 style="font-family: var(--font-header); color: #fff; font-size: 0.9rem; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                            <span><i class="fa-solid ${editSys ? 'fa-pen' : 'fa-plus'}" style="color: #ff8800;"></i> ${editSys ? `Editar Sistema "${editSys.name}"` : 'Criar Novo Sistema'}</span>
                            ${editSys ? `<button onclick="cancelEditSystem()" style="background:none; border:none; color:#ff5252; font-size:0.75rem; cursor:pointer;">Cancelar Edição</button>` : ''}
                        </h4>
                        <form onsubmit="handleSaveSystem(event)" style="display: flex; flex-direction: column; gap: 12px;">
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                                <input type="text" id="sys-form-name" class="global-admin-input" placeholder="Nome do Sistema (ex: LOCKPICK)" value="${editSys ? editSys.name : ''}" required style="margin:0;">
                                <input type="text" id="sys-form-slug" class="global-admin-input" placeholder="Slug (ex: lockpick)" value="${editSys ? editSys.slug : ''}" required style="margin:0;">
                                <input type="text" id="sys-form-tag" class="global-admin-input" placeholder="Tag (ex: MINIJOGO)" value="${editSys ? (editSys.tag || '') : ''}" style="margin:0;">
                                <input type="text" id="sys-form-link" class="global-admin-input" placeholder="Link (ex: lockpick/)" value="${editSys ? (editSys.link || '') : ''}" style="margin:0;">
                            </div>
                            <label style="font-size: 0.72rem; color: #94a3b8; font-weight: 700;">VINCULAR A CIDADES:</label>
                            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                                ${servers.map(serv => {
                                    const isChecked = editSys ? (editSys.city_ids && (editSys.city_ids.includes(serv.id) || editSys.city_ids.includes(serv.slug))) : true;
                                    return `
                                    <label style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; color: #cbd5e1; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                                        <input type="checkbox" name="city-link-check" value="${serv.id}" ${isChecked ? 'checked' : ''}> ${serv.name}
                                    </label>
                                `}).join('')}
                            </div>
                            <button type="submit" class="global-admin-submit" style="width: auto; align-self: start; padding: 10px 24px;">${editSys ? 'Atualizar Sistema' : 'Salvar Novo Sistema'}</button>
                        </form>
                    </div>

                    <h4 style="font-family: var(--font-header); color: #fff; font-size: 0.9rem;">Sistemas Cadastrados (${systems.length})</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 12px;">
                        ${systems.map((sys, idx) => `
                            <div style="background: rgba(15,20,32,0.4); padding: 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <div style="display: flex; flex-direction: column; gap: 2px;">
                                        <button onclick="moveSystemUp(${idx})" ${idx === 0 ? 'disabled style="opacity:0.3"' : ''} style="background: rgba(255,255,255,0.05); border: none; color: #fff; padding: 2px 6px; border-radius: 4px; cursor: pointer;"><i class="fa-solid fa-arrow-up" style="font-size:0.65rem;"></i></button>
                                        <button onclick="moveSystemDown(${idx})" ${idx === systems.length - 1 ? 'disabled style="opacity:0.3"' : ''} style="background: rgba(255,255,255,0.05); border: none; color: #fff; padding: 2px 6px; border-radius: 4px; cursor: pointer;"><i class="fa-solid fa-arrow-down" style="font-size:0.65rem;"></i></button>
                                    </div>
                                    <div>
                                        <h5 style="color: #fff; font-size: 0.85rem; font-weight: 800;">${sys.name}</h5>
                                        <span style="color: #ffaa00; font-size: 0.7rem; font-family: monospace;">${sys.tag || 'SISTEMA'}</span>
                                    </div>
                                </div>
                                <div style="display: flex; items-center; gap: 6px;">
                                    <button onclick="startEditSystem('${sys.id}')" style="background: rgba(255,102,0,0.1); border: 1px solid rgba(255,102,0,0.3); color: #ff6600; padding: 6px 10px; border-radius: 6px; font-size: 0.7rem; cursor: pointer;" title="Editar"><i class="fa-solid fa-pen"></i></button>
                                    <button onclick="deleteSystem('${sys.id}', '${sys.name}')" style="background: rgba(255,82,82,0.1); border: 1px solid rgba(255,82,82,0.3); color: #ff5252; padding: 6px 10px; border-radius: 6px; font-size: 0.7rem; cursor: pointer;" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } else if (tab === 'andarilho') {
            return `
                <div style="background: rgba(15,20,32,0.6); padding: 24px; border-radius: 14px; border: 1px solid rgba(255,102,0,0.2); text-align: center;">
                    <i class="fa-solid fa-rotate" style="font-size: 2rem; color: #ff6600; margin-bottom: 12px;"></i>
                    <h4 style="font-family: var(--font-header); color: #fff; font-size: 1rem; margin-bottom: 8px;">Resetar Ciclo do Andarilho</h4>
                    <p style="font-size: 0.8rem; color: #94a3b8; max-width: 500px; margin: 0 auto 16px;">Limpa todas as confirmações da comunidade acumuladas no ciclo atual do Andarilho em todas as cidades.</p>
                    <button onclick="handleResetWandererCycle()" class="global-admin-submit" style="width: auto; background: linear-gradient(135deg, #ff5500 0%, #e62e00 50%, #ffaa00 100%); color: #fff; padding: 10px 24px;">CONFIRMAR RESET DO CICLO</button>
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

    window.handleSaveCity = function(e) {
        e.preventDefault();
        const name = document.getElementById('city-form-name').value.trim();
        const slug = document.getElementById('city-form-slug').value.trim();
        const sub = document.getElementById('city-form-sub').value.trim();
        const banner = document.getElementById('city-form-banner').value.trim();

        let servers = getActiveServers();

        if (editingCityId) {
            servers = servers.map(s => s.id === editingCityId ? { ...s, name, slug, subtitle: sub, banner_image_url: banner } : s);
            editingCityId = null;
            alert('Cidade atualizada com sucesso!');
        } else {
            servers.push({ id: 'city-' + Date.now(), name, slug, subtitle: sub, banner_image_url: banner, description: 'Cidade cadastrada via Admin.' });
            alert('Cidade cadastrada com sucesso!');
        }

        localStorage.setItem('malaca_custom_servers', JSON.stringify(servers));
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
        renderAdminContent();
        if (window.loadCustomCities) window.loadCustomCities();
    };

    window.deleteCity = function(id, name) {
        if (confirm(`Tem certeza que deseja excluir a cidade "${name}"?`)) {
            let servers = getActiveServers();
            servers = servers.filter(s => s.id !== id);
            localStorage.setItem('malaca_custom_servers', JSON.stringify(servers));
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

    window.handleSaveSystem = function(e) {
        e.preventDefault();
        const name = document.getElementById('sys-form-name').value.trim();
        const slug = document.getElementById('sys-form-slug').value.trim();
        const tag = document.getElementById('sys-form-tag').value.trim();
        const link = document.getElementById('sys-form-link').value.trim();
        const checked = Array.from(document.querySelectorAll('input[name="city-link-check"]:checked')).map(c => c.value);

        let systems = getActiveSystems();

        if (editingSystemId) {
            systems = systems.map(s => s.id === editingSystemId ? { ...s, name, slug, tag, link, city_ids: checked } : s);
            editingSystemId = null;
            alert('Sistema atualizado com sucesso!');
        } else {
            systems.push({ id: 'sys-' + Date.now(), name, slug, tag, link: link || `${slug}/`, city_ids: checked, is_active: true });
            alert('Sistema cadastrado com sucesso!');
        }

        localStorage.setItem('malaca_custom_systems', JSON.stringify(systems));
        renderAdminContent();
    };

    window.moveSystemUp = function(idx) {
        if (idx <= 0) return;
        let systems = getActiveSystems();
        const temp = systems[idx - 1];
        systems[idx - 1] = systems[idx];
        systems[idx] = temp;
        localStorage.setItem('malaca_custom_systems', JSON.stringify(systems));
        renderAdminContent();
    };

    window.moveSystemDown = function(idx) {
        let systems = getActiveSystems();
        if (idx >= systems.length - 1) return;
        const temp = systems[idx + 1];
        systems[idx + 1] = systems[idx];
        systems[idx] = temp;
        localStorage.setItem('malaca_custom_systems', JSON.stringify(systems));
        renderAdminContent();
    };

    window.deleteSystem = function(id, name) {
        if (confirm(`Tem certeza que deseja excluir o sistema "${name}"?`)) {
            let systems = getActiveSystems();
            systems = systems.filter(s => s.id !== id);
            localStorage.setItem('malaca_custom_systems', JSON.stringify(systems));
            renderAdminContent();
        }
    };

    window.handleResetWandererCycle = function() {
        localStorage.removeItem('cidade_alta_user_confirmations');
        alert('Ciclo do Andarilho resetado com sucesso!');
    };

    // Admin Users Management View
    window.loadAdminUsersView = async function() {
        const container = document.getElementById('admin-users-list-container');
        if (!container) return;
        try {
            const { data, error } = await supabaseClient.from('profiles').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            if (!data || data.length === 0) {
                container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 30px; font-size: 0.8rem;">Nenhum usuário cadastrado ainda.</div>';
                return;
            }
            container.innerHTML = data.map(u => {
                const isAdmin = u.is_admin || u.role === 'admin';
                const isBanned = u.is_banned === true;
                return `
                    <div style="background: rgba(15,20,32,0.5); padding: 14px; border-radius: 12px; border: 1px solid ${isBanned ? 'rgba(239,68,68,0.4)' : isAdmin ? 'rgba(88,101,242,0.4)' : 'rgba(255,255,255,0.06)'}; display: flex; flex-direction: column; gap: 10px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <img src="${u.avatar_url || 'https://cdn.discordapp.com/embed/avatars/0.png'}" style="width: 44px; height: 44px; border-radius: 50%; border: 2px solid ${isAdmin ? '#5865F2' : '#38bdf8'}; object-fit: cover;" />
                            <div style="min-width: 0; flex: 1;">
                                <div style="display: flex; align-items: center; gap: 6px;">
                                    <h5 style="color: #fff; font-size: 0.85rem; font-weight: 800; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${u.full_name || u.username}</h5>
                                    ${isAdmin ? '<span style="font-size: 9px; font-weight: 800; background: rgba(88,101,242,0.2); color: #818cf8; padding: 2px 5px; border-radius: 4px; border: 1px solid rgba(88,101,242,0.4);">ADMIN</span>' : ''}
                                    ${isBanned ? '<span style="font-size: 9px; font-weight: 800; background: rgba(239,68,68,0.2); color: #fca5a5; padding: 2px 5px; border-radius: 4px; border: 1px solid rgba(239,68,68,0.4);">BANIDO</span>' : ''}
                                </div>
                                <span style="color: #38bdf8; font-size: 0.72rem; font-weight: 700;">@${u.username}</span>
                                <div style="color: #64748b; font-size: 0.68rem; font-family: monospace;">ID: ${u.discord_id}</div>
                            </div>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.06);">
                            <button onclick="toggleAdminProfile('${u.id}', ${isAdmin})" style="background: ${isAdmin ? 'rgba(245,158,11,0.15)' : 'rgba(88,101,242,0.15)'}; border: 1px solid ${isAdmin ? 'rgba(245,158,11,0.4)' : 'rgba(88,101,242,0.4)'}; color: ${isAdmin ? '#fde68a' : '#c7d2fe'}; padding: 4px 10px; border-radius: 6px; font-size: 0.68rem; font-weight: 800; cursor: pointer;">
                                <i class="fa-solid fa-shield"></i> ${isAdmin ? 'Remover Admin' : 'Tornar Admin'}
                            </button>
                            <button onclick="toggleBanProfile('${u.id}', ${isBanned})" style="background: ${isBanned ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}; border: 1px solid ${isBanned ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}; color: ${isBanned ? '#86efac' : '#fca5a5'}; padding: 4px 10px; border-radius: 6px; font-size: 0.68rem; font-weight: 800; cursor: pointer;">
                                <i class="fa-solid fa-ban"></i> ${isBanned ? 'Desbanir' : 'Banir'}
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        } catch(e) {
            container.innerHTML = `<div style="grid-column: 1/-1; color: #f87171; font-size: 0.75rem; text-align: center; padding: 20px;">Falha ao carregar usuários: ${e.message}</div>`;
        }
    };

    window.toggleAdminProfile = async function(id, currentIsAdmin) {
        const newAdmin = !currentIsAdmin;
        try {
            await supabaseClient.from('profiles').update({ is_admin: newAdmin, role: newAdmin ? 'admin' : 'user' }).eq('id', id);
            alert(`Permissão atualizada para: ${newAdmin ? 'ADMIN' : 'USUÁRIO'}`);
            loadAdminUsersView();
        } catch(e) {
            alert('Erro ao atualizar permissão: ' + e.message);
        }
    };

    window.toggleBanProfile = async function(id, currentIsBanned) {
        const newBanned = !currentIsBanned;
        try {
            await supabaseClient.from('profiles').update({ is_banned: newBanned }).eq('id', id);
            alert(`Usuário ${newBanned ? 'BANIDO' : 'DESBANIDO'} com sucesso.`);
            loadAdminUsersView();
        } catch(e) {
            alert('Erro ao atualizar status de banimento: ' + e.message);
        }
    };

    // Admin Logs View
    window.loadAdminLogsView = async function() {
        const container = document.getElementById('admin-logs-list-container');
        if (!container) return;
        try {
            const { data, error } = await supabaseClient.from('access_logs').select('*').order('logged_at', { ascending: false }).limit(40);
            if (error) throw error;
            if (!data || data.length === 0) {
                container.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 30px; font-size: 0.8rem;">Nenhum log gravado ainda.</div>';
                return;
            }
            container.innerHTML = data.map(l => `
                <div style="padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.04); display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                    <div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="color: #fff; font-weight: 800; font-size: 0.78rem;">${l.username || 'Discord User'}</span>
                            <span style="color: #38bdf8; font-family: monospace; font-size: 0.68rem; background: rgba(0,210,255,0.1); padding: 2px 6px; border-radius: 4px;">ID: ${l.discord_id || '—'}</span>
                        </div>
                        <span style="color: #64748b; font-size: 0.68rem; font-family: monospace;">${l.user_agent ? l.user_agent.substring(0, 70) + '...' : 'Navegador Web'}</span>
                    </div>
                    <span style="color: #94a3b8; font-size: 0.72rem; font-family: monospace; white-space: nowrap;">
                        ${l.logged_at ? new Date(l.logged_at).toLocaleTimeString('pt-BR') : ''}
                    </span>
                </div>
            `).join('');
        } catch(e) {
            container.innerHTML = `<div style="color: #f87171; font-size: 0.75rem; text-align: center; padding: 20px;">Falha ao carregar logs: ${e.message}</div>`;
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
            alert('Status de manutenção atualizado!');
        } catch(err) {
            alert('Erro ao salvar manutenção: ' + err.message);
        }
    };

    // Authentication Guard for Simulator / Minigame Pages
    function checkSystemAuthProtection() {
        const isSystemPage = window.location.pathname.includes('/lockpick') ||
                             window.location.pathname.includes('/caixinha') ||
                             window.location.pathname.includes('/hacking');
        if (!isSystemPage) return;

        const stored = localStorage.getItem('malaca_user_profile');
        const user = stored ? JSON.parse(stored) : null;

        if (!user) {
            let lockOverlay = document.getElementById('system-auth-guard-overlay');
            if (!lockOverlay) {
                lockOverlay = document.createElement('div');
                lockOverlay.id = 'system-auth-guard-overlay';
                lockOverlay.style.cssText = `
                    position: fixed; inset: 0; background: rgba(3, 7, 18, 0.94); backdrop-filter: blur(12px);
                    z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 20px;
                `;
                lockOverlay.innerHTML = `
                    <div style="background: linear-gradient(135deg, #090e17 0%, #000000 100%); border: 1px solid rgba(88,101,242,0.4); border-radius: 20px; padding: 36px; max-width: 440px; width: 100%; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.8);">
                        <div style="width: 64px; height: 64px; border-radius: 50%; background: rgba(88,101,242,0.15); border: 2px solid #5865F2; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: #5865F2; font-size: 30px;">
                            <i class="fa-brands fa-discord"></i>
                        </div>
                        <h3 style="font-family: var(--font-header, sans-serif); font-size: 1.15rem; font-weight: 900; color: #fff; margin-bottom: 8px;">ACESSO RESTRITO POR DISCORD</h3>
                        <p style="font-size: 0.8rem; color: #94a3b8; line-height: 1.6; margin-bottom: 24px;">
                            Para utilizar este simulador e participar das ferramentas do Malaca System GTARP, é necessário estar conectado com sua conta do Discord.
                        </p>
                        <button onclick="loginWithDiscordGlobal()" style="width: 100%; padding: 14px; border-radius: 12px; background: #5865F2; color: #fff; font-size: 0.85rem; font-weight: 800; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 8px 25px rgba(88,101,242,0.35); transition: all 0.2s ease;">
                            <i class="fa-brands fa-discord" style="font-size: 1.2rem;"></i> ENTRAR COM O DISCORD
                        </button>
                        <a href="/cidades/cda/" style="display: block; margin-top: 16px; font-size: 0.75rem; color: #64748b; text-decoration: none; font-weight: 600;">
                            <i class="fa-solid fa-arrow-left"></i> Voltar para a Central
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
    });
    checkSystemAuthProtection();
    checkGlobalAnnouncementBanner();
})();

