/**
 * STARFIELD DIGIPICK SIMULATOR
 * Lógica do Jogo, Geração Procedural e Efeitos de Áudio
 */

// --- CONFIGURAÇÃO DE ÁUDIO (Web Audio API) ---
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new AudioCtx();
    }
}

function playSound(type) {
    const optSound = document.getElementById('opt-sound');
    if (optSound && !optSound.checked) return;
    initAudio();
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    
    switch (type) {
        case 'click':
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, now);
            osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.linearRampToValueAtTime(0.001, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
            break;
        case 'tick':
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(180, now);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.linearRampToValueAtTime(0.001, now + 0.03);
            osc.start(now);
            osc.stop(now + 0.03);
            break;
        case 'slot':
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(240, now);
            osc.frequency.linearRampToValueAtTime(80, now + 0.12);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.linearRampToValueAtTime(0.001, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
            break;
        case 'clear':
            osc.type = 'sine';
            osc.frequency.setValueAtTime(500, now);
            osc.frequency.exponentialRampToValueAtTime(1600, now + 0.3);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0.001, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
            break;
        case 'error':
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, now);
            osc.frequency.setValueAtTime(95, now + 0.08);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0.001, now + 0.22);
            osc.start(now);
            osc.stop(now + 0.22);
            break;
        case 'victory':
            const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
            notes.forEach((freq, i) => {
                const noteOsc = audioCtx.createOscillator();
                const noteGain = audioCtx.createGain();
                noteOsc.connect(noteGain);
                noteGain.connect(audioCtx.destination);
                
                noteOsc.type = 'sine';
                noteOsc.frequency.setValueAtTime(freq, now + i * 0.08);
                noteGain.gain.setValueAtTime(0.06, now + i * 0.08);
                noteGain.gain.linearRampToValueAtTime(0.001, now + i * 0.08 + 0.35);
                
                noteOsc.start(now + i * 0.08);
                noteOsc.stop(now + i * 0.08 + 0.35);
            });
            break;
        case 'defeat':
            const sadNotes = [392.00, 349.23, 311.13, 261.63]; // G4, F4, D#4, C4
            sadNotes.forEach((freq, i) => {
                const noteOsc = audioCtx.createOscillator();
                const noteGain = audioCtx.createGain();
                noteOsc.connect(noteGain);
                noteGain.connect(audioCtx.destination);
                
                noteOsc.type = 'sine';
                noteOsc.frequency.setValueAtTime(freq, now + i * 0.12);
                noteGain.gain.setValueAtTime(0.08, now + i * 0.12);
                noteGain.gain.linearRampToValueAtTime(0.001, now + i * 0.12 + 0.4);
                
                noteOsc.start(now + i * 0.12);
                noteOsc.stop(now + i * 0.12 + 0.4);
            });
            break;
    }
}

// --- GERADOR DE NÚMEROS ALEATÓRIOS COM SEMENTE (Mulberry32) ---
function createRandom(seedString) {
    let h = 1779033703 ^ seedString.length;
    for (let i = 0; i < seedString.length; i++) {
        h = Math.imul(h ^ seedString.charCodeAt(i), 3432918353);
        h = (h << 13) | (h >>> 19);
    }
    return function() {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        return ((h ^= h >>> 16) >>> 0) / 4294967296;
    };
}

// --- ESTADO DO JOGO ---
const state = {
    difficulty: 'novice',
    isDailyChallenge: false,
    rings: [],
    keys: [],
    activeRingIndex: 0,
    selectedKeyIndex: 0,
    history: [],
    
    // Contadores e Stats
    timer: 0,
    timeLimit: 60,
    timerInterval: null,
    digipicksCount: 99,
    autoSlotsCount: 3,
    gameWon: false,
    gameLost: false,
    
    // Erros
    errorFlash: false,
    errorFlashTimeout: null,
    
    // Semente atual
    randomFn: Math.random
};

// Configurações de tamanho e raios para renderização
const CANVAS_SIZE = 600;
const CENTER_X = CANVAS_SIZE / 2;
const CENTER_Y = CANVAS_SIZE / 2;

// Cores resolvidas para uso no Canvas (Canvas 2D NÃO suporta var() CSS)
const COLORS = {
    cyan: '#00e5ff',
    blue: '#0088ff',
    inactive: '#455a64',
    success: '#00e676',
    error: '#ff1744',
    warning: '#ffb300',
    white: '#ffffff',
    ringInactive: 'rgba(69, 90, 100, 0.4)',
    cyanGlow: 'rgba(0, 229, 255, 0.6)',
    errorGlow: 'rgba(255, 23, 68, 0.6)',
    blueHalf: 'rgba(0, 229, 255, 0.4)'
};

// Canvas drawing dimensions (updated on DPI setup)
let drawW = CANVAS_SIZE;
let drawH = CANVAS_SIZE;
let centerX = CENTER_X;
let centerY = CENTER_Y;

// Retorna os raios correspondentes aos anéis dependendo da quantidade de anéis no puzzle
function getRingRadii(numRings) {
    const scale = drawW / CANVAS_SIZE;
    const radii = {
        4: [215, 175, 135, 95],
        3: [200, 150, 100],
        2: [180, 120]
    };
    return (radii[numRings] || radii[2]).map(r => r * scale);
}

