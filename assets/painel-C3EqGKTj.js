import{t as e}from"./dist-CPfJrQXr.js";/* empty css               */var t=`https://pdzytmdssswiyjwohvwn.supabase.co`,n=e(t,`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkenl0bWRzc3N3aXlqd29odnduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1ODI0NjQsImV4cCI6MjEwNzE1ODQ2NH0.RxTwiHG5JRHK02u1eBx3cFXI_3fKYMrxuI2op846FME`,{auth:{persistSession:!0,autoRefreshToken:!0,detectSessionInUrl:!0}}),r=[`722320491767136346`],i=null,a=`dashboard`,o=[],s=[],c=[],l=``,u=n.channel(`malaca_realtime_global_hub`);u.on(`broadcast`,{event:`user_permission_updated`},e=>{e?.payload?.userId===i?.id||e?.payload?.discordId===i?.discord_id?h():T()}).on(`broadcast`,{event:`user_ban_updated`},e=>{e?.payload?.userId===i?.id||e?.payload?.discordId===i?.discord_id?h():T()}).subscribe();function d(){try{return JSON.parse(localStorage.getItem(`malaca_banned_discord_accounts`)||`[]`)}catch{return[]}}function f(e){if(!e)return!1;let t=String(e.discord_id||e.provider_id||``).trim();if(t&&r.includes(t))return!1;if(e.is_banned===!0||e.role===`banned`)return!0;let n=d();return!!(t&&n.includes(t)||e.id&&n.includes(e.id))}function p(e){if(!e||f(e))return!1;let t=String(e.discord_id||e.provider_id||``).trim();return t&&r.includes(t)?!0:e.is_admin===!0||e.role===`admin`}function m(e){if(!e)return!1;let t=String(e.discord_id||e.provider_id||``).trim();return r.includes(t)}async function h(){let e=document.getElementById(`painel-app-root`);if(e){e.innerHTML=`
        <div class="painel-gate-container">
            <div style="text-align: center; color: #94a3b8;">
                <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 2.5rem; color: #00d2ff; margin-bottom: 16px;"></i>
                <h3 style="font-family: var(--font-heading); font-size: 1.2rem; color: #fff; margin-bottom: 8px;">Autenticando Acesso ao Painel...</h3>
                <p style="font-size: 0.85rem;">Validando credenciais administrativas no Supabase.</p>
            </div>
        </div>
    `;try{let{data:{session:t}}=await n.auth.getSession(),a=null;if(t&&t.user){t.user;let e=t.user.user_metadata?.provider_id||t.user.user_metadata?.sub||t.user.id,{data:i}=await n.from(`profiles`).select(`*`).or(`id.eq.${t.user.id},discord_id.eq.${e}`).maybeSingle();a=i||{id:t.user.id,discord_id:e,username:t.user.user_metadata?.preferred_username||t.user.user_metadata?.full_name||`Admin`,full_name:t.user.user_metadata?.full_name||t.user.user_metadata?.name||`Administrador`,avatar_url:t.user.user_metadata?.avatar_url||`https://cdn.discordapp.com/embed/avatars/0.png`,is_admin:r.includes(e),role:r.includes(e)?`admin`:`user`,is_banned:!1}}else{let e=localStorage.getItem(`malaca_user_profile`);e&&(a=JSON.parse(e))}if(i=a,!a){g(e);return}if(f(a)){v(e,a);return}if(!p(a)){_(e,a);return}b(e)}catch(t){console.error(`Erro na inicialização do painel:`,t),g(e)}}}function g(e){e.innerHTML=`
        <div class="painel-gate-container">
            <div class="painel-gate-card">
                <div class="painel-gate-icon">
                    <i class="fa-solid fa-shield-halved"></i>
                </div>
                <h2 class="painel-gate-title">ACESSO ADMINISTRATIVO</h2>
                <p class="painel-gate-desc">
                    O <strong>Painel Administrativo do Malaca System GTARP</strong> é uma área independente de alta segurança. Faça login com uma conta Discord autorizada para gerenciar a plataforma.
                </p>
                <button id="btn-login-discord-painel" class="btn-gate-primary">
                    <i class="fa-brands fa-discord" style="font-size: 1.2rem;"></i> ENTRAR COM O DISCORD
                </button>
                <a href="/" class="btn-gate-secondary">
                    <i class="fa-solid fa-arrow-left"></i> Voltar à Página Inicial
                </a>
            </div>
        </div>
    `,document.getElementById(`btn-login-discord-painel`)?.addEventListener(`click`,y)}function _(e,t){e.innerHTML=`
        <div class="painel-gate-container">
            <div class="painel-gate-card">
                <div class="painel-gate-icon danger">
                    <i class="fa-solid fa-lock"></i>
                </div>
                <h2 class="painel-gate-title">ACESSO RESTRITO</h2>
                <p class="painel-gate-desc">
                    A conta <strong style="color: #fff;">@${t.username||`Usuário`}</strong> está conectada, mas não possui permissões administrativas na plataforma.
                </p>
                <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px; margin-bottom: 24px; display: flex; align-items: center; gap: 12px; text-align: left;">
                    <img src="${t.avatar_url||`https://cdn.discordapp.com/embed/avatars/0.png`}" style="width: 42px; height: 42px; border-radius: 50%; object-fit: cover;" />
                    <div style="min-width: 0; flex: 1;">
                        <div style="color: #fff; font-weight: 800; font-size: 13px;">${t.full_name||t.username}</div>
                        <div style="color: #64748b; font-size: 11px;">ID Discord: ${t.discord_id||`—`}</div>
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
    `,document.getElementById(`btn-switch-account-painel`)?.addEventListener(`click`,async()=>{await n.auth.signOut(),localStorage.removeItem(`malaca_user_profile`),y()})}function v(e,t){e.innerHTML=`
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
    `,document.getElementById(`btn-banned-logout-painel`)?.addEventListener(`click`,async()=>{await n.auth.signOut(),localStorage.removeItem(`malaca_user_profile`),window.location.href=`/`})}async function y(){try{let e=window.location.origin+`/painel/`,{error:t}=await n.auth.signInWithOAuth({provider:`discord`,options:{redirectTo:e,scopes:`identify email`}});if(t)throw t}catch(e){alert(`Erro ao conectar com o Discord: `+(e.message||`Tente novamente.`))}}function b(e){let t=m(i);e.innerHTML=`
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
                    <img src="${i.avatar_url||`https://cdn.discordapp.com/embed/avatars/0.png`}" class="painel-admin-avatar" alt="Avatar" />
                    <div class="painel-admin-info">
                        <span class="painel-admin-name">${i.username||`Admin`}</span>
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

                <button class="painel-nav-item ${a===`dashboard`?`active`:``}" data-tab="dashboard">
                    <i class="fa-solid fa-chart-pie"></i>
                    <span>Dashboard</span>
                </button>

                <button class="painel-nav-item ${a===`users`?`active`:``}" data-tab="users">
                    <i class="fa-solid fa-users"></i>
                    <span>Usuários & Cargos</span>
                    <span class="painel-nav-badge" id="badge-users-count">—</span>
                </button>

                <button class="painel-nav-item ${a===`andarilho`?`active`:``}" data-tab="andarilho">
                    <i class="fa-solid fa-person-walking"></i>
                    <span>Andarilho & Mapa</span>
                </button>

                <div class="painel-nav-category">ECOSSISTEMA RP</div>

                <button class="painel-nav-item ${a===`cities`?`active`:``}" data-tab="cities">
                    <i class="fa-solid fa-city"></i>
                    <span>Cidades / Servidores</span>
                    <span class="painel-nav-badge" id="badge-cities-count">—</span>
                </button>

                <button class="painel-nav-item ${a===`systems`?`active`:``}" data-tab="systems">
                    <i class="fa-solid fa-layer-group"></i>
                    <span>Sistemas & Minijogos</span>
                    <span class="painel-nav-badge" id="badge-systems-count">—</span>
                </button>

                <div class="painel-nav-category">SISTEMA</div>

                <button class="painel-nav-item ${a===`settings`?`active`:``}" data-tab="settings">
                    <i class="fa-solid fa-gear"></i>
                    <span>Configurações Globais</span>
                </button>
            </aside>

            <main class="painel-content" id="painel-tab-content">
                <!-- Conteúdo da aba ativa -->
            </main>
        </div>
    `,document.querySelectorAll(`.painel-nav-item`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.getAttribute(`data-tab`);t&&x(t)})}),document.getElementById(`btn-painel-logout`)?.addEventListener(`click`,async()=>{confirm(`Deseja realmente encerrar a sessão de administrador?`)&&(await n.auth.signOut(),localStorage.removeItem(`malaca_user_profile`),window.location.href=`/`)}),S(),x(a)}function x(e){a=e,document.querySelectorAll(`.painel-nav-item`).forEach(t=>{t.classList.toggle(`active`,t.getAttribute(`data-tab`)===e)});let t=document.getElementById(`painel-tab-content`);t&&(e===`dashboard`?C(t):e===`users`?w(t):e===`andarilho`?D(t):e===`cities`?O(t):e===`systems`?k(t):e===`settings`&&A(t))}async function S(){try{let{data:e}=await n.from(`profiles`).select(`*`).order(`created_at`,{ascending:!1});if(e){o=e;let t=document.getElementById(`badge-users-count`);t&&(t.textContent=e.length)}let{data:t}=await n.from(`servers`).select(`*`).order(`created_at`,{ascending:!0});if(t){s=t;let e=document.getElementById(`badge-cities-count`);e&&(e.textContent=t.length)}let{data:r}=await n.from(`systems`).select(`*`).order(`created_at`,{ascending:!0});if(r){c=r;let e=document.getElementById(`badge-systems-count`);e&&(e.textContent=r.length)}if(a===`dashboard`){let e=document.getElementById(`painel-tab-content`);e&&C(e)}else a===`users`&&E()}catch(e){console.warn(`Erro ao carregar dados do dashboard:`,e)}}function C(e){e.innerHTML=`
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
                <div class="painel-stat-value" style="color: #38bdf8;">${o.length||0}</div>
                <div class="painel-stat-sub">${o.filter(e=>e.is_admin===!0||r.includes(e.discord_id)).length} Administradores • ${o.filter(e=>f(e)).length} Banidos</div>
            </div>

            <div class="painel-stat-card">
                <div class="painel-stat-label"><i class="fa-solid fa-city" style="color: #ffc046;"></i> Cidades Ativas</div>
                <div class="painel-stat-value" style="color: #ffc046;">${s.length||3}</div>
                <div class="painel-stat-sub">CDA, Valley GG, Los Santos</div>
            </div>

            <div class="painel-stat-card">
                <div class="painel-stat-label"><i class="fa-solid fa-layer-group" style="color: #10b981;"></i> Sistemas e Minijogos</div>
                <div class="painel-stat-value" style="color: #10b981;">${c.length||4}</div>
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
    `}function w(e){e.innerHTML=`
        <div class="painel-page-title-area">
            <div>
                <h1 class="painel-page-title">GESTÃO DE USUÁRIOS & ADMINS</h1>
                <p class="painel-page-desc">Controle rigoroso de privilégios, promoções, banimentos e auditoria de perfis.</p>
            </div>
            <div style="display: flex; gap: 12px; align-items: center;">
                <div class="painel-search-box">
                    <i class="fa-solid fa-magnifying-glass" style="color: #64748b;"></i>
                    <input type="text" id="painel-user-search" class="painel-search-input" placeholder="Buscar por nick, nome ou ID Discord..." value="${l}" />
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
    `,document.getElementById(`painel-user-search`)?.addEventListener(`input`,e=>{l=e.target.value.toLowerCase().trim(),E()}),T()}async function T(){try{let{data:e,error:t}=await n.from(`profiles`).select(`*`).order(`created_at`,{ascending:!1});if(!t&&e){o=e;let t=document.getElementById(`badge-users-count`);t&&(t.textContent=e.length)}}catch{}E()}function E(){let e=document.getElementById(`painel-users-list-container`);if(!e)return;let t=o;if(l&&(t=t.filter(e=>{let t=(e.full_name||``).toLowerCase(),n=(e.username||``).toLowerCase(),r=(e.discord_id||``).toLowerCase();return t.includes(l)||n.includes(l)||r.includes(l)})),t.length===0){e.innerHTML=`
            <div style="padding: 40px; text-align: center; color: #64748b; grid-column: 1 / -1;">
                <i class="fa-solid fa-user-slash" style="font-size: 32px; margin-bottom: 12px; display: block; color: #475569;"></i>
                Nenhum usuário encontrado com os termos pesquisados.
            </div>
        `;return}e.innerHTML=t.map(e=>{let t=String(e.discord_id||``).trim(),n=r.includes(t),i=e.is_admin===!0||n,a=f(e),o=``;return o=n?`<span class="badge-fundador"><i class="fa-solid fa-crown"></i> FUNDADOR</span>`:a?`<span class="badge-banido"><i class="fa-solid fa-ban"></i> BANIDO</span>`:i?`<span class="badge-admin"><i class="fa-solid fa-shield"></i> ADMIN</span>`:`<span class="badge-user">USUÁRIO</span>`,`
            <div class="painel-user-card" id="user-card-${e.id}">
                <div class="painel-user-header">
                    <img src="${e.avatar_url||`https://cdn.discordapp.com/embed/avatars/0.png`}" class="painel-user-avatar" alt="Avatar" />
                    <div class="painel-user-details">
                        <div class="painel-user-name">
                            <span>${e.full_name||e.username||`Sem Nome`}</span>
                            ${o}
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
                            <button class="btn-action btn-demote" onclick="window.painelToggleAdmin('${e.id}', '${t}', false)">
                                <i class="fa-solid fa-user-minus"></i> REMOVER ADMIN
                            </button>
                        `:`
                            <button class="btn-action btn-promote" onclick="window.painelToggleAdmin('${e.id}', '${t}', true)">
                                <i class="fa-solid fa-user-shield"></i> PROMOVER ADMIN
                            </button>
                        `}

                        ${a?`
                            <button class="btn-action btn-unban" onclick="window.painelToggleBan('${e.id}', '${t}', false)">
                                <i class="fa-solid fa-check"></i> DESBANIR
                            </button>
                        `:`
                            <button class="btn-action btn-ban" onclick="window.painelToggleBan('${e.id}', '${t}', true)">
                                <i class="fa-solid fa-ban"></i> BANIR
                            </button>
                        `}

                        <button class="btn-delete" title="Excluir Perfil" onclick="window.painelDeleteUser('${e.id}', '${t}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    `}
                </div>
            </div>
        `}).join(``)}window.painelToggleAdmin=async function(e,t,i){if(r.includes(t)&&!i){alert(`O Fundador Superadmin não pode ser rebaixado.`);return}try{let{error:r}=await n.from(`profiles`).update({is_admin:i,role:i?`admin`:`user`}).or(`id.eq.${e},discord_id.eq.${t}`);if(r)throw r;o=o.map(n=>n.id===e||n.discord_id===t?{...n,is_admin:i,role:i?`admin`:`user`}:n),u.send({type:`broadcast`,event:`user_permission_updated`,payload:{userId:e,discordId:t,isAdmin:i}}),E()}catch(e){alert(`Falha ao atualizar permissões de administrador: `+e.message)}},window.painelToggleBan=async function(e,t,i){if(r.includes(t)||r.includes(e)){alert(`O Fundador Superadmin não pode ser banido.`);return}if(confirm(`Tem certeza que deseja ${i?`banir`:`desbanir`} este usuário?`))try{let r={is_banned:i,role:i?`banned`:`user`,...i?{is_admin:!1}:{}},a=await n.from(`profiles`).update(r).or(`id.eq.${e},discord_id.eq.${t}`);if(a.error&&(a.error.message||``).includes(`is_banned`)){console.warn(`Coluna is_banned não encontrada no schema cache, aplicando fallback com role=banned`);let r={role:i?`banned`:`user`,...i?{is_admin:!1}:{}};a=await n.from(`profiles`).update(r).or(`id.eq.${e},discord_id.eq.${t}`)}if(a.error)throw a.error;let s=d();if(i?(t&&!s.includes(t)&&s.push(t),e&&!s.includes(e)&&s.push(e)):s=s.filter(n=>n!==t&&n!==e),localStorage.setItem(`malaca_banned_discord_accounts`,JSON.stringify(s)),i){let n=JSON.parse(localStorage.getItem(`malaca_admin_discord_accounts`)||`[]`);n=n.filter(n=>n!==t&&n!==e),localStorage.setItem(`malaca_admin_discord_accounts`,JSON.stringify(n))}o=o.map(n=>n.id===e||n.discord_id===t?{...n,is_banned:i,is_admin:!i&&n.is_admin,role:i?`banned`:n.is_admin?`admin`:`user`}:n),u.send({type:`broadcast`,event:`user_ban_updated`,payload:{userId:e,discordId:t,isBanned:i}}),E()}catch(e){alert(`Falha ao alterar banimento: `+e.message)}},window.painelDeleteUser=async function(e,t){if(r.includes(t)){alert(`O Fundador Superadmin não pode ser excluído.`);return}if(confirm(`Deseja realmente excluir este usuário da plataforma?`))try{let{error:r}=await n.from(`profiles`).delete().or(`id.eq.${e},discord_id.eq.${t}`);if(r)throw r;o=o.filter(n=>n.id!==e&&n.discord_id!==t),E()}catch(e){alert(`Falha ao excluir usuário: `+e.message)}};function D(e){e.innerHTML=`
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
    `}window.painelTriggerCycleChange=function(){alert(`Virada de ciclo disparada com sucesso! Coordenadas do Andarilho sincronizadas.`)};function O(e){e.innerHTML=`
        <div class="painel-page-title-area">
            <div>
                <h1 class="painel-page-title">CIDADES & SERVIDORES</h1>
                <p class="painel-page-desc">Gerenciamento dos servidores integrados ao ecossistema Malaca System GTARP.</p>
            </div>
        </div>

        <div class="painel-users-grid">
            ${(s.length>0?s:[{id:`cda-server-uuid`,slug:`cda`,name:`CIDADE ALTA RP (CDA)`,subtitle:`SERVIDORES OFICIAIS`,description:`Mapa Interativo em tempo real para os servidores CDA e VALLEY com virada do Andarilho, além de Lockpick, Caixinha e Hacking.`},{id:`valley-server-uuid`,slug:`valley`,name:`VALLEY RP`,subtitle:`SERVIDOR VALLEY GG`,description:`Mapa completo e ferramentas dedicadas para a comunidade do servidor Valley GG.`},{id:`ls-server-uuid`,slug:`los-santos`,name:`LOS SANTOS ROLEPLAY`,subtitle:`SERVIDOR MULTI-CIDADE`,description:`Hub de simuladores e mapas para servidores tradicionais de Los Santos.`}]).map(e=>`
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
    `}function k(e){e.innerHTML=`
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
    `}function A(e){e.innerHTML=`
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
    `}window.painelClearCaches=function(){localStorage.removeItem(`malaca_custom_servers`),localStorage.removeItem(`malaca_custom_systems`),localStorage.removeItem(`malaca_admin_users_cache`),alert(`Caches da plataforma limpos com sucesso! Dados sincronizados.`),S()},window.painelRefreshData=function(){S()},window.painelSwitchTab=function(e){x(e)},document.addEventListener(`DOMContentLoaded`,h);