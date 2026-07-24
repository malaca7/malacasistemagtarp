// Simulador de Hacking e Decodificação
const state = {
    gameState: 'waiting', // waiting, playing, won, lost
    timer: 0,
    timeLimit: 15,
    timerInterval: null,
    scrambleInterval: null,
    startTime: 0,
    
    charSet: 'all',
    targetLength: 4,
    gridSize: 80, // 8 rows x 10 cols
    
    gridChars: [],
    targetChars: [],
    correctPos: 0,
    cursorPos: 43,
    
    streak: 0,
    maxStreak: 0,
    soundEnabled: true
};

const CHARACTER_SETS = {
    numeric: "0123456789",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    alphanumeric: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    greek: "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ",
    braille: "⡀⡁⡂⡃⡄⡅⡆⡇⡈⡉⡊⡋⡌⡍⡎⡏⡐⡑⡒⡓⡔⡕⡖⡗⡘⡙⡚⡛⡜⡝⡞⡟⡠⡡⡢⡣⡤⡥⡦⡧⡨⡩⡪⡫⡬⡭⡮⡯⡰⡱⡲⡳⡴⡵⡶⡷⡸⡹⡺⡻⡼⡽⡾⡿",
    runes: "ᚠᚥᚧᚨᚩᚬᚭᚻᛐᛑᛒᛓᛔᛕᛖᛗᛘᛙᛚᛛᛜᛝᛞᛟᛤ",
    symbols: "☎☚☛☜☞☟☠☢☣☮☯♨♩♪♫♬Ψ♆✂✄෧✆✉✦✧✿❀"
};

const ALL_CHARS_COMBINED = Object.values(CHARACTER_SETS).join('');

// Web Audio API Sound Generator
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
    if (!state.soundEnabled || !audioContext) return;
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    const osc = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === 'move') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.04, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
        osc.start();
        osc.stop(audioContext.currentTime + 0.05);
    } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.35);
        osc.start();
        osc.stop(audioContext.currentTime + 0.35);
    } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, audioContext.currentTime);
        osc.frequency.setValueAtTime(880, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        osc.start();
        osc.stop(audioContext.currentTime + 0.4);
    }
}

let activeSetChars = "";

function getRandomChar() {
    return activeSetChars.charAt(Math.floor(Math.random() * activeSetChars.length));
}

function initGame() {
    state.gameState = 'playing';
    state.timer = state.timeLimit;
    state.startTime = Date.now();
    
    document.getElementById('success-overlay').classList.remove('show');
    document.getElementById('fail-overlay').classList.remove('show');
    
    // Se 'all' (Misto) estiver selecionado, escolhe 1 conjunto aleatório para este teste
    if (state.charSet === 'all') {
        const keys = Object.keys(CHARACTER_SETS);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        activeSetChars = CHARACTER_SETS[randomKey];
    } else {
        activeSetChars = CHARACTER_SETS[state.charSet] || CHARACTER_SETS.numeric;
    }
    
    // Gerar target string
    state.targetChars = [];
    for (let i = 0; i < state.targetLength; i++) {
        state.targetChars.push(getRandomChar());
    }
    document.getElementById('target-code').textContent = state.targetChars.join(' ');
    
    // Gerar grid de 80 caracteres aleatórios
    state.gridChars = [];
    for (let i = 0; i < state.gridSize; i++) {
        state.gridChars.push(getRandomChar());
    }
    
    // Escolher posição correta de início (garantir espaço para a sequência sem estourar 80)
    const maxStartPos = state.gridSize - state.targetLength;
    state.correctPos = Math.floor(Math.random() * (maxStartPos + 1));
    
    // Inserir a sequência exatamente a partir de correctPos
    for (let i = 0; i < state.targetLength; i++) {
        state.gridChars[state.correctPos + i] = state.targetChars[i];
    }
    
    // Posicionar o cursor inicial
    state.cursorPos = Math.floor(state.gridSize / 2) - 5;
    
    renderGrid();
    startTimer();
    startScrambler();
}

function renderGrid() {
    const gridEl = document.getElementById('character-soup-grid');
    gridEl.innerHTML = '';
    
    for (let i = 0; i < state.gridSize; i++) {
        const cell = document.createElement('div');
        cell.className = 'char-cell';
        cell.textContent = state.gridChars[i];
        cell.dataset.index = i;
        
        // Destacar o range do cursor selecionado (cursorPos ate cursorPos + targetLength - 1)
        if (i >= state.cursorPos && i < state.cursorPos + state.targetLength) {
            cell.classList.add('selected-cursor');
            if (i === state.cursorPos) {
                cell.classList.add('selected-cursor-head');
            }
        }
        
        gridEl.appendChild(cell);
    }
}

function startScrambler() {
    clearInterval(state.scrambleInterval);
    state.scrambleInterval = setInterval(() => {
        if (state.gameState !== 'playing') return;
        
        // 1. Mover a sequência correta 1 por 1 para a esquerda (subindo a linha ao estourar)
        const maxStartPos = state.gridSize - state.targetLength;
        state.correctPos--;
        if (state.correctPos < 0) {
            state.correctPos = maxStartPos;
        }
        
        // 2. Deslocar toda a malha em ordem: o primeiro símbolo vai exatamente para o final
        const firstChar = state.gridChars.shift();
        state.gridChars.push(firstChar);
        
        // 3. Garantir a sequência gabarito na posição exata
        for (let i = 0; i < state.targetLength; i++) {
            state.gridChars[state.correctPos + i] = state.targetChars[i];
        }
        
        // 4. Atualizar os textos das células no DOM
        const cells = document.querySelectorAll('.char-cell');
        for (let i = 0; i < state.gridSize; i++) {
            if (cells[i]) {
                cells[i].textContent = state.gridChars[i];
            }
        }
    }, 1500); // Passo ordenado a cada 1.5s
}

