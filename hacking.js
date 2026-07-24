// Simulador de Hacking e Decodificação
const state = {
    gameState: 'waiting', // waiting, playing, won, lost
    timer: 0,
    timeLimit: 15,
    timerInterval: null,
    startTime: 0,
    
    charSet: 'numeric',
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

function getRandomChar() {
    const chars = CHARACTER_SETS[state.charSet] || CHARACTER_SETS.numeric;
    return chars.charAt(Math.floor(Math.random() * chars.length));
}

function initGame() {
    state.gameState = 'playing';
    state.timer = state.timeLimit;
    state.startTime = Date.now();
    
    document.getElementById('success-overlay').classList.remove('show');
    document.getElementById('fail-overlay').classList.remove('show');
    
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
        
        // Eventos de Mouse
        cell.addEventListener('mouseenter', () => {
            if (state.gameState !== 'playing') return;
            state.cursorPos = i;
            playSound('move');
            updateCursorHighlight();
        });
        
        cell.addEventListener('click', () => {
            if (state.gameState !== 'playing') return;
            submitSelection();
        });
        
        gridEl.appendChild(cell);
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
    
    // Verificar se acertou a posição inicial ou os caracteres batem exatamente
    let isCorrect = (state.cursorPos === state.correctPos);
    
    if (!isCorrect) {
        // Checagem alternativa: validar se a sequência sob o cursor bate exatamente com a target
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
        
        // Visual de erro no grid
        const cells = document.querySelectorAll('.char-cell');
        for (let i = 0; i < state.targetLength; i++) {
            if (cells[state.cursorPos + i]) {
                cells[state.cursorPos + i].classList.add('fail-cell');
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
    
    state.streak = 0;
    updateHUD();
    
    document.getElementById('fail-message').textContent = msg;
    document.getElementById('fail-overlay').classList.add('show');
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
    
    if (state.gameState === 'won' || state.gameState === 'lost') {
        if (key === 'enter' || key === ' ') {
            e.preventDefault();
            initGame();
        }
        return;
    }
    
    if (state.gameState === 'playing') {
        if (key === 'w' || key === 'arrowup') {
            e.preventDefault();
            moveCursor(-10); // subir 1 linha (10 cols)
        } else if (key === 's' || key === 'arrowdown') {
            e.preventDefault();
            moveCursor(10); // descer 1 linha (10 cols)
        } else if (key === 'a' || key === 'arrowleft') {
            e.preventDefault();
            moveCursor(-1); // mover para esquerda
        } else if (key === 'd' || key === 'arrowright') {
            e.preventDefault();
            moveCursor(1); // mover para direita
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
document.getElementById('btn-stop-game').addEventListener('click', () => {
    if (state.gameState === 'playing') failGame('Hack interrompido.');
});
document.getElementById('btn-next-puzzle').addEventListener('click', initGame);
document.getElementById('btn-retry-puzzle').addEventListener('click', initGame);

// Configuração: Tipo de Caracteres
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

// Configuração: Som
document.getElementById('opt-sound').addEventListener('change', (e) => {
    state.soundEnabled = e.target.checked;
});

// Iniciar o jogo no carregamento
initGame();
