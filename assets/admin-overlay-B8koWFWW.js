import{t as e}from"./dist-CPfJrQXr.js";var t=e(`https://pdzytmdssswiyjwohvwn.supabase.co`,`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkenl0bWRzc3N3aXlqd29odnduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1ODI0NjQsImV4cCI6MjEwNzE1ODQ2NH0.RxTwiHG5JRHK02u1eBx3cFXI_3fKYMrxuI2op846FME`,{auth:{persistSession:!0,autoRefreshToken:!0,detectSessionInUrl:!0}}),n=t.channel(`malaca_realtime_global_hub`);(function(){document.body.insertAdjacentHTML(`beforeend`,`
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
                <div style="display: flex; align-items: center; gap: 10px;">
                    <a href="/painel/" class="global-admin-nav-btn" style="text-decoration: none; padding: 6px 14px; font-size: 11px; background: rgba(0,210,255,0.15); border: 1px solid rgba(0,210,255,0.4); color: #38bdf8; border-radius: 8px; display: inline-flex; align-items: center; gap: 6px;">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i> Abrir Painel Completo
                    </a>
                    <button class="global-admin-close" onclick="closeGlobalAdminModal()"><i class="fa-solid fa-xmark"></i></button>
                </div>
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
    `);let e=[`722320491767136346`],r=!1;function i(e){if(!e)return``;if(e.discord_id&&typeof e.discord_id==`string`&&e.discord_id.trim())return e.discord_id.trim();if(Array.isArray(e.identities)&&e.identities.length>0){let t=e.identities.find(e=>e.provider===`discord`)||e.identities[0];if(t){if(t.id)return String(t.id).trim();if(t.identity_data){if(t.identity_data.provider_id)return String(t.identity_data.provider_id).trim();if(t.identity_data.sub)return String(t.identity_data.sub).trim()}}}let t=e.user_metadata||e.raw_user_meta_data||{};return t.provider_id?String(t.provider_id).trim():t.sub&&!String(t.sub).includes(`-`)?String(t.sub).trim():t.id&&!String(t.id).includes(`-`)?String(t.id).trim():e.id&&typeof e.id==`string`&&/^\d{15,22}$/.test(e.id.trim())?e.id.trim():e.sub&&typeof e.sub==`string`&&/^\d{15,22}$/.test(e.sub.trim())?e.sub.trim():``}function a(t){if(!t)return!1;let n=i(t)||t.discord_id||``;if(n&&e.includes(String(n))||t.id&&e.includes(String(t.id)))return!0;if(t.is_banned===!0||t.role===`banned`)return!1;try{let e=JSON.parse(localStorage.getItem(`malaca_banned_discord_accounts`)||`[]`);if(n&&e.includes(String(n))||t.id&&e.includes(String(t.id)))return!1}catch{}if(t.is_admin===!0||t.role===`admin`||t.role===`owner`||t.role===`founder`)return!0;try{let e=JSON.parse(localStorage.getItem(`malaca_admin_discord_accounts`)||`[]`);if(n&&e.includes(String(n))||t.id&&e.includes(String(t.id)))return!0}catch{}return sessionStorage.getItem(`malaca_admin_master_session`)===`true`||localStorage.getItem(`malaca_admin_master_session`)===`true`}window.checkAdminPermission=a;function o(){try{let e=localStorage.getItem(`malaca_user_profile`);if(e){let t=JSON.parse(e);if(t.is_banned===!0)return!1;if(a(t))return!0}}catch{}return!1}function s(e){document.querySelectorAll(`.hub-footer-admin-link`).forEach(t=>{e?(t.classList.add(`is-admin-visible`),t.style.display=`inline-flex`):(t.classList.remove(`is-admin-visible`),t.style.display=`none`)})}function c(e){if(!e)return;let t=document.getElementById(`malaca-banned-lockout-overlay`);if(t)return;t=document.createElement(`div`),t.id=`malaca-banned-lockout-overlay`,t.style.cssText=`
            position: fixed; inset: 0; z-index: 99999999;
            background: radial-gradient(circle at center, rgba(30, 7, 7, 0.98) 0%, rgba(5, 5, 10, 0.99) 100%);
            backdrop-filter: blur(20px); display: flex; align-items: center; justify-content: center;
            padding: 20px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            pointer-events: all;
        `,t.innerHTML=`
            <div style="background: linear-gradient(180deg, #180909 0%, #0c0404 100%); border: 1px solid rgba(239,68,68,0.5); border-radius: 24px; padding: 36px 30px; max-width: 480px; width: 100%; text-align: center; box-shadow: 0 25px 70px rgba(0,0,0,0.95), 0 0 50px rgba(239,68,68,0.25); position: relative;">
                <div style="width: 76px; height: 76px; border-radius: 50%; background: rgba(239,68,68,0.15); border: 2px solid #ef4444; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: #ef4444; font-size: 34px; box-shadow: 0 0 35px rgba(239,68,68,0.4);">
                    <i class="fa-solid fa-ban"></i>
                </div>
                
                <div style="display: inline-flex; align-items: center; gap: 6px; padding: 5px 14px; border-radius: 20px; background: rgba(239,68,68,0.18); border: 1px solid rgba(239,68,68,0.4); color: #fca5a5; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px;">
                    <i class="fa-solid fa-triangle-exclamation"></i> ACESSO REVOGADO • CONTA SUSPENSA
                </div>

                <h3 style="font-family: var(--font-header, 'Orbitron', sans-serif); font-size: 1.4rem; font-weight: 900; color: #fff; margin: 0 0 10px; letter-spacing: 0.5px;">
                    CONTA SUSPENSA
                </h3>
                
                <p style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.6; margin: 0 0 22px;">
                    Seu acesso à plataforma <strong style="color: #fff;">Malaca System GTARP</strong> foi suspenso pela administração. Todas as cidades, sistemas, mapas e painéis estão bloqueados para sua conta.
                </p>

                <div style="background: rgba(0,0,0,0.5); border: 1px solid rgba(239,68,68,0.25); border-radius: 14px; padding: 14px; margin-bottom: 24px; display: flex; align-items: center; gap: 14px; text-align: left;">
                    <img src="${e.avatar_url||`https://cdn.discordapp.com/embed/avatars/0.png`}" style="width: 48px; height: 48px; border-radius: 50%; border: 2px solid #ef4444; object-fit: cover; flex-shrink: 0;" />
                    <div style="min-width: 0; flex: 1;">
                        <div style="color: #fff; font-weight: 800; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${e.full_name||e.username}</div>
                        <div style="color: #ef4444; font-weight: 700; font-size: 0.78rem;">@${e.username}</div>
                        <div style="color: #64748b; font-size: 0.7rem; font-family: monospace;">ID Discord: ${e.discord_id||`—`}</div>
                    </div>
                    <span style="font-size: 10px; font-weight: 900; background: rgba(239,68,68,0.25); color: #fca5a5; padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(239,68,68,0.5);">BANIDO</span>
                </div>

                <button onclick="handleBannedLogoutGlobal()" style="width: 100%; padding: 14px; border-radius: 12px; background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff; font-size: 0.85rem; font-weight: 900; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 10px 25px rgba(239,68,68,0.4); text-transform: uppercase; letter-spacing: 0.5px;">
                    <i class="fa-solid fa-arrow-right-from-bracket"></i> DESCONECTAR CONTA
                </button>
            </div>
        `,document.body.appendChild(t),r=!1,s(!1);let n=document.getElementById(`global-admin-modal`);n&&n.classList.remove(`active`);let i=document.getElementById(`global-discord-modal`);i&&i.classList.remove(`active`)}window.handleBannedLogoutGlobal=async function(){try{await t.auth.signOut()}catch{}localStorage.removeItem(`malaca_user_profile`),window.location.reload()};function l(){try{let e=localStorage.getItem(`malaca_user_profile`);if(e){let t=JSON.parse(e),n=i(t);if(n!==`722320491767136346`){let e=[];try{e=JSON.parse(localStorage.getItem(`malaca_banned_discord_accounts`)||`[]`)}catch{}if(t.is_banned===!0||e.includes(n))return c(t),!0}}}catch{}return!1}r=o(),s(r),l(),window.openDiscordModal=function(){l()||(document.getElementById(`global-discord-modal`).classList.add(`active`),u())},window.closeDiscordModal=function(){document.getElementById(`global-discord-modal`).classList.remove(`active`)},window.openGlobalAdminModal=function(){let e=localStorage.getItem(`malaca_user_profile`),t=null;try{t=e?JSON.parse(e):null}catch{}if(!(t&&(t.is_admin===!0||t.role===`admin`||a(t)))){window.openDiscordModal();return}r=!0,s(!0);let n=document.getElementById(`global-admin-modal`);n?(n.classList.add(`active`),T()):window.location.href=`/painel/`},window.closeGlobalAdminModal=function(){let e=document.getElementById(`global-admin-modal`);e&&e.classList.remove(`active`)},window.loginWithDiscordGlobal=async function(){let e=document.querySelector(`#discord-modal-body button`),n=e?e.innerHTML:``;e&&(e.disabled=!0,e.innerHTML=`<i class="fa-solid fa-spinner fa-spin"></i> Conectando ao Discord...`);try{let e=window.location.origin;(window.location.hostname.includes(`cda.malaca.com.br`)||window.location.hostname.includes(`malaca.com.br`))&&(e=`https://cda.malaca.com.br`);let n=e+window.location.pathname,{error:r}=await t.auth.signInWithOAuth({provider:`discord`,options:{redirectTo:n,scopes:`identify email`}});if(r)throw r}catch(t){console.error(`Supabase Discord OAuth error:`,t),e&&(e.disabled=!1,e.innerHTML=n||`<i class="fa-brands fa-discord" style="font-size: 18px;"></i> ENTRAR COM O DISCORD`),alert(`Falha ao autenticar com o Discord: `+(t.message||`Verifique a conexão e tente novamente.`))}},window.logoutDiscordGlobal=async function(){try{await t.auth.signOut()}catch(e){console.warn(`SignOut exception:`,e)}localStorage.removeItem(`malaca_user_profile`),u(),d(),typeof checkSystemAuthProtection==`function`&&checkSystemAuthProtection()};function u(){let e=document.getElementById(`discord-modal-body`),t=document.getElementById(`discord-modal-title`),n=document.getElementById(`discord-modal-subtitle`);if(!e)return;let r=localStorage.getItem(`malaca_user_profile`),i=r?JSON.parse(r):null,o=i?i.is_admin===!0||i.role===`admin`||typeof a==`function`&&a(i):!1;i?(t.textContent=`Dashboard do Usuário`,n.textContent=`Perfil e Registro de Acesso`,e.innerHTML=`
                <div style="display: flex; align-items: center; gap: 16px; padding: 16px; background: linear-gradient(135deg, #18181b 0%, #000000 100%); border-radius: 14px; border: 1px solid rgba(0,210,255,0.3); margin-bottom: 16px;">
                    <img src="${i.avatar_url||`https://cdn.discordapp.com/embed/avatars/0.png`}" style="width: 56px; height: 56px; border-radius: 50%; border: 2px solid ${o?`#f59e0b`:`#38bdf8`}; object-fit: cover;" />
                    <div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <h4 style="font-size: 16px; font-weight: 900; color: #fff;">${i.full_name||i.username}</h4>
                            <span style="font-size: 9px; font-weight: 800; background: ${o?`rgba(245,158,11,0.2)`:`rgba(88,101,242,0.2)`}; color: ${o?`#fde68a`:`#5865F2`}; padding: 2px 6px; border-radius: 4px; border: 1px solid ${o?`rgba(245,158,11,0.4)`:`rgba(88,101,242,0.4)`};">${o?`ADMIN`:`VERIFICADO`}</span>
                        </div>
                        <span style="font-size: 12px; color: #38bdf8; font-weight: 700;">@${i.username}</span>
                        <div style="font-size: 10px; color: #94a3b8; margin-top: 2px; font-family: monospace;">ID: ${i.discord_id}</div>
                    </div>
                </div>

                ${o?`
                    <div style="background: linear-gradient(135deg, rgba(88,101,242,0.18) 0%, rgba(0,210,255,0.12) 100%); border: 1px solid rgba(88,101,242,0.4); border-radius: 12px; padding: 14px; margin-bottom: 16px;">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <i class="fa-solid fa-shield-halved" style="color: #818cf8; font-size: 1rem;"></i>
                                <span style="font-size: 12px; font-weight: 800; color: #fff; text-transform: uppercase;">Acesso Administrativo</span>
                            </div>
                            <span style="font-size: 9px; font-weight: 900; background: rgba(88,101,242,0.3); color: #c7d2fe; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(88,101,242,0.5);">ADMINISTRADOR</span>
                        </div>
                        <p style="font-size: 11px; color: #94a3b8; line-height: 1.4; margin-bottom: 12px;">Sua conta possui acesso administrativo para gerenciar cidades, sistemas, usuários e configurações da plataforma.</p>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <a href="/painel/" style="width: 100%; padding: 11px; border-radius: 8px; background: linear-gradient(135deg, #5865F2 0%, #2563eb 100%); color: #fff; font-size: 12px; font-weight: 900; text-decoration: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(88,101,242,0.35); transition: all 0.2s ease;">
                                <i class="fa-solid fa-gauge-high"></i> ACESSAR PAINEL ADMINISTRATIVO
                            </a>
                            <button onclick="closeDiscordModal(); openGlobalAdminModal();" style="width: 100%; padding: 8px; border-radius: 8px; background: rgba(0,210,255,0.08); border: 1px solid rgba(0,210,255,0.25); color: #38bdf8; font-size: 11px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s ease;">
                                <i class="fa-solid fa-window-restore"></i> Abrir em Janela Modal Rápida
                            </button>
                        </div>
                    </div>
                `:``}

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px;">
                    <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);">
                        <span style="font-size: 10px; color: #94a3b8; display: block; font-weight: 700;">DATA DE CADASTRO</span>
                        <span style="font-size: 12px; font-weight: 800; color: #fff; font-family: monospace;">${new Date(i.created_at||Date.now()).toLocaleDateString(`pt-BR`)}</span>
                    </div>
                    <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);">
                        <span style="font-size: 10px; color: #94a3b8; display: block; font-weight: 700;">ÚLTIMO LOGIN</span>
                        <span style="font-size: 12px; font-weight: 800; color: #38bdf8; font-family: monospace;">${new Date(i.last_login_at||Date.now()).toLocaleTimeString(`pt-BR`,{hour:`2-digit`,minute:`2-digit`})}</span>
                    </div>
                </div>

                <div style="padding: 12px; background: rgba(0,0,0,0.6); border: 1px solid rgba(0,210,255,0.2); border-radius: 10px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <span style="font-size: 11px; font-weight: 700; color: #cbd5e1;"><i class="fa-solid fa-shield-halved" style="color: #22c55e;"></i> Status da Conta</span>
                    <span style="font-size: 11px; font-weight: 900; color: #38bdf8; background: rgba(0,210,255,0.2); padding: 3px 10px; border-radius: 6px; border: 1px solid rgba(0,210,255,0.3);">${o?`ADMINISTRADOR`:`VERIFICADO RP`}</span>
                </div>

                <button onclick="logoutDiscordGlobal()" style="width: 100%; padding: 12px; border-radius: 10px; background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.4); color: #fca5a5; font-size: 12px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <i class="fa-solid fa-right-from-bracket"></i> SAIR DA CONTA (LOGOUT)
                </button>
            `):(t.textContent=`Autenticação Oficial`,n.textContent=`Login e Cadastro via Discord OAuth2`,e.innerHTML=`
                <div style="text-align: center; padding: 12px 6px;">
                    <div style="width: 64px; height: 64px; border-radius: 50%; background: rgba(88,101,242,0.18); border: 2px solid #5865F2; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: #5865F2; font-size: 32px; box-shadow: 0 0 30px rgba(88,101,242,0.4);">
                        <i class="fa-brands fa-discord"></i>
                    </div>
                    <h3 style="font-size: 18px; font-weight: 900; color: #fff; margin-bottom: 8px; letter-spacing: 0.5px;">AUTENTICAÇÃO DISCORD</h3>
                    <p style="font-size: 12px; color: #94a3b8; line-height: 1.6; margin-bottom: 22px; max-width: 360px; margin-left: auto; margin-right: auto;">
                        Login e cadastro oficiais exclusivos via <strong>Discord OAuth2</strong> sincronizados com o Supabase. Sem formulários manuais, seguro e instantâneo.
                    </p>
                    <button onclick="loginWithDiscordGlobal()" id="btn-login-discord-global" style="width: 100%; padding: 14px; border-radius: 12px; background: linear-gradient(135deg, #5865F2, #4752C4); color: #fff; font-size: 13px; font-weight: 800; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 8px 25px rgba(88,101,242,0.45); transition: all 0.2s ease;">
                        <i class="fa-brands fa-discord" style="font-size: 20px;"></i> ENTRAR COM O DISCORD
                    </button>
                    <div style="margin-top: 18px; font-size: 11px; color: #64748b; display: flex; align-items: center; justify-content: center; gap: 6px;">
                        <i class="fa-solid fa-lock" style="color: #22c55e;"></i> Mesma sessão unificada para o site e painel administrativo
                    </div>
                </div>
            `)}function d(){let e=localStorage.getItem(`malaca_user_profile`),t=e?JSON.parse(e):null;document.querySelectorAll(`.hub-discord-btn`).forEach(e=>{t?(e.innerHTML=`<img src="${t.avatar_url||`https://cdn.discordapp.com/embed/avatars/0.png`}" style="width: 20px; height: 20px; border-radius: 50%; border: 1px solid #38bdf8;" /> <span style="font-family: monospace;">${t.username}</span>`,e.style.background=`#18181b`,e.style.borderColor=`rgba(0,210,255,0.5)`):(e.innerHTML=`<i class="fa-brands fa-discord"></i> <span>ENTRAR</span>`,e.style.background=`#5865F2`,e.style.borderColor=`#5865F2`)})}async function f(){let e=[];try{let t=JSON.parse(localStorage.getItem(`malaca_deleted_discord_accounts`)||`[]`);Array.isArray(t)&&(e=[...t])}catch{}try{let{data:n}=await t.from(`platform_settings`).select(`disabled_systems`).eq(`id`,`deleted_accounts`).maybeSingle();n&&Array.isArray(n.disabled_systems)&&(n.disabled_systems.forEach(t=>{let n=String(t||``).trim();n&&!e.includes(n)&&e.push(n)}),localStorage.setItem(`malaca_deleted_discord_accounts`,JSON.stringify(e)))}catch{}return e}async function p(e,n){let r=await f(),i=n&&n!==`—`&&n!==`undefined`?String(n).trim():``,a=e&&e!==`undefined`?String(e).trim():``;i&&!r.includes(i)&&r.push(i),a&&!r.includes(a)&&r.push(a),localStorage.setItem(`malaca_deleted_discord_accounts`,JSON.stringify(r));try{await t.from(`platform_settings`).upsert({id:`deleted_accounts`,disabled_systems:r,updated_at:new Date().toISOString()},{onConflict:`id`})}catch(e){console.warn(`Erro ao salvar tombstone global no Supabase:`,e)}return r}async function m(e=`Sua conta foi excluída por um administrador. Sessão desconectada.`){try{await t.auth.signOut({scope:`global`})}catch{}try{localStorage.removeItem(`malaca_user_profile`),localStorage.removeItem(`malaca_admin_master_session`),sessionStorage.removeItem(`malaca_admin_master_session`);for(let e=localStorage.length-1;e>=0;e--){let t=localStorage.key(e);t&&(t.startsWith(`sb-`)||t.includes(`supabase.auth.token`)||t.includes(`auth-token`))&&localStorage.removeItem(t)}for(let e=sessionStorage.length-1;e>=0;e--){let t=sessionStorage.key(e);t&&(t.startsWith(`sb-`)||t.includes(`supabase.auth.token`)||t.includes(`auth-token`))&&sessionStorage.removeItem(t)}}catch{}r=!1,s(!1),d(),typeof window.closeGlobalAdminModal==`function`&&window.closeGlobalAdminModal(),e&&alert(e),window.location.replace(`/`)}async function h(){try{let{data:{session:n},error:o}=await t.auth.getSession();if(o&&console.warn(`Supabase getSession warning:`,o),n&&n.user){let a=n.user,o=a.user_metadata||{},l=i(a)||o.provider_id||o.sub||``,u=o.preferred_username||o.user_name||o.name||o.full_name||`Discord User`,d=o.full_name||o.global_name||o.name||u,p=o.avatar_url||o.picture||`https://cdn.discordapp.com/embed/avatars/0.png`,h=new Date().toISOString(),g=a.email||o.email||``,_=await f();if(_.includes(String(l))||_.includes(String(a.id))){await m(`Esta conta foi excluída permanentemente por um administrador. Sessão desconectada.`);return}let v=null;try{let{data:e}=await t.from(`profiles`).select(`id, discord_id, username, full_name, avatar_url, email, is_admin, role, created_at, last_login_at`).eq(`id`,a.id).maybeSingle();e&&(v=e)}catch{}let y=e.includes(String(l))||e.includes(String(a.id)),b=[];try{b=JSON.parse(localStorage.getItem(`malaca_banned_discord_accounts`)||`[]`)}catch{}let x=[];try{x=JSON.parse(localStorage.getItem(`malaca_admin_discord_accounts`)||`[]`)}catch{}let S=x.includes(String(l))||x.includes(String(a.id)),C=!!(!y&&(v?.role===`banned`||b.includes(String(l)))),w=!!(!C&&v&&(v.is_admin===!0||v.role===`admin`)),T=y||w||S,E=C?`banned`:T?`admin`:v?.role||`user`;r=T;let D={id:a.id,discord_id:String(l),username:String(u),full_name:String(d),avatar_url:String(p),email:g||void 0,is_admin:T,role:E,last_login_at:h},O={};try{O=JSON.parse(localStorage.getItem(`malaca_user_profile`)||`{}`)}catch{}let k={...D,character_name:O.character_name||``,instagram:O.instagram||``,twitch:O.twitch||``,youtube:O.youtube||``,twitter_x:O.twitter_x||``,custom_bio:O.custom_bio||``,created_at:v?.created_at||a.created_at||h};if(localStorage.setItem(`malaca_user_profile`,JSON.stringify(k)),s(T),t.from(`profiles`).upsert([D],{onConflict:`id`}).then(()=>{}).catch(e=>{console.warn(`Supabase profiles sync warning:`,e)}),C){c(k);return}T&&sessionStorage.getItem(`malaca_open_admin_after_auth`)===`1`&&(sessionStorage.removeItem(`malaca_open_admin_after_auth`),setTimeout(()=>{window.openGlobalAdminModal()},100)),typeof window<`u`&&(window.location.hash.includes(`access_token=`)||window.location.search.includes(`code=`))&&window.history.replaceState(null,``,window.location.pathname)}else{let e=localStorage.getItem(`malaca_user_profile`);if(e)try{let t=JSON.parse(e);if(t.id&&String(t.id).startsWith(`mock-`))localStorage.removeItem(`malaca_user_profile`),r=!1,s(!1);else{let e=a(t);e&&(r=!0),s(e)}}catch{}else r=!1,s(!1)}}catch(e){console.warn(`Supabase Session Sync Exception:`,e)}d()}t.auth.onAuthStateChange(async(e,t)=>{if(e===`SIGNED_IN`||e===`TOKEN_REFRESHED`||e===`INITIAL_SESSION`||e===`USER_UPDATED`){if(await h(),u(),t&&t.user&&a(t.user)){r=!0,s(!0);let e=document.getElementById(`global-admin-modal`);e&&e.classList.contains(`active`)&&T()}typeof checkSystemAuthProtection==`function`&&checkSystemAuthProtection()}else if(e===`SIGNED_OUT`){r=!1,localStorage.removeItem(`malaca_user_profile`),s(!1),d(),u();let e=document.getElementById(`global-admin-modal`);e&&e.classList.contains(`active`)&&T(),typeof checkSystemAuthProtection==`function`&&checkSystemAuthProtection()}}),n.on(`broadcast`,{event:`servers_updated`},e=>{if(e?.payload?.servers&&Array.isArray(e.payload.servers)){localStorage.setItem(`malaca_custom_servers`,JSON.stringify(e.payload.servers)),typeof window.loadCustomCities==`function`&&window.loadCustomCities(),T();let t=window.location.pathname.split(`/`),n=t[2]||t[1];n&&typeof window.loadCitySystems==`function`&&window.loadCitySystems(n)}}).on(`broadcast`,{event:`systems_updated`},e=>{if(e?.payload?.systems&&Array.isArray(e.payload.systems)){localStorage.setItem(`malaca_custom_systems`,JSON.stringify(e.payload.systems)),T();let t=window.location.pathname.split(`/`),n=t[2]||t[1];n&&typeof window.loadCitySystems==`function`&&window.loadCitySystems(n),typeof window.initSystemVotes==`function`&&window.initSystemVotes()}}).on(`broadcast`,{event:`entity_sync`},async e=>{let t=e?.payload?.entity;if(t===`servers`)await g(),T(),typeof window.loadCustomCities==`function`&&window.loadCustomCities();else if(t===`systems`){await g(),T();let e=window.location.pathname.split(`/`),t=e[2]||e[1];t&&typeof window.loadCitySystems==`function`&&window.loadCitySystems(t),typeof window.initSystemVotes==`function`&&window.initSystemVotes()}else t===`settings`?F():t===`profiles`?typeof window.loadAdminUsersView==`function`&&window.loadAdminUsersView():(t===`wanderer_locations`||t===`wanderer`)&&typeof window.loadAdminWandererListView==`function`&&window.loadAdminWandererListView()}).on(`broadcast`,{event:`user_permission_updated`},({payload:e})=>{if(!e)return;let t=JSON.parse(localStorage.getItem(`malaca_user_profile`)||`null`);t&&(t.id===e.id||t.discord_id===e.discordId||t.id===e.userId)&&(t.is_admin=e.is_admin??e.isAdmin,t.role=e.role??(e.isAdmin?`admin`:`user`),localStorage.setItem(`malaca_user_profile`,JSON.stringify(t)),r=a(t),s(r),r?N(`Você foi promovido a Administrador da plataforma.`):(window.closeGlobalAdminModal(),N(`Seu cargo de administrador foi revogado para usuário comum.`))),D&&D.length>0&&(D=D.map(t=>t.id===e.id||t.discord_id===e.discordId||t.id===e.userId?{...t,is_admin:e.is_admin??e.isAdmin,role:e.role??(e.isAdmin?`admin`:`user`)}:t),O(D))}).on(`broadcast`,{event:`user_ban_updated`},({payload:e})=>{if(!e)return;let t=JSON.parse(localStorage.getItem(`malaca_user_profile`)||`null`),n=e.is_banned??e.isBanned;if(t&&(t.id===e.id||t.discord_id===e.discordId||t.id===e.userId)){if(t.is_banned=n,n)t.is_admin=!1,t.role=`user`,localStorage.setItem(`malaca_user_profile`,JSON.stringify(t)),c(t);else{localStorage.setItem(`malaca_user_profile`,JSON.stringify(t));let e=document.getElementById(`malaca-banned-lockout-overlay`);e&&e.remove()}}D&&D.length>0&&(D=D.map(t=>t.id===e.id||t.discord_id===e.discordId||t.id===e.userId?{...t,is_banned:n,...n?{is_admin:!1,role:`user`}:{}}:t),O(D))}).on(`broadcast`,{event:`force_user_logout`},async({payload:e})=>{if(!e)return;let n=String(e.id||``),r=String(e.discordId||``),a=JSON.parse(localStorage.getItem(`malaca_deleted_discord_accounts`)||`[]`);r&&!a.includes(r)&&a.push(r),n&&!a.includes(n)&&a.push(n),localStorage.setItem(`malaca_deleted_discord_accounts`,JSON.stringify(a));let o=JSON.parse(localStorage.getItem(`malaca_user_profile`)||`null`),s=i(o)||o?.discord_id||``,c=o?.id||``,{data:l}=await t.auth.getSession().catch(()=>({data:{}})),u=l?.session?.user,d=i(u)||``,f=u?.id||``;(n&&(c===n||f===n)||r&&(s===r||d===r))&&await m(`Sua conta foi excluída por um administrador. Sessão desconectada.`)}).on(`broadcast`,{event:`user_deleted`},async({payload:e})=>{if(!e)return;let n=String(e.id||``),r=String(e.discordId||``),a=JSON.parse(localStorage.getItem(`malaca_deleted_discord_accounts`)||`[]`);r&&!a.includes(r)&&a.push(r),n&&!a.includes(n)&&a.push(n),localStorage.setItem(`malaca_deleted_discord_accounts`,JSON.stringify(a));let o=JSON.parse(localStorage.getItem(`malaca_user_profile`)||`null`),s=i(o)||o?.discord_id||``,c=o?.id||``,{data:l}=await t.auth.getSession().catch(()=>({data:{}})),u=l?.session?.user,d=i(u)||``,f=u?.id||``;if(n&&(c===n||f===n)||r&&(s===r||d===r)){await m(`Sua conta foi excluída por um administrador. Sessão desconectada.`);return}D&&D.length>0&&(D=D.filter(e=>e.id!==n&&e.discord_id!==r),O(D))}).on(`postgres_changes`,{event:`*`,schema:`public`,table:`servers`},async()=>{await g(),T(),typeof window.loadCustomCities==`function`&&window.loadCustomCities()}).on(`postgres_changes`,{event:`*`,schema:`public`,table:`systems`},async()=>{await g(),T();let e=window.location.pathname.split(`/`),t=e[2]||e[1];t&&typeof window.loadCitySystems==`function`&&window.loadCitySystems(t),typeof window.initSystemVotes==`function`&&window.initSystemVotes()}).on(`postgres_changes`,{event:`*`,schema:`public`,table:`profiles`},async e=>{let t=e.new||e.old;if(!t)return;let n=JSON.parse(localStorage.getItem(`malaca_user_profile`)||`null`);if(n&&(n.id===t.id||n.discord_id===t.discord_id)){if(e.eventType===`DELETE`){await m(`Sua conta foi excluída por um administrador. Sessão desconectada.`);return}let i={...n,...t};if(localStorage.setItem(`malaca_user_profile`,JSON.stringify(i)),r=a(i),s(r),l())return;d()}if(D&&D.length>0){if(e.eventType===`DELETE`)D=D.filter(e=>e.id!==t.id&&e.discord_id!==t.discord_id);else{let n=D.findIndex(e=>e.id===t.id||e.discord_id===t.discord_id);n>=0?D[n]={...D[n],...t}:e.new&&D.unshift(e.new)}O(D)}}).on(`postgres_changes`,{event:`*`,schema:`public`,table:`platform_settings`},()=>{F()}).on(`broadcast`,{event:`settings_updated`},()=>{F()}).on(`broadcast`,{event:`wanderer_cycle_reset`},()=>{localStorage.removeItem(`cidade_alta_user_confirmations`),localStorage.removeItem(`malaca_wanderer_cycle_state`),typeof window.loadAdminWandererListView==`function`&&window.loadAdminWandererListView()}).on(`broadcast`,{event:`wanderer_locations_updated`},e=>{e?.payload?.locations&&(k=e.payload.locations,localStorage.setItem(`malaca_wanderer_custom_locations`,JSON.stringify(k)),j(k))}).on(`postgres_changes`,{event:`*`,schema:`public`,table:`wanderer_locations`},()=>{typeof window.loadAdminWandererListView==`function`&&window.loadAdminWandererListView()}).on(`postgres_changes`,{event:`*`,schema:`public`,table:`map_locations`},()=>{typeof window.loadAdminWandererListView==`function`&&window.loadAdminWandererListView()}).subscribe();async function g(){try{let{data:e}=await t.from(`servers`).select(`*`).order(`created_at`,{ascending:!0});e&&e.length>0&&(localStorage.setItem(`malaca_custom_servers`,JSON.stringify(e)),typeof window.loadCustomCities==`function`&&window.loadCustomCities())}catch{}try{let{data:e}=await t.from(`systems`).select(`*`).order(`created_at`,{ascending:!0});e&&e.length>0&&localStorage.setItem(`malaca_custom_systems`,JSON.stringify(e))}catch{}}document.addEventListener(`DOMContentLoaded`,()=>{h(),g()}),h(),g(),window.openAppearanceModal=function(){document.getElementById(`global-appearance-modal`).classList.add(`active`),_()},window.closeAppearanceModal=function(){document.getElementById(`global-appearance-modal`).classList.remove(`active`)},window.setGlobalTheme=function(e){document.documentElement.setAttribute(`data-theme`,e),localStorage.setItem(`malaca_theme`,e),_()},window.updateGlobalBrightness=function(e){let t=Number(e);document.documentElement.style.filter=`brightness(${t}%)`,localStorage.setItem(`malaca_brightness`,String(t));let n=document.getElementById(`g-brightness-val`);n&&(n.textContent=`${t}%`);let r=document.getElementById(`g-brightness-slider`);r&&(r.value=t)},window.setGlobalLang=function(e){localStorage.setItem(`malaca_lang`,e),_()};function _(){let e=localStorage.getItem(`malaca_theme`)||`escuro`,t=localStorage.getItem(`malaca_brightness`)||`100`,n=localStorage.getItem(`malaca_lang`)||`pt`;document.documentElement.setAttribute(`data-theme`,e),document.documentElement.style.filter=`brightness(${t}%)`,[`escuro`,`oled`,`dracula`,`cinza_escuro`,`cinza_claro`,`claro`].forEach(t=>{let n=document.getElementById(`gtheme-${t}`);n&&(t===e?(n.style.background=`linear-gradient(135deg, #00d2ff 0%, #2563eb 100%)`,n.style.color=`#fff`,n.style.borderColor=`#38bdf8`):(n.style.background=`rgba(255,255,255,0.05)`,n.style.color=`#94a3b8`,n.style.borderColor=`rgba(0,210,255,0.2)`))});let r=document.getElementById(`g-brightness-val`);r&&(r.textContent=`${t}%`);let i=document.getElementById(`g-brightness-slider`);i&&(i.value=t),[`pt`,`en`].forEach(e=>{let t=document.getElementById(`glang-${e}`);t&&(e===n?(t.style.background=`linear-gradient(135deg, #00d2ff 0%, #2563eb 100%)`,t.style.color=`#fff`,t.style.borderColor=`#38bdf8`):(t.style.background=`rgba(255,255,255,0.05)`,t.style.color=`#94a3b8`,t.style.borderColor=`rgba(0,210,255,0.2)`))})}document.addEventListener(`DOMContentLoaded`,_),_();let v=`dashboard`,y=null,b=null,x=[{id:`sys-mapa`,name:`MAPA INTERATIVO RP`,slug:`mapa-interativo`,tag:`CDA & VALLEY REALTIME`,link:`/cidades/cda/mapa/`,icon:`fa-compass`,is_active:!0},{id:`sys-lockpick`,name:`LOCKPICK SIMULATOR`,slug:`lockpick`,tag:`FIVEM LOCKPICK KIT`,link:`/cidades/cda/lockpick/`,icon:`fa-key`,is_active:!0},{id:`sys-caixinha`,name:`CAIXINHA ELETRÔNICO`,slug:`caixinha`,tag:`SAFE & ATM HACK`,link:`/cidades/cda/caixinha/`,icon:`fa-vault`,icon:`fa-vault`,is_active:!0},{id:`sys-hacking`,name:`HACKING DEVICE`,slug:`hacking`,tag:`CYBER HACK TERMINAL`,link:`/cidades/cda/hacking/`,icon:`fa-microchip`,is_active:!0}],S=[{id:`cda-server-uuid`,slug:`cda`,name:`Cidade Alta RP`,subtitle:`SERVIDORES CDA & VALLEY`},{id:`valley-server-uuid`,slug:`valley`,name:`Valley RP`,subtitle:`VALLEY ROLEPLAY HUB`},{id:`los-santos-server-uuid`,slug:`los-santos`,name:`Los Santos Central`,subtitle:`TREINAMENTO HEISTS & MINIJOGOS`}];window.loadCitySystems=function(e){let t=document.getElementById(`city-systems-grid`);if(!t)return;let n=localStorage.getItem(`malaca_custom_servers`),r=e;if(n)try{let t=JSON.parse(n).find(t=>t.slug.toLowerCase()===e.toLowerCase());t&&(r=t.id)}catch{}let i=[{id:`sys-mapa`,title:`MAPA INTERATIVO RP`,tag:`REALTIME MAP`,desc:`Mapa interativo em tempo real com virada do Andarilho e pontos de interesse.`,link:`/cidades/${e}/mapa/`,icon:`fa-compass`,img:`/images/gta_map_bg.webp`,city_ids:[`cda-server-uuid`,`valley-server-uuid`,`cda`,`valley`]},{id:`sys-lockpick`,title:`LOCKPICK SIMULATOR`,tag:`LOCKPICK KIT`,desc:`Simulador oficial de arrombamento com travamento de pinos.`,link:`/cidades/${e}/lockpick/`,icon:`fa-key`,img:`/images/lockpick.jpg`,city_ids:[`cda-server-uuid`,`los-santos-server-uuid`,`cda`,`los-santos`]},{id:`sys-caixinha`,title:`CAIXINHA ELETRÔNICO`,tag:`ATM HACK`,desc:`Decodificador rápido de cofres e caixas eletrônicos.`,link:`/cidades/${e}/caixinha/`,icon:`fa-vault`,img:`/images/caixinha.jpg`,city_ids:[`cda-server-uuid`,`los-santos-server-uuid`,`cda`,`los-santos`]},{id:`sys-hacking`,title:`HACKING DEVICE`,tag:`CYBER TERMINAL`,desc:`Terminal de hacking estilo Cayo Perico com matrizes de caracteres.`,link:`/cidades/${e}/hacking/`,icon:`fa-microchip`,img:`/images/hacking.jpg`,city_ids:[`cda-server-uuid`,`los-santos-server-uuid`,`cda`,`los-santos`]}],a=localStorage.getItem(`malaca_custom_systems`),o=i;if(a)try{let t=JSON.parse(a);Array.isArray(t)&&t.length>0&&(o=t.map(t=>({id:t.id||`sys-${t.slug}`,title:t.name,tag:t.tag||`SISTEMA RP`,desc:t.description||``,link:`/cidades/${e}/${t.slug||`mapa`}/`,icon:t.icon||`fa-microchip`,img:t.image_url||`/images/gta_map_bg.webp`,city_ids:t.city_ids||[]})))}catch{}let s=o.filter(t=>t.city_ids&&t.city_ids.length>0&&(t.city_ids.includes(r)||t.city_ids.includes(e)||t.city_ids.includes(`${e}-server-uuid`))),c=document.getElementById(`systems-count-tag`);if(c&&(c.textContent=`${s.length} SISTEMAS ATIVOS`),t.innerHTML=``,s.length===0){t.innerHTML=`<p style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 40px; font-weight: 700;">Nenhum sistema vinculado a esta cidade no momento.</p>`;return}s.forEach(e=>{let n=document.createElement(`a`);n.href=e.link,n.className=`hub-city-card`,n.innerHTML=`
                <div class="hub-city-card-header-clean">
                    <div class="hub-city-card-icon">
                        <i class="fa-solid ${e.icon}"></i>
                    </div>
                    <span class="hub-city-card-tag"><i class="fa-solid ${e.icon}"></i> ${e.tag}</span>
                </div>
                <div class="hub-city-card-body">
                    <h4 class="hub-city-card-title">${e.title}</h4>
                    <p class="hub-city-card-desc">${e.desc}</p>
                    <div class="hub-city-card-btn">
                        <span>ABRIR SISTEMA</span>
                        <i class="fa-solid fa-arrow-right"></i>
                    </div>
                </div>
            `,t.appendChild(n)})};function C(){let e=JSON.parse(localStorage.getItem(`malaca_custom_servers`)||`[]`);return e.length>0?e:S}function w(){let e=JSON.parse(localStorage.getItem(`malaca_custom_systems`)||`[]`);return e.length>0?e:x}window.loginAdminWithDiscord=function(){sessionStorage.setItem(`malaca_open_admin_after_auth`,`1`);let e=window.location.origin;(window.location.hostname.includes(`cda.malaca.com.br`)||window.location.hostname.includes(`malaca.com.br`))&&(e=`https://cda.malaca.com.br`);let n=e+window.location.pathname;t.auth.signInWithOAuth({provider:`discord`,options:{redirectTo:n,scopes:`identify email`}})};function T(){let e=document.getElementById(`global-admin-content`);if(e){if(r||=o(),!r){let e=localStorage.getItem(`malaca_user_profile`),t=null;try{t=e?JSON.parse(e):null}catch{}t&&a(t)&&(r=!0,s(!0))}if(r)try{let t=C(),n=w();e.innerHTML=`
                    <div class="global-admin-nav">
                        <button class="global-admin-nav-btn ${v===`dashboard`?`active`:``}" onclick="switchAdminTab('dashboard')"><i class="fa-solid fa-chart-pie"></i> Dashboard</button>
                        <button class="global-admin-nav-btn ${v===`users`?`active`:``}" onclick="switchAdminTab('users')"><i class="fa-solid fa-users"></i> Usuários</button>
                        <button class="global-admin-nav-btn ${v===`andarilho`?`active`:``}" onclick="switchAdminTab('andarilho')"><i class="fa-solid fa-person-walking"></i> Andarilho</button>
                        <button class="global-admin-nav-btn ${v===`cities`?`active`:``}" onclick="switchAdminTab('cities')"><i class="fa-solid fa-city"></i> Cidades (${t.length})</button>
                        <button class="global-admin-nav-btn ${v===`systems`?`active`:``}" onclick="switchAdminTab('systems')"><i class="fa-solid fa-layer-group"></i> Sistemas (${n.length})</button>
                        <button class="global-admin-nav-btn ${v===`settings`?`active`:``}" onclick="switchAdminTab('settings')"><i class="fa-solid fa-gear"></i> Opções Globais</button>
                        <button class="global-admin-nav-btn" onclick="logoutAdmin()" style="margin-left: auto; color: #ff5252;"><i class="fa-solid fa-right-from-bracket"></i> Sair</button>
                    </div>
                    <div class="global-admin-body" id="admin-tab-body">
                        ${E(v,t,n)}
                    </div>
                `,v===`dashboard`?loadAdminDashboardView():v===`users`?loadAdminUsersView():v===`andarilho`?loadAdminWandererListView():v===`settings`&&loadAdminSettingsView()}catch(t){console.error(`Erro ao montar o painel administrativo:`,t),e.innerHTML=`
                    <div class="global-admin-body" style="padding: 40px; text-align: center;">
                        <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.2rem; color: #f87171; margin-bottom: 12px; display: block;"></i>
                        <h4 style="color: #fff; font-size: 16px; font-weight: 800; margin-bottom: 8px;">Erro ao carregar o painel administrativo</h4>
                        <p style="font-size: 12px; color: #94a3b8; margin-bottom: 16px; max-width: 400px; margin-left: auto; margin-right: auto;">${t.message||`Falha ao renderizar os componentes do painel.`}</p>
                        <button onclick="switchAdminTab('dashboard')" class="global-admin-submit" style="width: auto; padding: 10px 24px; display: inline-block;">
                            <i class="fa-solid fa-rotate"></i> Recarregar Painel
                        </button>
                    </div>
                `}else{window.closeGlobalAdminModal(),e.innerHTML=``,N(`Acesso restrito: sua conta não possui privilégios de administrador.`);return}}}window.switchAdminTab=function(e){v=e,T()},window.handleAdminLogin=function(e){e.preventDefault();let t=document.getElementById(`admin-user-input`).value.trim(),n=document.getElementById(`admin-pass-input`).value.trim();t===`malaca`&&n===`199425`||t===`admin`&&(n===`cidadealta123`||n===`admin`)?(r=!0,T()):document.getElementById(`admin-auth-err`).style.display=`block`},window.logoutAdmin=function(){r=!1,T()};function E(e,t,n){if(e===`dashboard`)return`
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px;" id="admin-dashboard-stats-grid">
                        <div style="background: rgba(15,20,32,0.6); padding: 18px; border-radius: 14px; border: 1px solid rgba(88,101,242,0.3);">
                            <span style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; display: block;">USUÁRIOS DISCORD</span>
                            <span style="font-size: 26px; font-weight: 900; color: #818cf8; font-family: monospace; display: block; margin: 4px 0;" id="dash-stat-users">—</span>
                            <span style="font-size: 11px; color: #64748b;" id="dash-stat-admins">— Administradores</span>
                        </div>
                        <div style="background: rgba(15,20,32,0.6); padding: 18px; border-radius: 14px; border: 1px solid rgba(0,210,255,0.3);">
                            <span style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; display: block;">CIDADES RP</span>
                            <span style="font-size: 26px; font-weight: 900; color: #38bdf8; font-family: monospace; display: block; margin: 4px 0;">${t.length}</span>
                            <span style="font-size: 11px; color: #64748b;">CDA, Valley e Los Santos</span>
                        </div>
                        <div style="background: rgba(15,20,32,0.6); padding: 18px; border-radius: 14px; border: 1px solid rgba(0,210,255,0.3);">
                            <span style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; display: block;">SISTEMAS ATIVOS</span>
                            <span style="font-size: 26px; font-weight: 900; color: #00d2ff; font-family: monospace; display: block; margin: 4px 0;">${n.length}</span>
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
            `;if(e===`users`)return`
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
            `;if(e===`andarilho`)return`
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
                                    ${t.map(e=>`<option value="${e.id}">${e.name} (${e.slug.toUpperCase()})</option>`).join(``)}
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
                                    ${t.map(e=>`<option value="${e.id}">${e.name}</option>`).join(``)}
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
            `;if(e===`cities`){let e=y?t.find(e=>e.id===y):null;return`
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    <!-- Formulário de Criação / Edição de Cidade -->
                    <div style="background: rgba(15,20,32,0.6); padding: 20px; border-radius: 14px; border: 1px solid rgba(0,210,255,0.25);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                            <h4 style="font-family: var(--font-header); color: #fff; font-size: 0.9rem; margin: 0; display: flex; align-items: center; gap: 8px;">
                                <i class="fa-solid fa-city" style="color: #00d2ff;"></i> ${e?`Editar Servidor / Cidade`:`Adicionar Novo Servidor / Cidade`}
                            </h4>
                            ${e?`<button onclick="cancelEditCity()" style="background: none; border: none; color: #ff5252; font-size: 11px; font-weight: 800; cursor: pointer;">Cancelar Edição</button>`:``}
                        </div>
                        <form onsubmit="handleSaveCity(event)" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                            <div>
                                <label style="font-size: 11px; font-weight: 700; color: #94a3b8; display: block; margin-bottom: 4px;">Nome da Cidade / Servidor *</label>
                                <input type="text" id="city-form-name" class="global-admin-input" placeholder="Ex: Cidade Alta RP" value="${e?e.name:``}" required style="margin:0;">
                            </div>
                            <div>
                                <label style="font-size: 11px; font-weight: 700; color: #94a3b8; display: block; margin-bottom: 4px;">Slug URL *</label>
                                <input type="text" id="city-form-slug" class="global-admin-input" placeholder="ex: cda" value="${e?e.slug:``}" required style="margin:0;">
                            </div>
                            <div>
                                <label style="font-size: 11px; font-weight: 700; color: #94a3b8; display: block; margin-bottom: 4px;">Subtítulo / Descrição Curta</label>
                                <input type="text" id="city-form-sub" class="global-admin-input" placeholder="ex: SERVIDORES CDA & VALLEY" value="${e&&e.subtitle||``}" style="margin:0;">
                            </div>
                            <div>
                                <label style="font-size: 11px; font-weight: 700; color: #94a3b8; display: block; margin-bottom: 4px;">Imagem de Banner (URL opcional)</label>
                                <input type="text" id="city-form-banner" class="global-admin-input" placeholder="ex: /images/cda_banner.jpg" value="${e&&e.banner_image_url||``}" style="margin:0;">
                            </div>
                            <div style="grid-column: 1 / -1; display: flex; gap: 10px; margin-top: 4px;">
                                <button type="submit" class="global-admin-submit" style="width: auto; padding: 10px 24px;">${e?`SALVAR ALTERAÇÕES`:`CADASTRAR CIDADE`}</button>
                            </div>
                        </form>
                    </div>

                    <!-- Lista de Cidades Cadastradas -->
                    <div>
                        <h4 style="font-family: var(--font-header); color: #fff; font-size: 0.95rem; margin-bottom: 12px;">
                            <i class="fa-solid fa-list-ol" style="color: #00d2ff;"></i> Cidades Ativas na Plataforma (${t.length})
                        </h4>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            ${t.map((e,t)=>`
                                <div style="background: rgba(15,20,32,0.5); padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
                                    <div style="display: flex; align-items: center; gap: 12px;">
                                        <div style="width: 28px; height: 28px; border-radius: 6px; background: rgba(0,210,255,0.1); border: 1px solid rgba(0,210,255,0.3); display: flex; align-items: center; justify-content: center; color: #38bdf8; font-weight: 900; font-size: 12px;">
                                            ${t+1}
                                        </div>
                                        <div>
                                            <div style="color: #fff; font-size: 14px; font-weight: 800;">${e.name} <span style="font-size: 11px; color: #38bdf8; font-family: monospace;">/${e.slug}/</span></div>
                                            <div style="color: #64748b; font-size: 11px;">${e.subtitle||`Servidor RP`}</div>
                                        </div>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 6px;">
                                        <button onclick="moveCityUp(${t})" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; width: 28px; height: 28px; border-radius: 6px; cursor: pointer;" title="Mover para Cima"><i class="fa-solid fa-arrow-up"></i></button>
                                        <button onclick="moveCityDown(${t})" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; width: 28px; height: 28px; border-radius: 6px; cursor: pointer;" title="Mover para Baixo"><i class="fa-solid fa-arrow-down"></i></button>
                                        <button onclick="startEditCity('${e.id}')" style="background: rgba(0,210,255,0.15); border: 1px solid rgba(0,210,255,0.3); color: #38bdf8; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 800; cursor: pointer;"><i class="fa-solid fa-pen-to-square"></i> Editar</button>
                                        <button onclick="deleteCity('${e.id}', '${e.name}')" style="background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #f87171; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 800; cursor: pointer;"><i class="fa-solid fa-trash"></i> Excluir</button>
                                    </div>
                                </div>
                            `).join(``)}
                        </div>
                    </div>
                </div>
            `}if(e===`systems`){let e=b?n.find(e=>e.id===b):null;return`
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    <!-- Formulário de Criação / Edição de Sistema -->
                    <div style="background: rgba(15,20,32,0.6); padding: 20px; border-radius: 14px; border: 1px solid rgba(0,210,255,0.25);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                            <h4 style="font-family: var(--font-header); color: #fff; font-size: 0.9rem; margin: 0; display: flex; align-items: center; gap: 8px;">
                                <i class="fa-solid fa-layer-group" style="color: #00d2ff;"></i> ${e?`Editar Sistema RP`:`Cadastrar Novo Sistema RP`}
                            </h4>
                            ${e?`<button onclick="cancelEditSystem()" style="background: none; border: none; color: #ff5252; font-size: 11px; font-weight: 800; cursor: pointer;">Cancelar Edição</button>`:``}
                        </div>
                        <form onsubmit="handleSaveSystem(event)" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                            <div>
                                <label style="font-size: 11px; font-weight: 700; color: #94a3b8; display: block; margin-bottom: 4px;">Nome do Sistema *</label>
                                <input type="text" id="sys-form-name" class="global-admin-input" placeholder="Ex: Mapa Interativo" value="${e?e.name:``}" required style="margin:0;">
                            </div>
                            <div>
                                <label style="font-size: 11px; font-weight: 700; color: #94a3b8; display: block; margin-bottom: 4px;">Slug / Rota *</label>
                                <input type="text" id="sys-form-slug" class="global-admin-input" placeholder="ex: mapa-interativo" value="${e&&e.slug||``}" required style="margin:0;">
                            </div>
                            <div>
                                <label style="font-size: 11px; font-weight: 700; color: #94a3b8; display: block; margin-bottom: 4px;">Tag / Badge</label>
                                <input type="text" id="sys-form-tag" class="global-admin-input" placeholder="ex: REALTIME GPS" value="${e&&e.tag||``}" style="margin:0;">
                            </div>
                            <div>
                                <label style="font-size: 11px; font-weight: 700; color: #94a3b8; display: block; margin-bottom: 4px;">Link Direto (Opcional)</label>
                                <input type="text" id="sys-form-link" class="global-admin-input" placeholder="ex: /cidades/cda/mapa/" value="${e&&e.link||``}" style="margin:0;">
                            </div>
                            <div style="grid-column: 1 / -1;">
                                <label style="font-size: 11px; font-weight: 700; color: #94a3b8; display: block; margin-bottom: 6px;">Cidades Vinculadas (Onde o sistema deve aparecer)</label>
                                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                                    ${t.map(t=>{let n=!e||e.city_ids&&(e.city_ids.includes(t.id)||e.city_ids.includes(t.slug)||e.city_ids.includes(`${t.slug}-server-uuid`));return`
                                            <label style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: #cbd5e1; cursor: pointer; background: rgba(255,255,255,0.04); padding: 6px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08);">
                                                <input type="checkbox" name="city-link-check" value="${t.id}" ${n?`checked`:``}>
                                                <span>${t.name} (${t.slug.toUpperCase()})</span>
                                            </label>
                                        `}).join(``)}
                                </div>
                            </div>
                            <div style="grid-column: 1 / -1; display: flex; gap: 10px; margin-top: 4px;">
                                <button type="submit" class="global-admin-submit" style="width: auto; padding: 10px 24px;">${e?`SALVAR ALTERAÇÕES`:`CADASTRAR SISTEMA`}</button>
                            </div>
                        </form>
                    </div>

                    <!-- Lista de Sistemas Cadastrados -->
                    <div>
                        <h4 style="font-family: var(--font-header); color: #fff; font-size: 0.95rem; margin-bottom: 12px;">
                            <i class="fa-solid fa-list-check" style="color: #00d2ff;"></i> Sistemas Cadastrados (${n.length})
                        </h4>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            ${n.map((e,t)=>`
                                <div style="background: rgba(15,20,32,0.5); padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
                                    <div>
                                        <div style="color: #fff; font-size: 14px; font-weight: 800; display: flex; align-items: center; gap: 8px;">
                                            <i class="fa-solid ${e.icon||`fa-microchip`}" style="color: #00d2ff;"></i>
                                            <span>${e.name}</span>
                                            <span style="font-size: 10px; font-weight: 800; background: rgba(0,210,255,0.15); color: #38bdf8; padding: 2px 6px; border-radius: 4px;">${e.tag||`SISTEMA`}</span>
                                        </div>
                                        <div style="color: #64748b; font-size: 11px; margin-top: 2px;">Rota: ${e.link||e.slug}</div>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 6px;">
                                        <button onclick="moveSystemUp(${t})" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; width: 28px; height: 28px; border-radius: 6px; cursor: pointer;" title="Mover para Cima"><i class="fa-solid fa-arrow-up"></i></button>
                                        <button onclick="moveSystemDown(${t})" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; width: 28px; height: 28px; border-radius: 6px; cursor: pointer;" title="Mover para Baixo"><i class="fa-solid fa-arrow-down"></i></button>
                                        <button onclick="startEditSystem('${e.id}')" style="background: rgba(0,210,255,0.15); border: 1px solid rgba(0,210,255,0.3); color: #38bdf8; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 800; cursor: pointer;"><i class="fa-solid fa-pen-to-square"></i> Editar</button>
                                        <button onclick="deleteSystem('${e.id}', '${e.name}')" style="background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #f87171; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 800; cursor: pointer;"><i class="fa-solid fa-trash"></i> Excluir</button>
                                    </div>
                                </div>
                            `).join(``)}
                        </div>
                    </div>
                </div>
            `}return e===`settings`?`
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
            `:``}window.startEditCity=function(e){y=e,T()},window.cancelEditCity=function(){y=null,T()},window.handleSaveCity=async function(e){e.preventDefault();let r=document.getElementById(`city-form-name`).value.trim(),i=document.getElementById(`city-form-slug`).value.trim(),a=document.getElementById(`city-form-sub`).value.trim(),o=document.getElementById(`city-form-banner`).value.trim(),s=C(),c=null;y?(s=s.map(e=>e.id===y?(c={...e,name:r,slug:i,subtitle:a,banner_image_url:o},c):e),y=null):(c={id:`city-`+Date.now(),name:r,slug:i,subtitle:a,banner_image_url:o,description:`Cidade cadastrada via Admin.`,active:!0},s.push(c)),localStorage.setItem(`malaca_custom_servers`,JSON.stringify(s));try{await t.from(`servers`).upsert([c],{onConflict:`id`})}catch{}n.send({type:`broadcast`,event:`servers_updated`,payload:{servers:s,targetCity:c}}),n.send({type:`broadcast`,event:`entity_sync`,payload:{entity:`servers`,action:`UPDATE`,data:c,timestamp:Date.now()}}),alert(`Cidade salva no banco de dados e sincronizada em tempo real com todos os usuários!`),T(),window.loadCustomCities&&window.loadCustomCities()},window.moveCityUp=function(e){if(e<=0)return;let t=C(),r=t[e-1];t[e-1]=t[e],t[e]=r,localStorage.setItem(`malaca_custom_servers`,JSON.stringify(t)),n.send({type:`broadcast`,event:`servers_updated`,payload:{servers:t}}),T(),window.loadCustomCities&&window.loadCustomCities()},window.moveCityDown=function(e){let t=C();if(e>=t.length-1)return;let r=t[e+1];t[e+1]=t[e],t[e]=r,localStorage.setItem(`malaca_custom_servers`,JSON.stringify(t)),n.send({type:`broadcast`,event:`servers_updated`,payload:{servers:t}}),T(),window.loadCustomCities&&window.loadCustomCities()},window.deleteCity=async function(e,r){if(confirm(`Tem certeza que deseja excluir a cidade "${r}"?`)){let r=C();r=r.filter(t=>t.id!==e),localStorage.setItem(`malaca_custom_servers`,JSON.stringify(r));try{await t.from(`servers`).delete().eq(`id`,e)}catch{}n.send({type:`broadcast`,event:`servers_updated`,payload:{servers:r,deletedId:e}}),n.send({type:`broadcast`,event:`entity_sync`,payload:{entity:`servers`,action:`DELETE`,id:e,timestamp:Date.now()}}),T(),window.loadCustomCities&&window.loadCustomCities()}},window.startEditSystem=function(e){b=e,T()},window.cancelEditSystem=function(){b=null,T()},window.handleSaveSystem=async function(e){e.preventDefault();let r=document.getElementById(`sys-form-name`).value.trim(),i=document.getElementById(`sys-form-slug`).value.trim(),a=document.getElementById(`sys-form-tag`).value.trim(),o=document.getElementById(`sys-form-link`).value.trim(),s=Array.from(document.querySelectorAll(`input[name="city-link-check"]:checked`)).map(e=>e.value),c=w(),l=null;b?(c=c.map(e=>e.id===b?(l={...e,name:r,slug:i,tag:a,link:o,city_ids:s},l):e),b=null):(l={id:`sys-`+Date.now(),name:r,slug:i,tag:a,link:o||`${i}/`,city_ids:s,is_active:!0,description:`Sistema cadastrado via Admin.`,icon:`fa-microchip`},c.push(l)),localStorage.setItem(`malaca_custom_systems`,JSON.stringify(c));try{await t.from(`systems`).upsert([l],{onConflict:`id`})}catch{}n.send({type:`broadcast`,event:`systems_updated`,payload:{systems:c,targetSys:l}}),n.send({type:`broadcast`,event:`entity_sync`,payload:{entity:`systems`,action:`UPDATE`,data:l,timestamp:Date.now()}}),alert(`Sistema salvo no banco de dados e sincronizado em tempo real!`),T()},window.moveSystemUp=function(e){if(e<=0)return;let t=w(),r=t[e-1];t[e-1]=t[e],t[e]=r,localStorage.setItem(`malaca_custom_systems`,JSON.stringify(t)),n.send({type:`broadcast`,event:`systems_updated`,payload:{systems:t}}),T()},window.moveSystemDown=function(e){let t=w();if(e>=t.length-1)return;let r=t[e+1];t[e+1]=t[e],t[e]=r,localStorage.setItem(`malaca_custom_systems`,JSON.stringify(t)),n.send({type:`broadcast`,event:`systems_updated`,payload:{systems:t}}),T()},window.deleteSystem=async function(e,r){if(confirm(`Tem certeza que deseja excluir o sistema "${r}"?`)){let r=w();r=r.filter(t=>t.id!==e),localStorage.setItem(`malaca_custom_systems`,JSON.stringify(r));try{await t.from(`systems`).delete().eq(`id`,e)}catch{}n.send({type:`broadcast`,event:`systems_updated`,payload:{systems:r,deletedId:e}}),n.send({type:`broadcast`,event:`entity_sync`,payload:{entity:`systems`,action:`DELETE`,id:e,timestamp:Date.now()}}),T()}},window.handleResetWandererCycle=async function(){if(confirm(`Zerar votos do Andarilho e sincronizar todas as telas em tempo real?`)){localStorage.removeItem(`cidade_alta_user_confirmations`),localStorage.removeItem(`malaca_wanderer_cycle_state`);try{await t.from(`wanderer_confirmations`).delete().neq(`id`,`00000000-0000-0000-0000-000000000000`)}catch{}n.send({type:`broadcast`,event:`wanderer_cycle_reset`,payload:{resetBy:`admin`,timestamp:Date.now()}}),alert(`Ciclo do Andarilho zerado com sucesso! Todas as telas conectadas foram atualizadas.`)}},window.loadAdminDashboardView=async function(){let e=document.getElementById(`dash-stat-users`),n=document.getElementById(`dash-stat-admins`);if(!e)return;let r=0,i=0;try{let{data:e}=await t.from(`profiles`).select(`id, is_admin, role`);e&&Array.isArray(e)&&(r=e.length,i=e.filter(e=>e.is_admin||e.role===`admin`).length)}catch{}if(r===0)try{let e=JSON.parse(localStorage.getItem(`malaca_cached_profiles`)||`[]`);e.length>0&&(r=e.length,i=e.filter(e=>e.is_admin||e.role===`admin`).length)}catch{}e.textContent=r>0?String(r):`1`,n&&(n.textContent=`${Math.max(1,i)} Administradores Ativos`)};let D=[];window.loadAdminUsersView=async function(){let e=document.getElementById(`admin-users-list-container`);if(e)try{let{data:e,error:n}=await t.from(`profiles`).select(`*`).order(`created_at`,{ascending:!1});n&&console.warn(`Supabase profiles fetch warning:`,n);let r=JSON.parse(localStorage.getItem(`malaca_deleted_discord_accounts`)||`[]`),i=[];i=Array.isArray(e)&&!n?e.filter(e=>{let t=String(e.discord_id||``).trim(),n=String(e.id||``).trim();return!r.includes(t)&&!r.includes(n)}):JSON.parse(localStorage.getItem(`malaca_cached_profiles`)||`[]`).filter(e=>{let t=String(e.discord_id||``).trim(),n=String(e.id||``).trim();return!r.includes(t)&&!r.includes(n)}),D=i,localStorage.setItem(`malaca_cached_profiles`,JSON.stringify(i)),O(i)}catch(t){e.innerHTML=`<div style="grid-column: 1/-1; color: #f87171; font-size: 0.75rem; text-align: center; padding: 20px;">Falha ao carregar usuários: ${t.message}</div>`}};function O(e){let t=document.getElementById(`admin-users-list-container`);if(!t)return;if(!e||e.length===0){t.innerHTML=`<div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 30px; font-size: 0.8rem;">Nenhum usuário cadastrado ainda.</div>`;return}let n=JSON.parse(localStorage.getItem(`malaca_admin_discord_accounts`)||`[]`),r=JSON.parse(localStorage.getItem(`malaca_banned_discord_accounts`)||`[]`);t.innerHTML=e.map(e=>{let t=String(e.discord_id||e.id||``),i=t===`722320491767136346`||e.id===`722320491767136346`,a=!!(!i&&(e.is_banned===!0||r.includes(t))),o=i||!!(!a&&(e.is_admin===!0||e.role===`admin`||n.includes(t)));return`
                <div style="background: rgba(15,20,32,0.6); padding: 14px; border-radius: 12px; border: 1px solid ${a?`rgba(239,68,68,0.5)`:i?`rgba(0,210,255,0.5)`:o?`rgba(88,101,242,0.5)`:`rgba(255,255,255,0.06)`}; display: flex; flex-direction: column; gap: 10px; position: relative;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <img src="${e.avatar_url||`https://cdn.discordapp.com/embed/avatars/0.png`}" style="width: 44px; height: 44px; border-radius: 50%; border: 2px solid ${a?`#ef4444`:i?`#00d2ff`:o?`#5865F2`:`#38bdf8`}; object-fit: cover; flex-shrink: 0;" />
                        <div style="min-width: 0; flex: 1;">
                            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                                <h5 style="color: #fff; font-size: 0.85rem; font-weight: 800; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px;">${e.full_name||e.username}</h5>
                                ${i?`<span style="font-size: 9px; font-weight: 800; background: rgba(0,210,255,0.25); color: #38bdf8; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(0,210,255,0.5);">FUNDADOR</span>`:``}
                                ${o&&!i?`<span style="font-size: 9px; font-weight: 800; background: rgba(88,101,242,0.25); color: #818cf8; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(88,101,242,0.5);">ADMIN</span>`:``}
                                ${!o&&!a?`<span style="font-size: 9px; font-weight: 800; background: rgba(148,163,184,0.15); color: #94a3b8; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(148,163,184,0.3);">USUÁRIO</span>`:``}
                                ${a?`<span style="font-size: 9px; font-weight: 800; background: rgba(239,68,68,0.25); color: #fca5a5; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(239,68,68,0.5);">BANIDO</span>`:``}
                            </div>
                            <span style="color: #38bdf8; font-size: 0.72rem; font-weight: 700; display: block;">@${e.username}</span>
                            <div style="color: #64748b; font-size: 0.68rem; font-family: monospace;">ID Discord: ${t||`—`}</div>
                        </div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap;">
                        ${i?`
                            <span style="font-size: 0.68rem; color: #38bdf8; font-weight: 800; display: inline-flex; align-items: center; gap: 4px;"><i class="fa-solid fa-crown"></i> Fundador Principal</span>
                        `:`
                            <button onclick="toggleAdminProfile('${e.id}', '${t}', ${o})" style="background: ${o?`rgba(245,158,11,0.15)`:`rgba(88,101,242,0.15)`}; border: 1px solid ${o?`rgba(245,158,11,0.4)`:`rgba(88,101,242,0.4)`}; color: ${o?`#fde68a`:`#c7d2fe`}; padding: 5px 8px; border-radius: 6px; font-size: 0.68rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                                <i class="fa-solid fa-shield"></i> ${o?`Remover Admin`:`Tornar Admin`}
                            </button>
                            <button onclick="toggleBanProfile('${e.id}', '${t}', ${a})" style="background: ${a?`rgba(34,197,94,0.15)`:`rgba(239,68,68,0.15)`}; border: 1px solid ${a?`rgba(34,197,94,0.4)`:`rgba(239,68,68,0.4)`}; color: ${a?`#86efac`:`#fca5a5`}; padding: 5px 8px; border-radius: 6px; font-size: 0.68rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                                <i class="fa-solid fa-ban"></i> ${a?`Desbanir`:`Banir`}
                            </button>
                            <button onclick="deleteUserProfile('${e.id}', '${e.username||`Usuário`}', '${t}')" style="background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.35); color: #f87171; padding: 5px 8px; border-radius: 6px; font-size: 0.68rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px;" title="Excluir Usuário">
                                <i class="fa-solid fa-trash"></i> Excluir
                            </button>
                        `}
                    </div>
                </div>
            `}).join(``)}window.filterAdminUsersView=function(e){let t=(e||``).toLowerCase().trim();if(!t){O(D);return}O(D.filter(e=>e.username&&e.username.toLowerCase().includes(t)||e.full_name&&e.full_name.toLowerCase().includes(t)||e.discord_id&&String(e.discord_id).toLowerCase().includes(t)||e.id&&String(e.id).toLowerCase().includes(t)))},window.toggleAdminProfile=async function(e,i,a){if(i===`722320491767136346`||e===`722320491767136346`){alert(`A conta do fundador principal não pode ser alterada.`);return}let o=!a;try{try{/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(e)&&await t.from(`profiles`).update({is_admin:o,role:o?`admin`:`user`}).eq(`id`,e),i&&i!==`—`&&await t.from(`profiles`).update({is_admin:o,role:o?`admin`:`user`}).eq(`discord_id`,i)}catch{}let a=JSON.parse(localStorage.getItem(`malaca_admin_discord_accounts`)||`[]`);o?i&&!a.includes(i)&&a.push(i):a=a.filter(t=>t!==i&&t!==e),localStorage.setItem(`malaca_admin_discord_accounts`,JSON.stringify(a));let c=JSON.parse(localStorage.getItem(`malaca_cached_profiles`)||`[]`);c=c.map(t=>t.id===e||t.discord_id===i?{...t,is_admin:o,role:o?`admin`:`user`}:t),D=c,localStorage.setItem(`malaca_cached_profiles`,JSON.stringify(c));let l=JSON.parse(localStorage.getItem(`malaca_user_profile`)||`null`);l&&(l.id===e||l.discord_id===i)&&(l.is_admin=o,l.role=o?`admin`:`user`,localStorage.setItem(`malaca_user_profile`,JSON.stringify(l)),r=o,s(o),o||window.closeGlobalAdminModal()),n.send({type:`broadcast`,event:`user_permission_updated`,payload:{id:e,discordId:i,is_admin:o,role:o?`admin`:`user`}}),O(D),N(`Permissão atualizada com sucesso para: ${o?`ADMINISTRADOR`:`USUÁRIO`}`)}catch(e){alert(`Erro ao atualizar permissão: `+e.message)}},window.toggleBanProfile=async function(e,r,i){if(r===`722320491767136346`||e===`722320491767136346`){alert(`A conta do fundador principal não pode ser banida.`);return}let a=!i;try{let i={is_banned:a,role:a?`banned`:`user`,...a?{is_admin:!1}:{}};try{if(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(e)){let n=await t.from(`profiles`).update(i).eq(`id`,e);n&&n.error&&(n.error.message||``).includes(`is_banned`)&&(delete i.is_banned,await t.from(`profiles`).update(i).eq(`id`,e))}if(r&&r!==`—`){let e=await t.from(`profiles`).update(i).eq(`discord_id`,r);e&&e.error&&(e.error.message||``).includes(`is_banned`)&&(delete i.is_banned,await t.from(`profiles`).update(i).eq(`discord_id`,r))}}catch{}let o=JSON.parse(localStorage.getItem(`malaca_banned_discord_accounts`)||`[]`);if(a?(r&&!o.includes(r)&&o.push(r),e&&!o.includes(e)&&o.push(e)):o=o.filter(t=>t!==r&&t!==e),localStorage.setItem(`malaca_banned_discord_accounts`,JSON.stringify(o)),a){let t=JSON.parse(localStorage.getItem(`malaca_admin_discord_accounts`)||`[]`);t=t.filter(t=>t!==r&&t!==e),localStorage.setItem(`malaca_admin_discord_accounts`,JSON.stringify(t))}let s=JSON.parse(localStorage.getItem(`malaca_cached_profiles`)||`[]`);s=s.map(t=>t.id===e||t.discord_id===r?{...t,is_banned:a,...a?{is_admin:!1,role:`user`}:{}}:t),D=s,localStorage.setItem(`malaca_cached_profiles`,JSON.stringify(s));let l=JSON.parse(localStorage.getItem(`malaca_user_profile`)||`null`);if(l&&(l.id===e||l.discord_id===r)){if(l.is_banned=a,a)l.is_admin=!1,l.role=`user`,localStorage.setItem(`malaca_user_profile`,JSON.stringify(l)),c(l);else{localStorage.setItem(`malaca_user_profile`,JSON.stringify(l));let e=document.getElementById(`malaca-banned-lockout-overlay`);e&&e.remove()}}n.send({type:`broadcast`,event:`user_ban_updated`,payload:{id:e,discordId:r,is_banned:a}}),O(D),N(`Usuário ${a?`BANIDO`:`DESBANIDO`} com sucesso.`)}catch(e){alert(`Erro ao atualizar banimento: `+e.message)}},window.deleteUserProfile=async function(r,i,a){let o=a&&a!==`—`&&a!==`undefined`?String(a).trim():``,s=r&&r!==`undefined`?String(r).trim():``;if(o&&e.includes(o)||s&&e.includes(s)){N(`O Fundador Superadmin não pode ser excluído.`);return}if(confirm(`Deseja EXCLUIR permanentemente o usuário "${i||o||s}" (${o||s}) da plataforma? Esta ação não pode ser desfeita.`))try{await p(s,o);try{/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)&&await t.from(`profiles`).delete().eq(`id`,s),o&&await t.from(`profiles`).delete().eq(`discord_id`,o)}catch{}let e=JSON.parse(localStorage.getItem(`malaca_cached_profiles`)||`[]`);e=e.filter(e=>e.id!==s&&e.discord_id!==o&&e.discord_id!==s),D=e,localStorage.setItem(`malaca_cached_profiles`,JSON.stringify(e));let r=JSON.parse(localStorage.getItem(`malaca_admin_discord_accounts`)||`[]`);r=r.filter(e=>e!==o&&e!==s),localStorage.setItem(`malaca_admin_discord_accounts`,JSON.stringify(r));let a=JSON.parse(localStorage.getItem(`malaca_banned_discord_accounts`)||`[]`);a=a.filter(e=>e!==o&&e!==s),localStorage.setItem(`malaca_banned_discord_accounts`,JSON.stringify(a));let c=JSON.parse(localStorage.getItem(`malaca_user_profile`)||`null`);if(c&&(c.id===s||c.discord_id===o)){await m(`Sua conta foi excluída com sucesso.`);return}n.send({type:`broadcast`,event:`force_user_logout`,payload:{id:s,discordId:o,timestamp:Date.now()}}),n.send({type:`broadcast`,event:`user_deleted`,payload:{id:s,discordId:o}}),n.send({type:`broadcast`,event:`entity_sync`,payload:{entity:`profiles`,action:`DELETE`,id:s,discordId:o,timestamp:Date.now()}}),N(`Usuário "${i||o}" foi excluído e deslogado permanentemente.`),loadAdminUsersView()}catch(e){alert(`Erro ao excluir usuário: `+e.message)}};let k=[],A=[{id:`wand-1`,name:`Ponto 01 - Farol de El Gordo`,city_id:`cda-server-uuid`,coords:{x:3326.5,y:5163.2},hint:`Próximo à cerca de madeira na beira do penhasco, atrás do galpão.`},{id:`wand-2`,name:`Ponto 02 - Galpão Abandonado Sandy`,city_id:`cda-server-uuid`,coords:{x:1729.8,y:3314.1},hint:`Dentro do galpão de madeira com telhado quebrado.`},{id:`wand-3`,name:`Ponto 03 - Cabana do Monte Chiliad`,city_id:`cda-server-uuid`,coords:{x:-442.1,y:5972.4},hint:`Atrás da cabana de montanha, perto dos pinheiros altos.`},{id:`wand-4`,name:`Ponto 04 - Refúgio da Serraria Paleto`,city_id:`cda-server-uuid`,coords:{x:-582.4,y:5318.9},hint:`Perto do empilhamento de toras de madeira na serraria.`},{id:`wand-5`,name:`Ponto 05 - Píer de Del Perro`,city_id:`valley-server-uuid`,coords:{x:-1642.3,y:-1014.2},hint:`Debaixo da estrutura de madeira do píer próximo à praia.`},{id:`wand-6`,name:`Ponto 06 - Cais de Los Santos`,city_id:`valley-server-uuid`,coords:{x:114.5,y:-2218.4},hint:`Entre os contêineres azuis na doca sul.`}];window.loadAdminWandererListView=async function(){let e=document.getElementById(`admin-wanderer-list-container`);if(e)try{let e=[],{data:n,error:r}=await t.from(`wanderer_locations`).select(`*`).order(`created_at`,{ascending:!0});if(!r&&Array.isArray(n)&&n.length>0)e=n;else{let t=JSON.parse(localStorage.getItem(`malaca_wanderer_custom_locations`)||`[]`);e=t.length>0?t:A}k=e,localStorage.setItem(`malaca_wanderer_custom_locations`,JSON.stringify(e)),j(e)}catch(t){e.innerHTML=`<div style="grid-column: 1/-1; color: #f87171; font-size: 0.75rem; text-align: center; padding: 20px;">Falha ao carregar marcações: ${t.message}</div>`}};function j(e){let t=document.getElementById(`admin-wanderer-list-container`);if(!t)return;if(!e||e.length===0){t.innerHTML=`<div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 30px; font-size: 0.8rem;">Nenhuma marcação encontrada.</div>`;return}let n=C();t.innerHTML=e.map(e=>{let t=n.find(t=>t.id===e.city_id||t.slug===e.city_id)?.name||`Cidade Alta RP`,r=e.coords&&e.coords.x!==void 0?e.coords.x:e.x||0,i=e.coords&&e.coords.y!==void 0?e.coords.y:e.y||0;return`
                <div style="background: rgba(15,20,32,0.6); padding: 14px; border-radius: 12px; border: 1px solid rgba(0,210,255,0.25); display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                        <div>
                            <h5 style="color: #fff; font-size: 0.88rem; font-weight: 800; margin: 0; display: flex; align-items: center; gap: 6px;">
                                <i class="fa-solid fa-person-walking" style="color: #00d2ff;"></i> ${e.name}
                            </h5>
                            <span style="color: #38bdf8; font-size: 10px; font-weight: 700; background: rgba(0,210,255,0.12); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(0,210,255,0.3); display: inline-block; margin-top: 3px;">
                                <i class="fa-solid fa-city"></i> ${t}
                            </span>
                        </div>
                        <span style="font-family: monospace; font-size: 11px; color: #a5f3fc; background: rgba(0,0,0,0.4); padding: 3px 6px; border-radius: 4px; border: 1px solid rgba(0,210,255,0.2); white-space: nowrap;">
                            X: ${Number(r).toFixed(1)} | Y: ${Number(i).toFixed(1)}
                        </span>
                    </div>

                    <div style="background: rgba(0,0,0,0.3); padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); font-size: 11px; color: #cbd5e1; line-height: 1.4;">
                        <strong style="color: #fde68a; display: block; font-size: 10px; margin-bottom: 2px;"><i class="fa-solid fa-lightbulb"></i> DICA DO BALÃO:</strong>
                        ${e.hint||`Sem dica cadastrada.`}
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.06); margin-top: 4px;">
                        <button onclick="forceConfirmWandererPoint('${e.id}')" style="background: linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(16,185,129,0.3) 100%); border: 1px solid #22c55e; color: #86efac; padding: 5px 9px; border-radius: 6px; font-size: 10px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px;" title="Forçar este ponto como ativo no ciclo agora">
                            <i class="fa-solid fa-bolt"></i> Ativar no Ciclo
                        </button>
                        <div style="display: flex; gap: 6px;">
                            <button onclick="startEditWandererPoint('${e.id}')" style="background: rgba(0,210,255,0.15); border: 1px solid rgba(0,210,255,0.3); color: #38bdf8; padding: 5px 9px; border-radius: 6px; font-size: 10px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                                <i class="fa-solid fa-pen"></i> Editar
                            </button>
                            <button onclick="deleteWandererPoint('${e.id}', '${e.name}')" style="background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #f87171; padding: 5px 9px; border-radius: 6px; font-size: 10px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                                <i class="fa-solid fa-trash"></i> Excluir
                            </button>
                        </div>
                    </div>
                </div>
            `}).join(``)}window.filterAdminWandererList=function(e){let t=(e||``).toLowerCase().trim(),n=document.getElementById(`wand-filter-city-select`)?.value||`all`,r=k;n!==`all`&&(r=r.filter(e=>e.city_id===n||e.city_id===`${n}-server-uuid`)),t&&(r=r.filter(e=>e.name&&e.name.toLowerCase().includes(t)||e.hint&&e.hint.toLowerCase().includes(t))),j(r)},window.filterAdminWandererByCity=function(e){let t=document.getElementById(`wand-search-input`)?.value||``;window.filterAdminWandererList(t)},window.startEditWandererPoint=function(e){let t=k.find(t=>t.id===e);if(!t)return;document.getElementById(`wand-point-id`).value=e,document.getElementById(`wand-point-name`).value=t.name||``,document.getElementById(`wand-point-city`).value=t.city_id||`cda-server-uuid`;let n=t.coords&&t.coords.x!==void 0?t.coords.x:t.x||0,r=t.coords&&t.coords.y!==void 0?t.coords.y:t.y||0;document.getElementById(`wand-point-x`).value=n,document.getElementById(`wand-point-y`).value=r,document.getElementById(`wand-point-hint`).value=t.hint||``,document.getElementById(`wand-form-title`).innerHTML=`<i class="fa-solid fa-pen-to-square" style="color: #f59e0b;"></i> Editando: ${t.name}`,document.getElementById(`wand-submit-btn`).textContent=`SALVAR ALTERAÇÕES DA MARCAÇÃO`,document.getElementById(`wand-cancel-edit-btn`).style.display=`inline-block`,document.getElementById(`wand-point-name`).focus()},window.cancelEditWandererPoint=function(){document.getElementById(`wand-point-id`).value=``,document.getElementById(`wand-point-name`).value=``,document.getElementById(`wand-point-x`).value=``,document.getElementById(`wand-point-y`).value=``,document.getElementById(`wand-point-hint`).value=``,document.getElementById(`wand-form-title`).innerHTML=`<i class="fa-solid fa-location-crosshairs" style="color: #00d2ff;"></i> Cadastrar Nova Marcação do Andarilho`,document.getElementById(`wand-submit-btn`).textContent=`SALVAR MARCAÇÃO NO MAPA`,document.getElementById(`wand-cancel-edit-btn`).style.display=`none`},window.handleSaveWandererPoint=async function(e){e.preventDefault();let r=document.getElementById(`wand-point-id`).value.trim()||`wand-${Date.now()}`,i=document.getElementById(`wand-point-name`).value.trim(),a=document.getElementById(`wand-point-city`).value,o=parseFloat(document.getElementById(`wand-point-x`).value),s=parseFloat(document.getElementById(`wand-point-y`).value),c=document.getElementById(`wand-point-hint`).value.trim(),l={id:r,name:i,city_id:a,coords:{x:o,y:s},hint:c,updated_at:new Date().toISOString()};try{try{await t.from(`wanderer_locations`).upsert([l],{onConflict:`id`})}catch{}let e=k,i=e.findIndex(e=>e.id===r);i>=0?e[i]=l:e.push(l),k=e,localStorage.setItem(`malaca_wanderer_custom_locations`,JSON.stringify(e)),n.send({type:`broadcast`,event:`entity_sync`,payload:{entity:`wanderer_locations`,action:`UPDATE`,data:l,timestamp:Date.now()}}),n.send({type:`broadcast`,event:`wanderer_locations_updated`,payload:{locations:e,targetPoint:l}}),alert(`Marcação do Andarilho salva com sucesso e sincronizada no mapa em tempo real!`),cancelEditWandererPoint(),j(k)}catch(e){alert(`Erro ao salvar ponto do andarilho: `+e.message)}},window.deleteWandererPoint=async function(e,r){if(confirm(`Deseja realmente EXCLUIR a marcação "${r}" do mapa?`))try{try{await t.from(`wanderer_locations`).delete().eq(`id`,e)}catch{}let i=k.filter(t=>t.id!==e);k=i,localStorage.setItem(`malaca_wanderer_custom_locations`,JSON.stringify(i)),n.send({type:`broadcast`,event:`entity_sync`,payload:{entity:`wanderer_locations`,action:`DELETE`,id:e,timestamp:Date.now()}}),n.send({type:`broadcast`,event:`wanderer_locations_updated`,payload:{locations:i,deletedId:e}}),alert(`Marcação "${r}" excluída com sucesso!`),j(k)}catch(e){alert(`Erro ao excluir marcação: `+e.message)}},window.forceConfirmWandererPoint=async function(e){let r=k.find(t=>t.id===e);if(r&&confirm(`Deseja FORÇAR a ativação do "${r.name}" no ciclo atual para todos os usuários?`))try{let i=JSON.parse(localStorage.getItem(`malaca_user_profile`)||`{}`),a={id:`conf-${Date.now()}`,location_id:e,city_id:r.city_id,user_id:i.id||`admin`,user_name:i.username||`Admin Global`,avatar_url:i.avatar_url||``,confirmed_at:new Date().toISOString()};try{await t.from(`wanderer_confirmations`).insert([a])}catch{}n.send({type:`broadcast`,event:`wanderer_confirmed`,payload:{locationId:e,cityId:r.city_id,confirmation:a,forcedByAdmin:!0}}),alert(`Ponto "${r.name}" ativado com sucesso no ciclo atual! Todas as telas conectadas já atualizaram a localização.`)}catch(e){alert(`Erro ao forçar ativação: `+e.message)}},window.loadAdminSettingsView=async function(){try{let{data:e}=await t.from(`platform_settings`).select(`*`).eq(`id`,`default`).maybeSingle();if(e){let t=document.getElementById(`setting-announcement-text`),n=document.getElementById(`setting-announcement-active`),r=document.getElementById(`setting-maint-msg`),i=document.getElementById(`setting-maint-active`);t&&(t.value=e.global_announcement||``),n&&(n.checked=!!e.announcement_active),r&&(r.value=e.maintenance_message||`Plataforma em manutenção.`),i&&(i.checked=!!e.maintenance_mode)}}catch{}},window.handleSaveGlobalAnnouncement=async function(e){e.preventDefault();let r=document.getElementById(`setting-announcement-text`).value.trim(),i=document.getElementById(`setting-announcement-active`).checked;try{await t.from(`platform_settings`).upsert([{id:`default`,global_announcement:r,announcement_active:i,updated_at:new Date().toISOString()}],{onConflict:`id`}),n.send({type:`broadcast`,event:`settings_updated`,payload:{global_announcement:r,announcement_active:i}}),alert(`Anúncio global salvo e transmitido com sucesso!`),F()}catch(e){alert(`Erro ao salvar anúncio: `+e.message)}},window.handleSaveMaintenance=async function(e){e.preventDefault();let r=document.getElementById(`setting-maint-msg`).value.trim(),i=document.getElementById(`setting-maint-active`).checked;try{await t.from(`platform_settings`).upsert([{id:`default`,maintenance_message:r,maintenance_mode:i,updated_at:new Date().toISOString()}],{onConflict:`id`}),n.send({type:`broadcast`,event:`settings_updated`,payload:{maintenance_message:r,maintenance_mode:i}}),alert(`Status de manutenção atualizado!`)}catch(e){alert(`Erro ao salvar manutenção: `+e.message)}};function M(){let e=localStorage.getItem(`malaca_user_profile`);if(!e)return!1;try{let t=JSON.parse(e);return!(!t||!t.id||String(t.id).startsWith(`mock-`))}catch{return!1}}window.isUserLoggedIn=M;function N(e){let t=document.getElementById(`global-access-restricted-toast`);t||(t=document.createElement(`div`),t.id=`global-access-restricted-toast`,t.style.cssText=`
                position: fixed; bottom: 24px; right: 24px; z-index: 999999;
                background: linear-gradient(135deg, #090e17 0%, #030712 100%);
                border: 1px solid rgba(88, 101, 242, 0.6); border-radius: 14px;
                padding: 14px 20px; color: #fff; display: flex; align-items: center; gap: 14px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(88, 101, 242, 0.35);
                font-family: var(--font-header, sans-serif); font-size: 13px; font-weight: 700;
                transform: translateY(100px); opacity: 0; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                pointer-events: auto;
            `,document.body.appendChild(t)),t.innerHTML=`
            <div style="width: 34px; height: 34px; border-radius: 50%; background: rgba(88, 101, 242, 0.2); border: 1px solid #5865F2; display: flex; align-items: center; justify-content: center; color: #5865F2; font-size: 16px; flex-shrink: 0;">
                <i class="fa-brands fa-discord"></i>
            </div>
            <div>
                <div style="color: #fff; font-size: 12px; font-weight: 800; letter-spacing: 0.5px;">ACESSO RESTRITO A MEMBROS</div>
                <div style="color: #94a3b8; font-size: 11px; font-weight: 500; margin-top: 2px;">${e||`Faça login com o Discord para acessar os sistemas.`}</div>
            </div>
        `,t.style.transform=`translateY(0)`,t.style.opacity=`1`,clearTimeout(t._timeout),t._timeout=setTimeout(()=>{t.style.transform=`translateY(100px)`,t.style.opacity=`0`},4e3)}window.showAccessRestrictedToast=N,document.addEventListener(`click`,e=>{let t=e.target.closest(`a`)||e.target.closest(`button.system-access-btn`)||e.target.closest(`.hub-city-card`)||e.target.closest(`.hub-card`);if(!t)return;let n=(t.getAttribute(`href`)||t.dataset.link||``).toLowerCase(),r=t.classList.contains(`hub-card`)||!!t.closest(`.hub-card`)||!!t.closest(`#custom-cities-grid a`)||!!t.closest(`#cidades-section a`),i=n.includes(`/cidades`)||n.includes(`cidades/`)||n.includes(`/cidade.html`)||n.includes(`cidade.html`)||n.includes(`/cidade/`)||n===`valley/`||n===`cda/`||n===`los-santos/`,a=t.classList.contains(`hub-city-card`)||t.classList.contains(`system-access-btn`)||t.classList.contains(`hub-city-card-btn`),o=n.includes(`/sistemas`)||n.includes(`/mapa`)||n.includes(`/lockpick`)||n.includes(`/caixinha`)||n.includes(`/hacking`)||n.includes(`mapa-interativo`);(r||i||a||o)&&!M()&&(e.preventDefault(),e.stopPropagation(),N(`Faça login com o Discord para acessar as cidades e sistemas.`),window.openDiscordModal())},!0);function P(){let e=window.location.pathname.toLowerCase();if(e.includes(`/cidades`)||e.includes(`/cidade`)||e.includes(`/sistemas`)||e.includes(`/lockpick`)||e.includes(`/caixinha`)||e.includes(`/hacking`)||e.includes(`/mapa`)||e.includes(`/mapa-interativo`)){if(M()){let e=document.getElementById(`system-auth-guard-overlay`);e&&e.remove()}else{let t=document.getElementById(`system-auth-guard-overlay`);if(!t){t=document.createElement(`div`),t.id=`system-auth-guard-overlay`,t.style.cssText=`
                    position: fixed; inset: 0; background: rgba(3, 7, 18, 0.96); backdrop-filter: blur(16px);
                    z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 20px;
                `;let n=e.includes(`/cidades`)||e.includes(`/cidade`);t.innerHTML=`
                    <div style="background: linear-gradient(135deg, #090e17 0%, #000000 100%); border: 1px solid rgba(88,101,242,0.4); border-radius: 20px; padding: 36px; max-width: 440px; width: 100%; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.95);">
                        <div style="width: 68px; height: 68px; border-radius: 50%; background: rgba(88,101,242,0.15); border: 2px solid #5865F2; display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; color: #5865F2; font-size: 32px; box-shadow: 0 0 25px rgba(88,101,242,0.3);">
                            <i class="fa-brands fa-discord"></i>
                        </div>
                        <span style="display: inline-block; padding: 4px 12px; border-radius: 20px; background: rgba(88,101,242,0.15); border: 1px solid rgba(88,101,242,0.3); color: #818cf8; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
                            ${n?`CIDADE RESTRITA`:`SISTEMA RESTRITO`} • MALACA GTARP
                        </span>
                        <h3 style="font-family: var(--font-header, sans-serif); font-size: 1.25rem; font-weight: 900; color: #fff; margin-bottom: 10px; letter-spacing: 0.5px;">
                            AUTENTICAÇÃO NECESSÁRIA
                        </h3>
                        <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.6; margin-bottom: 24px;">
                            ${n?`O acesso às páginas das cidades e aos seus recursos é exclusivo para membros logados via Discord.`:`Para utilizar este sistema/simulador e acompanhar seus dados em tempo real, faça login com sua conta do Discord.`}
                        </p>
                        <button onclick="loginWithDiscordGlobal()" style="width: 100%; padding: 14px; border-radius: 12px; background: #5865F2; color: #fff; font-size: 0.85rem; font-weight: 800; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 8px 25px rgba(88,101,242,0.4); transition: all 0.2s ease;">
                            <i class="fa-brands fa-discord" style="font-size: 1.2rem;"></i> ENTRAR COM O DISCORD
                        </button>
                        <a href="/" style="display: inline-flex; align-items: center; gap: 6px; margin-top: 18px; font-size: 0.8rem; color: #64748b; text-decoration: none; font-weight: 700; transition: color 0.2s;">
                            <i class="fa-solid fa-arrow-left"></i> Voltar para a Página Inicial
                        </a>
                    </div>
                `,document.body.appendChild(t)}}}}window.checkSystemAuthProtection=P,window.checkGlobalAuthProtection=P;async function F(){try{let{data:e}=await t.from(`platform_settings`).select(`*`).eq(`id`,`default`).maybeSingle(),n=document.getElementById(`global-live-announcement-bar`);e&&e.announcement_active&&e.global_announcement?(n||(n=document.createElement(`div`),n.id=`global-live-announcement-bar`,n.style.cssText=`
                        position: fixed; top: 0; left: 0; right: 0; background: linear-gradient(90deg, #f59e0b, #d97706);
                        color: #000; font-weight: 900; font-size: 0.78rem; padding: 8px 16px; text-align: center;
                        z-index: 99998; box-shadow: 0 4px 15px rgba(245,158,11,0.3); display: flex; align-items: center; justify-content: center; gap: 8px;
                    `,document.body.prepend(n)),n.innerHTML=`<i class="fa-solid fa-bullhorn"></i> <span>${e.global_announcement}</span>`):n&&n.remove()}catch{}}function I(){try{let e=new URLSearchParams(window.location.search),t=new URLSearchParams;window.location.hash&&window.location.hash.includes(`=`)&&(t=new URLSearchParams(window.location.hash.replace(/^#/,``)));let n=e.get(`error`)||t.get(`error`),r=e.get(`error_description`)||t.get(`error_description`);(n||r)&&(console.warn(`OAuth Redirect Error detected:`,n,r),window.history.replaceState({},document.title,window.location.pathname),L(n,r))}catch(e){console.error(`Error checking OAuth error params:`,e)}}function L(e,t){let n=decodeURIComponent(t||e||`Erro de autenticação`),r=n.includes(`is_banned`)||n.includes(`42703`),i=document.getElementById(`oauth-error-modal-overlay`);i&&i.remove();let a=document.createElement(`div`);a.id=`oauth-error-modal-overlay`,a.style.cssText=`
            position: fixed; inset: 0; background: rgba(3, 7, 18, 0.88); backdrop-filter: blur(12px);
            z-index: 100000; display: flex; align-items: center; justify-content: center; padding: 20px;
        `,a.innerHTML=`
            <div style="background: #090e1a; border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 20px; max-width: 540px; width: 100%; padding: 28px; box-shadow: 0 20px 60px rgba(0,0,0,0.9), 0 0 30px rgba(239,68,68,0.2); position: relative; font-family: var(--font-body, sans-serif); color: #fff;">
                <button onclick="document.getElementById('oauth-error-modal-overlay').remove()" style="position: absolute; top: 16px; right: 16px; background: rgba(255,255,255,0.06); border: none; color: #94a3b8; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px;">
                    <i class="fa-solid fa-xmark"></i>
                </button>

                <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 18px;">
                    <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.4); display: flex; align-items: center; justify-content: center; color: #ef4444; font-size: 22px; flex-shrink: 0;">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                    </div>
                    <div>
                        <span style="font-size: 10px; font-weight: 800; color: #f87171; letter-spacing: 1px; text-transform: uppercase;">AVISO DE AUTENTICAÇÃO DISCORD</span>
                        <h3 style="font-size: 1.15rem; font-weight: 800; color: #fff; margin: 2px 0 0 0;">Erro no Trigger do Supabase</h3>
                    </div>
                </div>

                <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 12px; padding: 14px; margin-bottom: 20px;">
                    <p style="font-size: 12px; color: #cbd5e1; line-height: 1.6; margin: 0 0 8px 0;">
                        ${r?`O login do Discord falhou porque o trigger do banco de dados (Supabase) tentou gravar a coluna <code>is_banned</code> que ainda não foi criada na tabela <code>public.profiles</code>.`:`O provedor de autenticação retornou: <br><code style="color: #f87171; font-size: 11px;">${n}</code>`}
                    </p>
                    <div style="font-size: 11px; color: #38bdf8; font-weight: 600;">
                        <i class="fa-solid fa-circle-check" style="color: #22c55e;"></i> Não se preocupe: você pode acessar imediatamente via <strong>Login Direto</strong> (por Nickname ou ID) sem travar seu uso!
                    </div>
                </div>

                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <button id="btn-open-supabase-sql" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #10b981, #059669); border: none; border-radius: 12px; color: #fff; font-size: 11px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 15px rgba(16,185,129,0.3);">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i> ABRIR SUPABASE SQL EDITOR (COPIAR & EXECUTAR)
                    </button>

                    <button id="btn-oauth-direct-login" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #00d2ff, #2563eb); border: none; border-radius: 12px; color: #fff; font-size: 11px; font-weight: 800; letter-spacing: 0.5px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 8px 20px rgba(0,210,255,0.3);">
                        <i class="fa-solid fa-arrow-right-to-bracket"></i> CONECTAR VIA ACESSO RÁPIDO / NICKNAME
                    </button>

                    <button id="btn-copy-sql-fix" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(0,210,255,0.3); border-radius: 12px; color: #38bdf8; font-size: 11px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <i class="fa-solid fa-copy"></i> COPIAR SQL DE CORREÇÃO (PARA O SUPABASE)
                    </button>
                </div>
            </div>
        `,document.body.appendChild(a);let o=`-- 1. ADICIONA A COLUNA is_banned CASO NÃO EXISTA
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;

-- 2. RECRIAR O TRIGGER BLINDADO COM EXCEPTION HANDLER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (
        id, discord_id, username, full_name, avatar_url, email, is_admin, role, is_banned, created_at, last_login_at
    )
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'provider_id', new.raw_user_meta_data->>'sub', new.id::text),
        COALESCE(new.raw_user_meta_data->>'preferred_username', new.raw_user_meta_data->>'user_name', new.raw_user_meta_data->>'name', 'Discord User'),
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'global_name', new.raw_user_meta_data->>'name', 'Discord User'),
        COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', 'https://cdn.discordapp.com/embed/avatars/0.png'),
        new.email,
        (COALESCE(new.raw_user_meta_data->>'provider_id', new.raw_user_meta_data->>'sub', new.id::text) = '722320491767136346'),
        CASE WHEN (COALESCE(new.raw_user_meta_data->>'provider_id', new.raw_user_meta_data->>'sub', new.id::text) = '722320491767136346') THEN 'admin' ELSE 'user' END,
        false,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        last_login_at = NOW(),
        avatar_url = EXCLUDED.avatar_url,
        username = EXCLUDED.username;
    RETURN new;
EXCEPTION WHEN others THEN
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`;document.getElementById(`btn-open-supabase-sql`)?.addEventListener(`click`,()=>{navigator.clipboard.writeText(o).then(()=>{window.open(`https://supabase.com/dashboard/project/pdzytmdssswiyjwohvwn/sql/new`,`_blank`),alert(`Comando SQL copiado para a área de transferência! Cole (Ctrl+V) no Supabase SQL Editor aberto na nova aba e clique em RUN.`)}).catch(()=>{window.open(`https://supabase.com/dashboard/project/pdzytmdssswiyjwohvwn/sql/new`,`_blank`)})}),document.getElementById(`btn-oauth-direct-login`)?.addEventListener(`click`,()=>{a.remove(),typeof window.openDiscordModalGlobal==`function`&&window.openDiscordModalGlobal()}),document.getElementById(`btn-copy-sql-fix`)?.addEventListener(`click`,()=>{navigator.clipboard.writeText(o).then(()=>{alert(`Comando SQL copiado com sucesso! Execute no SQL Editor do Supabase para corrigir definitivamente o login Discord OAuth.`)}).catch(()=>{prompt(`Copie o comando SQL abaixo para rodar no Supabase:`,o)})})}document.addEventListener(`DOMContentLoaded`,()=>{I();let e=new URLSearchParams(window.location.search);if(e.get(`admin`)===`true`||e.get(`admin`)===`1`){if(r)window.openGlobalAdminModal();else{let e=new URL(window.location.href);e.searchParams.delete(`admin`),window.history.replaceState({},``,e.pathname+(e.search?e.search:``))}}P(),F(),s(r)}),I(),P(),F(),s(r)})();