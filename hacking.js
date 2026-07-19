// --- ESTRUTURA E CORES DO SIMULADOR DE HACKING DE DIGITAL (CAYO PERICO) ---
const COLORS = {
    bg: '#0a0d16',
    grid: '#1a2238',
    cyan: '#00e5ff',
    cyanGlow: 'rgba(0, 229, 255, 0.5)',
    green: '#00e676',
    greenGlow: 'rgba(0, 230, 118, 0.5)',
    error: '#ff1744',
    errorGlow: 'rgba(255, 23, 68, 0.5)',
    white: '#ffffff',
    textMuted: '#607d8b'
};

const state = {
    difficulty: 'easy', // easy (4 slices), medium (6 slices), hard (8 slices)
    numSlices: 4,
    correctOptions: [], // Array de tamanho numSlices, contendo a opção correta (0-7)
    selectedOptions: [], // Array de tamanho numSlices, contendo a opção selecionada pelo jogador
    activeSliceIndex: 0, // Índice da fatia atualmente em edição
    failsCount: 0,
    maxAttempts: 5,
    timer: 0,
    timerInterval: null,
    gameWon: false,
    audioCtx: null,
    isSoundEnabled: true
};

// Canvas do Jogo
const targetCanvas = document.getElementById('target-fingerprint-canvas');
const targetCtx = targetCanvas.getContext('2d');

const interactiveCanvas = document.getElementById('interactive-fingerprint-canvas');
const interactiveCtx = interactiveCanvas.getContext('2d');

