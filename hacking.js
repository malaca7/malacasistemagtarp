// --- SIMULADOR DE HACKING & DECODIFICAÇÃO (MALACA SYSTEM GTARP) ---
const state = {
    gameState: 'waiting', // waiting, playing, won, lost
    timer: 0,
    timeLimit: 20,
    timerInterval: null,
    scrambleInterval: null,
    startTime: 0,

    charSet: 'all',
    targetLength: 4,
    gridRows: 8,
    gridCols: 10,
    gridSize: 80, // 8 x 10 = 80 células

    gridChars: [],
    targetChars: [],
    correctPos: 0,
    cursorPos: 34,

    streak: 0,
    maxStreak: 0,
    soundEnabled: true,
    audioCtx: null,
};

const CHARACTER_SETS = {
    numeric: '0123456789',
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    greek: 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ',
    braille: '⡀⡁⡂⡃⡄⡅⡆⡇⡈⡉⡊⡋⡌⡍⡎⡏⡐⡑⡒⡓⡔⡕⡖⡗⡘⡙⡚⡛⡜⡝⡞⡟⡠⡡⡢⡣⡤⡥⡦⡧⡨⡩⡪⡫⡬⡭⡮⡯⡰⡱⡲⡳⡴⡵⡶⡷⡸⡹⡺⡻⡼⡽⡾⡿',
    runes: 'ᚠᚥᚧᚨᚩᚬᚭᚻᛐᛑᛒᛓᛔᛕᛖᛗᛘᛙᛚᛛᛜᛝᛞᛟᛤ',
    symbols: '☎☚☛☜☞☟☠☢☣☮☯♨♩♪♫♬Ψ♆✂✄෧✆✉✦✧✿❀',
};