// --- GERADOR PROCEDURAL DE PUZZLES ---
function generatePuzzle(difficulty, seed = null) {
    state.difficulty = difficulty;
    state.isDailyChallenge = (difficulty === 'daily');
    
    // LIMPEZA COMPLETA DE ESTADO ANTERIOR AO MUDAR DIFICULDADE
    state.rings = [];
    state.keys = [];
    state.activeRingIndex = 0;
    state.selectedKeyIndex = 0;
    state.history = [];
    state.gameWon = false;
    state.gameLost = false;
    keyCardElements = [];
    
    const failOverlay = document.getElementById('fail-overlay');
    if (failOverlay) failOverlay.classList.remove('show');
    const successOverlay = document.getElementById('success-overlay');
    if (successOverlay) successOverlay.classList.remove('show');
    
    // Definir semente
    if (state.isDailyChallenge && seed) {
        state.randomFn = createRandom(seed);
    } else {
        state.randomFn = Math.random;
    }
    
    // Parâmetros de dificuldade simplificados e muito mais acessíveis
    let numRings = 2;
    let numDuds = 0;
    
    if (difficulty === 'novice') {
        numRings = 2;
        numDuds = 0; // Apenas as 4 chaves exatas da solução na gaveta (sem chaves falsas!)
        state.timeLimit = 120;
        state.digipicksCount = 99;
        state.autoSlotsCount = 5;
    } else if (difficulty === 'advanced') {
        numRings = 2;
        numDuds = 1; // 4 chaves solução + 1 falsa = 5 chaves
        state.timeLimit = 90;
        state.digipicksCount = 99;
        state.autoSlotsCount = 3;
    } else if (difficulty === 'expert') {
        numRings = 3;
        numDuds = 2; // 6 chaves solução + 2 falsas = 8 chaves
        state.timeLimit = 75;
        state.digipicksCount = 99;
        state.autoSlotsCount = 3;
    } else if (difficulty === 'master' || difficulty === 'daily') {
        numRings = 3;
        numDuds = 3; // 6 chaves solução + 3 falsas = 9 chaves
        state.timeLimit = 60;
        state.digipicksCount = (difficulty === 'daily') ? 1 : 99; 
        state.autoSlotsCount = (difficulty === 'daily') ? 0 : 3;
    }
    
    function keyFitsNotchesAtAnyRotation(basePins, notches) {
        for (let rot = 0; rot < 32; rot++) {
            let fits = true;
            for (let p of basePins) {
                if (!notches[(p + rot) % 32]) {
                    fits = false;
                    break;
                }
            }
            if (fits) return true;
        }
        return false;
    }

    function generateSpacedKeyPins(pinCount) {
        if (pinCount === 1) {
            return [Math.floor(state.randomFn() * 32)];
        }
        const count = Math.max(2, Math.min(4, pinCount));
        const positions = [];
        let p = Math.floor(state.randomFn() * 32);
        positions.push(p);
        
        for (let i = 1; i < count; i++) {
            let candidate = Math.floor(state.randomFn() * 32);
            let attempts = 0;
            while (attempts < 100) {
                const isFarEnough = positions.every(pos => {
                    const diff = Math.abs(pos - candidate);
                    const circleDist = Math.min(diff, 32 - diff);
                    return circleDist >= 4;
                });
                if (isFarEnough) break;
                candidate = Math.floor(state.randomFn() * 32);
                attempts++;
            }
            positions.push(candidate);
        }
        
        return positions.sort((a, b) => a - b);
    }
    
    // Gerar chaves de solução e anéis
    const solutionKeys = [];
    
    for (let r = 0; r < numRings; r++) {
        let basePins1, basePins2;
        let r1, r2;
        let ringPins1, ringPins2;
        let success = false;
        let attempts = 0;
        
        while (!success) {
            let p1 = 2, p2 = 2;
            if (difficulty === 'novice') {
                p1 = 2;
                p2 = 2;
            } else if (difficulty === 'advanced') {
                p1 = (state.randomFn() < 0.5) ? 2 : 3;
                p2 = (state.randomFn() < 0.5) ? 2 : 3;
            } else {
                p1 = Math.floor(state.randomFn() * 3) + 2; // 2..4
                p2 = Math.floor(state.randomFn() * 3) + 2; // 2..4
            }
            
            basePins1 = generateSpacedKeyPins(p1);
            basePins2 = generateSpacedKeyPins(p2);
            
            r1 = Math.floor(state.randomFn() * 32);
            r2 = Math.floor(state.randomFn() * 32);
            
            ringPins1 = basePins1.map(p => (p + r1) % 32);
            ringPins2 = basePins2.map(p => (p + r2) % 32);
            
            const allPos = [...ringPins1, ...ringPins2];
            const expectedCount = basePins1.length + basePins2.length;
            
            if (new Set(allPos).size !== expectedCount) {
                continue;
            }
            
            let stealsPreviousRing = false;
            for (let prevR = 0; prevR < r; prevR++) {
                const prevNotches = state.rings[prevR].initialNotches;
                if (keyFitsNotchesAtAnyRotation(basePins1, prevNotches) || 
                    keyFitsNotchesAtAnyRotation(basePins2, prevNotches)) {
                    stealsPreviousRing = true;
                    break;
                }
            }
            
            if (!stealsPreviousRing) {
                success = true;
            }
        }
        
        const notches = Array(32).fill(false);
        ringPins1.forEach(p => notches[p] = true);
        ringPins2.forEach(p => notches[p] = true);
        
        state.rings.push({
            notches: notches,
            initialNotches: [...notches]
        });
        
        solutionKeys.push({
            basePins: basePins1,
            rotation: 0,
            solvedRotation: r1,
            isSolution: true,
            ringIndex: r,
            used: false
        });
        
        solutionKeys.push({
            basePins: basePins2,
            rotation: 0,
            solvedRotation: r2,
            isSolution: true,
            ringIndex: r,
            used: false
        });
    }
    
    // Gerar chaves falsas (duds)
    const dudKeys = [];
    for (let d = 0; d < numDuds; d++) {
        const dp = (difficulty === 'novice' || difficulty === 'advanced') ? 2 : Math.floor(state.randomFn() * 3) + 2;
        let basePins = generateSpacedKeyPins(dp);
        
        let dudAttempts = 0;
        while (dudAttempts < 50) {
            let fitsAnyRing = state.rings.some(ring => keyFitsNotchesAtAnyRotation(basePins, ring.initialNotches));
            if (!fitsAnyRing) break;
            basePins = generateSpacedKeyPins(dp);
            dudAttempts++;
        }
        
        dudKeys.push({
            basePins: basePins,
            rotation: 0,
            solvedRotation: -1,
            isSolution: false,
            ringIndex: -1,
            used: false
        });
    }
    
    // Combinar chaves e embaralhar a lista final
    const allKeys = [...solutionKeys, ...dudKeys];
    // Embaralhar lista
    for (let i = allKeys.length - 1; i > 0; i--) {
        const j = Math.floor(state.randomFn() * (i + 1));
        [allKeys[i], allKeys[j]] = [allKeys[j], allKeys[i]];
    }
    
    // Adicionar id e guardar no estado
    state.keys = allKeys.map((k, index) => {
        k.id = `key-${index}`;
        return k;
    });
    
    // Selecionar primeira chave
    state.selectedKeyIndex = 0;
    
    // Iniciar temporizador
    resetTimer();
    startTimer();
    
    // Forçar rebuild dos cards de chaves (novo puzzle = novas chaves)
    keyCardElements = [];
    
    // Atualizar UI
    updateUI();
}

