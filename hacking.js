const state = {
    gameState: 'waiting', // waiting, playing, won, lost
    timer: 0,
    timeLimit: 15,
    timerInterval: null,
    targetCode: '',
    gridItems: [],
    gridSize: 36, // 6x6
    scrambleInterval: null,
    correctIndex: -1
};

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
    if (!audioContext) return;
    const osc = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === 'beep') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        osc.start();
        osc.stop(audioContext.currentTime + 0.1);
    } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        osc.start();
        osc.stop(audioContext.currentTime + 0.3);
    } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, audioContext.currentTime);
        osc.frequency.setValueAtTime(900, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        osc.start();
        osc.stop(audioContext.currentTime + 0.4);
    }
}

function generateRandomCode() {
    const chars = '0123456789ABCDEF';
    let code = '';
    for(let i=0; i<4; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
        code += chars[Math.floor(Math.random() * chars.length)];
        if(i < 3) code += ' ';
    }
    return code;
}

function initGame() {
    state.gameState = 'playing';
    state.timer = state.timeLimit;
    
    document.getElementById('success-overlay').classList.remove('show');
    document.getElementById('fail-overlay').classList.remove('show');
    
    // Configurar o alvo
    state.targetCode = generateRandomCode();
    document.getElementById('target-code').textContent = state.targetCode;
    
    // Limpar o grid
    const grid = document.getElementById('hacking-grid');
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = 'repeat(6, 1fr)';
    
    state.gridItems = [];
    state.correctIndex = Math.floor(Math.random() * state.gridSize);
    
    for (let i = 0; i < state.gridSize; i++) {
        const item = document.createElement('div');
        item.className = 'hacking-grid-item';
        item.style.padding = '15px 10px';
        item.style.background = '#1a1d24';
        item.style.border = '1px solid rgba(0, 229, 255, 0.15)';
        item.style.color = 'white';
        item.style.fontFamily = 'monospace';
        item.style.fontSize = '1.2rem';
        item.style.textAlign = 'center';
        item.style.cursor = 'pointer';
        item.style.borderRadius = '6px';
        item.style.transition = 'background 0.2s';
        
        item.textContent = i === state.correctIndex ? state.targetCode : generateRandomCode();
        
        item.addEventListener('click', () => handleItemClick(i));
        item.addEventListener('mouseenter', () => {
            if(state.gameState === 'playing') item.style.background = '#252a36';
        });
        item.addEventListener('mouseleave', () => {
            if(state.gameState === 'playing') item.style.background = '#1a1d24';
        });
        
        grid.appendChild(item);
        state.gridItems.push(item);
    }
    
    startTimer();
    startScrambler();
}

function startScrambler() {
    clearInterval(state.scrambleInterval);
    state.scrambleInterval = setInterval(() => {
        if (state.gameState !== 'playing') return;
        playSound('beep');
        
        for (let i = 0; i < state.gridSize; i++) {
            if (i !== state.correctIndex) {
                // Change fake codes slightly or completely
                if (Math.random() > 0.4) {
                    state.gridItems[i].textContent = generateRandomCode();
                }
            }
        }
    }, 1500); // Scramble
}

function handleItemClick(index) {
    if (state.gameState !== 'playing') return;
    
    if (index === state.correctIndex) {
        // Vitória!
        state.gameState = 'won';
        playSound('success');
        stopTimer();
        clearInterval(state.scrambleInterval);
        
        state.gridItems[index].style.background = 'rgba(0, 230, 118, 0.3)';
        state.gridItems[index].style.borderColor = '#00e676';
        
        document.getElementById('succ-time').textContent = formatTime(state.timeLimit - state.timer);
        document.getElementById('success-overlay').classList.add('show');
        
    } else {
        // Erro!
        state.gridItems[index].style.background = 'rgba(255, 23, 68, 0.3)';
        state.gridItems[index].style.borderColor = '#ff1744';
        failGame();
    }
}

function failGame() {
    if (state.gameState !== 'playing') return;
    state.gameState = 'lost';
    playSound('error');
    stopTimer();
    clearInterval(state.scrambleInterval);
    
    const wrapper = document.querySelector('.hacking-device-wrapper');
    wrapper.classList.remove('shake');
    void wrapper.offsetWidth;
    wrapper.classList.add('shake');
    
    document.getElementById('fail-overlay').classList.add('show');
}

function startTimer() {
    clearInterval(state.timerInterval);
    updateTimerDisplay();
    state.timerInterval = setInterval(() => {
        state.timer--;
        updateTimerDisplay();
        if (state.timer <= 0) {
            failGame();
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(state.timerInterval);
}

function updateTimerDisplay() {
    const mins = Math.floor(state.timer / 60).toString().padStart(2, '0');
    const secs = (state.timer % 60).toString().padStart(2, '0');
    document.getElementById('timer-val').textContent = `${mins}:${secs}`;
}

function formatTime(sec) {
    const mins = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${mins}:${s}`;
}

// Event Listeners
document.getElementById('btn-stop-game').addEventListener('click', () => {
    if (state.gameState === 'playing') failGame();
});

document.getElementById('btn-next-puzzle').addEventListener('click', initGame);
document.getElementById('btn-retry-puzzle').addEventListener('click', initGame);

window.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (state.gameState === 'won' || state.gameState === 'lost') {
            initGame();
        } else if (state.gameState === 'playing' && e.key === ' ') {
            failGame();
        }
    }
});

// Start game initially
initGame();

// Configurações e Menu Lateral
const drawer = document.getElementById('settings-drawer');
document.getElementById('menu-toggle').addEventListener('click', () => {
    drawer.classList.toggle('open');
});

// Selector de Dificuldade
document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        const diff = e.target.getAttribute('data-difficulty');
        if (diff === 'easy') {
            state.timeLimit = 20;
        } else if (diff === 'medium') {
            state.timeLimit = 15;
        } else if (diff === 'hard') {
            state.timeLimit = 10;
        }
        initGame();
    });
});
