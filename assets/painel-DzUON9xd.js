import{t as e}from"./dist-CPfJrQXr.js";/* empty css               */var t=`https://pdzytmdssswiyjwohvwn.supabase.co`,n=e(t,`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkenl0bWRzc3N3aXlqd29odnduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1ODI0NjQsImV4cCI6MjEwNzE1ODQ2NH0.RxTwiHG5JRHK02u1eBx3cFXI_3fKYMrxuI2op846FME`,{auth:{persistSession:!0,autoRefreshToken:!0,detectSessionInUrl:!0}}),r=[`722320491767136346`],i=null,a=null,o=`dashboard`,s=[],c=[],l=[],u=``,d=n.channel(`malaca_realtime_global_hub`);d.on(`broadcast`,{event:`force_user_logout`},async e=>{let t=e?.payload;if(!t)return;let n=p(a)||a?.discord_id||``,r=a?.id||``,o=p(i)||``,s=i?.id||``;(t.id&&(r===t.id||s===t.id)||t.discordId&&(n===t.discordId||o===t.discordId))&&await _(`Sua conta foi excluída por um administrador. Sessão desconectada.`)}).on(`broadcast`,{event:`user_deleted`},async e=>{let t=e?.payload;if(!t)return;let n=p(a)||a?.discord_id||``,r=a?.id||``,o=p(i)||``,s=i?.id||``;t.id&&(r===t.id||s===t.id)||t.discordId&&(n===t.discordId||o===t.discordId)?await _(`Sua conta foi excluída por um administrador. Sessão desconectada.`):j()}).on(`broadcast`,{event:`user_permission_updated`},e=>{e?.payload?.userId===a?.id||e?.payload?.discordId===a?.discord_id?x():j()}).on(`broadcast`,{event:`user_ban_updated`},e=>{e?.payload?.userId===a?.id||e?.payload?.discordId===a?.discord_id?x():j()}).subscribe();function f(){try{return JSON.parse(localStorage.getItem(`malaca_banned_discord_accounts`)||`[]`)}catch{return[]}}function p(e){if(!e)return``;if(e.discord_id&&typeof e.discord_id==`string`&&e.discord_id.trim())return e.discord_id.trim();if(Array.isArray(e.identities)&&e.identities.length>0){let t=e.identities.find(e=>e.provider===`discord`)||e.identities[0];if(t){if(t.id)return String(t.id).trim();if(t.identity_data){if(t.identity_data.provider_id)return String(t.identity_data.provider_id).trim();if(t.identity_data.sub)return String(t.identity_data.sub).trim()}}}let t=e.user_metadata||e.raw_user_meta_data||{};return t.provider_id?String(t.provider_id).trim():t.sub&&!String(t.sub).includes(`-`)?String(t.sub).trim():t.id&&!String(t.id).includes(`-`)?String(t.id).trim():e.id&&typeof e.id==`string`&&/^\d{15,22}$/.test(e.id.trim())?e.id.trim():e.sub&&typeof e.sub==`string`&&/^\d{15,22}$/.test(e.sub.trim())?e.sub.trim():``}async function m(){let e=[];try{let t=JSON.parse(localStorage.getItem(`malaca_deleted_discord_accounts`)||`[]`);Array.isArray(t)&&(e=[...t])}catch{}try{let{data:t}=await n.from(`platform_settings`).select(`disabled_systems`).eq(`id`,`deleted_accounts`).maybeSingle();t&&Array.isArray(t.disabled_systems)&&(t.disabled_systems.forEach(t=>{let n=String(t||``).trim();n&&!e.includes(n)&&e.push(n)}),localStorage.setItem(`malaca_deleted_discord_accounts`,JSON.stringify(e)))}catch{}return e}function h(){try{return JSON.parse(localStorage.getItem(`malaca_deleted_discord_accounts`)||`[]`)}catch{return[]}}async function g(e,t){let r=await m(),i=t&&t!==`—`&&t!==`undefined`?String(t).trim():``,a=e&&e!==`undefined`?String(e).trim():``;i&&!r.includes(i)&&r.push(i),a&&!r.includes(a)&&r.push(a),localStorage.setItem(`malaca_deleted_discord_accounts`,JSON.stringify(r));try{await n.from(`platform_settings`).upsert({id:`deleted_accounts`,disabled_systems:r,updated_at:new Date().toISOString()},{onConflict:`id`})}catch(e){console.warn(`Erro ao salvar tombstone global no Supabase:`,e)}return r}async function _(e=`Sua conta foi excluída por um administrador. Sessão desconectada.`){try{await n.auth.signOut({scope:`global`})}catch{}try{localStorage.removeItem(`malaca_user_profile`),localStorage.removeItem(`malaca_admin_master_session`),sessionStorage.removeItem(`malaca_admin_master_session`);for(let e=localStorage.length-1;e>=0;e--){let t=localStorage.key(e);t&&(t.startsWith(`sb-`)||t.includes(`supabase.auth.token`)||t.includes(`auth-token`))&&localStorage.removeItem(t)}for(let e=sessionStorage.length-1;e>=0;e--){let t=sessionStorage.key(e);t&&(t.startsWith(`sb-`)||t.includes(`supabase.auth.token`)||t.includes(`auth-token`))&&sessionStorage.removeItem(t)}}catch{}i=null,a=null,e&&alert(e),window.location.replace(`/`)}function v(e){if(!e)return!1;let t=p(e)||e.discord_id||``;if(t&&r.includes(String(t))||e.id&&r.includes(String(e.id)))return!1;if(e.is_banned===!0||e.role===`banned`)return!0;let n=f();return!!(t&&n.includes(String(t))||e.id&&n.includes(String(e.id)))}function y(e){if(!e||v(e))return!1;let t=p(e)||e.discord_id||``;if(t&&r.includes(String(t))||e.id&&r.includes(String(e.id))||e.is_admin===!0||e.role===`admin`||e.role===`owner`||e.role===`founder`)return!0;try{let n=JSON.parse(localStorage.getItem(`malaca_admin_discord_accounts`)||`[]`);if(t&&n.includes(String(t))||e.id&&n.includes(String(e.id)))return!0}catch{}return sessionStorage.getItem(`malaca_admin_master_session`)===`true`||localStorage.getItem(`malaca_admin_master_session`)===`true`}function b(e){if(!e)return!1;let t=p(e)||e.discord_id||``;return r.includes(String(t))||r.includes(String(e.id||``))}n.auth.onAuthStateChange(async(e,t)=>{(e===`SIGNED_IN`||e===`TOKEN_REFRESHED`||e===`INITIAL_SESSION`||e===`USER_UPDATED`)&&t&&t.user&&(i=t.user,await x())});async function x(){let e=document.getElementById(`painel-app-root`);if(!e)return;let t=new URLSearchParams(window.location.search),o=new URLSearchParams;window.location.hash&&window.location.hash.includes(`=`)&&(o=new URLSearchParams(window.location.hash.replace(/^#/,``)));let s=t.get(`error`)||o.get(`error`),c=t.get(`error_description`)||o.get(`error_description`);(s||c)&&(window.history.replaceState(null,document.title,window.location.pathname),console.warn(`OAuth Error no painel:`,s,c));let l=window.location.hash.includes(`access_token=`)||window.location.search.includes(`code=`),u=null;try{let t=localStorage.getItem(`malaca_user_profile`);if(t){let n=JSON.parse(t);n&&typeof n==`object`&&y(n)&&(u=n,a=u,l||E(e))}}catch{}u||(e.innerHTML=`
            <div class="painel-gate-container">
                <div style="text-align: center; color: #94a3b8;">
                    <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 2.5rem; color: #00d2ff; margin-bottom: 16px;"></i>
                    <h3 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; margin-bottom: 8px;">
                        ${l?`Concluindo Autenticação Discord...`:`Verificando Sessão de Administrador...`}
                    </h3>
                    <p style="font-size: 0.85rem;">Validando credenciais do Discord e permissões no Supabase.</p>
                </div>
            </div>
        `);try{let{data:{session:t}}=await n.auth.getSession();if(!t&&l)for(let e=0;e<6;e++){await new Promise(e=>setTimeout(e,250));let e=await n.auth.getSession();if(e.data?.session){t=e.data.session;break}}let o=u;if(t&&t.user){i=t.user;let e=p(t.user)||p(u)||u?.discord_id||``,a=r.includes(String(e))||r.includes(String(t.user.id)),s=await m();if(s.includes(String(e))||s.includes(String(t.user.id))){await _(`Esta conta foi excluída permanentemente por um administrador.`);return}let c=null;try{let r=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t.user.id),i=[];if(r&&i.push(`id.eq.${t.user.id}`),e&&i.push(`discord_id.eq.${e}`),i.length>0){let{data:e}=await n.from(`profiles`).select(`id, discord_id, username, full_name, avatar_url, email, is_admin, role, created_at, last_login_at`).or(i.join(`,`)).maybeSingle();e&&(c=e)}}catch{}let d=[];try{d=JSON.parse(localStorage.getItem(`malaca_admin_discord_accounts`)||`[]`)}catch{}let f=e&&d.includes(String(e))||d.includes(String(t.user.id)),h=a||f||c&&(c.is_admin===!0||c.role===`admin`)||u?.is_admin===!0||u?.role===`admin`,g=h?`admin`:c?.role||u?.role||`user`,v=new Date().toISOString(),y=t.user.user_metadata||{};o={id:t.user.id,discord_id:String(e),username:y.preferred_username||y.global_name||y.name||c?.username||u?.username||`Discord User`,full_name:y.full_name||y.global_name||y.name||c?.full_name||u?.full_name||`Usuário`,avatar_url:y.avatar_url||y.picture||c?.avatar_url||u?.avatar_url||`https://cdn.discordapp.com/embed/avatars/0.png`,email:t.user.email||c?.email,is_admin:h,role:g,created_at:c?.created_at||t.user.created_at||v,last_login_at:v};let b={id:t.user.id,discord_id:String(e),username:o.username,full_name:o.full_name,avatar_url:o.avatar_url,email:o.email||void 0,is_admin:h,role:g,last_login_at:v};n.from(`profiles`).upsert([b],{onConflict:`id`}).catch(()=>{}),l&&window.history.replaceState(null,``,window.location.pathname)}if(!o){let e=localStorage.getItem(`malaca_user_profile`);if(e)try{let t=JSON.parse(e);if(t&&typeof t==`object`){let e=p(t)||t.discord_id||``,i=r.includes(String(e))||r.includes(String(t.id||``)),a=null,s=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(t.id||``)),c=[];if(s&&c.push(`id.eq.${t.id}`),e&&c.push(`discord_id.eq.${e}`),c.length>0)try{let{data:e}=await n.from(`profiles`).select(`id, discord_id, username, full_name, avatar_url, email, is_admin, role, created_at, last_login_at`).or(c.join(`,`)).maybeSingle();e&&(a=e)}catch{}let l=[];try{l=JSON.parse(localStorage.getItem(`malaca_admin_discord_accounts`)||`[]`)}catch{}let u=e&&l.includes(String(e))||t.id&&l.includes(String(t.id)),d=i||u||a&&(a.is_admin===!0||a.role===`admin`)||t.is_admin===!0||t.role===`admin`,f=d?`admin`:a?.role||t.role||`user`;o={...t,...a||{},discord_id:String(e||t.discord_id||``),username:a?.username||t.username||`MALACA7X`,full_name:a?.full_name||t.full_name||t.username||`Administrador`,avatar_url:a?.avatar_url||t.avatar_url||`https://cdn.discordapp.com/embed/avatars/0.png`,is_admin:d,role:f}}}catch(e){console.warn(`Erro ao processar sessão salva no painel:`,e)}}if(a=o,!o){S(e);return}if(localStorage.setItem(`malaca_user_profile`,JSON.stringify(o)),v(o)){w(e,o);return}if(!y(o)){C(e,o);return}document.getElementById(`painel-tab-content`)||E(e)}catch(t){console.error(`Erro na inicialização do painel:`,t),u||S(e)}}function S(e){e.innerHTML=`
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
    `,document.getElementById(`btn-login-discord-painel`)?.addEventListener(`click`,T),document.getElementById(`painel-master-login-form`)?.addEventListener(`submit`,t=>{t.preventDefault();let n=document.getElementById(`painel-master-user`)?.value.trim().toLowerCase(),r=document.getElementById(`painel-master-pass`)?.value.trim(),i=document.getElementById(`painel-master-error`);n===`malaca`&&r===`199425`||n===`admin`&&(r===`cidadealta123`||r===`admin`)||r===`199425`?(sessionStorage.setItem(`malaca_admin_master_session`,`true`),localStorage.setItem(`malaca_admin_master_session`,`true`),a={id:`722320491767136346`,discord_id:`722320491767136346`,username:`MALACA7X`,full_name:`Administrador Principal`,avatar_url:`/images/platform_icon.png`,is_admin:!0,role:`admin`},localStorage.setItem(`malaca_user_profile`,JSON.stringify(a)),E(e)):i&&(i.style.display=`block`)})}function C(e,t){e.innerHTML=`
        <div class="painel-gate-container">
            <div class="painel-gate-card">
                <div class="painel-gate-icon danger">
                    <i class="fa-solid fa-lock"></i>
                </div>
                <h2 class="painel-gate-title">ACESSO RESTRITO</h2>
                <p class="painel-gate-desc">
                    A conta <strong style="color: #fff;">@${t.username||`Usuário`}</strong> está conectada, mas não possui permissões administrativas ativas.
                </p>
                <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px; text-align: left;">
                    <img src="${t.avatar_url||`https://cdn.discordapp.com/embed/avatars/0.png`}" style="width: 42px; height: 42px; border-radius: 50%; object-fit: cover;" />
                    <div style="min-width: 0; flex: 1;">
                        <div style="color: #fff; font-weight: 800; font-size: 13px;">${t.full_name||t.username}</div>
                        <div style="color: #64748b; font-size: 11px;">ID Discord: ${t.discord_id||`—`}</div>
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
    `,document.getElementById(`painel-unlock-master-form`)?.addEventListener(`submit`,n=>{n.preventDefault();let r=document.getElementById(`painel-unlock-pass`)?.value.trim(),i=document.getElementById(`painel-unlock-error`);if(r===`199425`||r===`cidadealta123`||r===`admin`){t.is_admin=!0,t.role=`admin`,localStorage.setItem(`malaca_user_profile`,JSON.stringify(t)),sessionStorage.setItem(`malaca_admin_master_session`,`true`),localStorage.setItem(`malaca_admin_master_session`,`true`);let n=JSON.parse(localStorage.getItem(`malaca_admin_discord_accounts`)||`[]`),r=p(t)||t.discord_id;r&&!n.includes(r)&&(n.push(r),localStorage.setItem(`malaca_admin_discord_accounts`,JSON.stringify(n))),E(e)}else i&&(i.style.display=`block`)}),document.getElementById(`btn-switch-account-painel`)?.addEventListener(`click`,async()=>{await n.auth.signOut(),localStorage.removeItem(`malaca_user_profile`),T()})}function w(e,t){e.innerHTML=`
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
    `,document.getElementById(`btn-banned-logout-painel`)?.addEventListener(`click`,async()=>{await n.auth.signOut(),localStorage.removeItem(`malaca_user_profile`),window.location.href=`/`})}async function T(){try{let e=document.getElementById(`btn-login-discord-painel`);e&&(e.disabled=!0,e.innerHTML=`<i class="fa-solid fa-spinner fa-spin"></i> Redirecionando para o Discord...`);let t=window.location.origin;(window.location.hostname.includes(`cda.malaca.com.br`)||window.location.hostname.includes(`malaca.com.br`))&&(t=`https://cda.malaca.com.br`);let r=t+`/painel/`,{error:i}=await n.auth.signInWithOAuth({provider:`discord`,options:{redirectTo:r,scopes:`identify email`}});if(i)throw i}catch(e){alert(`Erro ao conectar com o Discord: `+(e.message||`Tente novamente.`));let t=document.getElementById(`btn-login-discord-painel`);t&&(t.disabled=!1,t.innerHTML=`<i class="fa-brands fa-discord" style="font-size: 1.2rem;"></i> ENTRAR COM O DISCORD`)}}function E(e){let t=b(a);e.innerHTML=`
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
                    <img src="${a.avatar_url||`https://cdn.discordapp.com/embed/avatars/0.png`}" class="painel-admin-avatar" alt="Avatar" />
                    <div class="painel-admin-info">
                        <span class="painel-admin-name">${a.username||`Admin`}</span>
                        <span class="painel-admin-role">${t?`SUPERADMIN • FUNDADOR`:`ADMINISTRADOR`}</span>
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

                <button class="painel-nav-item ${o===`dashboard`?`active`:``}" data-tab="dashboard">
                    <i class="fa-solid fa-chart-pie"></i>
                    <span>Dashboard</span>
                </button>

                <button class="painel-nav-item ${o===`users`?`active`:``}" data-tab="users">
                    <i class="fa-solid fa-users"></i>
                    <span>Usuários & Cargos</span>
                    <span class="painel-nav-badge" id="badge-users-count">—</span>
                </button>

                <button class="painel-nav-item ${o===`andarilho`?`active`:``}" data-tab="andarilho">
                    <i class="fa-solid fa-person-walking"></i>
                    <span>Andarilho & Mapa</span>
                </button>

                <div class="painel-nav-category">ECOSSISTEMA RP</div>

                <button class="painel-nav-item ${o===`cities`?`active`:``}" data-tab="cities">
                    <i class="fa-solid fa-city"></i>
                    <span>Cidades / Servidores</span>
                    <span class="painel-nav-badge" id="badge-cities-count">—</span>
                </button>

                <button class="painel-nav-item ${o===`systems`?`active`:``}" data-tab="systems">
                    <i class="fa-solid fa-layer-group"></i>
                    <span>Sistemas & Minijogos</span>
                    <span class="painel-nav-badge" id="badge-systems-count">—</span>
                </button>

                <div class="painel-nav-category">SISTEMA</div>

                <button class="painel-nav-item ${o===`settings`?`active`:``}" data-tab="settings">
                    <i class="fa-solid fa-gear"></i>
                    <span>Configurações Globais</span>
                </button>
            </aside>

            <main class="painel-content" id="painel-tab-content">
                <!-- Conteúdo da aba ativa -->
            </main>
        </div>
    `,document.querySelectorAll(`.painel-nav-item`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.getAttribute(`data-tab`);t&&D(t)})}),document.getElementById(`btn-painel-logout`)?.addEventListener(`click`,async()=>{confirm(`Deseja realmente encerrar a sessão de administrador?`)&&(await n.auth.signOut(),localStorage.removeItem(`malaca_user_profile`),window.location.href=`/`)}),O(),D(o)}function D(e){o=e,document.querySelectorAll(`.painel-nav-item`).forEach(t=>{t.classList.toggle(`active`,t.getAttribute(`data-tab`)===e)});let t=document.getElementById(`painel-tab-content`);t&&(e===`dashboard`?k(t):e===`users`?A(t):e===`andarilho`?P(t):e===`cities`?F(t):e===`systems`?I(t):e===`settings`&&L(t))}async function O(){try{let{data:e}=await n.from(`profiles`).select(`*`).order(`created_at`,{ascending:!1});if(e){s=e;let t=document.getElementById(`badge-users-count`);t&&(t.textContent=e.length)}let{data:t}=await n.from(`servers`).select(`*`).order(`created_at`,{ascending:!0});if(t){c=t;let e=document.getElementById(`badge-cities-count`);e&&(e.textContent=t.length)}let{data:r}=await n.from(`systems`).select(`*`).order(`created_at`,{ascending:!0});if(r){l=r;let e=document.getElementById(`badge-systems-count`);e&&(e.textContent=r.length)}if(o===`dashboard`){let e=document.getElementById(`painel-tab-content`);e&&k(e)}else o===`users`&&M()}catch(e){console.warn(`Erro ao carregar dados do dashboard:`,e)}}function k(e){e.innerHTML=`
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
                <div class="painel-stat-value" style="color: #38bdf8;">${s.length||0}</div>
                <div class="painel-stat-sub">${s.filter(e=>e.is_admin===!0||r.includes(e.discord_id)).length} Administradores • ${s.filter(e=>v(e)).length} Banidos</div>
            </div>

            <div class="painel-stat-card">
                <div class="painel-stat-label"><i class="fa-solid fa-city" style="color: #ffc046;"></i> Cidades Ativas</div>
                <div class="painel-stat-value" style="color: #ffc046;">${c.length||3}</div>
                <div class="painel-stat-sub">CDA, Valley GG, Los Santos</div>
            </div>

            <div class="painel-stat-card">
                <div class="painel-stat-label"><i class="fa-solid fa-layer-group" style="color: #10b981;"></i> Sistemas e Minijogos</div>
                <div class="painel-stat-value" style="color: #10b981;">${l.length||4}</div>
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
    `}function A(e){e.innerHTML=`
        <div class="painel-page-title-area">
            <div>
                <h1 class="painel-page-title">GESTÃO DE USUÁRIOS & ADMINS</h1>
                <p class="painel-page-desc">Controle rigoroso de privilégios, promoções, banimentos e auditoria de perfis.</p>
            </div>
            <div style="display: flex; gap: 12px; align-items: center;">
                <div class="painel-search-box">
                    <i class="fa-solid fa-magnifying-glass" style="color: #64748b;"></i>
                    <input type="text" id="painel-user-search" class="painel-search-input" placeholder="Buscar por nick, nome ou ID Discord..." value="${u}" />
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
    `,document.getElementById(`painel-user-search`)?.addEventListener(`input`,e=>{u=e.target.value.toLowerCase().trim(),M()}),j()}async function j(){try{let{data:e,error:t}=await n.from(`profiles`).select(`*`).order(`created_at`,{ascending:!1});if(!t&&Array.isArray(e)){let t=h();s=e.filter(e=>{let n=String(e.discord_id||``).trim(),r=String(e.id||``).trim();return!t.includes(n)&&!t.includes(r)});let n=document.getElementById(`badge-users-count`);n&&(n.textContent=s.length)}}catch{}M()}function M(){let e=document.getElementById(`painel-users-list-container`);if(!e)return;let t=s;if(u&&(t=t.filter(e=>{let t=(e.full_name||``).toLowerCase(),n=(e.username||``).toLowerCase(),r=(e.discord_id||``).toLowerCase();return t.includes(u)||n.includes(u)||r.includes(u)})),t.length===0){e.innerHTML=`
            <div style="padding: 40px; text-align: center; color: #64748b; grid-column: 1 / -1;">
                <i class="fa-solid fa-user-slash" style="font-size: 32px; margin-bottom: 12px; display: block; color: #475569;"></i>
                Nenhum usuário encontrado com os termos pesquisados.
            </div>
        `;return}e.innerHTML=t.map(e=>{let t=String(e.discord_id||``).trim(),n=r.includes(t)||r.includes(String(e.id||``)),i=e.is_admin===!0||n,a=v(e),o=String(e.id||``).replace(/'/g,`\\'`),s=String(t||``).replace(/'/g,`\\'`),c=``;return c=n?`<span class="badge-fundador"><i class="fa-solid fa-crown"></i> FUNDADOR</span>`:a?`<span class="badge-banido"><i class="fa-solid fa-ban"></i> BANIDO</span>`:i?`<span class="badge-admin"><i class="fa-solid fa-shield"></i> ADMIN</span>`:`<span class="badge-user">USUÁRIO</span>`,`
            <div class="painel-user-card" id="user-card-${e.id}">
                <div class="painel-user-header">
                    <img src="${e.avatar_url||`https://cdn.discordapp.com/embed/avatars/0.png`}" class="painel-user-avatar" alt="Avatar" />
                    <div class="painel-user-details">
                        <div class="painel-user-name">
                            <span>${e.full_name||e.username||`Sem Nome`}</span>
                            ${c}
                        </div>
                        <div class="painel-user-username">@${e.username||`discord_user`}</div>
                        <div class="painel-user-meta">ID Discord: ${t||`—`}</div>
                    </div>
                </div>

                <div class="painel-user-actions">
                    ${n?`
                        <button class="btn-action btn-promote" disabled style="opacity: 0.6; cursor: not-allowed; width: 100%;">
                            <i class="fa-solid fa-lock"></i> SUPERADMIN INATO
                        </button>
                    `:`
                        ${i?`
                            <button class="btn-action btn-demote" onclick="window.painelToggleAdmin('${o}', '${s}', false)">
                                <i class="fa-solid fa-user-minus"></i> REMOVER ADMIN
                            </button>
                        `:`
                            <button class="btn-action btn-promote" onclick="window.painelToggleAdmin('${o}', '${s}', true)">
                                <i class="fa-solid fa-user-shield"></i> PROMOVER ADMIN
                            </button>
                        `}

                        ${a?`
                            <button class="btn-action btn-unban" onclick="window.painelToggleBan('${o}', '${s}', false)">
                                <i class="fa-solid fa-check"></i> DESBANIR
                            </button>
                        `:`
                            <button class="btn-action btn-ban" onclick="window.painelToggleBan('${o}', '${s}', true)">
                                <i class="fa-solid fa-ban"></i> BANIR
                            </button>
                        `}

                        <button class="btn-delete" title="Excluir Perfil" onclick="window.painelDeleteUser('${o}', '${s}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    `}
                </div>
            </div>
        `}).join(``)}function N(e,t=`success`){let n=document.getElementById(`painel-floating-toast`);n&&n.remove();let r=document.createElement(`div`);r.id=`painel-floating-toast`;let i=t===`error`?`rgba(239, 68, 68, 0.95)`:t===`warning`?`rgba(245, 158, 11, 0.95)`:`rgba(16, 185, 129, 0.95)`,a=t===`error`?`fa-triangle-exclamation`:t===`warning`?`fa-circle-exclamation`:`fa-circle-check`;r.style.cssText=`position: fixed; top: 24px; left: 50%; transform: translateX(-50%); background: ${i}; color: #ffffff; padding: 12px 24px; border-radius: 12px; font-weight: 800; font-size: 13px; z-index: 999999; box-shadow: 0 10px 30px rgba(0,0,0,0.5); backdrop-filter: blur(10px); display: flex; align-items: center; gap: 10px; transition: all 0.3s ease;`,r.innerHTML=`<i class="fa-solid ${a}"></i> <span>${e}</span>`,document.body.appendChild(r),setTimeout(()=>{r.style.opacity=`0`,r.style.transform=`translate(-50%, -10px)`,setTimeout(()=>r.remove(),350)},3500)}window.painelToggleAdmin=async function(e,t,i){let a=t&&t!==`—`&&t!==`undefined`?String(t).trim():``,o=e&&e!==`undefined`?String(e).trim():``;if((a&&r.includes(a)||o&&r.includes(o))&&!i){N(`O Fundador Superadmin não pode ser rebaixado.`,`warning`);return}try{let e={is_admin:i,role:i?`admin`:`user`};i&&(e.is_banned=!1);let t=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(o),r=!1;if(t){let{error:t}=await n.from(`profiles`).update(e).eq(`id`,o);t||(r=!0)}if(a){let{error:t}=await n.from(`profiles`).update(e).eq(`discord_id`,a);t||(r=!0)}!r&&o&&await n.from(`profiles`).update(e).eq(`id`,o);let c=JSON.parse(localStorage.getItem(`malaca_admin_discord_accounts`)||`[]`),l=a||o;if(i?(l&&!c.includes(l)&&c.push(l),o&&!c.includes(o)&&c.push(o)):c=c.filter(e=>e!==a&&e!==o),localStorage.setItem(`malaca_admin_discord_accounts`,JSON.stringify(c)),i){let e=f();e=e.filter(e=>e!==a&&e!==o),localStorage.setItem(`malaca_banned_discord_accounts`,JSON.stringify(e))}try{let e=JSON.parse(localStorage.getItem(`malaca_cached_profiles`)||`[]`);e=e.map(e=>e.id===o||a&&e.discord_id===a?{...e,is_admin:i,role:i?`admin`:`user`,...i?{is_banned:!1}:{}}:e),localStorage.setItem(`malaca_cached_profiles`,JSON.stringify(e))}catch{}try{let e=localStorage.getItem(`malaca_user_profile`);if(e){let t=JSON.parse(e);(t.id===o||a&&t.discord_id===a)&&(t.is_admin=i,t.role=i?`admin`:`user`,i&&(t.is_banned=!1),localStorage.setItem(`malaca_user_profile`,JSON.stringify(t)))}}catch{}s=s.map(e=>e.id===o||a&&e.discord_id===a?{...e,is_admin:i,role:i?`admin`:`user`,...i?{is_banned:!1}:{}}:e);try{d.send({type:`broadcast`,event:`user_permission_updated`,payload:{userId:o,discordId:a,isAdmin:i}})}catch{}M(),N(`Usuário ${i?`PROMOVIDO A ADMINISTRADOR`:`REMOVIDO DA ADMINISTRAÇÃO`} com sucesso!`)}catch(e){N(`Falha ao atualizar permissões de administrador: `+(e.message||e),`error`)}},window.painelToggleBan=async function(e,t,i){let a=t&&t!==`—`&&t!==`undefined`?String(t).trim():``,o=e&&e!==`undefined`?String(e).trim():``;if(a&&r.includes(a)||o&&r.includes(o)){N(`O Fundador Superadmin não pode ser banido.`,`warning`);return}if(confirm(`Tem certeza que deseja ${(i?`banir`:`desbanir`).toUpperCase()} este usuário?`))try{let e={is_banned:i,role:i?`banned`:`user`,...i?{is_admin:!1}:{}},t=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(o);try{if(t){let t=await n.from(`profiles`).update(e).eq(`id`,o);t.error&&(t.error.message||``).includes(`is_banned`)&&(delete e.is_banned,await n.from(`profiles`).update(e).eq(`id`,o))}if(a){let t=await n.from(`profiles`).update(e).eq(`discord_id`,a);t.error&&(t.error.message||``).includes(`is_banned`)&&(delete e.is_banned,await n.from(`profiles`).update(e).eq(`discord_id`,a))}}catch(e){console.warn(`Erro ao sincronizar banimento no banco:`,e)}let r=f();if(i?(a&&!r.includes(a)&&r.push(a),o&&!r.includes(o)&&r.push(o)):r=r.filter(e=>e!==a&&e!==o),localStorage.setItem(`malaca_banned_discord_accounts`,JSON.stringify(r)),i){let e=JSON.parse(localStorage.getItem(`malaca_admin_discord_accounts`)||`[]`);e=e.filter(e=>e!==a&&e!==o),localStorage.setItem(`malaca_admin_discord_accounts`,JSON.stringify(e))}try{let e=JSON.parse(localStorage.getItem(`malaca_cached_profiles`)||`[]`);e=e.map(e=>e.id===o||a&&e.discord_id===a?{...e,is_banned:i,is_admin:!i&&e.is_admin,role:i?`banned`:e.is_admin?`admin`:`user`}:e),localStorage.setItem(`malaca_cached_profiles`,JSON.stringify(e))}catch{}try{let e=localStorage.getItem(`malaca_user_profile`);if(e){let t=JSON.parse(e);(t.id===o||a&&t.discord_id===a)&&(t.is_banned=i,i&&(t.is_admin=!1,t.role=`banned`),localStorage.setItem(`malaca_user_profile`,JSON.stringify(t)))}}catch{}s=s.map(e=>e.id===o||a&&e.discord_id===a?{...e,is_banned:i,is_admin:!i&&e.is_admin,role:i?`banned`:e.is_admin?`admin`:`user`}:e);try{d.send({type:`broadcast`,event:`user_ban_updated`,payload:{userId:o,discordId:a,isBanned:i}})}catch{}M(),N(`Usuário ${i?`BANIDO`:`DESBANIDO`} com sucesso!`,i?`warning`:`success`)}catch(e){N(`Falha ao alterar banimento: `+(e.message||e),`error`)}},window.painelDeleteUser=async function(e,t){let i=t&&t!==`—`&&t!==`undefined`?String(t).trim():``,a=e&&e!==`undefined`?String(e).trim():``;if(i&&r.includes(i)||a&&r.includes(a)){N(`O Fundador Superadmin não pode ser excluído.`,`warning`);return}if(confirm(`Deseja realmente EXCLUIR este usuário da plataforma? Esta ação é definitiva.`))try{await g(a,i);let e=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(a),t=!1;if(e){let{error:e}=await n.from(`profiles`).delete().eq(`id`,a);e||(t=!0)}if(i){let{error:e}=await n.from(`profiles`).delete().eq(`discord_id`,i);e||(t=!0)}!t&&a&&await n.from(`profiles`).delete().eq(`id`,a);try{let e=JSON.parse(localStorage.getItem(`malaca_cached_profiles`)||`[]`);e=e.filter(e=>e.id!==a&&e.discord_id!==i&&e.discord_id!==a),localStorage.setItem(`malaca_cached_profiles`,JSON.stringify(e));let t=JSON.parse(localStorage.getItem(`malaca_admin_discord_accounts`)||`[]`);t=t.filter(e=>e!==i&&e!==a),localStorage.setItem(`malaca_admin_discord_accounts`,JSON.stringify(t));let n=JSON.parse(localStorage.getItem(`malaca_banned_discord_accounts`)||`[]`);n=n.filter(e=>e!==i&&e!==a),localStorage.setItem(`malaca_banned_discord_accounts`,JSON.stringify(n));let r=localStorage.getItem(`malaca_user_profile`);if(r){let e=JSON.parse(r);if(e.id===a||e.discord_id===i){await _(`Sua conta foi excluída com sucesso.`);return}}}catch{}s=s.filter(e=>e.id!==a&&(!i||e.discord_id!==i));let r=document.getElementById(`badge-users-count`);r&&(r.textContent=s.length);try{d.send({type:`broadcast`,event:`force_user_logout`,payload:{id:a,discordId:i,timestamp:Date.now()}}),d.send({type:`broadcast`,event:`user_deleted`,payload:{id:a,discordId:i}}),d.send({type:`broadcast`,event:`entity_sync`,payload:{entity:`profiles`,action:`DELETE`,id:a,discordId:i,timestamp:Date.now()}})}catch{}M(),N(`Usuário excluído com sucesso da plataforma.`)}catch(e){N(`Falha ao excluir usuário: `+(e.message||e),`error`)}};function P(e){e.innerHTML=`
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
    `}window.painelTriggerCycleChange=function(){alert(`Virada de ciclo disparada com sucesso! Coordenadas do Andarilho sincronizadas.`)};function F(e){e.innerHTML=`
        <div class="painel-page-title-area">
            <div>
                <h1 class="painel-page-title">CIDADES & SERVIDORES</h1>
                <p class="painel-page-desc">Gerenciamento dos servidores integrados ao ecossistema Malaca System GTARP.</p>
            </div>
        </div>

        <div class="painel-users-grid">
            ${(c.length>0?c:[{id:`cda-server-uuid`,slug:`cda`,name:`CIDADE ALTA RP (CDA)`,subtitle:`SERVIDORES OFICIAIS`,description:`Mapa Interativo em tempo real para os servidores CDA e VALLEY com virada do Andarilho, além de Lockpick, Caixinha e Hacking.`},{id:`valley-server-uuid`,slug:`valley`,name:`VALLEY RP`,subtitle:`SERVIDOR VALLEY GG`,description:`Mapa completo e ferramentas dedicadas para a comunidade do servidor Valley GG.`},{id:`ls-server-uuid`,slug:`los-santos`,name:`LOS SANTOS ROLEPLAY`,subtitle:`SERVIDOR MULTI-CIDADE`,description:`Hub de simuladores e mapas para servidores tradicionais de Los Santos.`}]).map(e=>`
                <div class="painel-card" style="margin-bottom: 0;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                        <span class="badge-admin" style="font-family: monospace;">/${e.slug}/</span>
                        <span style="font-size: 10px; color: #10b981; font-weight: 800;"><i class="fa-solid fa-circle" style="font-size: 8px;"></i> ATIVO</span>
                    </div>
                    <h3 style="font-family: var(--font-heading); font-size: 1.15rem; color: #fff; margin-bottom: 4px;">${e.name}</h3>
                    <p style="color: #ffc046; font-size: 11px; font-weight: 700; margin-bottom: 12px;">${e.subtitle||`SERVIDOR RP`}</p>
                    <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin-bottom: 16px;">${e.description||`Sem descrição cadastrada.`}</p>
                    <div style="display: flex; gap: 8px;">
                        <a href="/cidades/${e.slug}/" target="_blank" class="painel-btn-secondary" style="flex: 1; justify-content: center;">
                            <i class="fa-solid fa-arrow-up-right-from-square"></i> Acessar Cidade
                        </a>
                    </div>
                </div>
            `).join(``)}
        </div>
    `}function I(e){e.innerHTML=`
        <div class="painel-page-title-area">
            <div>
                <h1 class="painel-page-title">SISTEMAS & MINIJOGOS</h1>
                <p class="painel-page-desc">Módulos de simulação e treinamento para a comunidade de GTA Roleplay.</p>
            </div>
        </div>

        <div class="painel-users-grid">
            ${[{id:`sys-mapa`,name:`MAPA INTERATIVO RP`,desc:`Rastreamento colaborativo em tempo real de hospitais, desmanches, mercado ilegal e virada do Andarilho.`,url:`/cidades/cda/mapa/`},{id:`sys-lockpick`,name:`LOCKPICK SIMULATOR`,desc:`Simulador de arrombamento de veículos e portas com sistema de 32 pinos mecânicos.`,url:`/cidades/cda/lockpick/`},{id:`sys-caixinha`,name:`CAIXINHA ELETRÔNICO`,desc:`Minijogo de reflexos e velocidade de digitação para arrombamento de caixas registradoras.`,url:`/cidades/cda/caixinha/`},{id:`sys-hacking`,name:`HACKING DEVICE`,desc:`Decodificador de segurança cibernética estilo Cayo Perico com matriz de sequências numéricas.`,url:`/cidades/cda/hacking/`}].map(e=>`
                <div class="painel-card" style="margin-bottom: 0;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                        <span class="badge-admin">MÓDULO ATIVO</span>
                        <span style="font-size: 11px; color: #ffc046; font-weight: 800;">5.0 ⭐</span>
                    </div>
                    <h3 style="font-family: var(--font-heading); font-size: 1.15rem; color: #fff; margin-bottom: 8px;">${e.name}</h3>
                    <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin-bottom: 16px;">${e.desc}</p>
                    <a href="${e.url}" target="_blank" class="painel-btn-secondary" style="width: 100%; justify-content: center;">
                        <i class="fa-solid fa-play"></i> Testar Sistema
                    </a>
                </div>
            `).join(``)}
        </div>
    `}function L(e){e.innerHTML=`
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
                        <span style="color: #fff; font-family: monospace;">${t}</span>
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
    `}window.painelClearCaches=function(){localStorage.removeItem(`malaca_custom_servers`),localStorage.removeItem(`malaca_custom_systems`),localStorage.removeItem(`malaca_admin_users_cache`),alert(`Caches da plataforma limpos com sucesso! Dados sincronizados.`),O()},window.painelRefreshData=function(){O()},window.painelSwitchTab=function(e){D(e)},document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,x):x();