// --- EFEITOS SONOROS (WEB AUDIO API SYNTHESIZER) ---
function initAudio() {
    if (!state.audioCtx) {
        state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound(type) {
    if (!state.isSoundEnabled) return;
    initAudio();
    if (!state.audioCtx) return;
    
    const now = state.audioCtx.currentTime;
    
    switch (type) {
        case 'click': // Clique de navegação horizontal
            {
                const osc = state.audioCtx.createOscillator();
                const gain = state.audioCtx.createGain();
                osc.connect(gain);
                gain.connect(state.audioCtx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.04);
                gain.gain.setValueAtTime(0.04, now);
                gain.gain.linearRampToValueAtTime(0.001, now + 0.04);
                osc.start(now);
                osc.stop(now + 0.04);
            }
            break;
        case 'select': // Bip de mudança de fatia vertical
            {
                const osc = state.audioCtx.createOscillator();
                const gain = state.audioCtx.createGain();
                osc.connect(gain);
                gain.connect(state.audioCtx.destination);
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.setValueAtTime(600, now + 0.03);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.linearRampToValueAtTime(0.001, now + 0.08);
                osc.start(now);
                osc.stop(now + 0.08);
            }
            break;
        case 'success': // Som de bip feliz / correto
            {
                const osc = state.audioCtx.createOscillator();
                const gain = state.audioCtx.createGain();
                osc.connect(gain);
                gain.connect(state.audioCtx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(659, now);
                osc.frequency.setValueAtTime(880, now + 0.08);
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.linearRampToValueAtTime(0.001, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
            }
            break;
        case 'error': // Buzzer de erro
            {
                const osc = state.audioCtx.createOscillator();
                const gain = state.audioCtx.createGain();
                osc.connect(gain);
                gain.connect(state.audioCtx.destination);
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(130, now);
                osc.frequency.linearRampToValueAtTime(80, now + 0.2);
                gain.gain.setValueAtTime(0.12, now);
                gain.gain.linearRampToValueAtTime(0.001, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
            }
            break;
        case 'victory': // Decodificação completa
            {
                const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
                notes.forEach((freq, i) => {
                    const osc = state.audioCtx.createOscillator();
                    const gain = state.audioCtx.createGain();
                    osc.connect(gain);
                    gain.connect(state.audioCtx.destination);
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now + i * 0.08);
                    gain.gain.setValueAtTime(0.06, now + i * 0.08);
                    gain.gain.linearRampToValueAtTime(0.001, now + i * 0.08 + 0.3);
                    osc.start(now + i * 0.08);
                    osc.stop(now + i * 0.08 + 0.3);
                });
            }
            break;
    }
}

// --- DESENHO DAS CURVAS DA DIGITAL (VETORIAL DINÂMICO) ---
function drawFingerprintCurves(ctx, cx, cy, option, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3.2;
    ctx.lineCap = 'round';
    
    // Filtro de brilho neon
    ctx.shadowBlur = 5;
    ctx.shadowColor = color;
    
    ctx.save();
    ctx.translate(cx, cy);
    
    const count = 18;
    
    // Desenha diferentes curvas geométricas com base na opção selecionada
    switch (option) {
        case 'correct': // Digital normal perfeitamente gabaritada
            for (let i = 0; i < count; i++) {
                const r = 16 + i * 13;
                ctx.beginPath();
                ctx.ellipse(0, 0, r * 0.65, r, 0.1, -Math.PI * 0.85, Math.PI * 0.85);
                ctx.stroke();
            }
            break;
            
        case 0: // Desvio para a direita
            ctx.translate(35, 10);
            for (let i = 0; i < count; i++) {
                const r = 16 + i * 13;
                ctx.beginPath();
                ctx.ellipse(0, 0, r * 0.65, r, 0.1, -Math.PI * 0.85, Math.PI * 0.85);
                ctx.stroke();
            }
            break;
            
        case 1: // Ondas senoidais horizontais
            ctx.translate(-cx, -cy);
            for (let i = 0; i < count; i++) {
                ctx.beginPath();
                const startY = 15 + i * 22;
                for (let x = 0; x <= 220; x += 5) {
                    const y = startY + Math.sin(x * 0.04) * 8;
                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }
            break;
            
        case 2: // Desvio para a esquerda e encolhido
            ctx.translate(-30, -20);
            for (let i = 0; i < count; i++) {
                const r = 16 + i * 12;
                ctx.beginPath();
                ctx.ellipse(0, 0, r * 0.5, r * 0.9, -0.1, -Math.PI * 0.85, Math.PI * 0.85);
                ctx.stroke();
            }
            break;
            
        case 3: // Círculos concêntricos perfeitos
            for (let i = 0; i < count; i++) {
                const r = 15 + i * 13;
                ctx.beginPath();
                ctx.arc(0, 0, r, 0, 2 * Math.PI);
                ctx.stroke();
            }
            break;
            
        case 4: // Linhas diagonais inclinadas com ruído
            ctx.translate(-cx, -cy);
            for (let i = -10; i < count + 10; i++) {
                ctx.beginPath();
                ctx.moveTo(0, i * 22);
                ctx.lineTo(220, i * 22 + 120);
                ctx.stroke();
            }
            break;
            
        case 5: // Curvas invertidas (concavidade contrária)
            ctx.scale(1, -1);
            for (let i = 0; i < count; i++) {
                const r = 16 + i * 13;
                ctx.beginPath();
                ctx.ellipse(0, 0, r * 0.65, r, 0.1, -Math.PI * 0.85, Math.PI * 0.85);
                ctx.stroke();
            }
            break;
            
        case 6: // Grade quadriculada biométrica futurista
            ctx.translate(-cx, -cy);
            for (let i = 0; i < 20; i++) {
                ctx.beginPath();
                ctx.moveTo(i * 15, 0);
                ctx.lineTo(i * 15 + 40, 380);
                ctx.stroke();
            }
            break;
            
        case 7: // Elipses rotacionadas 45 graus
            ctx.rotate(Math.PI / 4);
            for (let i = 0; i < count; i++) {
                const r = 16 + i * 13;
                ctx.beginPath();
                ctx.ellipse(0, 0, r * 0.5, r, 0, -Math.PI * 0.85, Math.PI * 0.85);
                ctx.stroke();
            }
            break;
    }
    
    ctx.restore();
    ctx.shadowBlur = 0;
}

// --- GERAÇÃO DO QUEBRA-CABEÇA ---
function generatePuzzle(difficulty) {
    state.difficulty = difficulty;
    state.numSlices = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8;
    state.activeSliceIndex = 0;
    state.failsCount = 0;
    state.maxAttempts = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 4 : 3;
    state.gameWon = false;
    
    // Gerar as opções corretas (qual opção de 0 a 7 é a certa para cada fatia)
    const correct = [];
    const selected = [];
    
    for (let i = 0; i < state.numSlices; i++) {
        // Opção correta é a que desenha a digital gabaritada
        correct.push('correct');
        
        // Inicializa o jogador com opções incorretas aleatórias (0 a 7)
        let randOpt;
        do {
            randOpt = Math.floor(Math.random() * 8);
        } while (randOpt === 3 && i === 0); // evita similaridades óbvias na primeira fatia
        
        selected.push(randOpt);
    }
    
    state.correctOptions = correct;
    state.selectedOptions = selected;
    
    // Ocultar overlay e exibir Stop
    document.getElementById('success-overlay').classList.remove('show');
    const stopBtn = document.getElementById('btn-stop-game');
    if(stopBtn) stopBtn.style.visibility = 'visible';
    
    resetTimer();
    startTimer();
    updateUI();
    drawTargetFingerprint();
    drawInteractiveFingerprint();
}

// --- RENDERIZAR GABARITO DA ESQUERDA ---
function drawTargetFingerprint() {
    targetCtx.fillStyle = COLORS.bg;
    targetCtx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);
    
    // Desenhar a grade de fundo leve
    drawGridPattern(targetCtx, targetCanvas.width, targetCanvas.height);
    
    // Desenhar a digital correta inteira
    drawFingerprintCurves(targetCtx, 110, 190, 'correct', COLORS.green);
}

// --- RENDERIZAR DIGITAL INTERATIVA DA DIREITA (FATIAS CLIPPADAS) ---
function drawInteractiveFingerprint() {
    interactiveCtx.fillStyle = COLORS.bg;
    interactiveCtx.fillRect(0, 0, interactiveCanvas.width, interactiveCanvas.height);
    
    drawGridPattern(interactiveCtx, interactiveCanvas.width, interactiveCanvas.height);
    
    const sliceH = interactiveCanvas.height / state.numSlices;
    
    for (let k = 0; k < state.numSlices; k++) {
        const yStart = k * sliceH;
        
        interactiveCtx.save();
        interactiveCtx.beginPath();
        interactiveCtx.rect(0, yStart, interactiveCanvas.width, sliceH);
        interactiveCtx.clip();
        
        // Desenha a opção atual da fatia
        const option = state.selectedOptions[k];
        const isCorrect = option === 'correct';
        const color = state.gameWon ? COLORS.green : (isCorrect ? '#38a5e8' : 'rgba(0, 229, 255, 0.45)');
        
        drawFingerprintCurves(interactiveCtx, 110, 190, option, color);
        interactiveCtx.restore();
        
        // Desenhar linha divisória fina entre fatias
        interactiveCtx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        interactiveCtx.lineWidth = 1;
        interactiveCtx.beginPath();
        interactiveCtx.moveTo(0, yStart);
        interactiveCtx.lineTo(interactiveCanvas.width, yStart);
        interactiveCtx.stroke();
        
        // Desenhar indicador da fatia ativa com borda ciano piscante
        if (k === state.activeSliceIndex && !state.gameWon) {
            interactiveCtx.strokeStyle = COLORS.cyan;
            interactiveCtx.lineWidth = 2.5;
            interactiveCtx.shadowBlur = 6;
            interactiveCtx.shadowColor = COLORS.cyanGlow;
            interactiveCtx.strokeRect(1, yStart + 1, interactiveCanvas.width - 2, sliceH - 2);
            interactiveCtx.shadowBlur = 0;
            
            // Fundo leve
            interactiveCtx.fillStyle = 'rgba(0, 229, 255, 0.04)';
            interactiveCtx.fillRect(1, yStart + 1, interactiveCanvas.width - 2, sliceH - 2);
        }
    }
}

// Desenhar grade eletrônica de fundo
function drawGridPattern(ctx, w, h) {
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 0.5;
    
    const size = 20;
    for (let x = size; x < w; x += size) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
    }
    for (let y = size; y < h; y += size) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }
}

// --- INTERAÇÕES E SELEÇÃO ---
function selectSlice(direction) {
    if (state.gameWon) return;
    playSound('select');
    
    state.activeSliceIndex += direction;
    if (state.activeSliceIndex < 0) {
        state.activeSliceIndex = state.numSlices - 1;
    } else if (state.activeSliceIndex >= state.numSlices) {
        state.activeSliceIndex = 0;
    }
    
    drawInteractiveFingerprint();
}

function cycleOption(direction) {
    if (state.gameWon) return;
    playSound('click');
    
    const idx = state.activeSliceIndex;
    let currentOpt = state.selectedOptions[idx];
    
    // Se estivesse no correto, trata como índice virtual para poder rolar
    if (currentOpt === 'correct') {
        currentOpt = 8; // Opção virtual extra correspondendo ao correto
    }
    
    let nextOpt = currentOpt + direction;
    
    // São 8 opções falsas (0 a 7) e 1 correta ('correct' mapeada virtualmente como 8)
    if (nextOpt < 0) nextOpt = 8;
    if (nextOpt > 8) nextOpt = 0;
    
    if (nextOpt === 8) {
        state.selectedOptions[idx] = 'correct';
    } else {
        state.selectedOptions[idx] = nextOpt;
    }
    
    drawInteractiveFingerprint();
}

// Validar se todas as fatias coincidem com a digital correta
function checkAlignment() {
    if (state.gameWon || state.failsCount >= state.maxAttempts) return;
    initAudio();
    
    // Verifica se todos os fragmentos são 'correct'
    const isAllAligned = state.selectedOptions.every(opt => opt === 'correct');
    
    if (isAllAligned) {
        // Sucesso
        state.gameWon = true;
        stopTimer();
        playSound('victory');
        
        // Sucesso overlay
        document.getElementById('succ-time').textContent = formatTime(state.timer);
        document.getElementById('succ-attempts').textContent = state.failsCount;
        document.getElementById('success-overlay').classList.add('show');
        const stopBtn = document.getElementById('btn-stop-game');
        if(stopBtn) stopBtn.style.visibility = 'hidden';
        
        drawInteractiveFingerprint();
    } else {
        // Erro
        playSound('error');
        state.failsCount++;
        
        // Tremor físico na caixa do dispositivo
        const devWrapper = document.querySelector('.hacking-device-wrapper');
        devWrapper.classList.remove('shake');
        void devWrapper.offsetWidth;
        devWrapper.classList.add('shake');
        setTimeout(() => devWrapper.classList.remove('shake'), 400);
        
        if (state.failsCount >= state.maxAttempts) {
            alert('Falha crítica de descriptografia! O sistema biométrico bloqueou.');
            generatePuzzle(state.difficulty);
        } else {
            updateUI();
        }
    }
function failGame() {
    if (state.gameWon) return;
    state.failsCount = state.maxAttempts;
    playSound('error');
    stopTimer();
    
    // Tremor físico na caixa do dispositivo
    const devWrapper = document.querySelector('.hacking-device-wrapper');
    devWrapper.classList.remove('shake');
    void devWrapper.offsetWidth;
    devWrapper.classList.add('shake');
    
    const stopBtn = document.getElementById('btn-stop-game');
    if(stopBtn) stopBtn.style.visibility = 'hidden';
    
    alert('Simulação cancelada / Falha crítica!');
    generatePuzzle(state.difficulty);
}

// --- ATUALIZAÇÕES DA ESTRUTURA GERAL DA UI ---
function updateUI() {
    document.getElementById('picks-val').textContent = state.maxAttempts - state.failsCount;
}

// --- TEMPORIZADOR ---
function startTimer() {
    clearInterval(state.timerInterval);
    state.timerInterval = setInterval(() => {
        state.timer++;
        document.getElementById('timer-val').textContent = formatTime(state.timer);
    }, 1000);
}

function stopTimer() {
    clearInterval(state.timerInterval);
}

function resetTimer() {
    state.timer = 0;
    document.getElementById('timer-val').textContent = "00:00";
}

function formatTime(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
}

// --- CAPTURA DE EVENTOS DE TECLADO ---
window.addEventListener('keydown', (e) => {
    if (state.gameWon || state.failsCount >= state.maxAttempts) return;
    
    switch (e.key.toUpperCase()) {
        case 'W':
        case 'ARROWUP':
            selectSlice(-1); // sobe fatia
            e.preventDefault();
            break;
        case 'S':
        case 'ARROWDOWN':
            selectSlice(1); // desce fatia
            e.preventDefault();
            break;
        case 'A':
        case 'ARROWLEFT':
            cycleOption(-1); // anterior
            e.preventDefault();
            break;
        case 'D':
        case 'ARROWRIGHT':
            cycleOption(1); // posterior
            e.preventDefault();
            break;
        case ' ': // ESPAÇO para Stop/Cancel
            failGame();
            e.preventDefault();
            break;
        case 'ENTER':
            checkAlignment();
            e.preventDefault();
            break;
        case 'ESCAPE':
            generatePuzzle(state.difficulty);
            e.preventDefault();
            break;
    }
});

const stopBtn = document.getElementById('btn-stop-game');
if (stopBtn) {
    stopBtn.addEventListener('click', () => {
        failGame();
    });
}

// Interação por mouse click direto nas fatias do canvas interativo
interactiveCanvas.addEventListener('click', (e) => {
    if (state.gameWon || state.failsCount >= state.maxAttempts) return;
    initAudio();
    
    const rect = interactiveCanvas.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const sliceH = rect.height / state.numSlices;
    
    const clickedSliceIdx = Math.floor(clickY / sliceH);
    
    if (clickedSliceIdx === state.activeSliceIndex) {
        // Se clicar na fatia já ativa, avança a opção para o lado direito por padrão
        cycleOption(1);
    } else {
        // Se clicar em outra fatia, seleciona ela
        playSound('select');
        state.activeSliceIndex = clickedSliceIdx;
        drawInteractiveFingerprint();
    }
});

// --- ASSOCIAÇÃO DE EVENTOS DO DRAWER/MENU ---
document.getElementById('btn-easy').addEventListener('click', () => {
    switchActiveDiffButton('btn-easy');
    generatePuzzle('easy');
    closeSettingsDrawer();
});

document.getElementById('btn-medium').addEventListener('click', () => {
    switchActiveDiffButton('btn-medium');
    generatePuzzle('medium');
    closeSettingsDrawer();
});

document.getElementById('btn-hard').addEventListener('click', () => {
    switchActiveDiffButton('btn-hard');
    generatePuzzle('hard');
    closeSettingsDrawer();
});

function switchActiveDiffButton(id) {
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(id).classList.add('active');
}

// Botões de Ação na base
document.getElementById('btn-reset').addEventListener('click', () => generatePuzzle(state.difficulty));
document.getElementById('btn-prev-slice').addEventListener('click', () => selectSlice(-1));
document.getElementById('btn-next-slice').addEventListener('click', () => selectSlice(1));
document.getElementById('btn-prev-opt').addEventListener('click', () => cycleOption(-1));
document.getElementById('btn-next-opt').addEventListener('click', () => cycleOption(1));
document.getElementById('btn-slot').addEventListener('click', checkAlignment);

// Vitória - jogar novamente
document.getElementById('btn-next-puzzle').addEventListener('click', () => {
    generatePuzzle(state.difficulty);
});

// Opções
document.getElementById('opt-sound').addEventListener('change', (e) => {
    state.isSoundEnabled = e.target.checked;
});

// Inicialização Geral
window.addEventListener('load', () => {
    // Configurar estrelas do fundo
    const bgCanvas = document.getElementById('starfield-bg');
    const bgCtx = bgCanvas.getContext('2d');
    let stars = [];
    
    function resizeBgCanvas() {
        bgCanvas.width = window.innerWidth;
        bgCanvas.height = window.innerHeight;
        initStars();
    }
    
    function initStars() {
        stars = [];
        const count = Math.floor((bgCanvas.width * bgCanvas.height) / 18000);
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * bgCanvas.width,
                y: Math.random() * bgCanvas.height,
                size: Math.random() * 1.5 + 0.5,
                twinkleSpeed: Math.random() * 0.02 + 0.005,
                phase: Math.random() * Math.PI
            });
        }
    }
    
    function animateStars() {
        bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
        stars.forEach(star => {
            star.phase += star.twinkleSpeed;
            const opacity = (Math.sin(star.phase) + 1) / 2 * 0.7 + 0.3;
            bgCtx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.6})`;
            bgCtx.beginPath();
            bgCtx.arc(star.x, star.y, star.size, 0, 2 * Math.PI);
            bgCtx.fill();
        });
        requestAnimationFrame(animateStars);
    }
    
    resizeBgCanvas();
    window.addEventListener('resize', resizeBgCanvas);
    requestAnimationFrame(animateStars);
    
    // Configurar Drawer do Menu lateral
    const menuToggle = document.getElementById('menu-toggle');
    const closeDrawerBtn = document.getElementById('close-drawer');
    const drawer = document.getElementById('settings-drawer');
    
    if (menuToggle && drawer) {
        menuToggle.addEventListener('click', () => {
            drawer.classList.add('open');
        });
    }
    if (closeDrawerBtn && drawer) {
        closeDrawerBtn.addEventListener('click', () => {
            drawer.classList.remove('open');
        });
    }
    
    document.addEventListener('click', (e) => {
        if (drawer && drawer.classList.contains('open') && !drawer.contains(e.target) && e.target !== menuToggle && !menuToggle.contains(e.target)) {
            drawer.classList.remove('open');
        }
    });
    
    // Iniciar com o nível Easy
    generatePuzzle('easy');
});

function closeSettingsDrawer() {
    const drawer = document.getElementById('settings-drawer');
    if (drawer) {
        drawer.classList.remove('open');
    }
}