// --- VERIFICAÇÕES DE ALINHAMENTO ---
// Verifica se uma chave cabe em um anel em ALGUMA das 32 rotações possíveis (para o indicador azul Rank 2)
function keyFitsRingAtAnyRotation(key, ring) {
    if (key.used) return false;
    
    const keyPins = key.basePins;
    const ringNotches = ring.notches;
    
    for (let r = 0; r < 32; r++) {
        let fits = true;
        for (let p of keyPins) {
            const rotatedPin = (p + r) % 32;
            if (!ringNotches[rotatedPin]) {
                fits = false;
                break;
            }
        }
        if (fits) return true;
    }
    return false;
}

// Verifica se a chave atualmente selecionada cabe no anel ativo com a rotação ATUAL (ou com offset)
function currentKeyFitsActiveRing(offset = 0) {
    const key = state.keys[state.selectedKeyIndex];
    if (!key || key.used) return false;
    
    const ring = state.rings[state.activeRingIndex];
    if (!ring) return false;
    
    const targetRotation = (key.rotation + offset + 32) % 32;
    const rotatedPins = key.basePins.map(p => (p + targetRotation) % 32);
    
    for (let p of rotatedPins) {
        if (!ring.notches[p]) {
            return false; // Se bater em metal sólido, não serve
        }
    }
    return true;
}

// --- AÇÕES DO JOGO ---

// Rotacionar chave selecionada (dir: +1 horário, -1 anti-horário)
function rotateSelectedKey(dir) {
    if (state.gameWon) return;
    const key = state.keys[state.selectedKeyIndex];
    if (!key || key.used) return;
    
    key.rotation = (key.rotation + dir + 32) % 32;
    playSound('tick');
    drawLock();
    drawKeysList();
}

// Mudar seleção de chave (dir: +1 próxima, -1 anterior)
function selectKey(dir) {
    if (state.gameWon) return;
    const initialIndex = state.selectedKeyIndex;
    let nextIndex = initialIndex;
    
    do {
        nextIndex = (nextIndex + dir + state.keys.length) % state.keys.length;
        // Se voltarmos ao início e ele estiver usado, paramos
        if (nextIndex === initialIndex) break;
    } while (state.keys[nextIndex].used);
    
    if (nextIndex !== initialIndex && !state.keys[nextIndex].used) {
        state.selectedKeyIndex = nextIndex;
        playSound('click');
        drawLock();
        drawKeysList();
    }
}

