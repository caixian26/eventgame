document.addEventListener('DOMContentLoaded', () => {
    // 공통 DOM
    const fullscreenTarget = document.getElementById('fullscreen-target');
    const levelButtons = document.querySelectorAll('.level-btn');
    const startOverlay = document.getElementById('startOverlay'), pauseOverlay = document.getElementById('pauseOverlay'), endOverlay = document.getElementById('endOverlay');
    const startBtn = document.getElementById('startButton'), modalRestartButton = document.getElementById('modalRestartButton');
    const retryBtn = document.getElementById('retryBtn'), pauseBtn = document.getElementById('pauseBtn'), fullscreenBtn = document.getElementById('fullscreenBtn');
    const moveCounterEl = document.getElementById('moveCounter'), timerEl = document.getElementById('timer'), endDetailsEl = document.getElementById('endDetails');
    const exitFullscreenBtn = document.getElementById('exitFullscreenBtn');

    // 이미지 퍼즐 DOM
    const imagePuzzleBoard = document.getElementById('image-puzzle-board');
    const imagePuzzlePieces = document.getElementById('image-puzzle-pieces');
    
    // ✨ 힌트 관련 DOM 선택 삭제 ✨

    // 게임 설정
    const gameConfigs = {
        normal: { gridSize: 3, imageSrc: 'puzzle_park.png', time: 180 },
        hard: { gridSize: 4, imageSrc: 'puzzle_city.png', time: 300 }
    };
    let currentConfig = gameConfigs.normal;
    let image = new Image();

    // 게임 상태
    let gridSize;
    let moves = 0, timeLeft, timerInterval;
    let isGameRunning = false, isPaused = false;
    let draggedPiece = null;

    // --- 게임 로직 ---
    function initGame() {
        isGameRunning = false; clearInterval(timerInterval);
        moves = 0; moveCounterEl.textContent = '0';
        timerEl.textContent = '--';
        image.src = currentConfig.imageSrc;
        image.onload = () => {
            gridSize = currentConfig.gridSize;
            setupImagePuzzle();
            showOverlay(startOverlay);
        };
        image.onerror = () => { alert('이미지를 불러오는 데 실패했습니다.'); };
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
        if (isSuccess) {
            endMessageEl.textContent = '🎉 퍼즐 완성! 🎉';
            const timeTaken = currentConfig.time - timeLeft;
            endDetailsEl.textContent = `이동 횟수: ${moves} | 걸린 시간: ${timeTaken}초`;
        } else {
            endMessageEl.textContent = '😭 시간 초과! 😭';
            endDetailsEl.textContent = `다시 도전해보세요!`;
        }
        showOverlay(endOverlay);
    }

    function startTimer() {
        clearInterval(timerInterval);
        timeLeft = currentConfig.time;
        timerEl.textContent = `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`;
        timerInterval = setInterval(() => {
            if (isPaused || !isGameRunning) return;
            timeLeft--;
            timerEl.textContent = `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`;
            if (timeLeft <= 0) { endGame(false); }
        }, 1000);
    }

    function setupImagePuzzle() {
        gridSize = currentConfig.gridSize;
        imagePuzzleBoard.innerHTML = ''; 
        imagePuzzlePieces.innerHTML = '';
        imagePuzzleBoard.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
        imagePuzzleBoard.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;
        const pieces = [];
        for (let i = 0; i < gridSize * gridSize; i++) {
            const slot = document.createElement('div');
            slot.classList.add('puzzle-slot'); slot.dataset.id = i;
            imagePuzzleBoard.appendChild(slot);
            const piece = document.createElement('div');
            piece.classList.add('puzzle-piece'); piece.dataset.id = i; piece.draggable = true;
            const pieceWidth = imagePuzzlePieces.clientWidth / 2 - 5;
            piece.style.width = `${pieceWidth}px`; piece.style.height = `${pieceWidth}px`;
            piece.style.backgroundImage = `url(${currentConfig.imageSrc})`;
            piece.style.backgroundSize = `${gridSize * 100}% ${gridSize * 100}%`;
            piece.style.backgroundPosition = `${(i % gridSize) * 100 / (gridSize - 1)}% ${(Math.floor(i / gridSize)) * 100 / (gridSize - 1)}%`;
            pieces.push(piece);
        }
        pieces.sort(() => Math.random() - 0.5);
        pieces.forEach(p => imagePuzzlePieces.appendChild(p));
        addImagePuzzleListeners();
    }

    function addImagePuzzleListeners() {
        document.querySelectorAll('.puzzle-piece').forEach(p => {
            p.addEventListener('dragstart', e => {
                draggedPiece = e.target;
                draggedPiece.originalParent = e.target.parentElement;
            });
        });
        
        const allDropTargets = [...document.querySelectorAll('.puzzle-slot'), imagePuzzlePieces];
        allDropTargets.forEach(target => {
            target.addEventListener('dragover', e => e.preventDefault());
            target.addEventListener('drop', handleDrop);
        });
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        let dropTarget = e.target;
        if (dropTarget.classList.contains('puzzle-piece')) { dropTarget = dropTarget.parentElement; }
        if (dropTarget.classList.contains('puzzle-slot') || dropTarget.id === 'image-puzzle-pieces') {
            const existingPiece = dropTarget.firstChild;
            const sourceParent = draggedPiece.originalParent;
            dropTarget.appendChild(draggedPiece);
            if (existingPiece) { sourceParent.appendChild(existingPiece); }
            if (isGameRunning) { moves++; moveCounterEl.textContent = moves; }
            checkImageWin();
        }
    }

    function checkImageWin() {
        if (imagePuzzlePieces.children.length > 0) return;
        const slots = imagePuzzleBoard.querySelectorAll('.puzzle-slot');
        for (const slot of slots) {
            const piece = slot.querySelector('.puzzle-piece');
            if (!piece || piece.dataset.id !== slot.dataset.id) return;
        }
        endGame();
    }

    // ✨ 힌트 기능 관련 함수 및 이벤트 리스너 삭제 ✨

    function togglePause() { if (!isGameRunning) return; isPaused = !isPaused; showOverlay(isPaused ? pauseOverlay : null); pauseBtn.textContent = isPaused ? '계속하기' : '일시정지'; }
    function toggleFullscreen() { if (!document.fullscreenElement) { fullscreenTarget.requestFullscreen(); } else { document.exitFullscreen(); } }
    
    function showOverlay(overlayToShow) {
        [startOverlay, pauseOverlay, endOverlay].forEach(o => o.classList.add('hidden'));
        if (overlayToShow) overlayToShow.classList.remove('hidden');
    }

    // --- 이벤트 리스너 ---
    levelButtons.forEach(button => {
        button.addEventListener('click', () => {
            levelButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentConfig = gameConfigs[button.dataset.difficulty];
            initGame();
        });
    });
    startBtn.addEventListener('click', startGame);
    modalRestartButton.addEventListener('click', initGame);
    retryBtn.addEventListener('click', initGame);
    pauseBtn.addEventListener('click', togglePause);
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    
    function handleResize() {
        if (isGameRunning) {
            // 게임 진행 중 리사이즈 시 필요한 로직 (현재는 DOM 기반이라 특별한 처리 불필요)
        } else {
            setupImagePuzzle();
        }
    }

    window.addEventListener('resize', handleResize);
    document.addEventListener('fullscreenchange', () => {
        setTimeout(handleResize, 100);
        exitFullscreenBtn.classList.toggle('hidden', !document.fullscreenElement);
    });

    initGame();
});