function stopScrambler() {
    clearInterval(state.scrambleInterval);
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
    
    const elapsedTime = ((Date.now() - state.startTime) / 1000).toFixed(2);
    
    // Verificar se acertou a posição inicial ou se os caracteres batem exatamente
    let isCorrect = (state.cursorPos === state.correctPos);
    
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
        // Vitória!
        state.gameState = 'won';
        playSound('success');
        stopTimer();
        stopScrambler();
        
        state.streak++;
        if (state.streak > state.maxStreak) {
            state.maxStreak = state.streak;
        }
        updateHUD();
        
        // Visual de acerto no grid
        const cells = document.querySelectorAll('.char-cell');
        for (let i = 0; i < state.targetLength; i++) {
            if (cells[state.cursorPos + i]) {
                cells[state.cursorPos + i].classList.add('success-cell');
            }
        }
        
        document.getElementById('succ-time').textContent = `${elapsedTime}s`;
        document.getElementById('succ-streak').textContent = state.streak;
        document.getElementById('success-overlay').classList.add('show');
        
    } else {
        // Erro!
        state.streak = 0;
        updateHUD();
        stopScrambler();
        
        // 1. Destacar a seleção errada do jogador em VERMELHO
        const cells = document.querySelectorAll('.char-cell');
        for (let i = 0; i < state.targetLength; i++) {
            if (cells[state.cursorPos + i]) {
                cells[state.cursorPos + i].classList.add('fail-cell');
            }
        }
        
        // 2. Destacar a posição CORRETA verdadeira em VERDE
        for (let i = 0; i < state.targetLength; i++) {
            if (cells[state.correctPos + i]) {
                cells[state.correctPos + i].classList.add('success-cell');
            }
        }
        
        failGame('Sequência incorreta!');
    }
}

function failGame(msg = 'O tempo esgotou ou você errou.') {
    if (state.gameState !== 'playing' && state.gameState !== 'lost') return;
    state.gameState = 'lost';
    playSound('error');
    stopTimer();
    stopScrambler();
    
    state.streak = 0;
    updateHUD();
    
    // Destacar a posição CORRETA verdadeira em VERDE ao esgotar o tempo
    const cells = document.querySelectorAll('.char-cell');
    for (let i = 0; i < state.targetLength; i++) {
        if (cells[state.correctPos + i]) {
            cells[state.correctPos + i].classList.add('success-cell');
        }
    }
    
    // Garantir que a mensagem de erro pop-up NÃO apareça por cima
    const failOverlay = document.getElementById('fail-overlay');
    if (failOverlay) failOverlay.classList.remove('show');
}

function startTimer() {
    clearInterval(state.timerInterval);
    updateTimerDisplay();
    state.timerInterval = setInterval(() => {
        state.timer -= 0.1;
        updateTimerDisplay();
        if (state.timer <= 0) {
            failGame('Tempo esgotado!');
        }
    }, 100);
}

function stopTimer() {
    clearInterval(state.timerInterval);
}

function updateTimerDisplay() {
    const t = Math.max(0, state.timer).toFixed(1);
    document.getElementById('timer-val').textContent = `${t}s`;
}

function updateHUD() {
    document.getElementById('val-streak').textContent = state.streak;
    document.getElementById('val-max-streak').textContent = state.maxStreak;
}

// Teclas de Atalho (WASD, Setas e Enter)
window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    
    // Quando perdeu, QUALQUER TECLA pressionada reinicia o teste instantaneamente
    if (state.gameState === 'lost') {
        e.preventDefault();
        initGame();
        return;
    }
    
    if (state.gameState === 'won') {
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
        } else if (key === ' ') {
            e.preventDefault();
            failGame('Hack interrompido pelo usuário.');
        }
    }
});

// Event Listeners do Jogo
const btnStop = document.getElementById('btn-stop-game');
if (btnStop) {
    btnStop.addEventListener('click', () => {
        if (state.gameState === 'playing') failGame('Hack interrompido.');
    });
}

const btnSubmit = document.getElementById('btn-submit');
if (btnSubmit) {
    btnSubmit.addEventListener('click', () => {
        if (state.gameState === 'playing') submitSelection();
    });
}

document.getElementById('btn-next-puzzle').addEventListener('click', initGame);
document.getElementById('btn-retry-puzzle').addEventListener('click', initGame);

// Configuração: Tipo de Caracteres (incluindo 'all' Misto)
document.querySelectorAll('.charset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.charset-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        state.charSet = e.target.getAttribute('data-set');
        initGame();
    });
});

// Configuração: Tamanho da Sequência
document.querySelectorAll('.length-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.length-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        state.targetLength = parseInt(e.target.getAttribute('data-length'), 10);
        initGame();
    });
});

// Configuração: Tempo Limite
document.querySelectorAll('.time-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        state.timeLimit = parseInt(e.target.getAttribute('data-time'), 10);
        initGame();
    });
});

// Iniciar o jogo no carregamento
initGame();
