// --- CAIXINHA ELETRÔNICO (TYPING SEQUENCE) ---
const COLORS = {
    bg: '#0a0d16',
    squareBg: 'rgba(22, 28, 46, 0.8)',
    squareHover: 'rgba(56, 165, 232, 0.15)',
    cyan: '#00e5ff',
    green: '#00e676',
    error: '#ff1744',
    text: '#ffffff',
    textMuted: '#8c9bb3'
};

const ALLOWED_KEYS = ['Q', 'W', 'E', 'A', 'S', 'D'];
const SEQUENCE_LENGTH = 8;

const state = {
    difficulty: 'medium', // easy (10s), medium (8s), hard (5s)
    gameMode: 'standard', // standard (3), endless (infinite)
    sequence: [], // Array de caracteres, ex: ['Q', 'A', 'S', ...]
    currentIndex: 0, // Qual tecla o jogador deve pressionar agora
    gameState: 'waiting', // waiting, playing, won, lost
    timerInterval: null,
    timeRemaining: 0,
    totalTime: 0,
    hacksCompleted: 0, // Contador de testes concluidos
    audioCtx: null,
    isSoundEnabled: true
};

const sequenceContainer = document.getElementById('typing-sequence');
const timerFill = document.getElementById('timer-fill');
const instructionVal = document.getElementById('instruction-val');
const counterVal = document.getElementById('caixinha-counter');
const stopBtn = document.getElementById('btn-stop-game');

// --- EFEITOS SONOROS ---
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
        case 'click':
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

// --- GERAÇÃO DOS BLOCOS (HTML) ---
function renderSequence() {
    sequenceContainer.innerHTML = '';
    
    state.sequence.forEach((char, index) => {
        const box = document.createElement('div');
        box.className = 'typing-square';
        box.dataset.index = index;
        box.textContent = char;
        
        if (state.gameState === 'waiting') {
            box.textContent = '?';
        }
        
        sequenceContainer.appendChild(box);
    });
}

// --- GERAÇÃO DO NÍVEL ---
function generatePuzzle(difficulty) {
    state.difficulty = difficulty || 'medium';
    
    let timeLimitText = '8s';
    if (state.difficulty === 'easy') timeLimitText = '10s';
    if (state.difficulty === 'hard') timeLimitText = '5s';
    
    document.getElementById('level-val').textContent = `TEMPO: ${timeLimitText}`;
    
    if (state.gameState === 'won' || state.gameState === 'lost') {
        state.gameState = 'waiting';
    }
    
    if (state.gameState !== 'playing') {
        state.hacksCompleted = 0;
    }
    state.currentIndex = 0;
    
    if (stopBtn) {
        stopBtn.style.visibility = 'hidden';
    }
    
    // Esconder overlays
    document.getElementById('success-overlay').classList.remove('show');
    document.getElementById('fail-overlay').classList.remove('show');
    
    // Sortear nova sequência (sempre 8 caracteres)
    state.sequence = [];
    for (let i = 0; i < SEQUENCE_LENGTH; i++) {
        const randKey = ALLOWED_KEYS[Math.floor(Math.random() * ALLOWED_KEYS.length)];
        state.sequence.push(randKey);
    }
    
    renderSequence();
    
    // Limpar barra de tempo e contador
    clearInterval(state.timerInterval);
    timerFill.style.width = '100%';
    timerFill.style.background = '#4a4a4a'; // cinza neutro antes de iniciar
    counterVal.textContent = `0/${SEQUENCE_LENGTH}`;
    
    if (state.gameState !== 'playing') {
        instructionVal.textContent = "AGUARDANDO INÍCIO";
        instructionVal.style.color = COLORS.cyan;
    } else {
        if (state.gameMode === 'standard') {
            instructionVal.textContent = `ACERTOS: ${state.hacksCompleted} / 3`;
        } else {
            instructionVal.textContent = `ACERTOS: ${state.hacksCompleted}`;
        }
        instructionVal.style.color = COLORS.green;
        
        // Se já está jogando e geramos um novo nível, iniciar timer novamente
        let durationMs = 8000;
        if (state.difficulty === 'easy') durationMs = 10000;
        if (state.difficulty === 'hard') durationMs = 5000;
        startTimer(durationMs, () => {
            if (state.gameState === 'playing') failGame();
        });
    }
}

