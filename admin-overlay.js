(function () {
    // Inject HTML Modal Container
    const modalHTML = `
    <div id="global-admin-modal" class="global-admin-overlay">
        <div class="global-admin-dialog">
            <div class="global-admin-header">
                <div class="global-admin-title-area">
                    <div class="global-admin-badge"><img src="./images/platform_icon.png" alt="MALACA ICON" style="width: 100%; height: 100%; object-fit: contain;"></div>
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
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    let isAuthenticated = false;
    let activeTab = 'cities';
    let editingCityId = null;
    let editingSystemId = null;

    const defaultSystems = [
        { id: 'sys-mapa', name: 'MAPA INTERATIVO RP', slug: 'mapa-interativo', tag: 'CDA & VALLEY REALTIME', link: 'mapa-interativo/', icon: 'fa-compass', is_active: true },
        { id: 'sys-lockpick', name: 'LOCKPICK SIMULATOR', slug: 'lockpick', tag: 'FIVEM LOCKPICK KIT', link: 'lockpick/', icon: 'fa-key', is_active: true },
        { id: 'sys-caixinha', name: 'CAIXINHA ELETRÔNICO', slug: 'caixinha', tag: 'SAFE & ATM HACK', link: 'caixinha/', icon: 'fa-vault', is_active: true },
        { id: 'sys-hacking', name: 'HACKING DEVICE', slug: 'hacking', tag: 'CYBER HACK TERMINAL', link: 'hacking/', icon: 'fa-microchip', is_active: true }
    ];

    const defaultServers = [
        { id: 'cda-server-uuid', slug: 'cda', name: 'Cidade Alta RP', subtitle: 'SERVIDORES CDA & VALLEY' },
        { id: 'valley-server-uuid', slug: 'valley', name: 'Valley RP', subtitle: 'VALLEY ROLEPLAY HUB' },
        { id: 'los-santos-server-uuid', slug: 'los-santos', name: 'Los Santos Central', subtitle: 'TREINAMENTO HEISTS & MINIJOGOS' }
    ];

    window.openGlobalAdminModal = function () {
        document.getElementById('global-admin-modal').classList.add('active');
        renderAdminContent();
    };

    window.closeGlobalAdminModal = function () {
        document.getElementById('global-admin-modal').classList.remove('active');
    };

    function getActiveServers() {
        const raw = JSON.parse(localStorage.getItem('malaca_custom_servers') || '[]');
        return raw.length > 0 ? raw : defaultServers;
    }

    function getActiveSystems() {
        const raw = JSON.parse(localStorage.getItem('malaca_custom_systems') || '[]');
        return raw.length > 0 ? raw : defaultSystems;
    }

    function renderAdminContent() {
        const container = document.getElementById('global-admin-content');
        if (!isAuthenticated) {
            container.innerHTML = `
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
            `;
        } else {
            const allServers = getActiveServers();
            const allSystems = getActiveSystems();

            container.innerHTML = `
                <div class="global-admin-nav">
                    <button class="global-admin-nav-btn ${activeTab === 'cities' ? 'active' : ''}" onclick="switchAdminTab('cities')"><i class="fa-solid fa-city"></i> Cidades (${allServers.length})</button>
                    <button class="global-admin-nav-btn ${activeTab === 'systems' ? 'active' : ''}" onclick="switchAdminTab('systems')"><i class="fa-solid fa-layer-group"></i> Sistemas (${allSystems.length})</button>
                    <button class="global-admin-nav-btn ${activeTab === 'andarilho' ? 'active' : ''}" onclick="switchAdminTab('andarilho')"><i class="fa-solid fa-person-walking"></i> Ciclo Andarilho</button>
                    <button class="global-admin-nav-btn" onclick="logoutAdmin()" style="margin-left: auto; color: #ff5252;"><i class="fa-solid fa-right-from-bracket"></i> Sair</button>
                </div>
                <div class="global-admin-body" id="admin-tab-body">
                    ${renderTabBody(activeTab, allServers, allSystems)}
                </div>
            `;
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
        if (tab === 'cities') {
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
})();
