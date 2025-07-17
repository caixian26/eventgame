document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.getElementById('gameWrapper');
    const fullscreenTarget = document.getElementById('fullscreen-target');
    const canvas = document.getElementById('mazeCanvas');
    const ctx = canvas.getContext('2d');
    const startOverlay = document.getElementById('startOverlay');
    const pauseOverlay = document.getElementById('pauseOverlay');
    const endOverlay = document.getElementById('endOverlay');
    const startBtn = document.getElementById('startButton');
    const modalRestartButton = document.getElementById('modalRestartButton');
    const retryBtn = document.getElementById('retryBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const timerEl = document.getElementById('timer');
    const endMessageEl = document.getElementById('endMessage');
    const endTimeEl = document.getElementById('endTime');

    let cols, rows, cellSize, maze, player, rabbit, stack = [];
    let isGameRunning = false, isPaused = false, isDragging = false;
    let startTime, timerInterval, timeLeft;
    const gameTime = 300; // 5분

    class Cell {
        constructor(c, r) { this.c = c; this.r = r; this.walls = { top: true, right: true, bottom: true, left: true }; this.visited = false; }
        draw() { const x = this.c * cellSize; const y = this.r * cellSize; ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--wall-color'); ctx.lineWidth = 4; if (this.walls.top) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + cellSize, y); ctx.stroke(); } if (this.walls.right) { ctx.beginPath(); ctx.moveTo(x + cellSize, y); ctx.lineTo(x + cellSize, y + cellSize); ctx.stroke(); } if (this.walls.bottom) { ctx.beginPath(); ctx.moveTo(x + cellSize, y + cellSize); ctx.lineTo(x, y + cellSize); ctx.stroke(); } if (this.walls.left) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + cellSize); ctx.stroke(); } }
        getNeighbors() { const n = []; const t = maze[this.r - 1]?.[this.c], r = maze[this.r]?.[this.c + 1], b = maze[this.r + 1]?.[this.c], l = maze[this.r]?.[this.c - 1]; if (t && !t.visited) n.push(t); if (r && !r.visited) n.push(r); if (b && !b.visited) n.push(b); if (l && !l.visited) n.push(l); return n.length > 0 ? n[Math.floor(Math.random() * n.length)] : undefined; }
    }
    function generateMaze() { for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) maze[r][c] = new Cell(c, r); let current = maze[0][0]; current.visited = true; stack.push(current); while (stack.length > 0) { let neighbor = current.getNeighbors(); if (neighbor) { removeWalls(current, neighbor); current = neighbor; current.visited = true; stack.push(current); } else { current = stack.pop(); } } }
    function removeWalls(a, b) { const dc = a.c - b.c, dr = a.r - b.r; if (dc === 1) { a.walls.left = false; b.walls.right = false; } else if (dc === -1) { a.walls.right = false; b.walls.left = false; } if (dr === 1) { a.walls.top = false; b.walls.bottom = false; } else if (dr === -1) { a.walls.bottom = false; b.walls.top = false; } }

    function setup() {
        const canvasSize = canvas.getBoundingClientRect().width;
        cellSize = canvasSize / 20;
        cols = Math.floor(canvasSize / cellSize);
        rows = Math.floor(canvasSize / cellSize);
        canvas.width = cols * cellSize; canvas.height = rows * cellSize;
        maze = Array(rows).fill(null).map(() => Array(cols).fill(null));
        player = { x: cellSize / 2, y: cellSize / 2, radius: cellSize / 2.5 };
        rabbit = { x: (cols - 0.5) * cellSize, y: (rows - 0.5) * cellSize };
        generateMaze();
        draw();
    }

    function redrawOnResize() {
        const playerXRatio = player.x / (cols * cellSize);
        const playerYRatio = player.y / (rows * cellSize);
        const canvasSize = canvas.getBoundingClientRect().width;
        cellSize = canvasSize / 20;
        cols = Math.floor(canvasSize / cellSize);
        rows = Math.floor(canvasSize / cellSize);
        canvas.width = cols * cellSize; canvas.height = rows * cellSize;
        player.x = playerXRatio * canvas.width;
        player.y = playerYRatio * canvas.height;
        player.radius = cellSize / 2.5;
        rabbit.x = (cols - 0.5) * cellSize;
        rabbit.y = (rows - 0.5) * cellSize;
        draw();
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (!maze) return;
        maze.forEach(row => row.forEach(cell => cell.draw()));
        ctx.font = `${cellSize * 0.8}px sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('🐇', rabbit.x, rabbit.y);
        ctx.fillText('🐢', player.x, player.y);
    }

    function gameLoop() { if (!isGameRunning || isPaused) return; draw(); checkWin(); requestAnimationFrame(gameLoop); }

    function movePlayer(targetX, targetY) {
        const dx = targetX - player.x;
        const dy = targetY - player.y;
        const distance = Math.hypot(dx, dy);
        const steps = Math.max(1, Math.floor(distance / (player.radius / 3)));
        let nextX = player.x;
        let nextY = player.y;
        for (let i = 1; i <= steps; i++) {
            const tempX = player.x + (dx / steps) * i;
            const tempY = player.y + (dy / steps) * i;
            if (isColliding(tempX, tempY)) {
                break;
            }
            nextX = tempX;
            nextY = tempY;
        }
        player.x = nextX;
        player.y = nextY;
    }

    function isColliding(x, y) {
        const r = player.radius * 0.8;
        const c = Math.floor(x / cellSize);
        const row = Math.floor(y / cellSize);
        const cell = maze[row]?.[c];
        if (!cell) return true;
        if (x - r < c * cellSize && cell.walls.left) return true;
        if (x + r > (c + 1) * cellSize && cell.walls.right) return true;
        if (y - r < row * cellSize && cell.walls.top) return true;
        if (y + r > (row + 1) * cellSize && cell.walls.bottom) return true;
        return false;
    }

    function checkWin() { const distance = Math.hypot(player.x - rabbit.x, player.y - rabbit.y); if (distance < player.radius) { endGame(true); } }
    
    // --- ✨ 타이머 중복 실행 버그 수정 (핵심) ✨ ---
    function startTimer() {
        // 기존에 실행 중인 타이머가 있다면 확실하게 제거
        clearInterval(timerInterval);

        startTime = Date.now();
        timeLeft = gameTime;
        timerEl.textContent = timeLeft;
        timerInterval = setInterval(() => {
            if (isPaused) return;
            timeLeft--;
            timerEl.textContent = timeLeft;
            if (timeLeft <= 0) {
                endGame(false);
            }
        }, 1000);
    }

    function startGame() { isGameRunning = true; isPaused = false; startOverlay.classList.add('hidden'); endOverlay.classList.add('hidden'); pauseOverlay.classList.add('hidden'); pauseBtn.textContent = '일시정지'; setup(); startTimer(); requestAnimationFrame(gameLoop); }
    function endGame(isSuccess) { isGameRunning = false; clearInterval(timerInterval); endOverlay.classList.remove('hidden'); if (isSuccess) { const timeTaken = Math.floor((Date.now() - startTime) / 1000); endMessageEl.textContent = '🎉 따라잡았습니다! 🎉'; endTimeEl.textContent = `걸린 시간: ${timeTaken}초`; } else { endMessageEl.textContent = '😭 시간 초과! 😭'; endTimeEl.textContent = '다시 도전해보세요!'; } }
    function togglePause() { if (!isGameRunning) return; isPaused = !isPaused; pauseOverlay.classList.toggle('hidden', !isPaused); pauseBtn.textContent = isPaused ? '계속하기' : '일시정지'; }
    function toggleFullscreen() { if (!document.fullscreenElement) { fullscreenTarget.requestFullscreen().catch(err => alert(`전체화면 모드를 사용할 수 없습니다: ${err.message}`)); } else { document.exitFullscreen(); } }

    function getPos(e) { const rect = canvas.getBoundingClientRect(); const scaleX = canvas.width / rect.width; const scaleY = canvas.height / rect.height; const clientX = e.clientX || e.touches[0].clientX; const clientY = e.clientY || e.touches[0].clientY; return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY }; }
    function onInteractionStart(e) { if (!isGameRunning || isPaused) return; const pos = getPos(e); const distance = Math.hypot(pos.x - player.x, pos.y - player.y); if (distance < player.radius) { isDragging = true; canvas.classList.add('grabbing'); } }
    function onInteractionMove(e) { if (!isDragging || !isGameRunning || isPaused) return; e.preventDefault(); const pos = getPos(e); movePlayer(pos.x, pos.y); }
    function onInteractionEnd() { isDragging = false; canvas.classList.remove('grabbing'); }

    startBtn.addEventListener('click', startGame);
    modalRestartButton.addEventListener('click', startGame);
    retryBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    canvas.addEventListener('mousedown', onInteractionStart);
    canvas.addEventListener('mousemove', onInteractionMove);
    window.addEventListener('mouseup', onInteractionEnd);
    canvas.addEventListener('touchstart', onInteractionStart, { passive: false });
    canvas.addEventListener('touchmove', onInteractionMove, { passive: false });
    window.addEventListener('touchend', onInteractionEnd);
    
    function handleResize() { if (isGameRunning) { redrawOnResize(); } else { setup(); } }
    window.addEventListener('resize', handleResize);
    document.addEventListener('fullscreenchange', () => { setTimeout(handleResize, 100); });

    endOverlay.classList.add('hidden');
    pauseOverlay.classList.add('hidden');
    startOverlay.classList.remove('hidden');
    setup();
});