// --- INÍCIO DO JOGO ---
function startGame() {
    if (state.gameState === 'playing') return;
    initAudio();
    
    state.gameState = 'playing';
    state.currentIndex = 0;
    state.hacksCompleted = 0;
    
    if (stopBtn) {
        stopBtn.style.visibility = 'visible';
    }
    
    document.getElementById('success-overlay').classList.remove('show');
    document.getElementById('fail-overlay').classList.remove('show');
    
    // Mostrar a sequência
    renderSequence();
    
    // Marcar a primeira letra como ativa (aguardando digitação)
    updateActiveSquare();
    
    if (state.gameMode === 'standard') {
        instructionVal.textContent = `ACERTOS: 0 / 3`;
    } else {
        instructionVal.textContent = `ACERTOS: 0`;
    }
    instructionVal.style.color = COLORS.green;
    
    // Iniciar timer
    let durationMs = 8000;
    if (state.difficulty === 'easy') durationMs = 10000;
    if (state.difficulty === 'hard') durationMs = 5000;
    
    startTimer(durationMs, () => {
        if (state.gameState === 'playing') {
            failGame();
        }
    });
}

function updateActiveSquare() {
    const squares = document.querySelectorAll('.typing-square');
    squares.forEach((sq, idx) => {
        sq.classList.remove('active');
        if (idx === state.currentIndex) {
            sq.classList.add('active');
        }
    });
}

// --- DIGITAÇÃO DO TECLADO ---
function handleKeyPress(key) {
    if (state.gameState !== 'playing') return;
    initAudio();
    
    const expectedKey = state.sequence[state.currentIndex];
    const squares = document.querySelectorAll('.typing-square');
    const sq = squares[state.currentIndex];
    
    if (key === expectedKey) {
        // Acertou a letra
        playSound('click');
        sq.classList.remove('active');
        sq.classList.add('correct');
        
        state.currentIndex++;
        counterVal.textContent = `${state.currentIndex}/${SEQUENCE_LENGTH}`;
        
        if (state.currentIndex >= state.sequence.length) {
            // Completou o teste atual!
            playSound('success');
            state.hacksCompleted++;
            
            if (state.gameMode === 'standard' && state.hacksCompleted >= 3) {
                // Ganhou o jogo padrão!
                winGame();
            } else {
                // Gerar próximo teste imediatamente
                generatePuzzle(state.difficulty);
            }
        } else {
            updateActiveSquare();
        }
    } else {
        // Errou a letra
        playSound('error');
        
        // Feedback visual de erro (tremer)
        const devWrapper = document.querySelector('.caixinha-device-wrapper');
        if (devWrapper) {
            devWrapper.classList.remove('shake');
            void devWrapper.offsetWidth;
            devWrapper.classList.add('shake');
        }
        
        // Volta do início daquele código, não perde (só perde por tempo)
        state.currentIndex = 0;
        counterVal.textContent = `0/${SEQUENCE_LENGTH}`;
        
        // Limpar todas as marcações e reativar a primeira letra
        squares.forEach(s => s.classList.remove('correct', 'wrong', 'active'));
        updateActiveSquare();
    }
}

// --- LÓGICA DE DERROTA/VITÓRIA ---
function winGame() {
    state.gameState = 'won';
    clearInterval(state.timerInterval);
    playSound('victory');
    document.getElementById('success-overlay').classList.add('show');
    
    if (stopBtn) {
        stopBtn.style.visibility = 'hidden';
    }
    
    const squares = document.querySelectorAll('.typing-square');
    squares.forEach(sq => {
        sq.classList.remove('active');
        sq.classList.add('correct');
    });
}

function failGame() {
    state.gameState = 'lost';
    clearInterval(state.timerInterval);
    playSound('error');
    
    // Revelar todos os pendentes em vermelho
    const squares = document.querySelectorAll('.typing-square');
    for (let i = state.currentIndex; i < state.sequence.length; i++) {
        if(squares[i]) {
            squares[i].classList.remove('active');
            squares[i].classList.add('wrong');
        }
    }
    
    // Atualizar mensagem de erro com a quantidade de acertos
    const failOverlay = document.getElementById('fail-overlay');
    const msgElement = failOverlay.querySelector('p');
    msgElement.innerHTML = `Falha no sistema.<br>Você completou <strong>${state.hacksCompleted}</strong> testes corretamente.`;
    
    failOverlay.classList.add('show');
    
    if (stopBtn) {
        stopBtn.style.visibility = 'hidden';
    }
    
    // Tremer a tela
    const devWrapper = document.querySelector('.caixinha-device-wrapper');
    devWrapper.classList.remove('shake');
    void devWrapper.offsetWidth;
    devWrapper.classList.add('shake');
}