// Tenta encaixar a chave selecionada no anel ativo
function slotKey() {
    if (state.gameWon) return;
    
    const keyIndex = state.selectedKeyIndex;
    const key = state.keys[keyIndex];
    if (!key || key.used) return;
    
    const ringIndex = state.activeRingIndex;
    const ring = state.rings[ringIndex];
    if (!ring) return;
    
    // Verificar se encaixa com rotação atual ou assistida nos níveis fáceis
    let fits = false;
    let bestOffset = 0;
    
    if (currentKeyFitsActiveRing(0)) {
        fits = true;
        bestOffset = 0;
    } else if (state.difficulty === 'novice' || state.difficulty === 'advanced') {
        const tolerance = (state.difficulty === 'novice') ? 2 : 1;
        for (let off of [-1, 1, -2, 2]) {
            if (Math.abs(off) <= tolerance && currentKeyFitsActiveRing(off)) {
                fits = true;
                bestOffset = off;
                break;
            }
        }
    }
    
    if (fits) {
        // Encaixe assistido: ajusta a rotação para a posição correta
        if (bestOffset !== 0) {
            key.rotation = (key.rotation + bestOffset + 32) % 32;
        }
        
        // Guardar estado no histórico antes de alterar
        state.history.push({
            keyIndex: keyIndex,
            ringIndex: ringIndex,
            keyRotation: key.rotation,
            previousRingNotches: [...ring.notches],
            previousActiveRingIndex: ringIndex
        });
        
        // Preencher os slots do anel com os pinos da chave
        const rotatedPins = key.basePins.map(p => (p + key.rotation) % 32);
        rotatedPins.forEach(p => {
            ring.notches[p] = false; // Furo preenchido
        });
        
        // Marcar chave como usada
        key.used = true;
        
        playSound('slot');
        
        // Verificar se limpou o anel ativo
        const isRingCleared = ring.notches.every(n => n === false);
        if (isRingCleared) {
            playSound('clear');
            state.activeRingIndex++;
            
            // Verificar vitória global
            if (state.activeRingIndex === state.rings.length) {
                winGame();
                return;
            }
        }
        
        // Selecionar próxima chave não usada
        selectKey(1);
        
        // Atualizar UI
        updateUI();
    } else {
        // Chave não encaixa no ângulo atual
        triggerErrorFlash();
        state.digipicksCount--;
        updateUI();
        if (state.digipicksCount <= 0) {
            failGame('Acabaram as tentativas de Lockpick.');
        }
    }
}

// Desfaz a última ação de slot
function undoLastAction() {
    if (state.gameWon) return;
    
    // Desafio Diário desabilita o Undo
    if (state.isDailyChallenge) {
        playSound('error');
        return;
    }
    
    if (state.history.length === 0) {
        playSound('error');
        return;
    }
    
    const lastAction = state.history.pop();
    
    // Restaurar anel e índice ativo
    const ring = state.rings[lastAction.ringIndex];
    ring.notches = lastAction.previousRingNotches;
    state.activeRingIndex = lastAction.previousActiveRingIndex;
    
    // Restaurar chave
    const key = state.keys[lastAction.keyIndex];
    key.used = false;
    key.rotation = lastAction.keyRotation;
    
    // Selecionar a chave restaurada
    state.selectedKeyIndex = lastAction.keyIndex;
    
    playSound('clear');
    updateUI();
}

// Auto-Slot: encontra uma chave de solução correta para o anel ativo, rotaciona e encaixa
function useAutoSlot() {
    if (state.gameWon || state.isDailyChallenge) {
        playSound('error');
        return;
    }
    
    if (state.autoSlotsCount <= 0) {
        playSound('error');
        return;
    }
    
    // Encontrar uma chave de solução não usada para o anel ativo
    const correctKeyIndex = state.keys.findIndex(k => 
        !k.used && k.isSolution && k.ringIndex === state.activeRingIndex
    );
    
    if (correctKeyIndex !== -1) {
        const key = state.keys[correctKeyIndex];
        
        // Diminuir contador
        state.autoSlotsCount--;
        
        // Ajustar a rotação para a correta
        key.rotation = key.solvedRotation;
        
        // Selecionar a chave e encaixar
        state.selectedKeyIndex = correctKeyIndex;
        slotKey();
    } else {
        playSound('error');
    }
}

// Exibir feedback de erro
function triggerErrorFlash() {
    playSound('error');
    
    if (state.errorFlashTimeout) clearTimeout(state.errorFlashTimeout);
    state.errorFlash = true;
    drawLock();
    
    state.errorFlashTimeout = setTimeout(() => {
        state.errorFlash = false;
        drawLock();
    }, 250);
    
    // Efeito de tremer no container do Canvas
    const canvasContainer = document.querySelector('.canvas-container');
    canvasContainer.classList.remove('shake');
    void canvasContainer.offsetWidth; // Forçar reflow para reiniciar animação CSS
    canvasContainer.classList.add('shake');
    setTimeout(() => canvasContainer.classList.remove('shake'), 400);
}

// Vitória
function winGame() {
    state.gameWon = true;
    stopTimer();
    playSound('victory');
    
    // Atualizar dados na tela de sucesso
    document.getElementById('succ-time').textContent = formatTime(state.timer);
    
    const usedKeysCount = state.keys.filter(k => k.used).length;
    document.getElementById('succ-keys').textContent = usedKeysCount;
    
    // Mensagem de sucesso estilizada
    const msgEl = document.getElementById('success-message');
    if (state.isDailyChallenge) {
        msgEl.textContent = "Desafio Diário concluído! Sua mente está afiada.";
        handleDailyWin();
    } else {
        msgEl.textContent = `Você destrancou o nível ${state.difficulty.toUpperCase()}!`;
    }
    
    // Exibir overlay de sucesso
    document.getElementById('success-overlay').classList.add('show');
    const stopBtn = document.getElementById('btn-stop-game');
    if(stopBtn) stopBtn.style.visibility = 'hidden';
}

