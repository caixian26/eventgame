document.addEventListener('DOMContentLoaded', () => {
    // --- DOM 요소 ---
    const fullscreenTarget = document.getElementById('fullscreen-target');
    const levelButtons = document.querySelectorAll('.level-btn');
    const startOverlay = document.getElementById('startOverlay'), pauseOverlay = document.getElementById('pauseOverlay'), endOverlay = document.getElementById('endOverlay');
    const startBtn = document.getElementById('startButton'), modalRestartButton = document.getElementById('modalRestartButton');
    const retryBtn = document.getElementById('retryBtn'), pauseBtn = document.getElementById('pauseBtn'), fullscreenBtn = document.getElementById('fullscreenBtn');
    const moveCounterEl = document.getElementById('moveCounter'), timerEl = document.getElementById('timer'), endDetailsEl = document.getElementById('endDetails');
    const exitFullscreenBtn = document.getElementById('exitFullscreenBtn');
    const imagePuzzleBoard = document.getElementById('image-puzzle-board');
    const imagePuzzlePieces = document.getElementById('image-puzzle-pieces');
    const gameWrapper = document.getElementById('gameWrapper');
    const showRankingBtn = document.getElementById('showRankingBtn');

    const GAME_ID = 'puzzle';

    const gameConfigs = {
        normal: { gridSize: 3, imageSrc: 'puzzle_1.png', time: 180, name: '보통' },
        hard: { gridSize: 4, imageSrc: 'puzzle_2.png', time: 300, name: '매우 어려움' }
    };
    let currentDifficulty = 'normal';
    let currentConfig = gameConfigs[currentDifficulty];
    let image = new Image();

    let gridSize;
    let moves = 0, timeLeft, timerInterval;
    let isGameRunning = false, isPaused = false;
    
    let draggedPiece = null;
    let isDragging = false;
    let dragStartX = 0, dragStartY = 0;
    let offsetX = 0, offsetY = 0;

    function preloadImages() {
        Object.values(gameConfigs).forEach(config => { (new Image()).src = config.imageSrc; });
    }

    function initGame() {
        isGameRunning = false; isDragging = false; draggedPiece = null;
        clearInterval(timerInterval);
        moves = 0; moveCounterEl.textContent = '0';
        timerEl.textContent = '--';
        image.src = currentConfig.imageSrc;
        image.onload = () => {
            gridSize = currentConfig.gridSize;
            setupImagePuzzle();
            showOverlay(startOverlay);
        };
        image.onerror = () => alert('이미지를 불러오는 데 실패했습니다.');
    }

    function startGame() {
        if (isGameRunning) return;
        isGameRunning = true; isPaused = false;
        moves = 0; moveCounterEl.textContent = '0';
        showOverlay(null);
        pauseBtn.textContent = '일시정지';
        startTimer();
    }

    // ✨ [핵심 수정] endGame 함수의 호출 순서 변경
    function endGame(isSuccess = true) {
        isGameRunning = false; clearInterval(timerInterval);
        const endMessageEl = document.getElementById('endMessage');
        const timeTaken = currentConfig.time - timeLeft;

        if (isSuccess) {
            // 1. 성공 메시지 내용 준비
            endMessageEl.textContent = '🎉 퍼즐 완성! 🎉';
            endDetailsEl.innerHTML = `이동 횟수: ${moves}  |  걸린 시간: ${timeTaken}초`;
            
            // 2. 랭킹 등록을 먼저 호출 (prompt가 먼저 나타남)
            const storageKey = `${GAME_ID}_${currentDifficulty}`;
            rankingModule.addScore(storageKey, { time: timeTaken }, currentConfig.name);
            
            // 3. 랭킹 등록이 끝난 후, 최종 결과 모달을 보여줌
            showOverlay(endOverlay);

        } else {
            endMessageEl.textContent = '😭 시간 초과! 😭';
            endDetailsEl.textContent = `다시 도전해보세요!`;
            showOverlay(endOverlay);
        }
    }

    function startTimer() {
        clearInterval(timerInterval);
        timeLeft = currentConfig.time;
        timerEl.textContent = `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`;
        timerInterval = setInterval(() => {
            if (isPaused || !isGameRunning) return;
            timeLeft--;
            timerEl.textContent = `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`;
            if (timeLeft <= 0) endGame(false);
        }, 1000);
    }

    function setupImagePuzzle() {
        gridSize = currentConfig.gridSize;
        imagePuzzleBoard.innerHTML = ''; imagePuzzlePieces.innerHTML = '';
        imagePuzzleBoard.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
        imagePuzzleBoard.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;
        
        const pieces = [];
        for (let i = 0; i < gridSize * gridSize; i++) {
            const slot = document.createElement('div');
            slot.classList.add('puzzle-slot'); slot.dataset.id = i;
            imagePuzzleBoard.appendChild(slot);

            const piece = document.createElement('div');
            piece.classList.add('puzzle-piece'); piece.dataset.id = i; piece.draggable = false;
            piece.style.backgroundImage = `url(${currentConfig.imageSrc})`;
            piece.style.backgroundSize = `${gridSize * 100}% ${gridSize * 100}%`;
            piece.style.backgroundPosition = `${(i % gridSize) * 100 / (gridSize - 1)}% ${(Math.floor(i / gridSize)) * 100 / (gridSize - 1)}%`;
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
                piece.style.width = `${pieceWidth}px`;
                piece.style.height = `${pieceWidth}px`;
            } else {
                piece.style.width = '';
                piece.style.height = '';
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
        endGame(true);
    }

    function moveOrSwap(piece1, targetContainer) {
        const piece2 = targetContainer.querySelector('.puzzle-piece');
        const parent1 = piece1.parentElement;

        if (piece2) {
            parent1.appendChild(piece2);
        }
        targetContainer.appendChild(piece1);
        
        if (isGameRunning && parent1 !== targetContainer) {
            moves++;
            moveCounterEl.textContent = moves;
        }
        
        redrawPieces();
        checkWin();
    }

    function handleClick(target) {
        const clickedPiece = target.closest('.puzzle-piece');
        if (clickedPiece && clickedPiece.parentElement === imagePuzzlePieces) {
            const emptySlot = imagePuzzleBoard.querySelector('.puzzle-slot:not(:has(.puzzle-piece))');
            if (emptySlot) {
                moveOrSwap(clickedPiece, emptySlot);
            }
        }
    }

    function handleDragStart(e) {
        const target = e.target.closest('.puzzle-piece');
        if (!target || !isGameRunning) return;
        
        draggedPiece = target;
        dragStartX = e.clientX || e.touches[0].clientX;
        dragStartY = e.clientY || e.touches[0].clientY;
    }

    function handleDragMove(e) {
        if (!draggedPiece || isDragging) return;

        const currentX = e.clientX || e.touches[0].clientX;
        const currentY = e.clientY || e.touches[0].clientY;
        const diffX = Math.abs(currentX - dragStartX);
        const diffY = Math.abs(currentY - dragStartY);

        if (diffX > 5 || diffY > 5) {
            isDragging = true;
            
            const rect = draggedPiece.getBoundingClientRect();
            offsetX = dragStartX - rect.left;
            offsetY = dragStartY - rect.top;

            draggedPiece.classList.add('dragging');
            draggedPiece.style.width = `${rect.width}px`;
            draggedPiece.style.height = `${rect.height}px`;
            draggedPiece.style.position = 'fixed'; 
            draggedPiece.style.left = `${dragStartX - offsetX}px`;
            draggedPiece.style.top = `${dragStartY - offsetY}px`;
        }
    }

    function updateDragPosition(e) {
        if (!isDragging) return;
        e.preventDefault();
        
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        
        draggedPiece.style.left = `${clientX - offsetX}px`;
        draggedPiece.style.top = `${clientY - offsetY}px`;
    }

    function handleDragEnd(e) {
        if (!draggedPiece) return;

        if (isDragging) {
            draggedPiece.classList.remove('dragging');
            draggedPiece.style.position = '';
            draggedPiece.style.width = '';
            draggedPiece.style.height = '';
            draggedPiece.style.left = '';
            draggedPiece.style.top = '';

            const clientX = e.clientX || e.changedTouches[0].clientX;
            const clientY = e.clientY || e.changedTouches[0].clientY;
            
            draggedPiece.style.display = 'none';
            const dropTarget = document.elementFromPoint(clientX, clientY);
            draggedPiece.style.display = '';

            const targetContainer = dropTarget ? dropTarget.closest('.puzzle-slot, #image-puzzle-pieces') : null;

            if (targetContainer) {
                const finalTarget = dropTarget.classList.contains('puzzle-piece') ? dropTarget.parentElement : targetContainer;
                moveOrSwap(draggedPiece, finalTarget);
            }
        } else {
            handleClick(e.target);
        }

        draggedPiece = null;
        isDragging = false;
    }

    levelButtons.forEach(button => {
        button.addEventListener('click', () => {
            levelButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentDifficulty = button.dataset.difficulty;
            currentConfig = gameConfigs[currentDifficulty];
            initGame();
        });
    });

    showRankingBtn.addEventListener('click', () => {
        const storageKey = `${GAME_ID}_${currentDifficulty}`;
        rankingModule.show(storageKey, currentConfig.name);
    });

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

    gameWrapper.addEventListener('mousedown', handleDragStart);
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mousemove', updateDragPosition);
    document.addEventListener('mouseup', handleDragEnd);
    
    gameWrapper.addEventListener('touchstart', handleDragStart, { passive: false });
    document.addEventListener('touchmove', handleDragMove, { passive: false });
    document.addEventListener('touchmove', updateDragPosition, { passive: false });
    document.addEventListener('touchend', handleDragEnd);

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