const gameContainer = document.getElementById('game-container');
const menuTrigger = document.getElementById('menu-trigger');
const adultMenu = document.getElementById('adult-menu');
const closeMenuBtn = document.getElementById('close-menu-btn');
const gameBtns = document.querySelectorAll('.game-select-btn');

let currentGame = 1;
let audioCtx;
let lastSpeakTime = 0;

// AudioContextをユーザー操作のタイミングで初期化・再開（awaitで確実に待つ）
async function initAudio() {
    if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        try {
            await audioCtx.resume();
        } catch (e) {}
    }
}

async function playSound(type) {
    await initAudio();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 1) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    } else if (type === 3) {
        osc.type = 'square';
        osc.frequency.setValueAtTime(100, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(150, audioCtx.currentTime + 1.0);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 1.5);
    }
}

// ==========================================
// テキスト読み上げ (Web Speech API)
// ==========================================
function speakAnimalSound(text) {
    // speaking/pendingチェックの代わりに時間ベースのデバウンス
    // （iOSではspeaking状態がスタックすることがあるため）
    const now = Date.now();
    if (now - lastSpeakTime < 1500) return;
    lastSpeakTime = now;

    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'ja-JP';
    msg.rate = 1.3;
    msg.pitch = 1.5;
    window.speechSynthesis.speak(msg);
}

// ==========================================
// ゲームコンテンツのデータ
// ==========================================
const emojis1 = ['✨', '🎈', '⭐', '🎵', '💖', '🌈', '🎉'];
const emojis3 = ['🚓', '🚒', '🚑', '🚅', '🚕', '🚌', '🚜'];

const animals = [
    { emoji: '🐶', sound: 'ワンワン！' },
    { emoji: '🐱', sound: 'ニャーニャー！' },
    { emoji: '🦁', sound: 'ガオー！' },
    { emoji: '🐻', sound: 'クマさんだぞー！' },
    { emoji: '🐘', sound: 'パオーン！' },
    { emoji: '🐸', sound: 'ケロケロ！' },
    { emoji: '🐵', sound: 'ウキィー！' },
    { emoji: '🐦', sound: 'チュンチュン！' },
    { emoji: '🐉', sound: 'ガオー！' }
];

function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// ==========================================
// ゲーム①の初期化
// ==========================================
function initGame1() {
    gameContainer.innerHTML = '';
    const bg = document.createElement('div');
    bg.id = 'game1-background';
    gameContainer.appendChild(bg);
}

// ==========================================
// ゲーム②の初期化
// ==========================================
function initGame2() {
    gameContainer.innerHTML = '';
    const bg = document.createElement('div');
    bg.id = 'game2-background';
    gameContainer.appendChild(bg);
}

// ==========================================
// ゲーム③の初期化
// ==========================================
function initGame3() {
    gameContainer.innerHTML = '';
    const bg = document.createElement('div');
    bg.id = 'game3-background';
    gameContainer.appendChild(bg);
}

// ==========================================
// アクション処理（タッチされた時）
// ==========================================
async function handleInteraction(x, y) {
    const el = document.createElement('div');

    if (currentGame === 1) {
        playSound(1);
        el.className = 'particle';
        el.innerText = getRandom(emojis1);
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        gameContainer.appendChild(el);

    } else if (currentGame === 2) {
        const animal = getRandom(animals);
        speakAnimalSound(animal.sound);

        el.className = 'animal-global';
        el.innerText = animal.emoji;
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        gameContainer.appendChild(el);

    } else if (currentGame === 3) {
        playSound(3);
        el.className = 'vehicle';
        el.innerText = getRandom(emojis3);
        const goingRight = Math.random() > 0.5;

        el.style.left = `${x}px`;
        el.style.top = `${y}px`;

        const flip = goingRight ? 'scaleX(-1)' : '';
        el.style.transform = `translate(-50%, -50%) scale(0) ${flip}`;
        el.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

        gameContainer.appendChild(el);

        setTimeout(() => {
            el.style.transform = `translate(-50%, -50%) scale(1) ${flip}`;
            el.style.transition = 'left 2.5s ease-in, transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            el.style.left = goingRight ? `${window.innerWidth + 150}px` : `-150px`;
        }, 50);

        setTimeout(() => {
            el.remove();
        }, 2600);
    }

    if (currentGame === 1 || currentGame === 2) {
        el.addEventListener('animationend', () => {
            el.remove();
        });
    }
}

// ==========================================
// イベントリスナー
// ==========================================
gameContainer.addEventListener('touchstart', (e) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        handleInteraction(touch.clientX, touch.clientY);
    }
}, { passive: false });

gameContainer.addEventListener('mousedown', (e) => {
    if (e.target !== menuTrigger) {
        handleInteraction(e.clientX, e.clientY);
    }
});

// ==========================================
// 大人用メニュー
// ==========================================
let menuTimer;

function startMenuTimer() {
    menuTimer = setTimeout(() => {
        adultMenu.classList.remove('hidden');
    }, 1000);
}
function clearMenuTimer() {
    clearTimeout(menuTimer);
}

menuTrigger.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startMenuTimer();
});
menuTrigger.addEventListener('touchend', clearMenuTimer);
menuTrigger.addEventListener('mousedown', startMenuTimer);
menuTrigger.addEventListener('mouseup', clearMenuTimer);
menuTrigger.addEventListener('mouseleave', clearMenuTimer);

closeMenuBtn.addEventListener('click', () => {
    adultMenu.classList.add('hidden');
});

gameBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        currentGame = parseInt(e.target.getAttribute('data-game'));
        gameBtns.forEach(b => b.style.backgroundColor = '#f0f0f0');
        e.target.style.backgroundColor = '#a0e0a0';

        gameContainer.innerHTML = '';
        gameContainer.style.backgroundColor = '#ffebcd';

        if (currentGame === 1) {
            initGame1();
        } else if (currentGame === 2) {
            initGame2();
        } else if (currentGame === 3) {
            initGame3();
        }

        adultMenu.classList.add('hidden');
    });
});

// 初期化
gameBtns[0].style.backgroundColor = '#a0e0a0';
if (currentGame === 1) {
    initGame1();
} else if (currentGame === 2) {
    initGame2();
} else if (currentGame === 3) {
    initGame3();
}
