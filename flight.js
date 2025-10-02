// --- DOM 요소 가져오기 ---
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const gameContainer = document.getElementById('game-container');
const rankingBtn = document.getElementById('ranking-btn');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');
const fullscreenBtn = document.getElementById('fullscreen-btn');

// --- 기본 설정 ---
canvas.setAttribute('tabindex', 0);
canvas.style.outline = 'none';
// canvas.style.cursor = 'none'; // ✨ 1. 이 줄을 주석 처리하거나 삭제하여 커서를 보이게 합니다.

// 캔버스의 '그림판' 크기는 고정 (성능 및 좌표계산을 위해 중요)
canvas.width = 800;
canvas.height = 600;

// --- 이미지 소스 (경로 수정됨) ---
const images = {};
const imageSources = {
    player: 'player.png',
    bullet_level1: 'bullet_level1.png',
    bullet_level2: 'bullet_level2.png',
    bullet_level3: 'bullet_level3.png',
    enemy_chaser: 'enemy_chaser.png',
    enemy_spinner: 'enemy_spinner.png',
    enemy_tank: 'enemy_tank.png',
    enemyBullet: 'enemy_bullet.png',
    coin: 'coin.png'
};
function loadImages(sources, callback) {
    let loaded = 0;
    const numImages = Object.keys(sources).length;
    for (const src in sources) {
        images[src] = new Image();
        images[src].src = sources[src];
        images[src].onload = () => { if (++loaded >= numImages) callback(); };
        images[src].onerror = () => console.error(`이미지 로드 실패: ${sources[src]}`);
    }
}

// --- 게임 설정 및 상태 변수 ---
let player, bullets, enemies, enemyBullets, coins, stars;
let score, timeScore, lives, isGameOver, isInvincible, invincibleTimer, gameTime;
let isPaused = false;
let difficultyMultiplier;
let isDragging = false;

const coinsForLevel2 = 50;
const coinsForLevel3 = 100;
const coinBonusValue = 250;
const RANKING_KEY = 'flightGameRankings';

// --- 게임 초기화 ---
function init() {
    score = 0; timeScore = 0; lives = 3; isGameOver = false;
    isInvincible = false; invincibleTimer = 0; gameTime = 0;
    isPaused = false; pauseBtn.textContent = '일시정지';
    difficultyMultiplier = 1;
    isDragging = false;
    bullets = []; enemies = []; enemyBullets = []; coins = []; stars = [];
    initPlayer();
    createStars();
    canvas.focus();
}

function initPlayer() {
    player = {
        x: canvas.width / 2, y: canvas.height - 80,
        width: 50, height: 50, hitboxRadius: 15,
        hp: 3, maxHp: 3,
        fireCooldown: 0,
        weaponLevel: 1, coinsCollected: 0
    };
}

function createStars() {
    if (stars.length > 0) return;
    for (let i = 0; i < 200; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 0.5 + 0.2
        });
    }
}

// --- 마우스 '클릭 & 드래그' 이벤트 리스너 ---
const mouse = { x: canvas.width / 2, y: canvas.height / 2 };

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
}

canvas.addEventListener('mousedown', e => {
    const pos = getMousePos(e);
    if (pos.x > player.x && pos.x < player.x + player.width &&
        pos.y > player.y && pos.y < player.y + player.height) {
        isDragging = true;
        canvas.style.cursor = 'grabbing';
    }
});

canvas.addEventListener('mousemove', e => {
    const pos = getMousePos(e);
    if (isDragging) {
        player.x = pos.x - player.width / 2;
        player.y = pos.y - player.height / 2;
    }
});

window.addEventListener('mouseup', () => {
    isDragging = false;
    canvas.style.cursor = 'default'; // ✨ 2. 커서를 기본 모양으로 되돌립니다.
});
canvas.addEventListener('mouseleave', () => {
    isDragging = false;
    canvas.style.cursor = 'default'; // ✨ 3. 커서를 기본 모양으로 되돌립니다.
});


