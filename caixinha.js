// --- CAIXINHA ELETRÔNICO (MINIJOGO DE DIGITAÇÃO RÁPIDA GTA RP) ---
const COLORS = {
    bg: '#040814',
    squareBg: 'rgba(6, 13, 26, 0.85)',
    squareHover: 'rgba(0, 210, 255, 0.25)',
    cyan: '#00d2ff',
    blue: '#2563eb',
    green: '#00e676',
    error: '#ff1744',
    text: '#ffffff',
    textMuted: '#94a3b8'
};

const ALLOWED_KEYS = ['Q', 'W', 'E', 'A', 'S', 'D'];
const SEQUENCE_LENGTH = 8;

const state = {
    difficulty: 'medium', // easy (12s), medium (9s), hard (6.5s)
    gameMode: 'standard', // standard (3 sequências), endless (infinito)
    sequence: [], // Array com 8 teclas
    currentIndex: 0,
    gameState: 'waiting', // waiting, playing, won, lost
    timerAnimId: null,
    timerInterval: null,
    timeRemaining: 0,
    totalTime: 0,
    hacksCompleted: 0,
    audioCtx: null,
    isSoundEnabled: true
};

const sequenceContainer = document.getElementById('typing-sequence');
const timerFill = document.getElementById('timer-fill');
const instructionVal = document.getElementById('instruction-val');
const counterVal = document.getElementById('caixinha-counter');