// Web Audio API Sound Generator Seguro
function initAudio() {
    try {
        if (!state.audioCtx) {
            state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (state.audioCtx && state.audioCtx.state === 'suspended') {
            state.audioCtx.resume();
        }
    } catch {}
}

function playSound(type) {
    if (!state.soundEnabled) return;
    initAudio();
    if (!state.audioCtx) return;

    try {
        const now = state.audioCtx.currentTime;
        const osc = state.audioCtx.createOscillator();
        const gainNode = state.audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(state.audioCtx.destination);

        if (type === 'move') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, now);
            gainNode.gain.setValueAtTime(0.04, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (type === 'error') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(140, now);
            gainNode.gain.setValueAtTime(0.18, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'success') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(520, now);
            osc.frequency.setValueAtTime(880, now + 0.08);
            gainNode.gain.setValueAtTime(0.12, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
            osc.start(now);
            osc.stop(now + 0.35);
        }
    } catch {}
}

let activeSetChars = '';

function getRandomChar() {
    return activeSetChars.charAt(Math.floor(Math.random() * activeSetChars.length));
}

// Gera uma posição inicial válida para que a sequência não quebre entre linhas
function getRandomValidRowPos(length) {
    const row = Math.floor(Math.random() * state.gridRows);
    const maxCol = state.gridCols - length;
    const col = Math.floor(Math.random() * (maxCol + 1));
    return row * state.gridCols + col;
}

function initGame() {
    stopTimer();
    stopScrambler();

    state.gameState = 'playing';
    state.timer = state.timeLimit;
    state.startTime = Date.now();

    document.getElementById('success-overlay')?.classList.remove('show');
    document.getElementById('fail-overlay')?.classList.remove('show');

    // Seleciona conjunto de caracteres
    if (state.charSet === 'all') {
        const keys = Object.keys(CHARACTER_SETS);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        activeSetChars = CHARACTER_SETS[randomKey];
    } else {
        activeSetChars = CHARACTER_SETS[state.charSet] || CHARACTER_SETS.numeric;
    }

    // Gera sequência alvo
    state.targetChars = [];
    for (let i = 0; i < state.targetLength; i++) {
        state.targetChars.push(getRandomChar());
    }
    const targetCodeEl = document.getElementById('target-code');
    if (targetCodeEl) {
        targetCodeEl.textContent = state.targetChars.join(' ');
    }

    // Gera grid completo de 80 caracteres
    state.gridChars = [];
    for (let i = 0; i < state.gridSize; i++) {
        state.gridChars.push(getRandomChar());
    }

    // Posiciona a sequência gabarito
    state.correctPos = getRandomValidRowPos(state.targetLength);
    for (let i = 0; i < state.targetLength; i++) {
        state.gridChars[state.correctPos + i] = state.targetChars[i];
    }

    // Posiciona o cursor do jogador
    state.cursorPos = Math.floor(state.gridSize / 2) - 5;

    renderGrid();
    startTimer();
    startScrambler();
    updateHUD();
}

function renderGrid() {
    const gridEl = document.getElementById('character-soup-grid');
    if (!gridEl) return;
    gridEl.innerHTML = '';

    for (let i = 0; i < state.gridSize; i++) {
        const cell = document.createElement('div');
        cell.className = 'char-cell';
        cell.textContent = state.gridChars[i];
        cell.dataset.index = i;

        // Destaque do cursor
        if (i >= state.cursorPos && i < state.cursorPos + state.targetLength) {
            cell.classList.add('selected-cursor');
            if (i === state.cursorPos) {
                cell.classList.add('selected-cursor-head');
            }
        }

        // Clique interativo na célula do grid
        cell.addEventListener('click', () => {
            initAudio();
            if (state.gameState !== 'playing') return;

            if (state.cursorPos === i) {
                // Segundo clique na mesma célula -> envia o código
                submitSelection();
            } else {
                // Primeiro clique -> move cursor para cá
                state.cursorPos = i;
                playSound('move');
                updateCursorHighlight();
            }
        });

        gridEl.appendChild(cell);
    }
}

// Scrambler dinâmico: a cada 1.3 segundos, os dígitos e a sequência correm para a ESQUERDA
function startScrambler() {
    stopScrambler();

    state.scrambleInterval = setInterval(() => {
        if (state.gameState !== 'playing') return;

        // 1. Desloca todas as linhas de caracteres para a ESQUERDA
        for (let r = 0; r < state.gridRows; r++) {
            const rowStart = r * state.gridCols;
            for (let c = 0; c < state.gridCols - 1; c++) {
                state.gridChars[rowStart + c] = state.gridChars[rowStart + c + 1];
            }
            // Coluna na borda direita recebe novo caractere
            state.gridChars[rowStart + state.gridCols - 1] = getRandomChar();
        }

        // 2. Calcula nova posição do gabarito correndo para a ESQUERDA (-1)
        let currentRow = Math.floor(state.correctPos / state.gridCols);
        let currentCol = (state.correctPos % state.gridCols) - 1;

        if (currentCol < 0) {
            // Saiu pela borda esquerda: reaparece na borda direita da próxima linha
            currentCol = state.gridCols - state.targetLength;
            currentRow = (currentRow + 1) % state.gridRows;
        }

        state.correctPos = currentRow * state.gridCols + currentCol;

        // 3. Garante que os caracteres da sequência alvo permaneçam na nova posição
        for (let i = 0; i < state.targetLength; i++) {
            state.gridChars[state.correctPos + i] = state.targetChars[i];
        }

        // 4. Atualiza células no DOM
        const cells = document.querySelectorAll('.char-cell');
        for (let i = 0; i < state.gridSize; i++) {
            if (cells[i]) {
                cells[i].textContent = state.gridChars[i];
            }
        }
    }, 1300);
}

function stopScrambler() {
    if (state.scrambleInterval) {
        clearInterval(state.scrambleInterval);
        state.scrambleInterval = null;
    }
}

function updateCursorHighlight() {
    const cells = document.querySelectorAll('.char-cell');
    cells.forEach((cell, idx) => {
        cell.classList.remove('selected-cursor', 'selected-cursor-head');
        if (idx >= state.cursorPos && idx < state.cursorPos + state.targetLength) {
            cell.classList.add('selected-cursor');
            if (idx === state.cursorPos) {
                cell.classList.add('selected-cursor-head');
            }
        }
    });
}

function moveCursor(delta) {
    if (state.gameState !== 'playing') return;
    initAudio();

    state.cursorPos += delta;

    // Wrap around 0..79
    if (state.cursorPos < 0) {
        state.cursorPos += state.gridSize;
    } else if (state.cursorPos >= state.gridSize) {
        state.cursorPos -= state.gridSize;
    }

    playSound('move');
    updateCursorHighlight();
}

function submitSelection() {
    if (state.gameState !== 'playing') return;
    initAudio();

    const elapsedTime = ((Date.now() - state.startTime) / 1000).toFixed(2);

    // Checa se acertou a posição ou se a sequência de caracteres bate exatamente
    let isCorrect = state.cursorPos === state.correctPos;

    if (!isCorrect) {
        let match = true;
        for (let i = 0; i < state.targetLength; i++) {
            if (state.gridChars[state.cursorPos + i] !== state.targetChars[i]) {
                match = false;
                break;
            }
        }
        if (match) isCorrect = true;
    }

    if (isCorrect) {
        // Sucesso / Hack Concluído
        state.gameState = 'won';
        playSound('success');
        stopTimer();
        stopScrambler();

        state.streak++;
        if (state.streak > state.maxStreak) {
            state.maxStreak = state.streak;
        }
        updateHUD();

        // Destaque visual verde
        const cells = document.querySelectorAll('.char-cell');
        for (let i = 0; i < state.targetLength; i++) {
            if (cells[state.cursorPos + i]) {
                cells[state.cursorPos + i].classList.add('success-cell');
            }
        }

        const succTime = document.getElementById('succ-time');
        if (succTime) succTime.textContent = `${elapsedTime}s`;
        const succStreak = document.getElementById('succ-streak');
        if (succStreak) succStreak.textContent = state.streak;

        document.getElementById('success-overlay')?.classList.add('show');
    } else {
        // Erro
        state.streak = 0;
        updateHUD();
        stopScrambler();

        // Destaca seleção errada em vermelho
        const cells = document.querySelectorAll('.char-cell');
        for (let i = 0; i < state.targetLength; i++) {
            if (cells[state.cursorPos + i]) {
                cells[state.cursorPos + i].classList.add('fail-cell');
            }
        }

        // Revela onde estava a correta em verde
        for (let i = 0; i < state.targetLength; i++) {
            if (cells[state.correctPos + i]) {
                cells[state.correctPos + i].classList.add('success-cell');
            }
        }

        failGame('Sequência incorreta! Acesso negado.');
    }
}

function failGame(msg = 'Acesso Negado: tempo esgotado ou código incorreto.') {
    state.gameState = 'lost';
    playSound('error');
    stopTimer();
    stopScrambler();

    state.streak = 0;
    updateHUD();

    // Revela a posição correta em verde
    const cells = document.querySelectorAll('.char-cell');
    for (let i = 0; i < state.targetLength; i++) {
        if (cells[state.correctPos + i]) {
            cells[state.correctPos + i].classList.add('success-cell');
        }
    }

    const failOverlay = document.getElementById('fail-overlay');
    if (failOverlay) {
        const failMsg = document.getElementById('fail-message');
        if (failMsg) failMsg.textContent = msg;
        failOverlay.classList.add('show');
    }
}

function startTimer() {
    stopTimer();
    updateTimerDisplay();

    state.timerInterval = setInterval(() => {
        state.timer -= 0.1;
        updateTimerDisplay();
        if (state.timer <= 0) {
            failGame('Tempo esgotado! Acesso expirado.');
        }
    }, 100);
}

function stopTimer() {
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }
}

