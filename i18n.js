// ==========================================================================
// MALACA SYSTEM - MULTILINGUAL (PT-BR / EN) & THEME ENGINE (LIGHT / DARK)
// ==========================================================================

const translations = {
    pt: {
        // Navbar & General
        "nav_system_online": "SISTEMA ONLINE",
        "nav_brand": "MALACA SYSTEM",
        "home_tooltip": "Voltar para o Início",
        
        // Home Page
        "hero_badge": "CENTRO DE TREINAMENTO GTARP",
        "hero_title_1": "DOMINE AS HABILIDADES DE ",
        "hero_title_accent": "INVASÃO & ARROMBAMENTO",
        "hero_subtitle": "Plataforma profissional projetada para aprimorar reflexos, precisão motora e agilidade nos minijogos mais exigentes dos servidores de Roleplay.",
        "stat_sims": "Simuladores Ativos",
        "stat_precision": "Precisão RP",
        "stat_fivem": "Compatível",
        "stat_latency": "Latência Ultra Smooth",
        "play_button": "INICIAR TREINO",
        "footer_text": "Desenvolvido para máxima otimização e treinamento de reflexos em Roleplay.",
        
        // Cards
        "lockpick_tag": "ENGINE STARFIELD",
        "lockpick_title": "LOCKPICK SIMULATOR",
        "lockpick_desc": "Arrombamento de fechadura circular de 32 furos. Encaixe as combinações exatas de pinos em cada camada para liberar o cilindro central sem desperdiçar tentativas.",
        "lockpick_f1": "2 a 4 Camadas",
        "lockpick_f2": "Desafio Diário",
        "lockpick_f3": "4 Dificuldades",
        
        "caixinha_tag": "REFLEXOS & VELOCIDADE",
        "caixinha_title": "CAIXINHA ELETRÔNICO",
        "caixinha_desc": "Minijogo de digitação sequencial de alta precisão. Complete as palavras-chave na barra dinâmica antes que a contagem regressiva chegue a zero.",
        "caixinha_f1": "Digitação Rápida",
        "caixinha_f2": "Modo Infinito",
        "caixinha_f3": "Animação 60 FPS",
        
        "hacking_tag": "VARREDURA DE MATRIZ",
        "hacking_title": "HACKING DEVICE",
        "hacking_desc": "Simulador avançado de invasão cibernética. Localize a sequência de caracteres alvo na matriz de dados embaralhada e mantenha sua sequência de vitórias.",
        "hacking_f1": "8 Tipos de Símbolos",
        "hacking_f2": "Sistema de Streaks",
        "hacking_f3": "Layout Cyberpunk",
        
        // Lockpick Simulator
        "difficulty_label": "DIFICULDADE:",
        "diff_novice": "NOVATO",
        "diff_advanced": "AVANÇADO",
        "diff_expert": "PERITO",
        "diff_master": "MESTRE",
        "diff_daily": "DIÁRIO",
        "lockpick_unlocked": "DESBLOQUEADO:",
        "lockpick_success_msg": "Acesso concedido.",
        "lockpick_failed": "FALHA NO LOCKPICK:",
        "lockpick_fail_msg": "Tempo esgotado ou cancelado.",
        "btn_new_puzzle": "NOVO PUZZLE",
        "btn_retry": "TENTAR NOVAMENTE",
        
        // Caixinha Eletrônico
        "time_label": "TEMPO:",
        "mode_label": "MODO:",
        "mode_standard": "PADRÃO (3 SEQS)",
        "mode_endless": "INFINITO",
        "caixinha_success_title": "SISTEMA HACKEADO:",
        "caixinha_success_msg": "Acesso eletrônico concedido.",
        "caixinha_fail_title": "FALHA NO SISTEMA:",
        "caixinha_fail_msg": "Sequência incorreta ou tempo esgotado.",
        "caixinha_status_waiting": "AGUARDANDO INÍCIO",
        "btn_next_caixinha": "PRÓXIMA CAIXINHA",
        
        // Hacking Device
        "type_label": "TIPO:",
        "size_label": "TAMANHO:",
        "charset_all": "MISTO (TODOS)",
        "charset_numeric": "Numérico",
        "charset_alphabet": "Alfabeto",
        "charset_alphanumeric": "Alfanumérico",
        "charset_greek": "Grego",
        "charset_braille": "Braille",
        "charset_runes": "Runas",
        "charset_symbols": "Símbolos",
        "hacking_target_label": "LOCALIZE A SEQUÊNCIA ALVO:",
        "hacking_success_title": "ACESSO CONCEDIDO:",
        "hacking_success_msg": "Sequência encontrada com sucesso!",
        "hacking_fail_title": "ACESSO NEGADO:",
        "hacking_fail_msg": "Sequência incorreta ou tempo esgotado.",
        "btn_next_hack": "PRÓXIMO HACK (ENTER)"
    },
    en: {
        // Navbar & General
        "nav_system_online": "SYSTEM ONLINE",
        "nav_brand": "MALACA SYSTEM",
        "home_tooltip": "Return to Home",
        
        // Home Page
        "hero_badge": "GTARP TRAINING CENTER",
        "hero_title_1": "MASTER THE SKILLS OF ",
        "hero_title_accent": "INTRUSION & LOCKPICKING",
        "hero_subtitle": "Professional platform engineered to hone reflexes, motor precision, and agility across the most demanding Roleplay server minigames.",
        "stat_sims": "Active Simulators",
        "stat_precision": "RP Precision",
        "stat_fivem": "Compatible",
        "stat_latency": "Ultra Smooth Latency",
        "play_button": "START TRAINING",
        "footer_text": "Designed for peak performance and reflex training in Roleplay.",
        
        // Cards
        "lockpick_tag": "STARFIELD ENGINE",
        "lockpick_title": "LOCKPICK SIMULATOR",
        "lockpick_desc": "32-slot circular lock picking simulator. Align exact pin combinations into each ring layer to clear the central cylinder without wasting key picks.",
        "lockpick_f1": "2 to 4 Ring Layers",
        "lockpick_f2": "Daily Challenge",
        "lockpick_f3": "4 Difficulties",
        
        "caixinha_tag": "REFLEXES & SPEED",
        "caixinha_title": "KEYPAD BREAKER",
        "caixinha_desc": "High-precision sequential typing minigame. Type key sequences into the dynamic progress bar before time runs out.",
        "caixinha_f1": "Fast Key Typing",
        "caixinha_f2": "Endless Mode",
        "caixinha_f3": "60 FPS Animation",
        
        "hacking_tag": "MATRIX SCANNER",
        "hacking_title": "HACKING DEVICE",
        "hacking_desc": "Advanced cyber intrusion simulator. Locate the target encrypted code sequence within the scrambled data grid and maintain your streak.",
        "hacking_f1": "8 Character Sets",
        "hacking_f2": "Streak Counter System",
        "hacking_f3": "Cyberpunk UI Layout",
        
        // Lockpick Simulator
        "difficulty_label": "DIFFICULTY:",
        "diff_novice": "NOVICE",
        "diff_advanced": "ADVANCED",
        "diff_expert": "EXPERT",
        "diff_master": "MASTER",
        "diff_daily": "DAILY",
        "lockpick_unlocked": "UNLOCKED:",
        "lockpick_success_msg": "Access granted.",
        "lockpick_failed": "LOCKPICK FAILED:",
        "lockpick_fail_msg": "Time expired or canceled.",
        "btn_new_puzzle": "NEW PUZZLE",
        "btn_retry": "RETRY PUZZLE",
        
        // Caixinha Eletrônico
        "time_label": "TIME:",
        "mode_label": "MODE:",
        "mode_standard": "STANDARD (3 SEQS)",
        "mode_endless": "ENDLESS",
        "caixinha_success_title": "SYSTEM HACKED:",
        "caixinha_success_msg": "Electronic access granted.",
        "caixinha_fail_title": "SYSTEM FAILURE:",
        "caixinha_fail_msg": "Incorrect sequence or timeout.",
        "caixinha_status_waiting": "WAITING TO START",
        "btn_next_caixinha": "NEXT KEYPAD",
        
        // Hacking Device
        "type_label": "TYPE:",
        "size_label": "SIZE:",
        "charset_all": "MIXED (ALL)",
        "charset_numeric": "Numeric",
        "charset_alphabet": "Alphabet",
        "charset_alphanumeric": "Alphanumeric",
        "charset_greek": "Greek",
        "charset_braille": "Braille",
        "charset_runes": "Runes",
        "charset_symbols": "Symbols",
        "hacking_target_label": "LOCATE TARGET SEQUENCE:",
        "hacking_success_title": "ACCESS GRANTED:",
        "hacking_success_msg": "Sequence successfully matched!",
        "hacking_fail_title": "ACCESS DENIED:",
        "hacking_fail_msg": "Incorrect sequence or time expired.",
        "btn_next_hack": "NEXT HACK (ENTER)"
    }
};