// --- EFEITOS SONOROS SEGUROS ---
function initAudio() {
    try {
        if (!state.audioCtx) {
            state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (state.audioCtx && state.audioCtx.state === 'suspended') {
            state.audioCtx.resume();
        }
    } catch (e) {
        console.warn('Audio init warning:', e);
    }
}

function playSound(type) {
    if (!state.isSoundEnabled) return;
    initAudio();
    if (!state.audioCtx) return;

    try {
        const now = state.audioCtx.currentTime;

        switch (type) {
            case 'click': {
                const osc = state.audioCtx.createOscillator();
                const gain = state.audioCtx.createGain();
                osc.connect(gain);
                gain.connect(state.audioCtx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);
                gain.gain.setValueAtTime(0.06, now);
                gain.gain.linearRampToValueAtTime(0.001, now + 0.04);
                osc.start(now);
                osc.stop(now + 0.04);
                break;
            }
            case 'success': {
                const osc = state.audioCtx.createOscillator();
                const gain = state.audioCtx.createGain();
                osc.connect(gain);
                gain.connect(state.audioCtx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(659, now);
                osc.frequency.setValueAtTime(880, now + 0.08);
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.linearRampToValueAtTime(0.001, now + 0.22);
                osc.start(now);
                osc.stop(now + 0.22);
                break;
            }
            case 'error': {
                const osc = state.audioCtx.createOscillator();
                const gain = state.audioCtx.createGain();
                osc.connect(gain);
                gain.connect(state.audioCtx.destination);
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(140, now);
                osc.frequency.linearRampToValueAtTime(80, now + 0.2);
                gain.gain.setValueAtTime(0.14, now);
                gain.gain.linearRampToValueAtTime(0.001, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;
            }
            case 'victory': {
                const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5];
                notes.forEach((freq, i) => {
                    const osc = state.audioCtx.createOscillator();
                    const gain = state.audioCtx.createGain();
                    osc.connect(gain);
                    gain.connect(state.audioCtx.destination);
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now + i * 0.07);
                    gain.gain.setValueAtTime(0.07, now + i * 0.07);
                    gain.gain.linearRampToValueAtTime(0.001, now + i * 0.07 + 0.25);
                    osc.start(now + i * 0.07);
                    osc.stop(now + i * 0.07 + 0.25);
                });
                break;
            }
        }
    } catch {}
}

// --- RENDERIZAÇÃO DOS QUADRADOS DE TECLAS ---
function renderSequence() {
    if (!sequenceContainer) return;
    sequenceContainer.innerHTML = '';

    state.sequence.forEach((char, index) => {
        const box = document.createElement('div');
        box.className = 'typing-square';
        box.dataset.index = index;
        box.textContent = char;

        box.addEventListener('click', () => {
            if (state.gameState === 'waiting') {
                startGame();
            }
        });

        sequenceContainer.appendChild(box);
    });

    if (counterVal) {
        counterVal.textContent = `${state.currentIndex}/${SEQUENCE_LENGTH}`;
    }
}

function updateActiveSquare() {
    const squares = document.querySelectorAll('.typing-square');
    squares.forEach((sq, idx) => {
        sq.classList.remove('active');
        if (state.gameState === 'playing' && idx === state.currentIndex) {
            sq.classList.add('active');
        }
    });

    // Atualiza destaque no teclado virtual
    const expectedKey = state.sequence[state.currentIndex];
    document.querySelectorAll('.vkey-btn').forEach((btn) => {
        btn.classList.remove('active-target');
        if (state.gameState === 'playing' && btn.getAttribute('data-key') === expectedKey) {
            btn.classList.add('active-target');
        }
    });
}

// --- GERAÇÃO DO NÍVEL ---
function getDurationForRound() {
    let baseMs = 9000;
    if (state.difficulty === 'easy') baseMs = 12000;
    if (state.difficulty === 'hard') baseMs = 6500;

    let speedMult = 1.0;
    if (state.hacksCompleted === 1) speedMult = 1.2;
    else if (state.hacksCompleted >= 2) speedMult = 1.4;

    const durationMs = Math.round(baseMs / speedMult);

    const levelVal = document.getElementById('level-val');
    if (levelVal) {
        levelVal.textContent = `${(durationMs / 1000).toFixed(1)}s`;
    }

    return durationMs;
}

function generatePuzzle(difficulty) {
    if (difficulty) state.difficulty = difficulty;

    stopTimer();

    if (state.gameState === 'won' || state.gameState === 'lost') {
        state.gameState = 'waiting';
        state.hacksCompleted = 0;
    }
    state.currentIndex = 0;

    // Esconde banners de vitória/derrota
    document.getElementById('success-overlay')?.classList.remove('show');
    document.getElementById('fail-overlay')?.classList.remove('show');

    // Sorteia nova sequência de 8 caracteres
    state.sequence = [];
    for (let i = 0; i < SEQUENCE_LENGTH; i++) {
        const randKey = ALLOWED_KEYS[Math.floor(Math.random() * ALLOWED_KEYS.length)];
        state.sequence.push(randKey);
    }

    renderSequence();
    updateActiveSquare();

    if (state.gameState === 'playing') {
        if (instructionVal) {
            if (state.gameMode === 'standard') {
                instructionVal.textContent = `ACERTOS: ${state.hacksCompleted} / 3`;
            } else {
                instructionVal.textContent = `ACERTOS: ${state.hacksCompleted}`;
            }
            instructionVal.style.color = COLORS.green;
        }

        const durationMs = getDurationForRound();
        startTimer(durationMs, () => {
            if (state.gameState === 'playing') failGame();
        });
    } else {
        if (timerFill) {
            timerFill.style.width = '100%';
            timerFill.style.background = 'linear-gradient(90deg, #00d2ff, #2563eb)';
        }
        if (instructionVal) {
            instructionVal.textContent = 'AGUARDANDO INÍCIO';
            instructionVal.style.color = COLORS.cyan;
        }
        const levelVal = document.getElementById('level-val');
        if (levelVal) {
            let baseText = '9.0s';
            if (state.difficulty === 'easy') baseText = '12.0s';
            if (state.difficulty === 'hard') baseText = '6.5s';
            levelVal.textContent = baseText;
        }
    }
}

// --- INICIAR JOGO ---
function startGame() {
    initAudio();

    state.gameState = 'playing';
    state.currentIndex = 0;

    document.getElementById('success-overlay')?.classList.remove('show');
    document.getElementById('fail-overlay')?.classList.remove('show');

    // Se sequência estiver vazia, gera
    if (state.sequence.length === 0) {
        state.sequence = [];
        for (let i = 0; i < SEQUENCE_LENGTH; i++) {
            const randKey = ALLOWED_KEYS[Math.floor(Math.random() * ALLOWED_KEYS.length)];
            state.sequence.push(randKey);
        }
    }

    renderSequence();
    updateActiveSquare();

    if (instructionVal) {
        if (state.gameMode === 'standard') {
            instructionVal.textContent = `ACERTOS: ${state.hacksCompleted} / 3`;
        } else {
            instructionVal.textContent = `ACERTOS: ${state.hacksCompleted}`;
        }
        instructionVal.style.color = COLORS.green;
    }

    const durationMs = getDurationForRound();
    startTimer(durationMs, () => {
        if (state.gameState === 'playing') {
            failGame();
        }
    });
}

// --- DIGITAÇÃO DO TECLADO / CLIQUE ---
function handleKeyPress(key) {
    if (state.gameState === 'waiting') {
        startGame();
        // Se a tecla pressionada for igual a primeira, processa como acerto
        if (key === state.sequence[0]) {
            processKey(key);
        }
        return;
    }

    if (state.gameState !== 'playing') return;
    processKey(key);
}

function processKey(key) {
    initAudio();

    const expectedKey = state.sequence[state.currentIndex];
    const squares = document.querySelectorAll('.typing-square');
    const sq = squares[state.currentIndex];

    if (key === expectedKey) {
        // Acertou a letra
        playSound('click');
        if (sq) {
            sq.classList.remove('active');
            sq.classList.add('correct');
        }

        state.currentIndex++;
        if (counterVal) {
            counterVal.textContent = `${state.currentIndex}/${SEQUENCE_LENGTH}`;
        }

        if (state.currentIndex >= state.sequence.length) {
            // Completou a sequência com sucesso
            playSound('success');
            state.hacksCompleted++;

            if (state.gameMode === 'standard' && state.hacksCompleted >= 3) {
                winGame();
            } else {
                // Próxima rodada
                setTimeout(() => {
                    generatePuzzle(state.difficulty);
                }, 150);
            }
        } else {
            updateActiveSquare();
        }
    } else {
        // Errou a letra
        playSound('error');

        const devWrapper = document.querySelector('.caixinha-device-wrapper');
        if (devWrapper) {
            devWrapper.classList.remove('shake');
            void devWrapper.offsetWidth;
            devWrapper.classList.add('shake');
        }

        // Reseta o progresso da sequência atual
        state.currentIndex = 0;
        if (counterVal) {
            counterVal.textContent = `0/${SEQUENCE_LENGTH}`;
        }

        squares.forEach((s) => s.classList.remove('correct', 'wrong', 'active'));
        updateActiveSquare();
    }
}

// --- VITÓRIA E DERROTA ---
function winGame() {
    state.gameState = 'won';
    stopTimer();
    playSound('victory');

    const successOverlay = document.getElementById('success-overlay');
    if (successOverlay) {
        const msg = document.getElementById('success-message');
        if (msg) msg.textContent = `Você hackeou todas as 3 caixas eletrônicas com sucesso!`;
        successOverlay.classList.add('show');
    }

    if (instructionVal) {
        instructionVal.textContent = 'SISTEMA HACKEADO COM SUCESSO!';
        instructionVal.style.color = COLORS.green;
    }

    const squares = document.querySelectorAll('.typing-square');
    squares.forEach((sq) => {
        sq.classList.remove('active');
        sq.classList.add('correct');
    });
}

function failGame() {
    state.gameState = 'lost';
    stopTimer();
    playSound('error');

    // Marca as pendentes em vermelho
    const squares = document.querySelectorAll('.typing-square');
    for (let i = state.currentIndex; i < state.sequence.length; i++) {
        if (squares[i]) {
            squares[i].classList.remove('active');
            squares[i].classList.add('wrong');
        }
    }

    const failOverlay = document.getElementById('fail-overlay');
    if (failOverlay) {
        const bannerText = failOverlay.querySelector('.banner-text');
        if (bannerText) {
            bannerText.innerHTML = `
                <i class="fa-solid fa-triangle-exclamation"></i>
                <div>
                    <strong>FALHA NO SISTEMA:</strong> Tempo esgotado ou sequência interrompida.<br>
                    <span style="font-size: 0.85em; opacity: 0.9;">Você completou <strong>${state.hacksCompleted}</strong> sequência(s) corretamente.</span>
                </div>
            `;
        }
        failOverlay.classList.add('show');
    }

    if (instructionVal) {
        instructionVal.textContent = 'ACESSO NEGADO (TEMPO ESGOTADO)';
        instructionVal.style.color = COLORS.error;
    }

    const devWrapper = document.querySelector('.caixinha-device-wrapper');
    if (devWrapper) {
        devWrapper.classList.remove('shake');
        void devWrapper.offsetWidth;
        devWrapper.classList.add('shake');
    }
}

// --- TEMPORIZADOR SUAVE (60 FPS) ---
function stopTimer() {
    if (state.timerAnimId) {
        cancelAnimationFrame(state.timerAnimId);
        state.timerAnimId = null;
    }
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }
}

