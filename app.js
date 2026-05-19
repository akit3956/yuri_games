const gameContainer = document.getElementById('game-container');
const menuTrigger = document.getElementById('menu-trigger');
const adultMenu = document.getElementById('adult-menu');
const gameBtns = document.querySelectorAll('.game-select-btn');

let currentGame = 1;
let audioCtx;

// BGM
const bgm = new Audio('sounds/bgm.mp3');
bgm.loop = true;
bgm.volume = 0.4;

function startBGM() {
    if (bgm.paused) {
        bgm.play().catch(() => {});
    }
}

function stopBGM() {
    if (!bgm.paused) {
        bgm.pause();
        bgm.currentTime = 0;
    }
}

function initAudio() {
    if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playSound(type) {
    initAudio();

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
// 動物の鳴き声（本物の音声ファイル）
// ==========================================
const animalAudios = {};

function preloadAnimalSounds() {
    const soundFiles = {
        dog:      'sounds/dog.mp3',
        cat:      'sounds/cat.mp3',
        elephant: 'sounds/elephant.mp3',
        bear:     'sounds/bear.mp3',
        bird:     'sounds/bird.mp3',
    };
    for (const [key, src] of Object.entries(soundFiles)) {
        const audio = new Audio(src);
        audio.preload = 'auto';
        animalAudios[key] = audio;
    }
}

function playAnimalSound(key) {
    if (key === 'yuri') {
        // ゆうりちゃんは名前を読み上げ
        if (window.speechSynthesis) {
            const msg = new SpeechSynthesisUtterance('ゆうり！');
            msg.rate = 0.85;
            msg.pitch = 1.6;
            msg.volume = 1.0;
            window.speechSynthesis.speak(msg);
        }
        return;
    }
    const audio = animalAudios[key];
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
    // 0.8秒後に止める
    setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
    }, 800);
}

// ==========================================
// ゲームコンテンツのデータ
// ==========================================
const emojis1 = ['✨', '🎈', '⭐', '🎵', '💖', '🌈', '🎉'];
const emojis3 = ['🚓', '🚒', '🚑', '🚅', '🚕', '🚌', '🚜'];

const animals = [
    { emoji: '🐶', sound: 'dog',      type: 'animal' },
    { emoji: '🐱', sound: 'cat',      type: 'animal' },
    { emoji: '🐘', sound: 'elephant', type: 'animal' },
    { emoji: '🐻', sound: 'bear',     type: 'animal' },
    { emoji: '🐦', sound: 'bird',     type: 'animal' },
    { emoji: null,  sound: 'yuri',     type: 'yuri'   },
];

function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// ==========================================
// ゲーム初期化
// ==========================================
function initGame1() {
    gameContainer.innerHTML = '';
    const bg = document.createElement('div');
    bg.id = 'game1-background';
    gameContainer.appendChild(bg);
}

function initGame2() {
    gameContainer.innerHTML = '';
    const bg = document.createElement('div');
    bg.id = 'game2-background';
    gameContainer.appendChild(bg);
}

function initGame3() {
    gameContainer.innerHTML = '';
    const bg = document.createElement('div');
    bg.id = 'game3-background';
    gameContainer.appendChild(bg);
}

// ==========================================
// アクション処理
// ==========================================
function handleInteraction(x, y) {
    if (currentGame === 1) {
        const el = document.createElement('div');
        playSound(1);
        el.className = 'particle';
        el.innerText = getRandom(emojis1);
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        gameContainer.appendChild(el);
        el.addEventListener('animationend', () => el.remove());

    } else if (currentGame === 2) {
        const animal = getRandom(animals);
        playAnimalSound(animal.sound);

        const el = document.createElement('div');
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;

        if (animal.type === 'yuri') {
            el.className = 'yuri-character';
            const img = document.createElement('img');
            img.src = 'images/yuri.png';
            img.className = 'yuri-img';
            el.appendChild(img);
        } else {
            el.className = 'animal-global';
            el.innerText = animal.emoji;
        }

        gameContainer.appendChild(el);
        el.addEventListener('animationend', () => el.remove());

    } else if (currentGame === 3) {
        const el = document.createElement('div');
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

        setTimeout(() => el.remove(), 2600);
    }
}

// ==========================================
// イベントリスナー
// ==========================================
gameContainer.addEventListener('touchstart', (e) => {
    e.preventDefault();
    initAudio();
}, { passive: false });

gameContainer.addEventListener('touchend', (e) => {
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
menuTrigger.addEventListener('touchend', (e) => {
    e.preventDefault();
    adultMenu.classList.remove('hidden');
    startBGM();
});
menuTrigger.addEventListener('click', () => {
    adultMenu.classList.remove('hidden');
    startBGM();
});

gameBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        currentGame = parseInt(e.target.getAttribute('data-game'));
        gameBtns.forEach(b => b.style.backgroundColor = '#f0f0f0');
        e.target.style.backgroundColor = '#a0e0a0';

        gameContainer.innerHTML = '';
        gameContainer.style.backgroundColor = '#ffebcd';

        if (currentGame === 1) initGame1();
        else if (currentGame === 2) initGame2();
        else if (currentGame === 3) initGame3();

        adultMenu.classList.add('hidden');
        stopBGM();
    });
});

// 起動時に音声ファイルをプリロード
preloadAnimalSounds();

// 初期化 - ホーム画面（ゲーム選択）を最初に表示
initGame1();
adultMenu.classList.remove('hidden');

// 最初のタッチでBGM開始（iOSはユーザー操作後でないと再生できない）
document.addEventListener('touchend', function startBGMOnce() {
    startBGM();
    document.removeEventListener('touchend', startBGMOnce);
}, { once: true });
document.addEventListener('click', function startBGMOnce() {
    startBGM();
    document.removeEventListener('click', startBGMOnce);
}, { once: true });