// --- TEMPORIZADOR COM BARRA ---
function startTimer(durationMs, onComplete) {
    clearInterval(state.timerInterval);
    
    state.totalTime = durationMs;
    state.timeRemaining = durationMs;
    
    const startTime = performance.now();
    timerFill.style.background = COLORS.green;
    
    state.timerInterval = setInterval(() => {
        const elapsed = performance.now() - startTime;
        state.timeRemaining = Math.max(0, durationMs - elapsed);
        
        const pct = (state.timeRemaining / durationMs) * 100;
        timerFill.style.width = `${pct}%`;
        
        if (pct < 25) {
            timerFill.style.background = COLORS.error;
        }
        
        if (state.timeRemaining <= 0) {
            clearInterval(state.timerInterval);
            onComplete();
        }
    }, 16); // ~60fps
}

// --- EVENTOS E INICIALIZAÇÃO ---
window.addEventListener('keydown', (e) => {
    // Tecla apertada em upper case
    const key = e.key.toUpperCase();
    
    // ESPAÇO (' ') E ENTER
    if (key === 'ENTER' || key === ' ') {
        e.preventDefault(); // Evitar scroll de tela no espaço
        if (state.gameState === 'playing') {
            failGame(); // Pausar/Stop equivale a falhar e cancelar o treino
        } else if (state.gameState === 'waiting' || state.gameState === 'won' || state.gameState === 'lost') {
            if (state.gameState === 'won' || state.gameState === 'lost') {
                generatePuzzle(state.difficulty);
            } else {
                startGame();
            }
        }
        return;
    }
    
    if (state.gameState === 'playing') {
        // Ignorar teclas que não importam
        if (ALLOWED_KEYS.includes(key)) {
            handleKeyPress(key);
            e.preventDefault();
        }
        return;
    }
    
    if (key === 'ESCAPE') {
        generatePuzzle(state.difficulty);
        e.preventDefault();
    }
});

document.getElementById('btn-start').addEventListener('click', () => {
    if (state.gameState === 'waiting') {
        startGame();
    } else {
        generatePuzzle(state.difficulty);
    }
});

document.getElementById('btn-next-puzzle').addEventListener('click', () => {
    generatePuzzle(state.difficulty);
});

document.getElementById('btn-retry-puzzle').addEventListener('click', () => {
    generatePuzzle(state.difficulty);
});

if (stopBtn) {
    stopBtn.addEventListener('click', () => {
        if (state.gameState === 'playing') {
            failGame();
        } else {
            generatePuzzle(state.difficulty);
        }
    });
}

// Opções do menu
document.getElementById('btn-easy').addEventListener('click', () => {
    switchActiveDiffButton('btn-easy', 'difficulty');
    generatePuzzle('easy');
    closeSettingsDrawer();
});

document.getElementById('btn-medium').addEventListener('click', () => {
    switchActiveDiffButton('btn-medium', 'difficulty');
    generatePuzzle('medium');
    closeSettingsDrawer();
});

document.getElementById('btn-hard').addEventListener('click', () => {
    switchActiveDiffButton('btn-hard', 'difficulty');
    generatePuzzle('hard');
    closeSettingsDrawer();
});

document.getElementById('btn-mode-standard').addEventListener('click', () => {
    switchActiveDiffButton('btn-mode-standard', 'mode');
    state.gameMode = 'standard';
    generatePuzzle(state.difficulty);
    closeSettingsDrawer();
});

document.getElementById('btn-mode-endless').addEventListener('click', () => {
    switchActiveDiffButton('btn-mode-endless', 'mode');
    state.gameMode = 'endless';
    generatePuzzle(state.difficulty);
    closeSettingsDrawer();
});

function switchActiveDiffButton(id, type) {
    if (type === 'difficulty') {
        document.querySelectorAll('.diff-btn:not(.mode-btn)').forEach(btn => btn.classList.remove('active'));
    } else {
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    }
    document.getElementById(id).classList.add('active');
}

// Inicialização Geral
window.addEventListener('load', () => {
    // Configurar estrelas do fundo
    const bgCanvas = document.getElementById('starfield-bg');
    if(bgCanvas) {
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
    }
    
    // Configurar Drawer
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
    
    // Iniciar
    generatePuzzle('medium');
});

function closeSettingsDrawer() {
    const drawer = document.getElementById('settings-drawer');
    if (drawer) {
        drawer.classList.remove('open');
    }
}