function startTimer(durationMs, onComplete) {
    stopTimer();

    state.totalTime = durationMs;
    state.timeRemaining = durationMs;

    const startTime = performance.now();
    if (timerFill) {
        timerFill.style.width = '100%';
        timerFill.style.background = 'linear-gradient(90deg, #00d2ff, #2563eb)';
    }

    function updateFrame(now) {
        if (state.gameState !== 'playing') return;

        const elapsed = now - startTime;
        state.timeRemaining = Math.max(0, durationMs - elapsed);

        const pct = (state.timeRemaining / durationMs) * 100;
        if (timerFill) {
            timerFill.style.width = `${pct}%`;
            if (pct < 30) {
                timerFill.style.background = '#ef4444';
            } else if (pct < 60) {
                timerFill.style.background = '#f59e0b';
            } else {
                timerFill.style.background = 'linear-gradient(90deg, #00d2ff, #2563eb)';
            }
        }

        const levelVal = document.getElementById('level-val');
        if (levelVal) {
            const remSec = (state.timeRemaining / 1000).toFixed(1);
            levelVal.textContent = `${remSec}s`;
        }

        if (state.timeRemaining <= 0) {
            stopTimer();
            onComplete();
        } else {
            state.timerAnimId = requestAnimationFrame(updateFrame);
        }
    }

    state.timerAnimId = requestAnimationFrame(updateFrame);
}

