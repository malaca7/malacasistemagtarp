(function(){document.body.insertAdjacentHTML(`beforeend`,`
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
                    <div class="global-admin-badge" style="background: rgba(250,118,8,0.2);"><i class="fa-solid fa-sliders" style="color: #FA7608;"></i></div>
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
                    <label style="font-size: 11px; font-weight: 800; color: #FA7608; text-transform: uppercase; display: block; margin-bottom: 10px;"><i class="fa-solid fa-palette"></i> Tema Visual</label>
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
                        <label style="font-size: 11px; font-weight: 800; color: #FA7608; text-transform: uppercase;"><i class="fa-solid fa-sun"></i> Brilho da Tela</label>
                        <span id="g-brightness-val" style="font-size: 13px; font-weight: 900; color: #FFB52E;">100%</span>
                    </div>
                    <input type="range" min="0" max="150" value="100" id="g-brightness-slider" style="width: 100%; accent-color: #FA7608; cursor: pointer;" oninput="updateGlobalBrightness(this.value)" ondblclick="updateGlobalBrightness(100)">
                    <span style="font-size: 10px; color: #94a3b8; display: block; margin-top: 4px;">Dica: dando dois cliques no controle ele volta para 100%.</span>
                </div>

                <!-- Idioma -->
                <div>
                    <label style="font-size: 11px; font-weight: 800; color: #FA7608; text-transform: uppercase; display: block; margin-bottom: 10px;"><i class="fa-solid fa-language"></i> Idioma</label>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="setGlobalLang('pt')" class="global-theme-btn" id="glang-pt" style="flex:1;">🇧🇷 Português (BR)</button>
                        <button onclick="setGlobalLang('en')" class="global-theme-btn" id="glang-en" style="flex:1;">🇺🇸 English (EN)</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `),window.openAppearanceModal=function(){document.getElementById(`global-appearance-modal`).classList.add(`active`),e()},window.closeAppearanceModal=function(){document.getElementById(`global-appearance-modal`).classList.remove(`active`)},window.setGlobalTheme=function(t){document.documentElement.setAttribute(`data-theme`,t),localStorage.setItem(`malaca_theme`,t),e()},window.updateGlobalBrightness=function(e){let t=Number(e);document.documentElement.style.filter=`brightness(${t}%)`,localStorage.setItem(`malaca_brightness`,String(t));let n=document.getElementById(`g-brightness-val`);n&&(n.textContent=`${t}%`);let r=document.getElementById(`g-brightness-slider`);r&&(r.value=t)},window.setGlobalLang=function(t){localStorage.setItem(`malaca_lang`,t),e()};function e(){let e=localStorage.getItem(`malaca_theme`)||`escuro`,t=localStorage.getItem(`malaca_brightness`)||`100`,n=localStorage.getItem(`malaca_lang`)||`pt`;document.documentElement.setAttribute(`data-theme`,e),document.documentElement.style.filter=`brightness(${t}%)`,[`escuro`,`oled`,`dracula`,`cinza_escuro`,`cinza_claro`,`claro`].forEach(t=>{let n=document.getElementById(`gtheme-${t}`);n&&(t===e?(n.style.background=`linear-gradient(135deg, #FA7608 0%, #E73701 100%)`,n.style.color=`#fff`,n.style.borderColor=`#FFB52E`):(n.style.background=`rgba(255,255,255,0.05)`,n.style.color=`#94a3b8`,n.style.borderColor=`rgba(250,118,8,0.2)`))});let r=document.getElementById(`g-brightness-val`);r&&(r.textContent=`${t}%`);let i=document.getElementById(`g-brightness-slider`);i&&(i.value=t),[`pt`,`en`].forEach(e=>{let t=document.getElementById(`glang-${e}`);t&&(e===n?(t.style.background=`linear-gradient(135deg, #FA7608 0%, #E73701 100%)`,t.style.color=`#fff`,t.style.borderColor=`#FFB52E`):(t.style.background=`rgba(255,255,255,0.05)`,t.style.color=`#94a3b8`,t.style.borderColor=`rgba(250,118,8,0.2)`))})}document.addEventListener(`DOMContentLoaded`,e),e();let t=!1,n=`cities`,r=null,i=null,a=[{id:`sys-mapa`,name:`MAPA INTERATIVO RP`,slug:`mapa-interativo`,tag:`CDA & VALLEY REALTIME`,link:`mapa-interativo/`,icon:`fa-compass`,is_active:!0},{id:`sys-lockpick`,name:`LOCKPICK SIMULATOR`,slug:`lockpick`,tag:`FIVEM LOCKPICK KIT`,link:`lockpick/`,icon:`fa-key`,is_active:!0},{id:`sys-caixinha`,name:`CAIXINHA ELETRÔNICO`,slug:`caixinha`,tag:`SAFE & ATM HACK`,link:`caixinha/`,icon:`fa-vault`,is_active:!0},{id:`sys-hacking`,name:`HACKING DEVICE`,slug:`hacking`,tag:`CYBER HACK TERMINAL`,link:`hacking/`,icon:`fa-microchip`,is_active:!0}],o=[{id:`cda-server-uuid`,slug:`cda`,name:`Cidade Alta RP`,subtitle:`SERVIDORES CDA & VALLEY`},{id:`valley-server-uuid`,slug:`valley`,name:`Valley RP`,subtitle:`VALLEY ROLEPLAY HUB`},{id:`los-santos-server-uuid`,slug:`los-santos`,name:`Los Santos Central`,subtitle:`TREINAMENTO HEISTS & MINIJOGOS`}];window.openGlobalAdminModal=function(){document.getElementById(`global-admin-modal`).classList.add(`active`),l()},window.closeGlobalAdminModal=function(){document.getElementById(`global-admin-modal`).classList.remove(`active`)};function s(){let e=JSON.parse(localStorage.getItem(`malaca_custom_servers`)||`[]`);return e.length>0?e:o}function c(){let e=JSON.parse(localStorage.getItem(`malaca_custom_systems`)||`[]`);return e.length>0?e:a}function l(){let e=document.getElementById(`global-admin-content`);if(!t)e.innerHTML=`
                <div class="global-admin-body">
                    <div class="global-admin-auth-box">
                        <i class="fa-solid fa-lock" style="font-size: 2.5rem; color: #ff6600; margin-bottom: 12px;"></i>
                        <h3 style="font-family: var(--font-header); font-size: 1.2rem; color: #fff; margin-bottom: 8px;">Autenticação Administrativa</h3>
                        <p style="font-size: 0.78rem; color: #8b9cb5; margin-bottom: 20px;">Digite o usuário e senha cadastrados para acessar a gestão da plataforma.</p>
                        
                        <form onsubmit="handleAdminLogin(event)" style="text-align: left;">
                            <label style="font-size: 0.7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Usuário</label>
                            <input type="text" id="admin-user-input" class="global-admin-input" placeholder="ex: malaca" required>
                            
                            <label style="font-size: 0.7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Senha</label>
                            <input type="password" id="admin-pass-input" class="global-admin-input" placeholder="Digite a senha" required>

                            <p id="admin-auth-err" style="color: #ff5252; font-size: 0.75rem; display: none; margin-bottom: 12px;">Usuário ou senha incorretos.</p>
                            
                            <button type="submit" class="global-admin-submit">ENTRAR NO PAINEL</button>
                        </form>
                    </div>
                </div>
            `;else{let t=s(),r=c();e.innerHTML=`
                <div class="global-admin-nav">
                    <button class="global-admin-nav-btn ${n===`cities`?`active`:``}" onclick="switchAdminTab('cities')"><i class="fa-solid fa-city"></i> Cidades (${t.length})</button>
                    <button class="global-admin-nav-btn ${n===`systems`?`active`:``}" onclick="switchAdminTab('systems')"><i class="fa-solid fa-layer-group"></i> Sistemas (${r.length})</button>
                    <button class="global-admin-nav-btn ${n===`andarilho`?`active`:``}" onclick="switchAdminTab('andarilho')"><i class="fa-solid fa-person-walking"></i> Ciclo Andarilho</button>
                    <button class="global-admin-nav-btn" onclick="logoutAdmin()" style="margin-left: auto; color: #ff5252;"><i class="fa-solid fa-right-from-bracket"></i> Sair</button>
                </div>
                <div class="global-admin-body" id="admin-tab-body">
                    ${u(n,t,r)}
                </div>
            `}}window.switchAdminTab=function(e){n=e,l()},window.handleAdminLogin=function(e){e.preventDefault();let n=document.getElementById(`admin-user-input`).value.trim(),r=document.getElementById(`admin-pass-input`).value.trim();n===`malaca`&&r===`199425`||n===`admin`&&(r===`cidadealta123`||r===`admin`)?(t=!0,l()):document.getElementById(`admin-auth-err`).style.display=`block`},window.logoutAdmin=function(){t=!1,l()};function u(e,t,n){if(e===`cities`){let e=r?t.find(e=>e.id===r):null;return`
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
            `}if(e===`systems`){let e=i?n.find(e=>e.id===i):null;return`
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
            `}return e===`andarilho`?`
                <div style="background: rgba(15,20,32,0.6); padding: 24px; border-radius: 14px; border: 1px solid rgba(255,102,0,0.2); text-align: center;">
                    <i class="fa-solid fa-rotate" style="font-size: 2rem; color: #ff6600; margin-bottom: 12px;"></i>
                    <h4 style="font-family: var(--font-header); color: #fff; font-size: 1rem; margin-bottom: 8px;">Resetar Ciclo do Andarilho</h4>
                    <p style="font-size: 0.8rem; color: #94a3b8; max-width: 500px; margin: 0 auto 16px;">Limpa todas as confirmações da comunidade acumuladas no ciclo atual do Andarilho em todas as cidades.</p>
                    <button onclick="handleResetWandererCycle()" class="global-admin-submit" style="width: auto; background: linear-gradient(135deg, #ff5500 0%, #e62e00 50%, #ffaa00 100%); color: #fff; padding: 10px 24px;">CONFIRMAR RESET DO CICLO</button>
                </div>
            `:``}window.startEditCity=function(e){r=e,l()},window.cancelEditCity=function(){r=null,l()},window.handleSaveCity=function(e){e.preventDefault();let t=document.getElementById(`city-form-name`).value.trim(),n=document.getElementById(`city-form-slug`).value.trim(),i=document.getElementById(`city-form-sub`).value.trim(),a=document.getElementById(`city-form-banner`).value.trim(),o=s();r?(o=o.map(e=>e.id===r?{...e,name:t,slug:n,subtitle:i,banner_image_url:a}:e),r=null,alert(`Cidade atualizada com sucesso!`)):(o.push({id:`city-`+Date.now(),name:t,slug:n,subtitle:i,banner_image_url:a,description:`Cidade cadastrada via Admin.`}),alert(`Cidade cadastrada com sucesso!`)),localStorage.setItem(`malaca_custom_servers`,JSON.stringify(o)),l(),window.loadCustomCities&&window.loadCustomCities()},window.moveCityUp=function(e){if(e<=0)return;let t=s(),n=t[e-1];t[e-1]=t[e],t[e]=n,localStorage.setItem(`malaca_custom_servers`,JSON.stringify(t)),l(),window.loadCustomCities&&window.loadCustomCities()},window.moveCityDown=function(e){let t=s();if(e>=t.length-1)return;let n=t[e+1];t[e+1]=t[e],t[e]=n,localStorage.setItem(`malaca_custom_servers`,JSON.stringify(t)),l(),window.loadCustomCities&&window.loadCustomCities()},window.deleteCity=function(e,t){if(confirm(`Tem certeza que deseja excluir a cidade "${t}"?`)){let t=s();t=t.filter(t=>t.id!==e),localStorage.setItem(`malaca_custom_servers`,JSON.stringify(t)),l(),window.loadCustomCities&&window.loadCustomCities()}},window.startEditSystem=function(e){i=e,l()},window.cancelEditSystem=function(){i=null,l()},window.handleSaveSystem=function(e){e.preventDefault();let t=document.getElementById(`sys-form-name`).value.trim(),n=document.getElementById(`sys-form-slug`).value.trim(),r=document.getElementById(`sys-form-tag`).value.trim(),a=document.getElementById(`sys-form-link`).value.trim(),o=Array.from(document.querySelectorAll(`input[name="city-link-check"]:checked`)).map(e=>e.value),s=c();i?(s=s.map(e=>e.id===i?{...e,name:t,slug:n,tag:r,link:a,city_ids:o}:e),i=null,alert(`Sistema atualizado com sucesso!`)):(s.push({id:`sys-`+Date.now(),name:t,slug:n,tag:r,link:a||`${n}/`,city_ids:o,is_active:!0}),alert(`Sistema cadastrado com sucesso!`)),localStorage.setItem(`malaca_custom_systems`,JSON.stringify(s)),l()},window.moveSystemUp=function(e){if(e<=0)return;let t=c(),n=t[e-1];t[e-1]=t[e],t[e]=n,localStorage.setItem(`malaca_custom_systems`,JSON.stringify(t)),l()},window.moveSystemDown=function(e){let t=c();if(e>=t.length-1)return;let n=t[e+1];t[e+1]=t[e],t[e]=n,localStorage.setItem(`malaca_custom_systems`,JSON.stringify(t)),l()},window.deleteSystem=function(e,t){if(confirm(`Tem certeza que deseja excluir o sistema "${t}"?`)){let t=c();t=t.filter(t=>t.id!==e),localStorage.setItem(`malaca_custom_systems`,JSON.stringify(t)),l()}},window.handleResetWandererCycle=function(){localStorage.removeItem(`cidade_alta_user_confirmations`),alert(`Ciclo do Andarilho resetado com sucesso!`)}})();