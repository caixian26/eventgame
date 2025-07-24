document.addEventListener('DOMContentLoaded', () => {
    // --- DOM 요소 ---
    const fullscreenTarget = document.getElementById('fullscreen-target');
    const startOverlay = document.getElementById('startOverlay'), pauseOverlay = document.getElementById('pauseOverlay'), endOverlay = document.getElementById('endOverlay');
    const startBtn = document.getElementById('startButton'), modalRestartButton = document.getElementById('modalRestartButton');
    const retryBtn = document.getElementById('retryBtn'), pauseBtn = document.getElementById('pauseBtn'), fullscreenBtn = document.getElementById('fullscreenBtn');
    const moveCounterEl = document.getElementById('moveCounter'), timerEl = document.getElementById('timer'), endDetailsEl = document.getElementById('endDetails');
    const exitFullscreenBtn = document.getElementById('exitFullscreenBtn');
    const imagePuzzleBoard = document.getElementById('image-puzzle-board');
    const imagePuzzlePieces = document.getElementById('image-puzzle-pieces');
    const showRankingBtn = document.getElementById('showRankingBtn');
    const hintBtn = document.getElementById('hintBtn');

    // 게임 설정 상수
    const GAME_ID = 'puzzle';
    const GRID_COLS = 4, GRID_ROWS = 3, GAME_TIME = 240;
    const RANKING_KEY = 'puzzle_ranking', RANKING_TITLE = '이미지 퍼즐';
    const IMAGE_SOURCES = [
        'puzzle_1.png', 'puzzle_2.png', 'puzzle_3.png', 'puzzle_4.png', 
        'puzzle_5.png', 'puzzle_6.png', 'puzzle_7.png', 'puzzle_8.jpg', 
        'puzzle_9.png', 'puzzle_10.png', 'puzzle_11.png', 'puzzle_12.jpeg',
        'puzzle_13.jpg', 'puzzle_14.jpg'
    ];

    let currentImageSrc = '', image = new Image();
    let moves = 0, timeLeft, timerInterval;
    let isGameRunning = false, isPaused = false;
    let draggedPiece = null, isDragging = false;
    let dragStartX = 0, dragStartY = 0, offsetX = 0, offsetY = 0;

    function preloadImages() { IMAGE_SOURCES.forEach(src => { (new Image()).src = src; }); }

    function initGame() {
        isGameRunning = false; isDragging = false; draggedPiece = null;
        clearInterval(timerInterval);
        moves = 0; moveCounterEl.textContent = '0';
        timerEl.textContent = '--';
        currentImageSrc = IMAGE_SOURCES[Math.floor(Math.random() * IMAGE_SOURCES.length)];
        image.src = currentImageSrc;
        image.onload = () => { setupImagePuzzle(); showOverlay(startOverlay); };
        image.onerror = () => alert(`'${currentImageSrc}' 이미지를 불러오는 데 실패했습니다.`);
    }

    function startGame() {
        if (isGameRunning) return;
        isGameRunning = true; isPaused = false;
        moves = 0; moveCounterEl.textContent = '0';
        showOverlay(null);
        pauseBtn.textContent = '일시정지';
        startTimer();
    }

    function endGame(isSuccess = true) {
        isGameRunning = false; clearInterval(timerInterval);
        const endMessageEl = document.getElementById('endMessage');
        const timeTaken = GAME_TIME - timeLeft;
        if (isSuccess) {
            endMessageEl.textContent = '🎉 퍼즐 완성! 🎉';
            endDetailsEl.innerHTML = `이동 횟수: ${moves}  |  걸린 시간: ${timeTaken}초`;
            if (typeof rankingModule !== 'undefined') {
                rankingModule.addScore(RANKING_KEY, { time: timeTaken }, RANKING_TITLE);
            }
            showOverlay(endOverlay);
        } else {
            endMessageEl.textContent = '😭 시간 초과! 😭';
            endDetailsEl.textContent = `다시 도전해보세요!`;
            showOverlay(endOverlay);
        }
    }

    function startTimer() {
        clearInterval(timerInterval);
        timeLeft = GAME_TIME;
        timerEl.textContent = `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`;
        timerInterval = setInterval(() => {
            if (isPaused || !isGameRunning) return;
            timeLeft--;
            timerEl.textContent = `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`;
            if (timeLeft <= 0) endGame(false);
        }, 1000);
    }

    function setupImagePuzzle() {
        imagePuzzleBoard.innerHTML = ''; imagePuzzlePieces.innerHTML = '';
        imagePuzzleBoard.style.gridTemplateColumns = `repeat(${GRID_COLS}, 1fr)`;
        imagePuzzleBoard.style.gridTemplateRows = `repeat(${GRID_ROWS}, 1fr)`;
        const pieces = [];
        const totalPieces = GRID_COLS * GRID_ROWS;
        for (let i = 0; i < totalPieces; i++) {
            const slot = document.createElement('div');
            slot.classList.add('puzzle-slot'); slot.dataset.id = i;
            imagePuzzleBoard.appendChild(slot);
            const piece = document.createElement('div');
            piece.classList.add('puzzle-piece'); piece.dataset.id = i;
            piece.draggable = false;
            piece.style.backgroundImage = `url(${currentImageSrc})`;
            const col = i % GRID_COLS, row = Math.floor(i / GRID_COLS);
            piece.style.backgroundSize = `${GRID_COLS * 100}% ${GRID_ROWS * 100}%`;
            piece.style.backgroundPosition = `${col * 100 / (GRID_COLS - 1)}% ${row * 100 / (GRID_ROWS - 1)}%`;
            pieces.push(piece);
        }
        pieces.sort(() => Math.random() - 0.5);
        pieces.forEach(p => imagePuzzlePieces.appendChild(p));
        redrawPieces();
    }

    function redrawPieces() {
        const pieceContainerWidth = imagePuzzlePieces.clientWidth;
        if (pieceContainerWidth === 0) return;
        const pieceWidth = (pieceContainerWidth / 2) - 10;
        document.querySelectorAll('.puzzle-piece').forEach(piece => {
            if (piece.parentElement === imagePuzzlePieces) {
                piece.style.width = `${pieceWidth}px`; piece.style.height = `${pieceWidth}px`;
            } else {
                piece.style.width = ''; piece.style.height = '';
            }
        });
    }

    function checkWin() {
        if (imagePuzzlePieces.children.length > 0) return;
        const slots = imagePuzzleBoard.querySelectorAll('.puzzle-slot');
        for (const slot of slots) {
            const piece = slot.querySelector('.puzzle-piece');
            if (!piece || piece.dataset.id !== slot.dataset.id) return;
        }
        setTimeout(() => endGame(true), 100);
    }

    function moveOrSwap(piece1, targetContainer) {
        const piece2 = targetContainer.querySelector('.puzzle-piece');
        const parent1 = piece1.parentElement;

        if (isGameRunning && parent1 !== targetContainer) { moves++; moveCounterEl.textContent = moves; }

        if (piece2 && parent1.classList.contains('puzzle-slot') && targetContainer.classList.contains('puzzle-slot')) {
            const tempId = piece1.dataset.id;
            const tempBgPos = piece1.style.backgroundPosition;
            piece1.dataset.id = piece2.dataset.id;
            piece1.style.backgroundPosition = piece2.style.backgroundPosition;
            piece2.dataset.id = tempId;
            piece2.style.backgroundPosition = tempBgPos;
        } else {
            if (piece2) { parent1.appendChild(piece2); }
            targetContainer.appendChild(piece1);
        }
        redrawPieces();
        checkWin();
    }

    function handleClick(target) {
        const clickedPiece = target.closest('.puzzle-piece');
        if (clickedPiece && clickedPiece.parentElement === imagePuzzlePieces) {
            const emptySlot = imagePuzzleBoard.querySelector('.puzzle-slot:not(:has(.puzzle-piece))');
            if (emptySlot) { moveOrSwap(clickedPiece, emptySlot); }
        }
    }

    function handleDragStart(e) {
        const target = e.target.closest('.puzzle-piece');
        if (!target || !isGameRunning || isPaused) return;
        draggedPiece = target;
        isDragging = false; // 드래그 시작 시 isDragging을 false로 초기화
        dragStartX = e.clientX || e.touches[0].clientX;
        dragStartY = e.clientY || e.touches[0].clientY;
    }

    function handleDragMove(e) {
        if (!draggedPiece) return;
        if (!isDragging) {
            const currentX = e.clientX || e.touches[0].clientX;
            const currentY = e.clientY || e.touches[0].clientY;
            const diffX = Math.abs(currentX - dragStartX), diffY = Math.abs(currentY - dragStartY);
            if (diffX > 5 || diffY > 5) {
                isDragging = true;
                const rect = draggedPiece.getBoundingClientRect();
                offsetX = dragStartX - rect.left; offsetY = dragStartY - rect.top;
                draggedPiece.classList.add('dragging');
                draggedPiece.style.width = `${rect.width}px`; draggedPiece.style.height = `${rect.height}px`;
                draggedPiece.style.position = 'fixed'; 
            }
        }
        if (isDragging) {
            e.preventDefault();
            const clientX = e.clientX || e.touches[0].clientX;
            const clientY = e.clientY || e.touches[0].clientY;
            draggedPiece.style.left = `${clientX - offsetX}px`; draggedPiece.style.top = `${clientY - offsetY}px`;
        }
    }

    function handleDragEnd(e) {
        if (!draggedPiece) return;
        if (isDragging) {
            draggedPiece.classList.remove('dragging');
            draggedPiece.style.position = ''; draggedPiece.style.left = ''; draggedPiece.style.top = '';
            draggedPiece.style.width = ''; draggedPiece.style.height = '';
            const clientX = e.clientX || e.changedTouches[0].clientX;
            const clientY = e.clientY || e.changedTouches[0].clientY;
            draggedPiece.style.display = 'none';
            const dropTarget = document.elementFromPoint(clientX, clientY);
            draggedPiece.style.display = '';
            const targetContainer = dropTarget ? dropTarget.closest('.puzzle-slot, #image-puzzle-pieces') : null;
            if (targetContainer) {
                const finalTarget = dropTarget.classList.contains('puzzle-piece') ? dropTarget.parentElement : targetContainer;
                moveOrSwap(draggedPiece, finalTarget);
            } else {
                redrawPieces();
            }
        } else {
            handleClick(draggedPiece);
        }
        draggedPiece = null; isDragging = false;
    }
    
    function showHint() {
        if (!isGameRunning || isPaused) return;
        const hintOverlay = document.createElement('div');
        Object.assign(hintOverlay.style, {
            position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.7)', backgroundImage: `url(${currentImageSrc})`,
            backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
            zIndex: '2000', opacity: '1', transition: 'opacity 0.3s ease-in-out'
        });
        document.body.appendChild(hintOverlay);
        setTimeout(() => {
            hintOverlay.style.opacity = '0';
            setTimeout(() => { if (hintOverlay.parentElement) { hintOverlay.parentElement.removeChild(hintOverlay); } }, 300);
        }, 1000);
    }

    showRankingBtn.addEventListener('click', () => {
        if (typeof rankingModule !== 'undefined') { rankingModule.show(RANKING_KEY, RANKING_TITLE); } 
        else { alert('랭킹 모듈을 불러오는 데 실패했습니다.'); }
    });

    hintBtn.addEventListener('click', showHint);
    startBtn.addEventListener('click', startGame);
    modalRestartButton.addEventListener('click', initGame);
    retryBtn.addEventListener('click', initGame);
    pauseBtn.addEventListener('click', () => {
        if (!isGameRunning) return;
        isPaused = !isPaused;
        showOverlay(isPaused ? pauseOverlay : null);
        pauseBtn.textContent = isPaused ? '계속하기' : '일시정지';
    });
    fullscreenBtn.addEventListener('click', () => document.fullscreenElement ? document.exitFullscreen() : fullscreenTarget.requestFullscreen());
    exitFullscreenBtn.addEventListener('click', () => document.exitFullscreen());

    // ✨ [최종 해결책] 이벤트 리스너 수정
    fullscreenTarget.addEventListener('mousedown', handleDragStart);
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    fullscreenTarget.addEventListener('touchstart', handleDragStart, { passive: false });
    document.addEventListener('touchmove', handleDragMove, { passive: false });
    document.addEventListener('touchend', handleDragEnd);

    // ✨ [최종 해결책] 브라우저 기본 드래그 기능 원천 차단
    fullscreenTarget.addEventListener('dragstart', (e) => {
        e.preventDefault();
    });

    function showOverlay(overlayToShow) {
        [startOverlay, pauseOverlay, endOverlay].forEach(o => o.classList.add('hidden'));
        if (overlayToShow) overlayToShow.classList.remove('hidden');
    }

    window.addEventListener('resize', redrawPieces);
    document.addEventListener('fullscreenchange', () => {
        const isFullscreen = !!document.fullscreenElement;
        exitFullscreenBtn.classList.toggle('hidden', !isFullscreen);
        setTimeout(redrawPieces, 100);
    });

    preloadImages();
    initGame();
});