function failGame() {
    if (state.gameWon || state.gameLost) return;
    state.gameLost = true;
    playSound('error');
    stopTimer();
    
    // Animação de tremor
    const canvasContainer = document.querySelector('.lockpick-device-wrapper');
    if (canvasContainer) {
        canvasContainer.classList.add('shake');
        setTimeout(() => canvasContainer.classList.remove('shake'), 400);
    }
    
    const stopBtn = document.getElementById('btn-stop-game');
    if(stopBtn) stopBtn.style.visibility = 'hidden';
    
    // Exibir overlay de falha
    const failOverlay = document.getElementById('fail-overlay');
    if(failOverlay) failOverlay.classList.add('show');
}

// --- TEMPORIZADOR ---
function startTimer() {
    clearInterval(state.timerInterval);
    state.timer = state.timeLimit;
    document.getElementById('timer-val').textContent = formatTime(state.timer);
    
    state.timerInterval = setInterval(() => {
        state.timer--;
        if (state.timer <= 0) {
            state.timer = 0;
            document.getElementById('timer-val').textContent = formatTime(state.timer);
            failGame(); // Perde ao zerar
        } else {
            document.getElementById('timer-val').textContent = formatTime(state.timer);
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(state.timerInterval);
}

function resetTimer() {
    state.timer = state.timeLimit;
    document.getElementById('timer-val').textContent = formatTime(state.timer);
}

function formatTime(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
}

// --- SISTEMA DE SEQUÊNCIA DIÁRIA (DAILY STREAK) ---
function getDailySeed() {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `digipick-${y}-${m}-${d}`;
}

function handleDailyWin() {
    const todayStr = getDailySeed();
    const lastPlayed = localStorage.getItem('digipick_last_played_date');
    let streak = parseInt(localStorage.getItem('digipick_streak') || '0', 10);
    
    if (lastPlayed === todayStr) {
        // Já ganhou hoje, não altera sequência
    } else if (isYesterday(lastPlayed)) {
        streak++;
        localStorage.setItem('digipick_streak', streak);
        localStorage.setItem('digipick_last_played_date', todayStr);
    } else {
        streak = 1;
        localStorage.setItem('digipick_streak', streak);
        localStorage.setItem('digipick_last_played_date', todayStr);
    }
    
    updateStreakCard();
}

function isYesterday(dateStr) {
    if (!dateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Tenta quebrar a semente "digipick-YYYY-MM-DD"
    const parts = dateStr.split('-');
    if (parts.length < 4) return false;
    const lastDate = new Date(parseInt(parts[1]), parseInt(parts[2]) - 1, parseInt(parts[3]));
    lastDate.setHours(0, 0, 0, 0);
    
    const diffTime = today - lastDate;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
}

function updateStreakCard() {
    const streakCard = document.getElementById('streak-card');
    const streakVal = document.getElementById('streak-val');
    const streakDesc = document.getElementById('streak-desc');
    if (!streakCard || !streakVal || !streakDesc) return;
    
    const lastPlayed = localStorage.getItem('digipick_last_played_date');
    const streak = parseInt(localStorage.getItem('digipick_streak') || '0', 10);
    const todayStr = getDailySeed();
    
    if (state.difficulty === 'daily' || streak > 0) {
        streakCard.style.display = 'block';
    } else {
        streakCard.style.display = 'none';
    }
    
    streakVal.textContent = `${streak} ${streak === 1 ? 'dia' : 'dias'}`;
    
    if (lastPlayed === todayStr) {
        streakDesc.textContent = "Desafio de hoje concluído!";
        streakDesc.style.color = 'var(--color-success)';
    } else {
        streakDesc.textContent = "Complete o desafio de hoje!";
        streakDesc.style.color = 'var(--text-muted)';
    }
}

// --- RENDERIZAÇÃO DO LOCK (CANVAS CENTRAL) ---
const canvas = document.getElementById('digipick-canvas');
const ctx = canvas.getContext('2d');

function setupCanvasDPI() {
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0) return; // Guard against invisible canvas
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    
    // Atualizar coordenadas de desenho
    drawW = rect.width;
    drawH = rect.height;
    centerX = drawW / 2;
    centerY = drawH / 2;
    
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
}

function drawLock() {
    // Limpar com dimensões dinâmicas
    ctx.clearRect(0, 0, drawW, drawH);
    
    const numRings = state.rings.length;
    if (numRings === 0) return;
    
    const radii = getRingRadii(numRings);
    const activeKey = state.keys[state.selectedKeyIndex];
    const optHelperEl = document.getElementById('opt-helper');
    const isHelperEnabled = (optHelperEl ? optHelperEl.checked : true) && !state.isDailyChallenge;
    
    // 1. Desenhar Anéis
    for (let r = 0; r < numRings; r++) {
        if (r < state.activeRingIndex) continue;
        
        const radius = radii[r];
        const ring = state.rings[r];
        const isActive = (r === state.activeRingIndex);
        
        // Escolher cor do anel — usando COLORS resolvidos
        let ringColor = COLORS.inactive;
        
        if (isActive) {
            if (isHelperEnabled && activeKey && keyFitsRingAtAnyRotation(activeKey, ring)) {
                ringColor = COLORS.cyan;
            } else {
                ringColor = COLORS.white;
            }
        } else {
            if (isHelperEnabled && activeKey && keyFitsRingAtAnyRotation(activeKey, ring)) {
                ringColor = COLORS.blue;
            } else {
                ringColor = COLORS.ringInactive;
            }
        }
        
        // Desenhar os 32 segmentos do anel
        const lw = isActive ? 4 : 2.5;
        const scale = drawW / CANVAS_SIZE;
        ctx.lineWidth = lw * scale;
        ctx.strokeStyle = ringColor;
        
        for (let i = 0; i < 32; i++) {
            if (ring.notches[i]) continue;
            
            const angleCenter = (i * 11.25) * Math.PI / 180 - Math.PI / 2;
            const angleStart = angleCenter - (4.8 * Math.PI / 180);
            const angleEnd = angleCenter + (4.8 * Math.PI / 180);
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, angleStart, angleEnd);
            ctx.stroke();
        }
    }
    
    // 2. Desenhar Pinos da Chave Ativa por Cima do Anel Ativo (Pinos retangulares grossos)
    if (activeKey && !activeKey.used && !state.gameWon) {
        const activeRadius = radii[state.activeRingIndex];
        const pins = activeKey.basePins;
        const rot = activeKey.rotation;
        const scale = drawW / CANVAS_SIZE;
        
        const pinColor = state.errorFlash ? COLORS.error : COLORS.cyan;
        const shadowColor = state.errorFlash ? COLORS.errorGlow : COLORS.cyanGlow;
        
        ctx.strokeStyle = pinColor;
        ctx.lineWidth = 8 * scale;
        ctx.shadowBlur = 4;
        ctx.shadowColor = shadowColor;
        
        for (let k = 0; k < pins.length; k++) {
            const rotatedPos = (pins[k] + rot) % 32;
            const angle = (rotatedPos * 11.25) * Math.PI / 180 - Math.PI / 2;
            
            const startR = activeRadius - 15 * scale;
            const endR = activeRadius + 15 * scale;
            
            ctx.beginPath();
            ctx.moveTo(centerX + startR * Math.cos(angle), centerY + startR * Math.sin(angle));
            ctx.lineTo(centerX + endR * Math.cos(angle), centerY + endR * Math.sin(angle));
            ctx.stroke();
            // Círculo removido para ter o visual de retângulos lisos idêntico ao FiveM
        }
        
        // Resetar sombra
        ctx.shadowBlur = 0;
    }
}

// --- RENDERIZAÇÃO DA LISTA DE CHAVES (PAINEL LATERAL DIREITO) ---
// Cache de elementos DOM das chaves para evitar reconstrução a cada tick
let keyCardElements = [];

function buildKeysList() {
    const container = document.getElementById('keys-container');
    container.innerHTML = '';
    keyCardElements = [];
    
    state.keys.forEach((key, index) => {
        const keyCard = document.createElement('div');
        keyCard.className = 'key-item';
        
        const canvasEl = document.createElement('canvas');
        canvasEl.width = 100;
        canvasEl.height = 100;
        keyCard.appendChild(canvasEl);
        
        keyCard.addEventListener('click', () => {
            if (!key.used && !state.gameWon) {
                state.selectedKeyIndex = index;
                playSound('click');
                drawLock();
                drawKeysList();
            }
        });
        
        container.appendChild(keyCard);
        keyCardElements.push({ card: keyCard, canvas: canvasEl });
    });
}

function drawKeysList() {
    if (keyCardElements.length !== state.keys.length) {
        buildKeysList();
    }
    
    const activeRing = state.rings[state.activeRingIndex];
    const optHelperEl = document.getElementById('opt-helper');
    const isHelperEnabled = (optHelperEl ? optHelperEl.checked : true) && !state.isDailyChallenge;
    
    state.keys.forEach((key, index) => {
        const { card, canvas: canvasEl } = keyCardElements[index];
        
        // Reset classes
        card.className = 'key-item';
        
        if (key.used) {
            card.classList.add('used');
        } else {
            if (index === state.selectedKeyIndex) {
                card.classList.add('selected');
            }
            if (isHelperEnabled && activeRing) {
                if (keyFitsRingAtAnyRotation(key, activeRing)) {
                    card.classList.add('fits-active');
                } else {
                    card.classList.add('no-fit');
                }
            }
        }
        
        drawMiniKey(canvasEl, key, index === state.selectedKeyIndex, isHelperEnabled && activeRing && keyFitsRingAtAnyRotation(key, activeRing));
    });
}

function drawMiniKey(canvasEl, key, isSelected, fitsActive) {
    const miniCtx = canvasEl.getContext('2d');
    miniCtx.clearRect(0, 0, 100, 100);
    
    const cx = 50;
    const cy = 50;
    const r = 24;
    
    // Cor do círculo central — usando COLORS resolvidos
    let circleColor = COLORS.inactive;
    if (isSelected) {
        circleColor = COLORS.cyan;
    } else if (fitsActive) {
        circleColor = COLORS.blueHalf;
    }
    
    miniCtx.strokeStyle = circleColor;
    miniCtx.lineWidth = isSelected ? 2 : 1.5;
    
    if (isSelected) {
        miniCtx.shadowBlur = 6;
        miniCtx.shadowColor = COLORS.cyanGlow;
    }
    
    miniCtx.beginPath();
    miniCtx.arc(cx, cy, r, 0, 2 * Math.PI);
    miniCtx.stroke();
    miniCtx.shadowBlur = 0;

    // Se selecionada, desenha uma bolinha preenchida no centro (FiveM UI Style)
    if (isSelected) {
        miniCtx.fillStyle = '#8f9cb3';
        miniCtx.beginPath();
        miniCtx.arc(cx, cy, 7, 0, 2 * Math.PI);
        miniCtx.fill();
    }
    
    // Pinos da chave
    let pinColor = COLORS.white;
    if (isSelected) {
        pinColor = COLORS.cyan;
    } else if (fitsActive) {
        pinColor = COLORS.blue;
    }
    
    miniCtx.strokeStyle = pinColor;
    miniCtx.lineWidth = isSelected ? 3 : 2;
    
    for (let i = 0; i < key.basePins.length; i++) {
        const rotatedPin = (key.basePins[i] + key.rotation) % 32;
        const angle = (rotatedPin * 11.25) * Math.PI / 180 - Math.PI / 2;
        
        const startR = r - 5;
        const endR = r + 6;
        
        miniCtx.beginPath();
        miniCtx.moveTo(cx + startR * Math.cos(angle), cy + startR * Math.sin(angle));
        miniCtx.lineTo(cx + endR * Math.cos(angle), cy + endR * Math.sin(angle));
        miniCtx.stroke();
    }
}

// --- ATUALIZAÇÕES DA ESTRUTURA GERAL DA UI ---
function updateUI() {
    // Anel ativo
    const indicator = document.getElementById('lock-status-indicator');
    const text = document.getElementById('lock-status-text');
    
    if (indicator && text) {
        if (state.gameWon) {
            indicator.classList.remove('active');
            text.textContent = "ACESSO PERMITIDO";
        } else {
            indicator.classList.add('active');
            text.textContent = `ANEL ATIVO: ${state.activeRingIndex + 1} DE ${state.rings.length}`;
        }
    }
    
    // Stats
    const picksVal = document.getElementById('picks-val');
    if (picksVal) picksVal.textContent = state.digipicksCount;
    
    const autoVal = document.getElementById('auto-val');
    if (autoVal) autoVal.textContent = state.autoSlotsCount;
    
    // Undo text
    const undoVal = document.getElementById('undo-val');
    if (undoVal) {
        if (state.isDailyChallenge) {
            undoVal.textContent = "DESABILITADO";
            undoVal.style.color = 'var(--color-inactive)';
        } else {
            undoVal.textContent = "ILIMITADO";
            undoVal.style.color = 'var(--color-cyan)';
        }
    }
    
    // Habilitar/Desabilitar botões dependendo das opções
    const btnUndo = document.getElementById('btn-undo');
    const btnAuto = document.getElementById('btn-auto');
    
    if (btnUndo && btnAuto) {
        if (state.isDailyChallenge) {
            btnUndo.setAttribute('disabled', 'true');
            btnAuto.setAttribute('disabled', 'true');
            btnUndo.style.opacity = '0.3';
            btnAuto.style.opacity = '0.3';
        } else {
            btnUndo.removeAttribute('disabled');
            btnAuto.removeAttribute('disabled');
            btnUndo.style.opacity = '1';
            btnAuto.style.opacity = '1';
        }
    }
    
    updateStreakCard();
    drawLock();
    drawKeysList();
}

// --- CAPTURA DE EVENTOS DE TECLADO ---
// Controles idênticos ao simulador de BB_Dev (itch.io):
// A/D: Girar  •  Q/W: Alternar itens  •  ?: Ajuda
window.addEventListener('keydown', (e) => {
    // ? (Shift+/) = toggle ajuda — funciona mesmo com jogo ganho
    if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        toggleHelpOverlay();
        e.preventDefault();
        return;
    }
    
    const keyUpper = e.key.toUpperCase();
    
    if (state.gameWon || state.gameLost) {
        if (keyUpper === ' ' || keyUpper === 'ENTER') {
            document.getElementById('success-overlay').classList.remove('show');
            const failOverlay = document.getElementById('fail-overlay');
            if (failOverlay) failOverlay.classList.remove('show');
            generatePuzzle(state.difficulty);
            e.preventDefault();
        }
        return;
    }
    
    switch (keyUpper) {
        case 'A':
        case 'ARROWLEFT':
            rotateSelectedKey(-1); // girar anti-horário
            e.preventDefault();
            break;
        case 'D':
        case 'ARROWRIGHT':
            rotateSelectedKey(1); // girar horário
            e.preventDefault();
            break;
        case 'Q':
        case 'W':
            selectKey(-1); // alternar item anterior (Q / W)
            e.preventDefault();
            break;
        case 'E':
        case 'S':
            selectKey(1); // alternar item próximo (E / S)
            e.preventDefault();
            break;
        case 'ENTER':
        case ' ':
            slotKey(); // encaixar chave (Enter ou Espaço)
            e.preventDefault();
            break;
        case 'R':
            undoLastAction(); // desfazer/remover última chave
            e.preventDefault();
            break;
        case 'TAB':
            useAutoSlot(); // auto-slot
            e.preventDefault();
            break;
        case 'ESCAPE':
            restartCurrentPuzzle(); // reiniciar puzzle
            e.preventDefault();
            break;
    }
});

// --- TOGGLE DO OVERLAY DE AJUDA (?) ---
function toggleHelpOverlay() {
    const overlay = document.getElementById('help-overlay');
    if (overlay) {
        overlay.classList.toggle('show');
    }
}

// --- MOUSE WHEEL: Alternar entre chaves (como no Starfield original) ---
let lastWheelTime = 0;
canvas.addEventListener('wheel', (e) => {
    if (state.gameWon) return;
    
    const now = Date.now();
    if (now - lastWheelTime < 100) {
        e.preventDefault();
        return; // Cooldown de 100ms para evitar sobrecarga e travamentos
    }
    lastWheelTime = now;
    
    // Scroll para baixo = próxima chave, Scroll para cima = anterior
    if (e.deltaY > 0) {
        selectKey(1);
    } else if (e.deltaY < 0) {
        selectKey(-1);
    }
    e.preventDefault();
}, { passive: false });

// --- CLICK NO CANVAS: Encaixar chave (como no Starfield original) ---
canvas.addEventListener('click', () => {
    if (state.gameWon) return;
    initAudio(); // Garantir que o contexto de áudio esteja ativo
    slotKey();
});

// Reiniciar o puzzle atual mantendo a semente/gerador original
function restartCurrentPuzzle() {
    if (state.gameWon) return;
    
    // Restaurar estado dos anéis
    state.rings.forEach(ring => {
        ring.notches = [...ring.initialNotches];
    });
    
    // Restaurar todas as chaves
    state.keys.forEach(key => {
        key.used = false;
        key.rotation = 0;
    });
    
    state.activeRingIndex = 0;
    state.history = [];
    state.selectedKeyIndex = 0;
    
    // Tirar pontos de picks se diário
    if (state.isDailyChallenge) {
        state.digipicksCount = 1;
    } else {
        state.digipicksCount = 99;
    }
    
    playSound('defeat');
    resetTimer();
    startTimer();
    updateUI();
}

// --- ASSOCIAÇÃO DE EVENTOS DE INTERFACE ---

// Dificuldades
document.getElementById('btn-novice').addEventListener('click', () => {
    switchActiveDiffButton('btn-novice');
    generatePuzzle('novice');
    closeSettingsDrawer();
});
document.getElementById('btn-advanced').addEventListener('click', () => {
    switchActiveDiffButton('btn-advanced');
    generatePuzzle('advanced');
    closeSettingsDrawer();
});
document.getElementById('btn-expert').addEventListener('click', () => {
    switchActiveDiffButton('btn-expert');
    generatePuzzle('expert');
    closeSettingsDrawer();
});
document.getElementById('btn-master').addEventListener('click', () => {
    switchActiveDiffButton('btn-master');
    generatePuzzle('master');
    closeSettingsDrawer();
});
document.getElementById('btn-daily').addEventListener('click', () => {
    switchActiveDiffButton('btn-daily');
    const seed = getDailySeed();
    generatePuzzle('daily', seed);
    closeSettingsDrawer();
});

function switchActiveDiffButton(id) {
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(id).classList.add('active');
    // Esconder painel de vitória
    document.getElementById('success-overlay').classList.remove('show');
}

// Controles Físicos do Dispositivo
const btnReset = document.getElementById('btn-reset');
if (btnReset) btnReset.addEventListener('click', restartCurrentPuzzle);

const btnUndo = document.getElementById('btn-undo');
if (btnUndo) btnUndo.addEventListener('click', undoLastAction);

const btnAuto = document.getElementById('btn-auto');
if (btnAuto) btnAuto.addEventListener('click', useAutoSlot);

const btnSlot = document.getElementById('btn-slot');
if (btnSlot) btnSlot.addEventListener('click', slotKey);

const stopBtn = document.getElementById('btn-stop-game');
if (stopBtn) {
    stopBtn.addEventListener('click', () => {
        failGame();
    });
}

// Botão de vitória (jogar novamente)
document.getElementById('btn-next-puzzle').addEventListener('click', () => {
    document.getElementById('success-overlay').classList.remove('show');
    if (state.isDailyChallenge) {
        // Se diário, gera um master padrão para continuar jogando
        switchActiveDiffButton('btn-master');
        generatePuzzle('master');
    } else {
        generatePuzzle(state.difficulty);
    }
});

// Botão de falha (tentar novamente)
const btnRetry = document.getElementById('btn-retry-puzzle');
if (btnRetry) {
    btnRetry.addEventListener('click', () => {
        const failOverlay = document.getElementById('fail-overlay');
        if (failOverlay) failOverlay.classList.remove('show');
        generatePuzzle(state.difficulty);
    });
}

// Configurações
const optHelperBtn = document.getElementById('opt-helper');
if (optHelperBtn) {
    optHelperBtn.addEventListener('click', () => {
        drawLock();
        drawKeysList();
    });
}

// Ajustar redimensionamento
window.addEventListener('resize', () => {
    setupCanvasDPI();
    drawLock();
});

// --- ANIMAÇÃO DE ESTRELAS NO FUNDO ---
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
    
    bgCtx.fillStyle = '#ffffff';
    stars.forEach(star => {
        star.phase += star.twinkleSpeed;
        const opacity = (Math.sin(star.phase) + 1) / 2 * 0.7 + 0.3; // Opacidade entre 0.3 e 1.0
        
        bgCtx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.6})`;
        bgCtx.beginPath();
        bgCtx.arc(star.x, star.y, star.size, 0, 2 * Math.PI);
        bgCtx.fill();
    });
    
    requestAnimationFrame(animateStars);
}

// Inicializar tudo ao carregar a página
window.addEventListener('load', () => {
    resizeBgCanvas();
    window.addEventListener('resize', resizeBgCanvas);
    requestAnimationFrame(animateStars);
    
    // Iniciar com o nível Novice por padrão
    setupCanvasDPI();
    generatePuzzle('novice');
    updateStreakCard();
});

function closeSettingsDrawer() {
    // No drawer needed - settings on screen
}
