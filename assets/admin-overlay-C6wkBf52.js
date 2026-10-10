import{t as e}from"./dist-CJgmpDaA.js";var t=e(`https://pdzytmdssswiyjwohvwn.supabase.co`,`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkenl0bWRzc3N3aXlqd29odnduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1ODI0NjQsImV4cCI6MjEwNzE1ODQ2NH0.RxTwiHG5JRHK02u1eBx3cFXI_3fKYMrxuI2op846FME`,{auth:{persistSession:!0,autoRefreshToken:!0,detectSessionInUrl:!0}});(function(){document.body.insertAdjacentHTML(`beforeend`,`
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
    `),window.openDiscordModal=function(){document.getElementById(`global-discord-modal`).classList.add(`active`),e()},window.closeDiscordModal=function(){document.getElementById(`global-discord-modal`).classList.remove(`active`)},window.loginWithDiscordGlobal=async function(){let e=document.querySelector(`#discord-modal-body button`),n=e?e.innerHTML:``;e&&(e.disabled=!0,e.innerHTML=`<i class="fa-solid fa-spinner fa-spin"></i> Conectando ao Discord...`);try{let e=window.location.origin+window.location.pathname,{error:n}=await t.auth.signInWithOAuth({provider:`discord`,options:{redirectTo:e,scopes:`identify email`}});if(n)throw n}catch(t){console.error(`Supabase Discord OAuth error:`,t),e&&(e.disabled=!1,e.innerHTML=n||`<i class="fa-brands fa-discord" style="font-size: 18px;"></i> ENTRAR COM O DISCORD`),alert(`Falha ao autenticar com o Discord: `+(t.message||`Verifique a conexão e tente novamente.`))}},window.logoutDiscordGlobal=async function(){try{await t.auth.signOut()}catch(e){console.warn(`SignOut exception:`,e)}localStorage.removeItem(`malaca_user_profile`),e(),n()};function e(){let e=document.getElementById(`discord-modal-body`),t=document.getElementById(`discord-modal-title`),n=document.getElementById(`discord-modal-subtitle`);if(!e)return;let r=localStorage.getItem(`malaca_user_profile`),i=r?JSON.parse(r):null;i?(t.textContent=`Dashboard do Usuário`,n.textContent=`Perfil e Registro de Acesso`,e.innerHTML=`
                <div style="display: flex; align-items: center; gap: 16px; padding: 16px; background: linear-gradient(135deg, #18181b 0%, #000000 100%); border-radius: 14px; border: 1px solid rgba(0,210,255,0.3); margin-bottom: 20px;">
                    <img src="${i.avatar_url}" style="width: 56px; height: 56px; border-radius: 50%; border: 2px solid #38bdf8;" />
                    <div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <h4 style="font-size: 16px; font-weight: 900; color: #fff;">${i.full_name||i.username}</h4>
                            <span style="font-size: 9px; font-weight: 800; background: rgba(88,101,242,0.2); color: #5865F2; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(88,101,242,0.4);">VERIFICADO</span>
                        </div>
                        <span style="font-size: 12px; color: #38bdf8; font-weight: 700;">@${i.username}</span>
                        <div style="font-size: 10px; color: #94a3b8; margin-top: 2px; font-family: monospace;">ID: ${i.discord_id}</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
                    <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);">
                        <span style="font-size: 10px; color: #94a3b8; display: block; font-weight: 700;">DATA DE CADASTRO</span>
                        <span style="font-size: 12px; font-weight: 800; color: #fff; font-family: monospace;">${new Date(i.created_at).toLocaleDateString(`pt-BR`)}</span>
                    </div>
                    <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);">
                        <span style="font-size: 10px; color: #94a3b8; display: block; font-weight: 700;">ÚLTIMO LOGIN</span>
                        <span style="font-size: 12px; font-weight: 800; color: #38bdf8; font-family: monospace;">${new Date(i.last_login_at).toLocaleTimeString(`pt-BR`,{hour:`2-digit`,minute:`2-digit`})}</span>
                    </div>
                </div>

                <div style="padding: 12px; background: rgba(0,0,0,0.6); border: 1px solid rgba(0,210,255,0.2); border-radius: 10px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <span style="font-size: 11px; font-weight: 700; color: #cbd5e1;"><i class="fa-solid fa-shield-halved" style="color: #22c55e;"></i> Sessões Registradas</span>
                    <span style="font-size: 12px; font-weight: 900; color: #38bdf8; background: rgba(0,210,255,0.2); padding: 3px 10px; border-radius: 6px; border: 1px solid rgba(0,210,255,0.3);">${i.access_count||1} acessos</span>
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
            `)}function n(){let e=localStorage.getItem(`malaca_user_profile`),t=e?JSON.parse(e):null;document.querySelectorAll(`.hub-discord-btn`).forEach(e=>{t?(e.innerHTML=`<img src="${t.avatar_url}" style="width: 20px; height: 20px; border-radius: 50%; border: 1px solid #38bdf8;" /> <span style="font-family: monospace;">${t.username}</span>`,e.style.background=`#18181b`,e.style.borderColor=`rgba(0,210,255,0.5)`):(e.innerHTML=`<i class="fa-brands fa-discord"></i> <span>ENTRAR</span>`,e.style.background=`#5865F2`,e.style.borderColor=`#5865F2`)})}async function r(){try{let{data:{session:e},error:n}=await t.auth.getSession();if(n&&console.warn(`Supabase getSession warning:`,n),e&&e.user){let n=e.user,r=n.user_metadata||{},i=r.provider_id||r.sub||n.id,a=r.preferred_username||r.user_name||r.name||r.full_name||`Discord User`,o=r.full_name||r.global_name||r.name||a,s=r.avatar_url||r.picture||`https://cdn.discordapp.com/embed/avatars/0.png`,c=new Date().toISOString(),l=n.email||r.email||``,u=typeof p==`function`&&p(n),d={id:n.id,discord_id:String(i),username:String(a),full_name:String(o),avatar_url:String(s),email:l||void 0,is_admin:u,role:u?`admin`:`user`,last_login_at:c},f=1;try{let{count:e}=await t.from(`access_logs`).select(`id`,{count:`exact`,head:!0}).eq(`user_id`,n.id);e!=null&&(f=Math.max(1,e))}catch{}let m={...d,created_at:n.created_at||c,access_count:f};localStorage.setItem(`malaca_user_profile`,JSON.stringify(m)),t.from(`profiles`).upsert([d],{onConflict:`id`}).then(()=>{}).catch(e=>{console.warn(`Supabase profiles sync warning:`,e)}),typeof window<`u`&&(window.location.hash.includes(`access_token=`)||window.location.search.includes(`code=`))&&window.history.replaceState(null,``,window.location.pathname)}else{let e=localStorage.getItem(`malaca_user_profile`);if(e)try{let t=JSON.parse(e);t.id&&String(t.id).startsWith(`mock-`)&&localStorage.removeItem(`malaca_user_profile`)}catch{}}}catch(e){console.warn(`Supabase Session Sync Exception:`,e)}n()}t.auth.onAuthStateChange(async(i,a)=>{if(i===`SIGNED_IN`&&a&&a.user){let e=a.user,n=e.user_metadata||{},r=n.provider_id||n.sub||e.id,i=n.preferred_username||n.user_name||n.name||n.full_name||`Discord User`;t.from(`access_logs`).insert([{user_id:e.id,discord_id:String(r),username:String(i),logged_at:new Date().toISOString(),user_agent:navigator.userAgent}]).then(()=>{}).catch(()=>{})}i===`SIGNED_IN`||i===`TOKEN_REFRESHED`||i===`INITIAL_SESSION`||i===`USER_UPDATED`?(await r(),e()):i===`SIGNED_OUT`&&(localStorage.removeItem(`malaca_user_profile`),n(),e())}),document.addEventListener(`DOMContentLoaded`,()=>{r()}),r(),window.openAppearanceModal=function(){document.getElementById(`global-appearance-modal`).classList.add(`active`),i()},window.closeAppearanceModal=function(){document.getElementById(`global-appearance-modal`).classList.remove(`active`)},window.setGlobalTheme=function(e){document.documentElement.setAttribute(`data-theme`,e),localStorage.setItem(`malaca_theme`,e),i()},window.updateGlobalBrightness=function(e){let t=Number(e);document.documentElement.style.filter=`brightness(${t}%)`,localStorage.setItem(`malaca_brightness`,String(t));let n=document.getElementById(`g-brightness-val`);n&&(n.textContent=`${t}%`);let r=document.getElementById(`g-brightness-slider`);r&&(r.value=t)},window.setGlobalLang=function(e){localStorage.setItem(`malaca_lang`,e),i()};function i(){let e=localStorage.getItem(`malaca_theme`)||`escuro`,t=localStorage.getItem(`malaca_brightness`)||`100`,n=localStorage.getItem(`malaca_lang`)||`pt`;document.documentElement.setAttribute(`data-theme`,e),document.documentElement.style.filter=`brightness(${t}%)`,[`escuro`,`oled`,`dracula`,`cinza_escuro`,`cinza_claro`,`claro`].forEach(t=>{let n=document.getElementById(`gtheme-${t}`);n&&(t===e?(n.style.background=`linear-gradient(135deg, #00d2ff 0%, #2563eb 100%)`,n.style.color=`#fff`,n.style.borderColor=`#38bdf8`):(n.style.background=`rgba(255,255,255,0.05)`,n.style.color=`#94a3b8`,n.style.borderColor=`rgba(0,210,255,0.2)`))});let r=document.getElementById(`g-brightness-val`);r&&(r.textContent=`${t}%`);let i=document.getElementById(`g-brightness-slider`);i&&(i.value=t),[`pt`,`en`].forEach(e=>{let t=document.getElementById(`glang-${e}`);t&&(e===n?(t.style.background=`linear-gradient(135deg, #00d2ff 0%, #2563eb 100%)`,t.style.color=`#fff`,t.style.borderColor=`#38bdf8`):(t.style.background=`rgba(255,255,255,0.05)`,t.style.color=`#94a3b8`,t.style.borderColor=`rgba(0,210,255,0.2)`))})}document.addEventListener(`DOMContentLoaded`,i),i();let a=!1,o=`cities`,s=null,c=null,l=[{id:`sys-mapa`,name:`MAPA INTERATIVO RP`,slug:`mapa-interativo`,tag:`CDA & VALLEY REALTIME`,link:`/cidades/cda/mapa/`,icon:`fa-compass`,is_active:!0},{id:`sys-lockpick`,name:`LOCKPICK SIMULATOR`,slug:`lockpick`,tag:`FIVEM LOCKPICK KIT`,link:`/cidades/cda/lockpick/`,icon:`fa-key`,is_active:!0},{id:`sys-caixinha`,name:`CAIXINHA ELETRÔNICO`,slug:`caixinha`,tag:`SAFE & ATM HACK`,link:`/cidades/cda/caixinha/`,icon:`fa-vault`,icon:`fa-vault`,is_active:!0},{id:`sys-hacking`,name:`HACKING DEVICE`,slug:`hacking`,tag:`CYBER HACK TERMINAL`,link:`/cidades/cda/hacking/`,icon:`fa-microchip`,is_active:!0}],u=[{id:`cda-server-uuid`,slug:`cda`,name:`Cidade Alta RP`,subtitle:`SERVIDORES CDA & VALLEY`},{id:`valley-server-uuid`,slug:`valley`,name:`Valley RP`,subtitle:`VALLEY ROLEPLAY HUB`},{id:`los-santos-server-uuid`,slug:`los-santos`,name:`Los Santos Central`,subtitle:`TREINAMENTO HEISTS & MINIJOGOS`}];window.loadCitySystems=function(e){let t=document.getElementById(`city-systems-grid`);if(!t)return;let n=localStorage.getItem(`malaca_custom_servers`),r=e;if(n)try{let t=JSON.parse(n).find(t=>t.slug.toLowerCase()===e.toLowerCase());t&&(r=t.id)}catch{}let i=[{id:`sys-mapa`,title:`MAPA INTERATIVO RP`,tag:`REALTIME MAP`,desc:`Mapa interativo em tempo real com virada do Andarilho e pontos de interesse.`,link:`/cidades/${e}/mapa/`,icon:`fa-compass`,img:`/images/gta_map_bg.webp`,city_ids:[`cda-server-uuid`,`valley-server-uuid`,`cda`,`valley`]},{id:`sys-lockpick`,title:`LOCKPICK SIMULATOR`,tag:`LOCKPICK KIT`,desc:`Simulador oficial de arrombamento com travamento de pinos.`,link:`/cidades/${e}/lockpick/`,icon:`fa-key`,img:`/images/lockpick.jpg`,city_ids:[`cda-server-uuid`,`los-santos-server-uuid`,`cda`,`los-santos`]},{id:`sys-caixinha`,title:`CAIXINHA ELETRÔNICO`,tag:`ATM HACK`,desc:`Decodificador rápido de cofres e caixas eletrônicos.`,link:`/cidades/${e}/caixinha/`,icon:`fa-vault`,img:`/images/caixinha.jpg`,city_ids:[`cda-server-uuid`,`los-santos-server-uuid`,`cda`,`los-santos`]},{id:`sys-hacking`,title:`HACKING DEVICE`,tag:`CYBER TERMINAL`,desc:`Terminal de hacking estilo Cayo Perico com matrizes de caracteres.`,link:`/cidades/${e}/hacking/`,icon:`fa-microchip`,img:`/images/hacking.jpg`,city_ids:[`cda-server-uuid`,`los-santos-server-uuid`,`cda`,`los-santos`]}],a=localStorage.getItem(`malaca_custom_systems`),o=i;if(a)try{let t=JSON.parse(a);Array.isArray(t)&&t.length>0&&(o=t.map(t=>({id:t.id||`sys-${t.slug}`,title:t.name,tag:t.tag||`SISTEMA RP`,desc:t.description||``,link:`/cidades/${e}/${t.slug||`mapa`}/`,icon:t.icon||`fa-microchip`,img:t.image_url||`/images/gta_map_bg.webp`,city_ids:t.city_ids||[]})))}catch{}let s=o.filter(t=>t.city_ids&&t.city_ids.length>0&&(t.city_ids.includes(r)||t.city_ids.includes(e)||t.city_ids.includes(`${e}-server-uuid`))),c=document.getElementById(`systems-count-tag`);if(c&&(c.textContent=`${s.length} SISTEMAS ATIVOS`),t.innerHTML=``,s.length===0){t.innerHTML=`<p style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 40px; font-weight: 700;">Nenhum sistema vinculado a esta cidade no momento.</p>`;return}s.forEach(e=>{let n=document.createElement(`a`);n.href=e.link,n.className=`hub-city-card`,n.innerHTML=`
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
            `,t.appendChild(n)})},window.openGlobalAdminModal=function(){let e=document.getElementById(`global-admin-modal`);e&&(e.classList.add(`active`),m())},window.closeGlobalAdminModal=function(){let e=document.getElementById(`global-admin-modal`);e&&e.classList.remove(`active`)};function d(){let e=JSON.parse(localStorage.getItem(`malaca_custom_servers`)||`[]`);return e.length>0?e:u}function f(){let e=JSON.parse(localStorage.getItem(`malaca_custom_systems`)||`[]`);return e.length>0?e:l}function p(e){if(!e)return!1;if(e.is_admin===!0||e.role===`admin`||e.user_metadata?.is_admin===!0)return!0;let t=(e.email||e.user_metadata?.email||``).toLowerCase(),n=(e.username||e.user_metadata?.name||e.user_metadata?.full_name||e.user_metadata?.preferred_username||``).toLowerCase();if(t&&[`rogeriomalaquiasjr@gmail.com`,`rogeriosantanajr@gmail.com`].some(e=>t.includes(e))||n&&[`malaca`,`malaquias`,`malaca7`].some(e=>n.includes(e)))return!0;try{let r=JSON.parse(localStorage.getItem(`malaca_admin_discord_accounts`)||`[]`),i=e.discord_id||e.id||e.user_metadata?.sub;if(i&&r.includes(i)||t&&r.includes(t)||n&&r.includes(n))return!0}catch{}return!1}window.loginAdminWithDiscord=function(){let e=window.location.origin+window.location.pathname;t.auth.signInWithOAuth({provider:`discord`,options:{redirectTo:e,scopes:`identify email`}})},t.auth.getSession().then(({data:{session:e}})=>{e&&e.user&&p(e.user)&&(a=!0)}),t.auth.onAuthStateChange((e,t)=>{if(t&&t.user&&p(t.user)){a=!0;let e=document.getElementById(`global-admin-modal`);e&&e.classList.contains(`active`)&&m()}});function m(){let e=document.getElementById(`global-admin-content`);if(!a)e.innerHTML=`
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
            `;else{let t=d(),n=f();e.innerHTML=`
                <div class="global-admin-nav">
                    <button class="global-admin-nav-btn ${o===`cities`?`active`:``}" onclick="switchAdminTab('cities')"><i class="fa-solid fa-city"></i> Cidades (${t.length})</button>
                    <button class="global-admin-nav-btn ${o===`systems`?`active`:``}" onclick="switchAdminTab('systems')"><i class="fa-solid fa-layer-group"></i> Sistemas (${n.length})</button>
                    <button class="global-admin-nav-btn ${o===`andarilho`?`active`:``}" onclick="switchAdminTab('andarilho')"><i class="fa-solid fa-person-walking"></i> Ciclo Andarilho</button>
                    <button class="global-admin-nav-btn" onclick="logoutAdmin()" style="margin-left: auto; color: #ff5252;"><i class="fa-solid fa-right-from-bracket"></i> Sair</button>
                </div>
                <div class="global-admin-body" id="admin-tab-body">
                    ${h(o,t,n)}
                </div>
            `}}window.switchAdminTab=function(e){o=e,m()},window.handleAdminLogin=function(e){e.preventDefault();let t=document.getElementById(`admin-user-input`).value.trim(),n=document.getElementById(`admin-pass-input`).value.trim();t===`malaca`&&n===`199425`||t===`admin`&&(n===`cidadealta123`||n===`admin`)?(a=!0,m()):document.getElementById(`admin-auth-err`).style.display=`block`},window.logoutAdmin=function(){a=!1,m()};function h(e,t,n){if(e===`cities`){let e=s?t.find(e=>e.id===s):null;return`
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    <div style="background: rgba(15,20,32,0.6); padding: 20px; border-radius: 14px; border: 1px solid rgba(255,102,0,0.2);">
                        <h4 style="font-family: var(--font-header); color: #fff; font-size: 0.9rem; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                            <span><i class="fa-solid ${e?`fa-pen`:`fa-plus`}" style="color: #ff6600;"></i> ${e?`Editar Cidade "${e.name}"`:`Criar Nova Cidade`}</span>
                            ${e?`<button onclick="cancelEditCity()" style="background:none; border:none; color:#ff5252; font-size:0.75rem; cursor:pointer;">Cancelar Edição</button>`:``}
                        </h4>
                        <form onsubmit="handleSaveCity(event)" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                            <input type="text" id="city-form-name" class="global-admin-input" placeholder="Nome da Cidade (ex: CDA RP)" value="${e?e.name:``}" required style="margin:0;">
                            <input type="text" id="city-form-slug" class="global-admin-input" placeholder="Slug / Rota (ex: cda)" value="${e?e.slug:``}" required style="margin:0;">
                            <input type="text" id="city-form-sub" class="global-admin-input" placeholder="Subtítulo (ex: SERVIDOR OFICIAL)" value="${e&&e.subtitle||``}" style="margin:0;">
                            <input type="text" id="city-form-banner" class="global-admin-input" placeholder="URL da Imagem Banner" value="${e&&e.banner_image_url||``}" style="margin:0;">
                            <button type="submit" class="global-admin-submit" style="grid-column: 1 / -1; justify-self: start; width: auto; padding: 10px 24px;">${e?`Atualizar Cidade`:`Salvar Nova Cidade`}</button>
                        </form>
                    </div>

                    <h4 style="font-family: var(--font-header); color: #fff; font-size: 0.9rem;">Cidades Cadastradas (${t.length})</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 12px;">
                        ${t.map((e,n)=>`
                            <div style="background: rgba(15,20,32,0.4); padding: 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <div style="display: flex; flex-direction: column; gap: 2px;">
                                        <button onclick="moveCityUp(${n})" ${n===0?`disabled style="opacity:0.3"`:``} style="background: rgba(255,255,255,0.05); border: none; color: #fff; padding: 2px 6px; border-radius: 4px; cursor: pointer;"><i class="fa-solid fa-arrow-up" style="font-size:0.65rem;"></i></button>
                                        <button onclick="moveCityDown(${n})" ${n===t.length-1?`disabled style="opacity:0.3"`:``} style="background: rgba(255,255,255,0.05); border: none; color: #fff; padding: 2px 6px; border-radius: 4px; cursor: pointer;"><i class="fa-solid fa-arrow-down" style="font-size:0.65rem;"></i></button>
                                    </div>
                                    <div>
                                        <h5 style="color: #fff; font-size: 0.85rem; font-weight: 800;">${e.name}</h5>
                                        <span style="color: #ff6600; font-size: 0.7rem; font-family: monospace;">/${e.slug}/</span>
                                    </div>
                                </div>
                                <div style="display: flex; items-center; gap: 6px;">
                                    <button onclick="startEditCity('${e.id}')" style="background: rgba(255,102,0,0.1); border: 1px solid rgba(255,102,0,0.3); color: #ff6600; padding: 6px 10px; border-radius: 6px; font-size: 0.7rem; cursor: pointer;" title="Editar"><i class="fa-solid fa-pen"></i></button>
                                    <button onclick="deleteCity('${e.id}', '${e.name}')" style="background: rgba(255,82,82,0.1); border: 1px solid rgba(255,82,82,0.3); color: #ff5252; padding: 6px 10px; border-radius: 6px; font-size: 0.7rem; cursor: pointer;" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                                </div>
                            </div>
                        `).join(``)}
                    </div>
                </div>
            `}else if(e===`systems`){let e=c?n.find(e=>e.id===c):null;return`
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    <div style="background: rgba(15,20,32,0.6); padding: 20px; border-radius: 14px; border: 1px solid rgba(255,102,0,0.2);">
                        <h4 style="font-family: var(--font-header); color: #fff; font-size: 0.9rem; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                            <span><i class="fa-solid ${e?`fa-pen`:`fa-plus`}" style="color: #ff8800;"></i> ${e?`Editar Sistema "${e.name}"`:`Criar Novo Sistema`}</span>
                            ${e?`<button onclick="cancelEditSystem()" style="background:none; border:none; color:#ff5252; font-size:0.75rem; cursor:pointer;">Cancelar Edição</button>`:``}
                        </h4>
                        <form onsubmit="handleSaveSystem(event)" style="display: flex; flex-direction: column; gap: 12px;">
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                                <input type="text" id="sys-form-name" class="global-admin-input" placeholder="Nome do Sistema (ex: LOCKPICK)" value="${e?e.name:``}" required style="margin:0;">
                                <input type="text" id="sys-form-slug" class="global-admin-input" placeholder="Slug (ex: lockpick)" value="${e?e.slug:``}" required style="margin:0;">
                                <input type="text" id="sys-form-tag" class="global-admin-input" placeholder="Tag (ex: MINIJOGO)" value="${e&&e.tag||``}" style="margin:0;">
                                <input type="text" id="sys-form-link" class="global-admin-input" placeholder="Link (ex: lockpick/)" value="${e&&e.link||``}" style="margin:0;">
                            </div>
                            <label style="font-size: 0.72rem; color: #94a3b8; font-weight: 700;">VINCULAR A CIDADES:</label>
                            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                                ${t.map(t=>{let n=!e||e.city_ids&&(e.city_ids.includes(t.id)||e.city_ids.includes(t.slug));return`
                                    <label style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; color: #cbd5e1; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                                        <input type="checkbox" name="city-link-check" value="${t.id}" ${n?`checked`:``}> ${t.name}
                                    </label>
                                `}).join(``)}
                            </div>
                            <button type="submit" class="global-admin-submit" style="width: auto; align-self: start; padding: 10px 24px;">${e?`Atualizar Sistema`:`Salvar Novo Sistema`}</button>
                        </form>
                    </div>

                    <h4 style="font-family: var(--font-header); color: #fff; font-size: 0.9rem;">Sistemas Cadastrados (${n.length})</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 12px;">
                        ${n.map((e,t)=>`
                            <div style="background: rgba(15,20,32,0.4); padding: 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <div style="display: flex; flex-direction: column; gap: 2px;">
                                        <button onclick="moveSystemUp(${t})" ${t===0?`disabled style="opacity:0.3"`:``} style="background: rgba(255,255,255,0.05); border: none; color: #fff; padding: 2px 6px; border-radius: 4px; cursor: pointer;"><i class="fa-solid fa-arrow-up" style="font-size:0.65rem;"></i></button>
                                        <button onclick="moveSystemDown(${t})" ${t===n.length-1?`disabled style="opacity:0.3"`:``} style="background: rgba(255,255,255,0.05); border: none; color: #fff; padding: 2px 6px; border-radius: 4px; cursor: pointer;"><i class="fa-solid fa-arrow-down" style="font-size:0.65rem;"></i></button>
                                    </div>
                                    <div>
                                        <h5 style="color: #fff; font-size: 0.85rem; font-weight: 800;">${e.name}</h5>
                                        <span style="color: #ffaa00; font-size: 0.7rem; font-family: monospace;">${e.tag||`SISTEMA`}</span>
                                    </div>
                                </div>
                                <div style="display: flex; items-center; gap: 6px;">
                                    <button onclick="startEditSystem('${e.id}')" style="background: rgba(255,102,0,0.1); border: 1px solid rgba(255,102,0,0.3); color: #ff6600; padding: 6px 10px; border-radius: 6px; font-size: 0.7rem; cursor: pointer;" title="Editar"><i class="fa-solid fa-pen"></i></button>
                                    <button onclick="deleteSystem('${e.id}', '${e.name}')" style="background: rgba(255,82,82,0.1); border: 1px solid rgba(255,82,82,0.3); color: #ff5252; padding: 6px 10px; border-radius: 6px; font-size: 0.7rem; cursor: pointer;" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                                </div>
                            </div>
                        `).join(``)}
                    </div>
                </div>
            `}else if(e===`andarilho`)return`
                <div style="background: rgba(15,20,32,0.6); padding: 24px; border-radius: 14px; border: 1px solid rgba(255,102,0,0.2); text-align: center;">
                    <i class="fa-solid fa-rotate" style="font-size: 2rem; color: #ff6600; margin-bottom: 12px;"></i>
                    <h4 style="font-family: var(--font-header); color: #fff; font-size: 1rem; margin-bottom: 8px;">Resetar Ciclo do Andarilho</h4>
                    <p style="font-size: 0.8rem; color: #94a3b8; max-width: 500px; margin: 0 auto 16px;">Limpa todas as confirmações da comunidade acumuladas no ciclo atual do Andarilho em todas as cidades.</p>
                    <button onclick="handleResetWandererCycle()" class="global-admin-submit" style="width: auto; background: linear-gradient(135deg, #ff5500 0%, #e62e00 50%, #ffaa00 100%); color: #fff; padding: 10px 24px;">CONFIRMAR RESET DO CICLO</button>
                </div>
            `;return``}window.startEditCity=function(e){s=e,m()},window.cancelEditCity=function(){s=null,m()},window.handleSaveCity=function(e){e.preventDefault();let t=document.getElementById(`city-form-name`).value.trim(),n=document.getElementById(`city-form-slug`).value.trim(),r=document.getElementById(`city-form-sub`).value.trim(),i=document.getElementById(`city-form-banner`).value.trim(),a=d();s?(a=a.map(e=>e.id===s?{...e,name:t,slug:n,subtitle:r,banner_image_url:i}:e),s=null,alert(`Cidade atualizada com sucesso!`)):(a.push({id:`city-`+Date.now(),name:t,slug:n,subtitle:r,banner_image_url:i,description:`Cidade cadastrada via Admin.`}),alert(`Cidade cadastrada com sucesso!`)),localStorage.setItem(`malaca_custom_servers`,JSON.stringify(a)),m(),window.loadCustomCities&&window.loadCustomCities()},window.moveCityUp=function(e){if(e<=0)return;let t=d(),n=t[e-1];t[e-1]=t[e],t[e]=n,localStorage.setItem(`malaca_custom_servers`,JSON.stringify(t)),m(),window.loadCustomCities&&window.loadCustomCities()},window.moveCityDown=function(e){let t=d();if(e>=t.length-1)return;let n=t[e+1];t[e+1]=t[e],t[e]=n,localStorage.setItem(`malaca_custom_servers`,JSON.stringify(t)),m(),window.loadCustomCities&&window.loadCustomCities()},window.deleteCity=function(e,t){if(confirm(`Tem certeza que deseja excluir a cidade "${t}"?`)){let t=d();t=t.filter(t=>t.id!==e),localStorage.setItem(`malaca_custom_servers`,JSON.stringify(t)),m(),window.loadCustomCities&&window.loadCustomCities()}},window.startEditSystem=function(e){c=e,m()},window.cancelEditSystem=function(){c=null,m()},window.handleSaveSystem=function(e){e.preventDefault();let t=document.getElementById(`sys-form-name`).value.trim(),n=document.getElementById(`sys-form-slug`).value.trim(),r=document.getElementById(`sys-form-tag`).value.trim(),i=document.getElementById(`sys-form-link`).value.trim(),a=Array.from(document.querySelectorAll(`input[name="city-link-check"]:checked`)).map(e=>e.value),o=f();c?(o=o.map(e=>e.id===c?{...e,name:t,slug:n,tag:r,link:i,city_ids:a}:e),c=null,alert(`Sistema atualizado com sucesso!`)):(o.push({id:`sys-`+Date.now(),name:t,slug:n,tag:r,link:i||`${n}/`,city_ids:a,is_active:!0}),alert(`Sistema cadastrado com sucesso!`)),localStorage.setItem(`malaca_custom_systems`,JSON.stringify(o)),m()},window.moveSystemUp=function(e){if(e<=0)return;let t=f(),n=t[e-1];t[e-1]=t[e],t[e]=n,localStorage.setItem(`malaca_custom_systems`,JSON.stringify(t)),m()},window.moveSystemDown=function(e){let t=f();if(e>=t.length-1)return;let n=t[e+1];t[e+1]=t[e],t[e]=n,localStorage.setItem(`malaca_custom_systems`,JSON.stringify(t)),m()},window.deleteSystem=function(e,t){if(confirm(`Tem certeza que deseja excluir o sistema "${t}"?`)){let t=f();t=t.filter(t=>t.id!==e),localStorage.setItem(`malaca_custom_systems`,JSON.stringify(t)),m()}},window.handleResetWandererCycle=function(){localStorage.removeItem(`cidade_alta_user_confirmations`),alert(`Ciclo do Andarilho resetado com sucesso!`)},document.addEventListener(`DOMContentLoaded`,()=>{let e=new URLSearchParams(window.location.search);(e.get(`admin`)===`true`||e.get(`admin`)===`1`)&&window.openGlobalAdminModal()})})();