// --- (이하 모든 게임 로직은 이전과 동일합니다) ---
function update() {
    gameTime++;
    difficultyMultiplier = 1 + (gameTime / 3600);
    updateStars();
    updatePlayer();
    updateEntities();
    updateEnemies();
    checkCollisions();
    updateScore();
    spawnEnemies();
}
function updateStars() {
    stars.forEach(star => {
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    });
}
function updatePlayer() {
    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
    player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
    handleShooting();
    if (isInvincible) {
        invincibleTimer--;
        if (invincibleTimer <= 0) isInvincible = false;
    }
}
function handleShooting() {
    if (player.fireCooldown > 0) {
        player.fireCooldown--;
        return;
    }
    const level = player.weaponLevel;
    switch (level) {
        case 1:
            bullets.push({ x: player.x + player.width / 2 - 5, y: player.y, width: 10, height: 20, speed: 12, level: 1, damage: 1 });
            player.fireCooldown = 15;
            break;
        case 2:
            bullets.push({ x: player.x + player.width / 2 - 15, y: player.y, width: 10, height: 20, speed: 12, level: 2, damage: 2 });
            bullets.push({ x: player.x + player.width / 2 + 5, y: player.y, width: 10, height: 20, speed: 12, level: 2, damage: 2 });
            player.fireCooldown = 12;
            break;
        case 3:
        default:
            bullets.push({ x: player.x + player.width / 2 - 10, y: player.y, width: 20, height: 30, speed: 15, level: 3, damage: 4 });
            player.fireCooldown = 10;
            break;
    }
}
function updateEntities() {
    bullets.forEach((b, i) => { b.y -= b.speed; if (b.y < -b.height) bullets.splice(i, 1); });
    enemyBullets.forEach((b, i) => { b.x += b.dx; b.y += b.dy; if (b.x < -b.radius || b.x > canvas.width + b.radius || b.y < -b.radius || b.y > canvas.height + b.radius) enemyBullets.splice(i, 1); });
    coins.forEach((c, i) => { c.y += c.speed; if (c.y > canvas.height) coins.splice(i, 1); });
}
function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        if (e.type !== 'tank') e.y += e.speed;
        if (e.lifetime) {
            e.lifetime--;
            if (e.lifetime <= 0) { enemies.splice(i, 1); continue; }
        }
        if (e.fireCooldown > 0) e.fireCooldown--;
        if (e.fireCooldown === 0) {
            if (e.type === 'spinner') {
                const bulletCount = 12;
                for (let j = 0; j < bulletCount; j++) {
                    const angle = (j / bulletCount) * Math.PI * 2;
                    enemyBullets.push({ x: e.x + e.width / 2, y: e.y + e.height / 2, radius: 8, dx: Math.cos(angle) * 3, dy: Math.sin(angle) * 3 });
                }
                e.fireCooldown = 150;
            } else if (e.type === 'tank') {
                const angle = Math.atan2(player.y - e.y, player.x - e.x);
                enemyBullets.push({ x: e.x + e.width / 2, y: e.y + e.height / 2, radius: 10, dx: Math.cos(angle) * 4, dy: Math.sin(angle) * 4 });
                e.fireCooldown = 20;
            }
        }
        if (e.y > canvas.height) enemies.splice(i, 1);
    }
}
function updateScore() {
    if (gameTime % 60 === 0) {
        const timeBonus = 10 + Math.floor(gameTime / 600);
        timeScore += timeBonus;
    }
}
function checkCollisions() {
    if (!isInvincible) {
        for (const bullet of enemyBullets) {
            const dist = Math.hypot(player.x + player.width / 2 - (bullet.x), player.y + player.height / 2 - (bullet.y));
            if (dist < player.hitboxRadius + bullet.radius) {
                player.hp--;
                isInvincible = true; invincibleTimer = 120;
                if (player.hp <= 0) {
                    lives--;
                    if (lives <= 0) isGameOver = true;
                    else player.hp = player.maxHp;
                }
                break;
            }
        }
        for (let i = enemies.length - 1; i >= 0; i--) {
            const e = enemies[i];
            if (player.x < e.x + e.width && player.x + player.width > e.x &&
                player.y < e.y + e.height && player.y + player.height > e.y) {
                player.hp--;
                isInvincible = true; invincibleTimer = 120;
                if (player.hp <= 0) {
                    lives--;
                    if (lives <= 0) isGameOver = true;
                    else player.hp = player.maxHp;
                }
                enemies.splice(i, 1);
                break;
            }
        }
    }
    for (let i = enemies.length - 1; i >= 0; i--) {
        for (let j = bullets.length - 1; j >= 0; j--) {
            const e = enemies[i]; const b = bullets[j];
            if (b.x < e.x + e.width && b.x + b.width > e.x && b.y < e.y + e.height && b.y + b.height > e.y) {
                e.hp -= b.damage;
                bullets.splice(j, 1);
                if (e.hp <= 0) {
                    score += e.score;
                    let coinsToDrop = 0;
                    switch (e.type) {
                        case 'chaser': coinsToDrop = 1; break;
                        case 'spinner': coinsToDrop = 2; break;
                        case 'tank': coinsToDrop = 3; break;
                    }
                    for (let k = 0; k < coinsToDrop; k++) {
                        const offsetX = (Math.random() - 0.5) * e.width;
                        const offsetY = (Math.random() - 0.5) * e.height;
                        coins.push({ x: e.x + e.width / 2 + offsetX, y: e.y + e.height / 2 + offsetY, radius: 15, speed: 2 });
                    }
                    enemies.splice(i, 1);
                }
            }
        }
    }
    for (let i = coins.length - 1; i >= 0; i--) {
        const c = coins[i];
        const dist = Math.hypot(player.x + player.width / 2 - c.x, player.y + player.height / 2 - c.y);
        if (dist < player.hitboxRadius + c.radius + 20) {
            coins.splice(i, 1);
            player.coinsCollected++;
            if (player.weaponLevel < 2 && player.coinsCollected >= coinsForLevel2) {
                player.weaponLevel = 2;
            } else if (player.weaponLevel < 3 && player.coinsCollected >= coinsForLevel3) {
                player.weaponLevel = 3;
            }
        }
    }
}
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStars();
    if (!isInvincible || Math.floor(invincibleTimer / 6) % 2) {
        ctx.drawImage(images.player, player.x, player.y, player.width, player.height);
    }
    bullets.forEach(b => ctx.drawImage(images[`bullet_level${b.level}`], b.x, b.y, b.width, b.height));
    enemies.forEach(e => ctx.drawImage(images[e.imageKey], e.x, e.y, e.width, e.height));
    enemyBullets.forEach(b => ctx.drawImage(images.enemyBullet, b.x - b.radius, b.y - b.radius, b.radius * 2, b.radius * 2));
    coins.forEach(c => ctx.drawImage(images.coin, c.x - c.radius, c.y - c.radius, c.radius * 2, c.radius * 2));
    drawUI();
    if (isPaused) drawPauseScreen();
}
function drawStars() {
    ctx.fillStyle = 'white';
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size / 2, 0, Math.PI * 2);
        ctx.fill();
    });
}
function drawUI() {
    ctx.fillStyle = 'grey'; ctx.fillRect(10, 10, 200, 20);
    ctx.fillStyle = 'red'; ctx.fillRect(10, 10, (player.hp / player.maxHp) * 200, 20);
    ctx.strokeStyle = 'white'; ctx.strokeRect(10, 10, 200, 20);
    for (let i = 0; i < lives; i++) { ctx.drawImage(images.player, 15 + i * 30, 40, 25, 25); }
    ctx.fillStyle = 'white'; ctx.font = '24px "Noto Sans KR"';
    ctx.textAlign = 'right'; ctx.fillText(`${score + timeScore}`, canvas.width - 15, 35);
    ctx.textAlign = 'left';
    ctx.drawImage(images.coin, canvas.width - 150, 50, 25, 25);
    ctx.fillText(`x ${player.coinsCollected}`, canvas.width - 115, 70);
}
function drawPauseScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 50px "Noto Sans KR"';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
}
let baseSpawnInterval = 120;
let enemySpawnTimer = 0;
let animationFrameId;
function gameLoop() {
    if (isGameOver) {
        cancelAnimationFrame(animationFrameId);
        showGameOver();
        return;
    }
    if (!isPaused) {
        update();
    }
    draw();
    animationFrameId = requestAnimationFrame(gameLoop);
}
function spawnEnemies() {
    const currentSpawnInterval = Math.max(25, baseSpawnInterval / difficultyMultiplier);
    if (++enemySpawnTimer > currentSpawnInterval) {
        const rand = Math.random();
        if (rand < 0.6) createEnemy('chaser');
        else if (rand < 0.85) createEnemy('spinner');
        else createEnemy('tank');
        enemySpawnTimer = 0;
    }
}
function createEnemy(type) {
    let enemy;
    const speedMod = difficultyMultiplier;
    const hpMod = Math.ceil(difficultyMultiplier);
    switch (type) {
        case 'chaser':
            enemy = { x: Math.random() * (canvas.width - 40), y: -40, width: 40, height: 40, speed: 2.5 * speedMod, hp: 1 * hpMod, score: 100, imageKey: 'enemy_chaser', type: 'chaser' };
            break;
        case 'spinner':
            enemy = { x: Math.random() * (canvas.width - 60), y: -60, width: 60, height: 60, speed: 1 * speedMod, hp: 5 * hpMod, score: 300, imageKey: 'enemy_spinner', type: 'spinner', fireCooldown: 100 };
            break;
        case 'tank':
            enemy = { x: Math.random() * (canvas.width - 80), y: Math.random() * (canvas.height / 4) + 20, width: 80, height: 80, speed: 0, hp: 10 * hpMod, score: 500, imageKey: 'enemy_tank', type: 'tank', fireCooldown: 0, lifetime: 600 };
            break;
    }
    enemies.push(enemy);
}
function showGameOver() {
    const coinBonus = player.coinsCollected * coinBonusValue;
    const totalScore = timeScore + score + coinBonus;
    rankingModule.addScore(RANKING_KEY, { score: totalScore }, '비행선 슈팅 게임');
}
pauseBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? '계속하기' : '일시정지';
    canvas.focus();
});
restartBtn.addEventListener('click', () => {
    cancelAnimationFrame(animationFrameId);
    init();
    gameLoop();
});
fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        gameContainer.requestFullscreen().catch(err => {
            alert(`전체화면 모드를 사용할 수 없습니다: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
});
rankingBtn.addEventListener('click', () => {
    rankingModule.show(RANKING_KEY, '비행선 슈팅 게임');
});
loadImages(imageSources, () => {
    init();
    gameLoop();
});