// --- EVENTOS DE TECLADO E BOTÕES ---
window.addEventListener('keydown', (e) => {
    const key = e.key.toUpperCase();

    if (key === 'ENTER' || key === ' ') {
        e.preventDefault();
        if (state.gameState === 'playing') {
            failGame();
        } else {
            startGame();
        }
        return;
    }

    if (ALLOWED_KEYS.includes(key)) {
        e.preventDefault();
        handleKeyPress(key);
        return;
    }

    if (key === 'ESCAPE') {
        e.preventDefault();
        state.gameState = 'waiting';
        state.hacksCompleted = 0;
        generatePuzzle(state.difficulty);
    }
});

// Botões de início e retry
document.getElementById('btn-start-caixinha')?.addEventListener('click', () => {
    startGame();
});

document.getElementById('btn-next-puzzle')?.addEventListener('click', () => {
    state.gameState = 'waiting';
    state.hacksCompleted = 0;
    generatePuzzle(state.difficulty);
    startGame();
});

document.getElementById('btn-retry-puzzle')?.addEventListener('click', () => {
    state.gameState = 'waiting';
    state.hacksCompleted = 0;
    generatePuzzle(state.difficulty);
    startGame();
});

// Botões de Dificuldade
document.getElementById('btn-easy')?.addEventListener('click', () => {
    switchActiveDiffButton('btn-easy', 'difficulty');
    state.gameState = 'waiting';
    generatePuzzle('easy');
});

document.getElementById('btn-medium')?.addEventListener('click', () => {
    switchActiveDiffButton('btn-medium', 'difficulty');
    state.gameState = 'waiting';
    generatePuzzle('medium');
});

document.getElementById('btn-hard')?.addEventListener('click', () => {
    switchActiveDiffButton('btn-hard', 'difficulty');
    state.gameState = 'waiting';
    generatePuzzle('hard');
});

// Modos de Jogo
document.getElementById('btn-mode-standard')?.addEventListener('click', () => {
    switchActiveDiffButton('btn-mode-standard', 'mode');
    state.gameMode = 'standard';
    state.gameState = 'waiting';
    generatePuzzle(state.difficulty);
});

document.getElementById('btn-mode-endless')?.addEventListener('click', () => {
    switchActiveDiffButton('btn-mode-endless', 'mode');
    state.gameMode = 'endless';
    state.gameState = 'waiting';
    generatePuzzle(state.difficulty);
});

function switchActiveDiffButton(id, type) {
    if (type === 'difficulty') {
        document.querySelectorAll('.diff-btn:not(.mode-btn)').forEach((btn) => btn.classList.remove('active'));
    } else {
        document.querySelectorAll('.mode-btn').forEach((btn) => btn.classList.remove('active'));
    }
    document.getElementById(id)?.classList.add('active');
}

// Configuração do Teclado Virtual (Mouse e Touch)
function initVirtualKeypad() {
    document.querySelectorAll('.vkey-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const k = btn.getAttribute('data-key');
            if (k) {
                handleKeyPress(k);
            }
        });
    });
}

// Inicialização
window.addEventListener('DOMContentLoaded', () => {
    initVirtualKeypad();
    generatePuzzle('medium');
});

// Estrelas de fundo
const bgCanvas = document.getElementById('starfield-bg');
if (bgCanvas) {
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
                phase: Math.random() * Math.PI,
            });
        }
    }

    function animateStars() {
        bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
        stars.forEach((star) => {
            star.phase += star.twinkleSpeed;
            const opacity = ((Math.sin(star.phase) + 1) / 2) * 0.7 + 0.3;
            bgCtx.fillStyle = `rgba(0, 210, 255, ${opacity * 0.55})`;
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