function updateTimerDisplay() {
    const t = Math.max(0, state.timer).toFixed(1);
    const timerVal = document.getElementById('timer-val');
    if (timerVal) timerVal.textContent = `${t}s`;
}

function updateHUD() {
    const valStreak = document.getElementById('val-streak');
    if (valStreak) valStreak.textContent = state.streak;
    const valMaxStreak = document.getElementById('val-max-streak');
    if (valMaxStreak) valMaxStreak.textContent = state.maxStreak;
}

// Atalhos de Teclado (WASD, Setas, Enter, Espaço)
window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();

    if (state.gameState === 'lost' || state.gameState === 'won') {
        if (key === 'enter' || key === ' ') {
            e.preventDefault();
            initGame();
        }
        return;
    }

    if (state.gameState === 'playing') {
        if (key === 'w' || key === 'arrowup') {
            e.preventDefault();
            moveCursor(-10);
        } else if (key === 's' || key === 'arrowdown') {
            e.preventDefault();
            moveCursor(10);
        } else if (key === 'a' || key === 'arrowleft') {
            e.preventDefault();
            moveCursor(-1);
        } else if (key === 'd' || key === 'arrowright') {
            e.preventDefault();
            moveCursor(1);
        } else if (key === 'enter') {
            e.preventDefault();
            submitSelection();
        } else if (key === 'escape') {
            e.preventDefault();
            initGame();
        }
    }
});

// Botões interativos
document.getElementById('btn-submit')?.addEventListener('click', submitSelection);
document.getElementById('btn-next-puzzle')?.addEventListener('click', initGame);
document.getElementById('btn-retry-puzzle')?.addEventListener('click', initGame);

// D-Pad Virtual para Celular e Mouse
document.getElementById('dpad-up')?.addEventListener('click', () => moveCursor(-10));
document.getElementById('dpad-down')?.addEventListener('click', () => moveCursor(10));
document.getElementById('dpad-left')?.addEventListener('click', () => moveCursor(-1));
document.getElementById('dpad-right')?.addEventListener('click', () => moveCursor(1));

// Seletores de Configuração
document.querySelectorAll('.charset-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.charset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.charSet = btn.getAttribute('data-set') || 'all';
        initGame();
    });
});

document.querySelectorAll('.length-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.length-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.targetLength = parseInt(btn.getAttribute('data-length') || '4', 10);
        initGame();
    });
});

document.querySelectorAll('.time-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.time-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.timeLimit = parseInt(btn.getAttribute('data-time') || '20', 10);
        initGame();
    });
});

// Estrelas de Fundo
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

// Inicia o jogo no carregamento
window.addEventListener('DOMContentLoaded', () => {
    initGame();
});
