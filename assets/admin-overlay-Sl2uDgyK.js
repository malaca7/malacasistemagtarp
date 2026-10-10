import{t as e}from"./dist-C4Qc8-Kv.js";var t=e(`https://pdzytmdssswiyjwohvwn.supabase.co`,`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkenl0bWRzc3N3aXlqd29odnduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1ODI0NjQsImV4cCI6MjEwNzE1ODQ2NH0.RxTwiHG5JRHK02u1eBx3cFXI_3fKYMrxuI2op846FME`,{auth:{persistSession:!0,autoRefreshToken:!0,detectSessionInUrl:!0}}),n=t.channel(`malaca_realtime_global_hub`);(function(){document.body.insertAdjacentHTML(`beforeend`,`
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
    `),window.openDiscordModal=function(){document.getElementById(`global-discord-modal`).classList.add(`active`),e()},window.closeDiscordModal=function(){document.getElementById(`global-discord-modal`).classList.remove(`active`)},window.openGlobalAdminModal=function(){let e=document.getElementById(`global-admin-modal`);e&&(e.classList.add(`active`),g())},window.closeGlobalAdminModal=function(){let e=document.getElementById(`global-admin-modal`);e&&e.classList.remove(`active`)},window.loginWithDiscordGlobal=async function(){let e=document.querySelector(`#discord-modal-body button`),n=e?e.innerHTML:``;e&&(e.disabled=!0,e.innerHTML=`<i class="fa-solid fa-spinner fa-spin"></i> Conectando ao Discord...`);try{let e=window.location.origin+window.location.pathname,{error:n}=await t.auth.signInWithOAuth({provider:`discord`,options:{redirectTo:e,scopes:`identify email`}});if(n)throw n}catch(t){console.error(`Supabase Discord OAuth error:`,t),e&&(e.disabled=!1,e.innerHTML=n||`<i class="fa-brands fa-discord" style="font-size: 18px;"></i> ENTRAR COM O DISCORD`),alert(`Falha ao autenticar com o Discord: `+(t.message||`Verifique a conexão e tente novamente.`))}},window.logoutDiscordGlobal=async function(){try{await t.auth.signOut()}catch(e){console.warn(`SignOut exception:`,e)}localStorage.removeItem(`malaca_user_profile`),e(),r(),typeof T==`function`&&T()};function e(){let e=document.getElementById(`discord-modal-body`),t=document.getElementById(`discord-modal-title`),n=document.getElementById(`discord-modal-subtitle`);if(!e)return;let r=localStorage.getItem(`malaca_user_profile`),i=r?JSON.parse(r):null,a=i?i.is_admin===!0||i.role===`admin`||typeof h==`function`&&h(i):!1;i?(t.textContent=`Dashboard do Usuário`,n.textContent=`Perfil e Registro de Acesso`,e.innerHTML=`
                <div style="display: flex; align-items: center; gap: 16px; padding: 16px; background: linear-gradient(135deg, #18181b 0%, #000000 100%); border-radius: 14px; border: 1px solid rgba(0,210,255,0.3); margin-bottom: 16px;">
                    <img src="${i.avatar_url}" style="width: 56px; height: 56px; border-radius: 50%; border: 2px solid ${a?`#f59e0b`:`#38bdf8`}; object-fit: cover;" />
                    <div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <h4 style="font-size: 16px; font-weight: 900; color: #fff;">${i.full_name||i.username}</h4>
                            <span style="font-size: 9px; font-weight: 800; background: ${a?`rgba(245,158,11,0.2)`:`rgba(88,101,242,0.2)`}; color: ${a?`#fde68a`:`#5865F2`}; padding: 2px 6px; border-radius: 4px; border: 1px solid ${a?`rgba(245,158,11,0.4)`:`rgba(88,101,242,0.4)`};">${a?`ADMIN`:`VERIFICADO`}</span>
                        </div>
                        <span style="font-size: 12px; color: #38bdf8; font-weight: 700;">@${i.username}</span>
                        <div style="font-size: 10px; color: #94a3b8; margin-top: 2px; font-family: monospace;">ID: ${i.discord_id}</div>
                    </div>
                </div>

                ${a?`
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
                `:``}

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px;">
                    <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);">
                        <span style="font-size: 10px; color: #94a3b8; display: block; font-weight: 700;">DATA DE CADASTRO</span>
                        <span style="font-size: 12px; font-weight: 800; color: #fff; font-family: monospace;">${new Date(i.created_at).toLocaleDateString(`pt-BR`)}</span>
                    </div>
                    <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);">
                        <span style="font-size: 10px; color: #94a3b8; display: block; font-weight: 700;">ÚLTIMO LOGIN</span>
                        <span style="font-size: 12px; font-weight: 800; color: #38bdf8; font-family: monospace;">${new Date(i.last_login_at).toLocaleTimeString(`pt-BR`,{hour:`2-digit`,minute:`2-digit`})}</span>
                    </div>
                </div>

                <div style="padding: 12px; background: rgba(0,0,0,0.6); border: 1px solid rgba(0,210,255,0.2); border-radius: 10px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <span style="font-size: 11px; font-weight: 700; color: #cbd5e1;"><i class="fa-solid fa-shield-halved" style="color: #22c55e;"></i> Status da Conta</span>
                    <span style="font-size: 11px; font-weight: 900; color: #38bdf8; background: rgba(0,210,255,0.2); padding: 3px 10px; border-radius: 6px; border: 1px solid rgba(0,210,255,0.3);">${a?`ADMINISTRADOR`:`VERIFICADO RP`}</span>
                </div>

                <button onclick="logoutDiscordGlobal()" style="width: 100%; padding: 12px; border-radius: 10px; background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.4); color: #fca5a5; font-size: 12px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <i class="fa-solid fa-right-from-bracket"></i> SAIR DA CONTA (LOGOUT)
                </button>
            `):(t.textContent=`Autenticação Discord`,n.textContent=`Login Exclusivo via OAuth2`,e.innerHTML=`
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
            `)}function r(){let e=localStorage.getItem(`malaca_user_profile`),t=e?JSON.parse(e):null;document.querySelectorAll(`.hub-discord-btn`).forEach(e=>{t?(e.innerHTML=`<img src="${t.avatar_url}" style="width: 20px; height: 20px; border-radius: 50%; border: 1px solid #38bdf8;" /> <span style="font-family: monospace;">${t.username}</span>`,e.style.background=`#18181b`,e.style.borderColor=`rgba(0,210,255,0.5)`):(e.innerHTML=`<i class="fa-brands fa-discord"></i> <span>ENTRAR</span>`,e.style.background=`#5865F2`,e.style.borderColor=`#5865F2`)})}async function i(){try{let{data:{session:e},error:n}=await t.auth.getSession();if(n&&console.warn(`Supabase getSession warning:`,n),e&&e.user){let n=e.user,r=n.user_metadata||{},i=r.provider_id||r.sub||n.id,a=r.preferred_username||r.user_name||r.name||r.full_name||`Discord User`,o=r.full_name||r.global_name||r.name||a,s=r.avatar_url||r.picture||`https://cdn.discordapp.com/embed/avatars/0.png`,c=new Date().toISOString(),l=n.email||r.email||``,u=typeof h==`function`&&h(n),d={id:n.id,discord_id:String(i),username:String(a),full_name:String(o),avatar_url:String(s),email:l||void 0,is_admin:u,role:u?`admin`:`user`,last_login_at:c},f={...d,created_at:n.created_at||c};localStorage.setItem(`malaca_user_profile`,JSON.stringify(f)),t.from(`profiles`).upsert([d],{onConflict:`id`}).then(()=>{}).catch(e=>{console.warn(`Supabase profiles sync warning:`,e)}),typeof window<`u`&&(window.location.hash.includes(`access_token=`)||window.location.search.includes(`code=`))&&window.history.replaceState(null,``,window.location.pathname)}else{let e=localStorage.getItem(`malaca_user_profile`);if(e)try{let t=JSON.parse(e);t.id&&String(t.id).startsWith(`mock-`)&&localStorage.removeItem(`malaca_user_profile`)}catch{}}}catch(e){console.warn(`Supabase Session Sync Exception:`,e)}r()}t.auth.onAuthStateChange(async(t,n)=>{t===`SIGNED_IN`||t===`TOKEN_REFRESHED`||t===`INITIAL_SESSION`||t===`USER_UPDATED`?(await i(),e(),typeof T==`function`&&T()):t===`SIGNED_OUT`&&(localStorage.removeItem(`malaca_user_profile`),r(),e(),typeof T==`function`&&T())}),n.on(`broadcast`,{event:`servers_updated`},e=>{if(e?.payload?.servers&&Array.isArray(e.payload.servers)){localStorage.setItem(`malaca_custom_servers`,JSON.stringify(e.payload.servers)),typeof window.loadCustomCities==`function`&&window.loadCustomCities(),g();let t=window.location.pathname.split(`/`),n=t[2]||t[1];n&&typeof window.loadCitySystems==`function`&&window.loadCitySystems(n)}}).on(`broadcast`,{event:`systems_updated`},e=>{if(e?.payload?.systems&&Array.isArray(e.payload.systems)){localStorage.setItem(`malaca_custom_systems`,JSON.stringify(e.payload.systems)),g();let t=window.location.pathname.split(`/`),n=t[2]||t[1];n&&typeof window.loadCitySystems==`function`&&window.loadCitySystems(n)}}).on(`broadcast`,{event:`entity_sync`},async e=>{let t=e?.payload?.entity;if(t===`servers`)await a(),g(),typeof window.loadCustomCities==`function`&&window.loadCustomCities();else if(t===`systems`){await a(),g();let e=window.location.pathname.split(`/`),t=e[2]||e[1];t&&typeof window.loadCitySystems==`function`&&window.loadCitySystems(t)}else t===`settings`&&E()}).on(`postgres_changes`,{event:`*`,schema:`public`,table:`servers`},async()=>{await a(),g(),typeof window.loadCustomCities==`function`&&window.loadCustomCities()}).on(`postgres_changes`,{event:`*`,schema:`public`,table:`systems`},async()=>{await a(),g();let e=window.location.pathname.split(`/`),t=e[2]||e[1];t&&typeof window.loadCitySystems==`function`&&window.loadCitySystems(t)}).on(`postgres_changes`,{event:`*`,schema:`public`,table:`platform_settings`},()=>{E()}).on(`broadcast`,{event:`settings_updated`},()=>{E()}).on(`broadcast`,{event:`wanderer_cycle_reset`},()=>{localStorage.removeItem(`cidade_alta_user_confirmations`),localStorage.removeItem(`malaca_wanderer_cycle_state`)}).subscribe();async function a(){try{let{data:e}=await t.from(`servers`).select(`*`).order(`created_at`,{ascending:!0});e&&e.length>0&&(localStorage.setItem(`malaca_custom_servers`,JSON.stringify(e)),typeof window.loadCustomCities==`function`&&window.loadCustomCities())}catch{}try{let{data:e}=await t.from(`systems`).select(`*`).order(`created_at`,{ascending:!0});e&&e.length>0&&localStorage.setItem(`malaca_custom_systems`,JSON.stringify(e))}catch{}}document.addEventListener(`DOMContentLoaded`,()=>{i(),a()}),i(),a(),window.openAppearanceModal=function(){document.getElementById(`global-appearance-modal`).classList.add(`active`),o()},window.closeAppearanceModal=function(){document.getElementById(`global-appearance-modal`).classList.remove(`active`)},window.setGlobalTheme=function(e){document.documentElement.setAttribute(`data-theme`,e),localStorage.setItem(`malaca_theme`,e),o()},window.updateGlobalBrightness=function(e){let t=Number(e);document.documentElement.style.filter=`brightness(${t}%)`,localStorage.setItem(`malaca_brightness`,String(t));let n=document.getElementById(`g-brightness-val`);n&&(n.textContent=`${t}%`);let r=document.getElementById(`g-brightness-slider`);r&&(r.value=t)},window.setGlobalLang=function(e){localStorage.setItem(`malaca_lang`,e),o()};function o(){let e=localStorage.getItem(`malaca_theme`)||`escuro`,t=localStorage.getItem(`malaca_brightness`)||`100`,n=localStorage.getItem(`malaca_lang`)||`pt`;document.documentElement.setAttribute(`data-theme`,e),document.documentElement.style.filter=`brightness(${t}%)`,[`escuro`,`oled`,`dracula`,`cinza_escuro`,`cinza_claro`,`claro`].forEach(t=>{let n=document.getElementById(`gtheme-${t}`);n&&(t===e?(n.style.background=`linear-gradient(135deg, #00d2ff 0%, #2563eb 100%)`,n.style.color=`#fff`,n.style.borderColor=`#38bdf8`):(n.style.background=`rgba(255,255,255,0.05)`,n.style.color=`#94a3b8`,n.style.borderColor=`rgba(0,210,255,0.2)`))});let r=document.getElementById(`g-brightness-val`);r&&(r.textContent=`${t}%`);let i=document.getElementById(`g-brightness-slider`);i&&(i.value=t),[`pt`,`en`].forEach(e=>{let t=document.getElementById(`glang-${e}`);t&&(e===n?(t.style.background=`linear-gradient(135deg, #00d2ff 0%, #2563eb 100%)`,t.style.color=`#fff`,t.style.borderColor=`#38bdf8`):(t.style.background=`rgba(255,255,255,0.05)`,t.style.color=`#94a3b8`,t.style.borderColor=`rgba(0,210,255,0.2)`))})}document.addEventListener(`DOMContentLoaded`,o),o();let s=!1,c=`cities`,l=null,u=null,d=[{id:`sys-mapa`,name:`MAPA INTERATIVO RP`,slug:`mapa-interativo`,tag:`CDA & VALLEY REALTIME`,link:`/cidades/cda/mapa/`,icon:`fa-compass`,is_active:!0},{id:`sys-lockpick`,name:`LOCKPICK SIMULATOR`,slug:`lockpick`,tag:`FIVEM LOCKPICK KIT`,link:`/cidades/cda/lockpick/`,icon:`fa-key`,is_active:!0},{id:`sys-caixinha`,name:`CAIXINHA ELETRÔNICO`,slug:`caixinha`,tag:`SAFE & ATM HACK`,link:`/cidades/cda/caixinha/`,icon:`fa-vault`,icon:`fa-vault`,is_active:!0},{id:`sys-hacking`,name:`HACKING DEVICE`,slug:`hacking`,tag:`CYBER HACK TERMINAL`,link:`/cidades/cda/hacking/`,icon:`fa-microchip`,is_active:!0}],f=[{id:`cda-server-uuid`,slug:`cda`,name:`Cidade Alta RP`,subtitle:`SERVIDORES CDA & VALLEY`},{id:`valley-server-uuid`,slug:`valley`,name:`Valley RP`,subtitle:`VALLEY ROLEPLAY HUB`},{id:`los-santos-server-uuid`,slug:`los-santos`,name:`Los Santos Central`,subtitle:`TREINAMENTO HEISTS & MINIJOGOS`}];window.loadCitySystems=function(e){let t=document.getElementById(`city-systems-grid`);if(!t)return;let n=localStorage.getItem(`malaca_custom_servers`),r=e;if(n)try{let t=JSON.parse(n).find(t=>t.slug.toLowerCase()===e.toLowerCase());t&&(r=t.id)}catch{}let i=[{id:`sys-mapa`,title:`MAPA INTERATIVO RP`,tag:`REALTIME MAP`,desc:`Mapa interativo em tempo real com virada do Andarilho e pontos de interesse.`,link:`/cidades/${e}/mapa/`,icon:`fa-compass`,img:`/images/gta_map_bg.webp`,city_ids:[`cda-server-uuid`,`valley-server-uuid`,`cda`,`valley`]},{id:`sys-lockpick`,title:`LOCKPICK SIMULATOR`,tag:`LOCKPICK KIT`,desc:`Simulador oficial de arrombamento com travamento de pinos.`,link:`/cidades/${e}/lockpick/`,icon:`fa-key`,img:`/images/lockpick.jpg`,city_ids:[`cda-server-uuid`,`los-santos-server-uuid`,`cda`,`los-santos`]},{id:`sys-caixinha`,title:`CAIXINHA ELETRÔNICO`,tag:`ATM HACK`,desc:`Decodificador rápido de cofres e caixas eletrônicos.`,link:`/cidades/${e}/caixinha/`,icon:`fa-vault`,img:`/images/caixinha.jpg`,city_ids:[`cda-server-uuid`,`los-santos-server-uuid`,`cda`,`los-santos`]},{id:`sys-hacking`,title:`HACKING DEVICE`,tag:`CYBER TERMINAL`,desc:`Terminal de hacking estilo Cayo Perico com matrizes de caracteres.`,link:`/cidades/${e}/hacking/`,icon:`fa-microchip`,img:`/images/hacking.jpg`,city_ids:[`cda-server-uuid`,`los-santos-server-uuid`,`cda`,`los-santos`]}],a=localStorage.getItem(`malaca_custom_systems`),o=i;if(a)try{let t=JSON.parse(a);Array.isArray(t)&&t.length>0&&(o=t.map(t=>({id:t.id||`sys-${t.slug}`,title:t.name,tag:t.tag||`SISTEMA RP`,desc:t.description||``,link:`/cidades/${e}/${t.slug||`mapa`}/`,icon:t.icon||`fa-microchip`,img:t.image_url||`/images/gta_map_bg.webp`,city_ids:t.city_ids||[]})))}catch{}let s=o.filter(t=>t.city_ids&&t.city_ids.length>0&&(t.city_ids.includes(r)||t.city_ids.includes(e)||t.city_ids.includes(`${e}-server-uuid`))),c=document.getElementById(`systems-count-tag`);if(c&&(c.textContent=`${s.length} SISTEMAS ATIVOS`),t.innerHTML=``,s.length===0){t.innerHTML=`<p style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 40px; font-weight: 700;">Nenhum sistema vinculado a esta cidade no momento.</p>`;return}s.forEach(e=>{let n=document.createElement(`a`);n.href=e.link,n.className=`hub-city-card`,n.innerHTML=`
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
            `,t.appendChild(n)})},window.openGlobalAdminModal=function(){let e=document.getElementById(`global-admin-modal`);e&&(e.classList.add(`active`),g())},window.closeGlobalAdminModal=function(){let e=document.getElementById(`global-admin-modal`);e&&e.classList.remove(`active`)};function p(){let e=JSON.parse(localStorage.getItem(`malaca_custom_servers`)||`[]`);return e.length>0?e:f}function m(){let e=JSON.parse(localStorage.getItem(`malaca_custom_systems`)||`[]`);return e.length>0?e:d}function h(e){if(!e)return!1;let t=String(e.discord_id||e.id||e.user_metadata&&(e.user_metadata.provider_id||e.user_metadata.sub)||``).trim();if(t&&[`722320491767136346`,`917826984778797087`].includes(t))return!0;try{let e=JSON.parse(localStorage.getItem(`malaca_admin_discord_accounts`)||`[]`);if(t&&e.includes(t))return!0}catch{}return!1}window.loginAdminWithDiscord=function(){let e=window.location.origin+window.location.pathname;t.auth.signInWithOAuth({provider:`discord`,options:{redirectTo:e,scopes:`identify email`}})},t.auth.getSession().then(({data:{session:e}})=>{e&&e.user&&h(e.user)&&(s=!0)}),t.auth.onAuthStateChange((e,t)=>{if(t&&t.user&&h(t.user)){s=!0;let e=document.getElementById(`global-admin-modal`);e&&e.classList.contains(`active`)&&g()}});function g(){let e=document.getElementById(`global-admin-content`);if(!s)e.innerHTML=`
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
            `;else{let t=p();e.innerHTML=`
                <div class="global-admin-nav">
                    <button class="global-admin-nav-btn ${c===`dashboard`?`active`:``}" onclick="switchAdminTab('dashboard')"><i class="fa-solid fa-chart-pie"></i> Dashboard</button>
                    <button class="global-admin-nav-btn ${c===`users`?`active`:``}" onclick="switchAdminTab('users')"><i class="fa-solid fa-users"></i> Usuários</button>
                    <button class="global-admin-nav-btn ${c===`andarilho`?`active`:``}" onclick="switchAdminTab('andarilho')"><i class="fa-solid fa-person-walking"></i> Andarilho</button>
                    <button class="global-admin-nav-btn ${c===`cities`?`active`:``}" onclick="switchAdminTab('cities')"><i class="fa-solid fa-city"></i> Cidades (${t.length})</button>
                    <button class="global-admin-nav-btn ${c===`systems`?`active`:``}" onclick="switchAdminTab('systems')"><i class="fa-solid fa-layer-group"></i> Sistemas (${allSystems.length})</button>
                    <button class="global-admin-nav-btn ${c===`settings`?`active`:``}" onclick="switchAdminTab('settings')"><i class="fa-solid fa-gear"></i> Opções Globais</button>
                    <button class="global-admin-nav-btn" onclick="logoutAdmin()" style="margin-left: auto; color: #ff5252;"><i class="fa-solid fa-right-from-bracket"></i> Sair</button>
                </div>
                <div class="global-admin-body" id="admin-tab-body">
                    ${_(c,t,allSystems)}
                </div>
            `,c===`dashboard`?loadAdminDashboardView():c===`users`?loadAdminUsersView():c===`andarilho`?loadAdminWandererListView():c===`settings`&&loadAdminSettingsView()}}window.switchAdminTab=function(e){c=e,g()},window.handleAdminLogin=function(e){e.preventDefault();let t=document.getElementById(`admin-user-input`).value.trim(),n=document.getElementById(`admin-pass-input`).value.trim();t===`malaca`&&n===`199425`||t===`admin`&&(n===`cidadealta123`||n===`admin`)?(s=!0,g()):document.getElementById(`admin-auth-err`).style.display=`block`},window.logoutAdmin=function(){s=!1,g()};function _(e,t,n){if(e===`dashboard`)return`
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
            `;if(e===`cities`){let e=l?t.find(e=>e.id===l):null;return`
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
            `}else if(e===`systems`){let e=u?n.find(e=>e.id===u):null;return`
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
            `}else if(e===`settings`)return`
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
            `;return``}window.startEditCity=function(e){l=e,g()},window.cancelEditCity=function(){l=null,g()},window.handleSaveCity=async function(e){e.preventDefault();let r=document.getElementById(`city-form-name`).value.trim(),i=document.getElementById(`city-form-slug`).value.trim(),a=document.getElementById(`city-form-sub`).value.trim(),o=document.getElementById(`city-form-banner`).value.trim(),s=p(),c=null;l?(s=s.map(e=>e.id===l?(c={...e,name:r,slug:i,subtitle:a,banner_image_url:o},c):e),l=null):(c={id:`city-`+Date.now(),name:r,slug:i,subtitle:a,banner_image_url:o,description:`Cidade cadastrada via Admin.`,active:!0},s.push(c)),localStorage.setItem(`malaca_custom_servers`,JSON.stringify(s));try{await t.from(`servers`).upsert([c],{onConflict:`id`})}catch{}n.send({type:`broadcast`,event:`servers_updated`,payload:{servers:s,targetCity:c}}),n.send({type:`broadcast`,event:`entity_sync`,payload:{entity:`servers`,action:`UPDATE`,data:c,timestamp:Date.now()}}),alert(`Cidade salva no banco de dados e sincronizada em tempo real com todos os usuários!`),g(),window.loadCustomCities&&window.loadCustomCities()},window.moveCityUp=function(e){if(e<=0)return;let t=p(),r=t[e-1];t[e-1]=t[e],t[e]=r,localStorage.setItem(`malaca_custom_servers`,JSON.stringify(t)),n.send({type:`broadcast`,event:`servers_updated`,payload:{servers:t}}),g(),window.loadCustomCities&&window.loadCustomCities()},window.moveCityDown=function(e){let t=p();if(e>=t.length-1)return;let r=t[e+1];t[e+1]=t[e],t[e]=r,localStorage.setItem(`malaca_custom_servers`,JSON.stringify(t)),n.send({type:`broadcast`,event:`servers_updated`,payload:{servers:t}}),g(),window.loadCustomCities&&window.loadCustomCities()},window.deleteCity=async function(e,r){if(confirm(`Tem certeza que deseja excluir a cidade "${r}"?`)){let r=p();r=r.filter(t=>t.id!==e),localStorage.setItem(`malaca_custom_servers`,JSON.stringify(r));try{await t.from(`servers`).delete().eq(`id`,e)}catch{}n.send({type:`broadcast`,event:`servers_updated`,payload:{servers:r,deletedId:e}}),n.send({type:`broadcast`,event:`entity_sync`,payload:{entity:`servers`,action:`DELETE`,id:e,timestamp:Date.now()}}),g(),window.loadCustomCities&&window.loadCustomCities()}},window.startEditSystem=function(e){u=e,g()},window.cancelEditSystem=function(){u=null,g()},window.handleSaveSystem=async function(e){e.preventDefault();let r=document.getElementById(`sys-form-name`).value.trim(),i=document.getElementById(`sys-form-slug`).value.trim(),a=document.getElementById(`sys-form-tag`).value.trim(),o=document.getElementById(`sys-form-link`).value.trim(),s=Array.from(document.querySelectorAll(`input[name="city-link-check"]:checked`)).map(e=>e.value),c=m(),l=null;u?(c=c.map(e=>e.id===u?(l={...e,name:r,slug:i,tag:a,link:o,city_ids:s},l):e),u=null):(l={id:`sys-`+Date.now(),name:r,slug:i,tag:a,link:o||`${i}/`,city_ids:s,is_active:!0,description:`Sistema cadastrado via Admin.`,icon:`fa-microchip`},c.push(l)),localStorage.setItem(`malaca_custom_systems`,JSON.stringify(c));try{await t.from(`systems`).upsert([l],{onConflict:`id`})}catch{}n.send({type:`broadcast`,event:`systems_updated`,payload:{systems:c,targetSys:l}}),n.send({type:`broadcast`,event:`entity_sync`,payload:{entity:`systems`,action:`UPDATE`,data:l,timestamp:Date.now()}}),alert(`Sistema salvo no banco de dados e sincronizado em tempo real!`),g()},window.moveSystemUp=function(e){if(e<=0)return;let t=m(),r=t[e-1];t[e-1]=t[e],t[e]=r,localStorage.setItem(`malaca_custom_systems`,JSON.stringify(t)),n.send({type:`broadcast`,event:`systems_updated`,payload:{systems:t}}),g()},window.moveSystemDown=function(e){let t=m();if(e>=t.length-1)return;let r=t[e+1];t[e+1]=t[e],t[e]=r,localStorage.setItem(`malaca_custom_systems`,JSON.stringify(t)),n.send({type:`broadcast`,event:`systems_updated`,payload:{systems:t}}),g()},window.deleteSystem=async function(e,r){if(confirm(`Tem certeza que deseja excluir o sistema "${r}"?`)){let r=m();r=r.filter(t=>t.id!==e),localStorage.setItem(`malaca_custom_systems`,JSON.stringify(r));try{await t.from(`systems`).delete().eq(`id`,e)}catch{}n.send({type:`broadcast`,event:`systems_updated`,payload:{systems:r,deletedId:e}}),n.send({type:`broadcast`,event:`entity_sync`,payload:{entity:`systems`,action:`DELETE`,id:e,timestamp:Date.now()}}),g()}},window.handleResetWandererCycle=async function(){if(confirm(`Zerar votos do Andarilho e sincronizar todas as telas em tempo real?`)){localStorage.removeItem(`cidade_alta_user_confirmations`),localStorage.removeItem(`malaca_wanderer_cycle_state`);try{await t.from(`wanderer_confirmations`).delete().neq(`id`,`00000000-0000-0000-0000-000000000000`)}catch{}n.send({type:`broadcast`,event:`wanderer_cycle_reset`,payload:{resetBy:`admin`,timestamp:Date.now()}}),alert(`Ciclo do Andarilho zerado com sucesso! Todas as telas conectadas foram atualizadas.`)}},window.loadAdminDashboardView=async function(){let e=document.getElementById(`dash-stat-users`),n=document.getElementById(`dash-stat-admins`);if(!e)return;let r=0,i=0;try{let{data:e}=await t.from(`profiles`).select(`id, is_admin, role`);e&&Array.isArray(e)&&(r=e.length,i=e.filter(e=>e.is_admin||e.role===`admin`).length)}catch{}if(r===0)try{let e=JSON.parse(localStorage.getItem(`malaca_cached_profiles`)||`[]`);e.length>0&&(r=e.length,i=e.filter(e=>e.is_admin||e.role===`admin`).length)}catch{}e.textContent=r>0?String(r):`1`,n&&(n.textContent=`${Math.max(1,i)} Administradores Ativos`)};let v=[];window.loadAdminUsersView=async function(){let e=document.getElementById(`admin-users-list-container`);if(e)try{let{data:e,error:n}=await t.from(`profiles`).select(`*`).order(`created_at`,{ascending:!1});n&&console.warn(`Supabase profiles fetch warning:`,n);let r=Array.isArray(e)&&e.length>0?e:[];try{let e=JSON.parse(localStorage.getItem(`malaca_cached_profiles`)||`[]`),t=JSON.parse(localStorage.getItem(`malaca_user_profile`)||`null`);t&&!r.some(e=>e.id===t.id||e.discord_id===t.discord_id)&&r.unshift(t),e.forEach(e=>{r.some(t=>t.id===e.id||t.discord_id===e.discord_id)||r.push(e)})}catch{}v=r,localStorage.setItem(`malaca_cached_profiles`,JSON.stringify(r)),y(r)}catch(t){e.innerHTML=`<div style="grid-column: 1/-1; color: #f87171; font-size: 0.75rem; text-align: center; padding: 20px;">Falha ao carregar usuários: ${t.message}</div>`}};function y(e){let t=document.getElementById(`admin-users-list-container`);if(!t)return;if(!e||e.length===0){t.innerHTML=`<div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 30px; font-size: 0.8rem;">Nenhum usuário cadastrado ainda.</div>`;return}let n=JSON.parse(localStorage.getItem(`malaca_admin_discord_accounts`)||`[]`),r=JSON.parse(localStorage.getItem(`malaca_banned_discord_accounts`)||`[]`);t.innerHTML=e.map(e=>{let t=String(e.discord_id||e.id||``),i=e.is_admin||e.role===`admin`||n.includes(t)||[`722320491767136346`,`917826984778797087`].includes(t),a=e.is_banned===!0||r.includes(t);return`
                <div style="background: rgba(15,20,32,0.6); padding: 14px; border-radius: 12px; border: 1px solid ${a?`rgba(239,68,68,0.5)`:i?`rgba(88,101,242,0.5)`:`rgba(255,255,255,0.06)`}; display: flex; flex-direction: column; gap: 10px; position: relative;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <img src="${e.avatar_url||`https://cdn.discordapp.com/embed/avatars/0.png`}" style="width: 44px; height: 44px; border-radius: 50%; border: 2px solid ${i?`#5865F2`:`#38bdf8`}; object-fit: cover; flex-shrink: 0;" />
                        <div style="min-width: 0; flex: 1;">
                            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                                <h5 style="color: #fff; font-size: 0.85rem; font-weight: 800; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px;">${e.full_name||e.username}</h5>
                                ${i?`<span style="font-size: 9px; font-weight: 800; background: rgba(88,101,242,0.25); color: #818cf8; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(88,101,242,0.5);">ADMIN</span>`:``}
                                ${a?`<span style="font-size: 9px; font-weight: 800; background: rgba(239,68,68,0.25); color: #fca5a5; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(239,68,68,0.5);">BANIDO</span>`:``}
                            </div>
                            <span style="color: #38bdf8; font-size: 0.72rem; font-weight: 700; display: block;">@${e.username}</span>
                            <div style="color: #64748b; font-size: 0.68rem; font-family: monospace;">ID Discord: ${t||`—`}</div>
                        </div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap;">
                        <button onclick="toggleAdminProfile('${e.id}', '${t}', ${i})" style="background: ${i?`rgba(245,158,11,0.15)`:`rgba(88,101,242,0.15)`}; border: 1px solid ${i?`rgba(245,158,11,0.4)`:`rgba(88,101,242,0.4)`}; color: ${i?`#fde68a`:`#c7d2fe`}; padding: 5px 8px; border-radius: 6px; font-size: 0.68rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                            <i class="fa-solid fa-shield"></i> ${i?`Remover Admin`:`Tornar Admin`}
                        </button>
                        <button onclick="toggleBanProfile('${e.id}', '${t}', ${a})" style="background: ${a?`rgba(34,197,94,0.15)`:`rgba(239,68,68,0.15)`}; border: 1px solid ${a?`rgba(34,197,94,0.4)`:`rgba(239,68,68,0.4)`}; color: ${a?`#86efac`:`#fca5a5`}; padding: 5px 8px; border-radius: 6px; font-size: 0.68rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                            <i class="fa-solid fa-ban"></i> ${a?`Desbanir`:`Banir`}
                        </button>
                        <button onclick="deleteUserProfile('${e.id}', '${e.username||`Usuário`}', '${t}')" style="background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.35); color: #f87171; padding: 5px 8px; border-radius: 6px; font-size: 0.68rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px;" title="Excluir Usuário">
                            <i class="fa-solid fa-trash"></i> Excluir
                        </button>
                    </div>
                </div>
            `}).join(``)}window.filterAdminUsersView=function(e){let t=(e||``).toLowerCase().trim();if(!t){y(v);return}y(v.filter(e=>e.username&&e.username.toLowerCase().includes(t)||e.full_name&&e.full_name.toLowerCase().includes(t)||e.discord_id&&String(e.discord_id).toLowerCase().includes(t)||e.id&&String(e.id).toLowerCase().includes(t)))},window.toggleAdminProfile=async function(e,r,i){let a=!i;try{try{await t.from(`profiles`).update({is_admin:a,role:a?`admin`:`user`}).eq(`id`,e)}catch{}let i=JSON.parse(localStorage.getItem(`malaca_admin_discord_accounts`)||`[]`);a?r&&!i.includes(r)&&i.push(r):i=i.filter(t=>t!==r&&t!==e),localStorage.setItem(`malaca_admin_discord_accounts`,JSON.stringify(i));let o=JSON.parse(localStorage.getItem(`malaca_cached_profiles`)||`[]`);o=o.map(t=>t.id===e||t.discord_id===r?{...t,is_admin:a,role:a?`admin`:`user`}:t),localStorage.setItem(`malaca_cached_profiles`,JSON.stringify(o));let s=JSON.parse(localStorage.getItem(`malaca_user_profile`)||`null`);s&&(s.id===e||s.discord_id===r)&&(s.is_admin=a,s.role=a?`admin`:`user`,localStorage.setItem(`malaca_user_profile`,JSON.stringify(s))),n.send({type:`broadcast`,event:`user_permission_updated`,payload:{id:e,discordId:r,is_admin:a,role:a?`admin`:`user`}}),alert(`Permissão atualizada com sucesso para: ${a?`ADMINISTRADOR`:`USUÁRIO`}`),loadAdminUsersView()}catch(e){alert(`Erro ao atualizar permissão: `+e.message)}},window.toggleBanProfile=async function(e,r,i){let a=!i;try{try{await t.from(`profiles`).update({is_banned:a}).eq(`id`,e)}catch{}let i=JSON.parse(localStorage.getItem(`malaca_banned_discord_accounts`)||`[]`);a?r&&!i.includes(r)&&i.push(r):i=i.filter(t=>t!==r&&t!==e),localStorage.setItem(`malaca_banned_discord_accounts`,JSON.stringify(i));let o=JSON.parse(localStorage.getItem(`malaca_cached_profiles`)||`[]`);o=o.map(t=>t.id===e||t.discord_id===r?{...t,is_banned:a}:t),localStorage.setItem(`malaca_cached_profiles`,JSON.stringify(o));let s=JSON.parse(localStorage.getItem(`malaca_user_profile`)||`null`);s&&(s.id===e||s.discord_id===r)&&(s.is_banned=a,localStorage.setItem(`malaca_user_profile`,JSON.stringify(s))),n.send({type:`broadcast`,event:`user_ban_updated`,payload:{id:e,discordId:r,is_banned:a}}),alert(`Usuário ${a?`BANIDO`:`DESBANIDO`} com sucesso.`),loadAdminUsersView()}catch(e){alert(`Erro ao atualizar banimento: `+e.message)}},window.deleteUserProfile=async function(e,i,a){if(confirm(`Deseja EXCLUIR permanentemente o usuário "${i}" (${a||e}) da plataforma? Esta ação não pode ser desfeita.`))try{try{await t.from(`profiles`).delete().eq(`id`,e)}catch{}let o=JSON.parse(localStorage.getItem(`malaca_cached_profiles`)||`[]`);o=o.filter(t=>t.id!==e&&t.discord_id!==a),localStorage.setItem(`malaca_cached_profiles`,JSON.stringify(o));let s=JSON.parse(localStorage.getItem(`malaca_admin_discord_accounts`)||`[]`);s=s.filter(t=>t!==a&&t!==e),localStorage.setItem(`malaca_admin_discord_accounts`,JSON.stringify(s));let c=JSON.parse(localStorage.getItem(`malaca_banned_discord_accounts`)||`[]`);c=c.filter(t=>t!==a&&t!==e),localStorage.setItem(`malaca_banned_discord_accounts`,JSON.stringify(c));let l=JSON.parse(localStorage.getItem(`malaca_user_profile`)||`null`);l&&(l.id===e||l.discord_id===a)&&(localStorage.removeItem(`malaca_user_profile`),r()),n.send({type:`broadcast`,event:`entity_sync`,payload:{entity:`profiles`,action:`DELETE`,id:e,discordId:a,timestamp:Date.now()}}),alert(`Usuário "${i}" foi excluído com sucesso!`),loadAdminUsersView()}catch(e){alert(`Erro ao excluir usuário: `+e.message)}};let b=[],x=[{id:`wand-1`,name:`Ponto 01 - Farol de El Gordo`,city_id:`cda-server-uuid`,coords:{x:3326.5,y:5163.2},hint:`Próximo à cerca de madeira na beira do penhasco, atrás do galpão.`},{id:`wand-2`,name:`Ponto 02 - Galpão Abandonado Sandy`,city_id:`cda-server-uuid`,coords:{x:1729.8,y:3314.1},hint:`Dentro do galpão de madeira com telhado quebrado.`},{id:`wand-3`,name:`Ponto 03 - Cabana do Monte Chiliad`,city_id:`cda-server-uuid`,coords:{x:-442.1,y:5972.4},hint:`Atrás da cabana de montanha, perto dos pinheiros altos.`},{id:`wand-4`,name:`Ponto 04 - Refúgio da Serraria Paleto`,city_id:`cda-server-uuid`,coords:{x:-582.4,y:5318.9},hint:`Perto do empilhamento de toras de madeira na serraria.`},{id:`wand-5`,name:`Ponto 05 - Píer de Del Perro`,city_id:`valley-server-uuid`,coords:{x:-1642.3,y:-1014.2},hint:`Debaixo da estrutura de madeira do píer próximo à praia.`},{id:`wand-6`,name:`Ponto 06 - Cais de Los Santos`,city_id:`valley-server-uuid`,coords:{x:114.5,y:-2218.4},hint:`Entre os contêineres azuis na doca sul.`}];window.loadAdminWandererListView=async function(){let e=document.getElementById(`admin-wanderer-list-container`);if(e)try{let e=[],{data:n,error:r}=await t.from(`wanderer_locations`).select(`*`).order(`created_at`,{ascending:!0});if(!r&&Array.isArray(n)&&n.length>0)e=n;else{let t=JSON.parse(localStorage.getItem(`malaca_wanderer_custom_locations`)||`[]`);e=t.length>0?t:x}b=e,localStorage.setItem(`malaca_wanderer_custom_locations`,JSON.stringify(e)),S(e)}catch(t){e.innerHTML=`<div style="grid-column: 1/-1; color: #f87171; font-size: 0.75rem; text-align: center; padding: 20px;">Falha ao carregar marcações: ${t.message}</div>`}};function S(e){let t=document.getElementById(`admin-wanderer-list-container`);if(!t)return;if(!e||e.length===0){t.innerHTML=`<div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 30px; font-size: 0.8rem;">Nenhuma marcação encontrada.</div>`;return}let n=p();t.innerHTML=e.map(e=>{let t=n.find(t=>t.id===e.city_id||t.slug===e.city_id)?.name||`Cidade Alta RP`,r=e.coords&&e.coords.x!==void 0?e.coords.x:e.x||0,i=e.coords&&e.coords.y!==void 0?e.coords.y:e.y||0;return`
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
            `}).join(``)}window.filterAdminWandererList=function(e){let t=(e||``).toLowerCase().trim(),n=document.getElementById(`wand-filter-city-select`)?.value||`all`,r=b;n!==`all`&&(r=r.filter(e=>e.city_id===n||e.city_id===`${n}-server-uuid`)),t&&(r=r.filter(e=>e.name&&e.name.toLowerCase().includes(t)||e.hint&&e.hint.toLowerCase().includes(t))),S(r)},window.filterAdminWandererByCity=function(e){let t=document.getElementById(`wand-search-input`)?.value||``;window.filterAdminWandererList(t)},window.startEditWandererPoint=function(e){let t=b.find(t=>t.id===e);if(!t)return;document.getElementById(`wand-point-id`).value=e,document.getElementById(`wand-point-name`).value=t.name||``,document.getElementById(`wand-point-city`).value=t.city_id||`cda-server-uuid`;let n=t.coords&&t.coords.x!==void 0?t.coords.x:t.x||0,r=t.coords&&t.coords.y!==void 0?t.coords.y:t.y||0;document.getElementById(`wand-point-x`).value=n,document.getElementById(`wand-point-y`).value=r,document.getElementById(`wand-point-hint`).value=t.hint||``,document.getElementById(`wand-form-title`).innerHTML=`<i class="fa-solid fa-pen-to-square" style="color: #f59e0b;"></i> Editando: ${t.name}`,document.getElementById(`wand-submit-btn`).textContent=`SALVAR ALTERAÇÕES DA MARCAÇÃO`,document.getElementById(`wand-cancel-edit-btn`).style.display=`inline-block`,document.getElementById(`wand-point-name`).focus()},window.cancelEditWandererPoint=function(){document.getElementById(`wand-point-id`).value=``,document.getElementById(`wand-point-name`).value=``,document.getElementById(`wand-point-x`).value=``,document.getElementById(`wand-point-y`).value=``,document.getElementById(`wand-point-hint`).value=``,document.getElementById(`wand-form-title`).innerHTML=`<i class="fa-solid fa-location-crosshairs" style="color: #00d2ff;"></i> Cadastrar Nova Marcação do Andarilho`,document.getElementById(`wand-submit-btn`).textContent=`SALVAR MARCAÇÃO NO MAPA`,document.getElementById(`wand-cancel-edit-btn`).style.display=`none`},window.handleSaveWandererPoint=async function(e){e.preventDefault();let r=document.getElementById(`wand-point-id`).value.trim()||`wand-${Date.now()}`,i=document.getElementById(`wand-point-name`).value.trim(),a=document.getElementById(`wand-point-city`).value,o=parseFloat(document.getElementById(`wand-point-x`).value),s=parseFloat(document.getElementById(`wand-point-y`).value),c=document.getElementById(`wand-point-hint`).value.trim(),l={id:r,name:i,city_id:a,coords:{x:o,y:s},hint:c,updated_at:new Date().toISOString()};try{try{await t.from(`wanderer_locations`).upsert([l],{onConflict:`id`})}catch{}let e=b,i=e.findIndex(e=>e.id===r);i>=0?e[i]=l:e.push(l),b=e,localStorage.setItem(`malaca_wanderer_custom_locations`,JSON.stringify(e)),n.send({type:`broadcast`,event:`entity_sync`,payload:{entity:`wanderer_locations`,action:`UPDATE`,data:l,timestamp:Date.now()}}),n.send({type:`broadcast`,event:`wanderer_locations_updated`,payload:{locations:e,targetPoint:l}}),alert(`Marcação do Andarilho salva com sucesso e sincronizada no mapa em tempo real!`),cancelEditWandererPoint(),S(b)}catch(e){alert(`Erro ao salvar ponto do andarilho: `+e.message)}},window.deleteWandererPoint=async function(e,r){if(confirm(`Deseja realmente EXCLUIR a marcação "${r}" do mapa?`))try{try{await t.from(`wanderer_locations`).delete().eq(`id`,e)}catch{}let i=b.filter(t=>t.id!==e);b=i,localStorage.setItem(`malaca_wanderer_custom_locations`,JSON.stringify(i)),n.send({type:`broadcast`,event:`entity_sync`,payload:{entity:`wanderer_locations`,action:`DELETE`,id:e,timestamp:Date.now()}}),n.send({type:`broadcast`,event:`wanderer_locations_updated`,payload:{locations:i,deletedId:e}}),alert(`Marcação "${r}" excluída com sucesso!`),S(b)}catch(e){alert(`Erro ao excluir marcação: `+e.message)}},window.forceConfirmWandererPoint=async function(e){let r=b.find(t=>t.id===e);if(r&&confirm(`Deseja FORÇAR a ativação do "${r.name}" no ciclo atual para todos os usuários?`))try{let i=JSON.parse(localStorage.getItem(`malaca_user_profile`)||`{}`),a={id:`conf-${Date.now()}`,location_id:e,city_id:r.city_id,user_id:i.id||`admin`,user_name:i.username||`Admin Global`,avatar_url:i.avatar_url||``,confirmed_at:new Date().toISOString()};try{await t.from(`wanderer_confirmations`).insert([a])}catch{}n.send({type:`broadcast`,event:`wanderer_confirmed`,payload:{locationId:e,cityId:r.city_id,confirmation:a,forcedByAdmin:!0}}),alert(`Ponto "${r.name}" ativado com sucesso no ciclo atual! Todas as telas conectadas já atualizaram a localização.`)}catch(e){alert(`Erro ao forçar ativação: `+e.message)}},window.loadAdminSettingsView=async function(){try{let{data:e}=await t.from(`platform_settings`).select(`*`).eq(`id`,`default`).maybeSingle();if(e){let t=document.getElementById(`setting-announcement-text`),n=document.getElementById(`setting-announcement-active`),r=document.getElementById(`setting-maint-msg`),i=document.getElementById(`setting-maint-active`);t&&(t.value=e.global_announcement||``),n&&(n.checked=!!e.announcement_active),r&&(r.value=e.maintenance_message||`Plataforma em manutenção.`),i&&(i.checked=!!e.maintenance_mode)}}catch{}},window.handleSaveGlobalAnnouncement=async function(e){e.preventDefault();let r=document.getElementById(`setting-announcement-text`).value.trim(),i=document.getElementById(`setting-announcement-active`).checked;try{await t.from(`platform_settings`).upsert([{id:`default`,global_announcement:r,announcement_active:i,updated_at:new Date().toISOString()}],{onConflict:`id`}),n.send({type:`broadcast`,event:`settings_updated`,payload:{global_announcement:r,announcement_active:i}}),alert(`Anúncio global salvo e transmitido com sucesso!`),E()}catch(e){alert(`Erro ao salvar anúncio: `+e.message)}},window.handleSaveMaintenance=async function(e){e.preventDefault();let r=document.getElementById(`setting-maint-msg`).value.trim(),i=document.getElementById(`setting-maint-active`).checked;try{await t.from(`platform_settings`).upsert([{id:`default`,maintenance_message:r,maintenance_mode:i,updated_at:new Date().toISOString()}],{onConflict:`id`}),n.send({type:`broadcast`,event:`settings_updated`,payload:{maintenance_message:r,maintenance_mode:i}}),alert(`Status de manutenção atualizado!`)}catch(e){alert(`Erro ao salvar manutenção: `+e.message)}};function C(){let e=localStorage.getItem(`malaca_user_profile`);if(!e)return!1;try{let t=JSON.parse(e);return!(!t||!t.id||String(t.id).startsWith(`mock-`))}catch{return!1}}window.isUserLoggedIn=C;function w(e){let t=document.getElementById(`global-access-restricted-toast`);t||(t=document.createElement(`div`),t.id=`global-access-restricted-toast`,t.style.cssText=`
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
        `,t.style.transform=`translateY(0)`,t.style.opacity=`1`,clearTimeout(t._timeout),t._timeout=setTimeout(()=>{t.style.transform=`translateY(100px)`,t.style.opacity=`0`},4e3)}window.showAccessRestrictedToast=w,document.addEventListener(`click`,e=>{let t=e.target.closest(`a`)||e.target.closest(`button.system-access-btn`)||e.target.closest(`.hub-city-card`);if(!t)return;let n=(t.getAttribute(`href`)||t.dataset.link||``).toLowerCase(),r=t.classList.contains(`hub-city-card`)||t.classList.contains(`system-access-btn`)||t.classList.contains(`hub-city-card-btn`),i=n.includes(`/sistemas`)||n.includes(`/mapa`)||n.includes(`/lockpick`)||n.includes(`/caixinha`)||n.includes(`/hacking`)||n.includes(`mapa-interativo`);(r||i)&&!C()&&(e.preventDefault(),e.stopPropagation(),w(`Faça login com o Discord para acessar este sistema.`),window.openDiscordModal())},!0);function T(){let e=window.location.pathname.toLowerCase();if(e.includes(`/sistemas`)||e.includes(`/lockpick`)||e.includes(`/caixinha`)||e.includes(`/hacking`)||e.includes(`/mapa`)||e.includes(`/mapa-interativo`))if(C()){let e=document.getElementById(`system-auth-guard-overlay`);e&&e.remove()}else{let e=document.getElementById(`system-auth-guard-overlay`);if(!e){e=document.createElement(`div`),e.id=`system-auth-guard-overlay`,e.style.cssText=`
                    position: fixed; inset: 0; background: rgba(3, 7, 18, 0.95); backdrop-filter: blur(16px);
                    z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 20px;
                `;let t=`/cidades/`,n=window.location.pathname.match(/\/cidades\/([^\/]+)\//);n&&n[1]&&(t=`/cidades/${n[1]}/`),e.innerHTML=`
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
                        <a href="${t}" style="display: inline-flex; align-items: center; gap: 6px; margin-top: 18px; font-size: 0.8rem; color: #64748b; text-decoration: none; font-weight: 700; transition: color 0.2s;">
                            <i class="fa-solid fa-arrow-left"></i> Voltar para a Cidade
                        </a>
                    </div>
                `,document.body.appendChild(e)}}}async function E(){try{let{data:e}=await t.from(`platform_settings`).select(`*`).eq(`id`,`default`).maybeSingle(),n=document.getElementById(`global-live-announcement-bar`);e&&e.announcement_active&&e.global_announcement?(n||(n=document.createElement(`div`),n.id=`global-live-announcement-bar`,n.style.cssText=`
                        position: fixed; top: 0; left: 0; right: 0; background: linear-gradient(90deg, #f59e0b, #d97706);
                        color: #000; font-weight: 900; font-size: 0.78rem; padding: 8px 16px; text-align: center;
                        z-index: 99998; box-shadow: 0 4px 15px rgba(245,158,11,0.3); display: flex; align-items: center; justify-content: center; gap: 8px;
                    `,document.body.prepend(n)),n.innerHTML=`<i class="fa-solid fa-bullhorn"></i> <span>${e.global_announcement}</span>`):n&&n.remove()}catch{}}document.addEventListener(`DOMContentLoaded`,()=>{let e=new URLSearchParams(window.location.search);(e.get(`admin`)===`true`||e.get(`admin`)===`1`)&&window.openGlobalAdminModal(),T(),E()}),T(),E()})();