class SystemController {
    constructor() {
        this.currentLang = localStorage.getItem('malaca_lang') || 'pt';
        this.currentTheme = localStorage.getItem('malaca_theme') || 'dark';
        
        this.initTheme();
        this.createFloatingControls();
        this.applyLanguage(this.currentLang);
    }
    
    initTheme() {
        if (this.currentTheme === 'light') {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }
    }
    
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('malaca_theme', this.currentTheme);
        this.initTheme();
        this.updateFloatingUI();
    }
    
    toggleLanguage() {
        this.currentLang = this.currentLang === 'pt' ? 'en' : 'pt';
        localStorage.setItem('malaca_lang', this.currentLang);
        this.applyLanguage(this.currentLang);
        this.updateFloatingUI();
    }
    
    applyLanguage(lang) {
        document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
        
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = translations[lang][key];
                } else {
                    el.textContent = translations[lang][key];
                }
            }
        });
    }
    
    createFloatingControls() {
        if (document.getElementById('floating-controls-widget')) return;
        
        const widget = document.createElement('div');
        widget.id = 'floating-controls-widget';
        widget.className = 'floating-controls';
        
        widget.innerHTML = `
            <button id="btn-toggle-theme" class="floating-btn" title="Alternar Tema Claro / Escuro">
                <i class="fa-solid ${this.currentTheme === 'dark' ? 'fa-sun' : 'fa-moon'}"></i>
            </button>
            <button id="btn-toggle-lang" class="floating-btn lang-btn" title="Switch Language (PT / EN)">
                <i class="fa-solid fa-globe"></i>
                <span id="lang-badge">${this.currentLang.toUpperCase()}</span>
            </button>
        `;
        
        document.body.appendChild(widget);
        
        document.getElementById('btn-toggle-theme').addEventListener('click', () => this.toggleTheme());
        document.getElementById('btn-toggle-lang').addEventListener('click', () => this.toggleLanguage());
    }
    
    updateFloatingUI() {
        const themeBtn = document.getElementById('btn-toggle-theme');
        if (themeBtn) {
            themeBtn.querySelector('i').className = `fa-solid ${this.currentTheme === 'dark' ? 'fa-sun' : 'fa-moon'}`;
        }
        
        const langBadge = document.getElementById('lang-badge');
        if (langBadge) {
            langBadge.textContent = this.currentLang.toUpperCase();
        }
    }
}

// Inicializar quando o DOM estiver pronto
window.addEventListener('DOMContentLoaded', () => {
    window.malacaSystem = new SystemController();
});
