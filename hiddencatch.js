/* --- 전체 hiddencatch.js 코드 (최종 수정) --- */

document.addEventListener('DOMContentLoaded', () => {
    // DOM 요소
    const gameArea = document.getElementById('game-area');
    const restartButton = document.getElementById('restartButton');
    const pauseButton = document.getElementById('pauseButton');
    const fullscreenButton = document.getElementById('fullscreenButton');
    const exitFullscreenBtn = document.getElementById('exitFullscreenBtn');
    const difficultySelect = document.getElementById('difficulty');
    const timerEl = document.getElementById('timer');
    const foundCounterEl = document.getElementById('found-counter');
    const originalImage = document.getElementById('original-image');
    const modifiedImage = document.getElementById('modified-image');
    const modifiedImageContainer = document.getElementById('modified-image-container');
    const gameOverlay = document.getElementById('game-overlay');
    const overlayStartBtn = document.getElementById('overlayStartBtn');
    const pauseText = document.getElementById('pauseText');
    const gameOverModal = document.getElementById('gameOverModal');
    const closeGameOverModal = document.getElementById('closeGameOverModal');
    const finalTimeEl = document.getElementById('finalTime');

    // ✨ 새로운 랭킹 UI 요소
    const rankingButton = document.getElementById('rankingButton');
    const rankingPanel = document.getElementById('ranking-panel');
    const rankingCloseBtn = document.getElementById('ranking-close-btn');
    const rankingLevelName = document.getElementById('ranking-level-name');
    const rankingList = document.getElementById('ranking-list');

    // 게임 상태 변수
    let timerInterval, seconds = 0, differences = [], foundCount = 0, totalDifferences = 0;
    let isGameActive = false, isPaused = false;

    // ★★★★★ 중요 ★★★★★ 틀린 부분 좌표 데이터
    const differenceData = {
        '1': { name: '보통', image: 'hiddencatch_1.jpg', spots: [ { x: 385, y: 385, r: 25, found: false }, { x: 140, y: 375, r: 25, found: false }, { x: 530, y: 160, r: 25, found: false }, { x: 50, y: 80, r: 25, found: false }, { x: 270, y: 200, r: 20, found: false } ] },
        '2': { name: '매우 어려움', image: 'hiddencatch_2.jpg', spots: [ { x: 410, y: 350, r: 20, found: false }, { x: 240, y: 380, r: 20, found: false }, { x: 150, y: 220, r: 20, found: false }, { x: 510, y: 100, r: 20, found: false }, { x: 340, y: 80, r: 20, found: false }, { x: 80, y: 430, r: 20, found: false }, { x: 520, y: 440, r: 20, found: false } ] }
    };

    // 이벤트 리스너
    overlayStartBtn.addEventListener('click', startGame);
    restartButton.addEventListener('click', initGame);
    pauseButton.addEventListener('click', togglePause);
    difficultySelect.addEventListener('change', initGame);
    fullscreenButton.addEventListener('click', () => gameArea.requestFullscreen());
    exitFullscreenBtn.addEventListener('click', () => document.exitFullscreen());
    modifiedImageContainer.addEventListener('click', handleImageClick);
    closeGameOverModal.addEventListener('click', () => gameOverModal.classList.remove('show'));
    document.addEventListener('fullscreenchange', () => exitFullscreenBtn.classList.toggle('hidden', !document.fullscreenElement));

    // ✨ 랭킹 UI 이벤트 리스너
    rankingButton.addEventListener('click', showRanking);
    rankingCloseBtn.addEventListener('click', () => rankingPanel.classList.add('hidden'));
    window.addEventListener('click', (e) => {
        if (!rankingPanel.classList.contains('hidden') && !rankingPanel.contains(e.target) && e.target !== rankingButton) {
            rankingPanel.classList.add('hidden');
        }
    });

    function initGame() {
        isGameActive = false; isPaused = false;
        clearInterval(timerInterval);
        seconds = 0; foundCount = 0;
        const difficulty = difficultySelect.value;
        const gameData = differenceData[difficulty];
        originalImage.src = gameData.image; modifiedImage.src = gameData.image;
        differences = JSON.parse(JSON.stringify(gameData.spots));
        totalDifferences = differences.length;
        clearMarkers();
        gameOverModal.classList.remove('show');
        updateUI();
        timerEl.textContent = '--:--';
        gameOverlay.classList.remove('hidden');
        overlayStartBtn.classList.remove('hidden');
        pauseText.classList.add('hidden');
        pauseButton.textContent = '일시정지';
    }

    function startGame() {
        if (isGameActive) return;
        isGameActive = true;
        gameOverlay.classList.add('hidden');
        timerInterval = setInterval(updateTimer, 1000);
    }

    function togglePause() {
        if (!isGameActive) return;
        isPaused = !isPaused;
        gameOverlay.classList.toggle('hidden', !isPaused);
        overlayStartBtn.classList.add('hidden');
        pauseText.classList.toggle('hidden', !isPaused);
        pauseButton.textContent = isPaused ? '계속하기' : '일시정지';
    }

    function updateTimer() {
        if (isPaused || !isGameActive) return;
        seconds++;
        updateUI();
    }

    function handleImageClick(event) {
        if (!isGameActive || isPaused) return;
        const rect = modifiedImage.getBoundingClientRect();
        const scaleX = modifiedImage.naturalWidth / rect.width;
        const scaleY = modifiedImage.naturalHeight / rect.height;
        const clickX = event.offsetX * scaleX;
        const clickY = event.offsetY * scaleY;
        let foundDifference = false;
        for (const diff of differences) {
            if (diff.found) continue;
            const distance = Math.sqrt(Math.pow(clickX - diff.x, 2) + Math.pow(clickY - diff.y, 2));
            if (distance < diff.r) {
                diff.found = true; foundCount++; foundDifference = true;
                createMarker(diff.x, diff.y, 'correct');
                updateUI();
                break;
            }
        }
        if (!foundDifference) createMarker(clickX, clickY, 'incorrect');
        if (foundCount === totalDifferences) endGame();
    }

    function endGame() {
        isGameActive = false;
        clearInterval(timerInterval);
        finalTimeEl.textContent = `걸린 시간: ${formatTime(seconds)}`;
        gameOverModal.classList.add('show');
        saveRanking(seconds, differenceData[difficultySelect.value].name);
    }

    function updateUI() {
        if (isGameActive) timerEl.textContent = formatTime(seconds);
        foundCounterEl.textContent = `${foundCount} / ${totalDifferences}`;
    }

    function createMarker(x, y, type) {
        const marker = document.createElement('div');
        marker.className = `marker ${type}`;
        marker.textContent = type === 'correct' ? 'O' : 'X';
        marker.style.left = `${(x / modifiedImage.naturalWidth) * 100}%`;
        marker.style.top = `${(y / modifiedImage.naturalHeight) * 100}%`;
        modifiedImageContainer.appendChild(marker);
        if (type === 'incorrect') setTimeout(() => marker.remove(), 1000);
    }

    function clearMarkers() { modifiedImageContainer.querySelectorAll('.marker').forEach(m => m.remove()); }
    function formatTime(s) { return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }

    // ✨ 랭킹 관련 함수 수정
    function saveRanking(time, difficultyName) {
        const key = 'hiddencatchRanking';
        const ranking = JSON.parse(localStorage.getItem(key)) || [];
        ranking.push({ time, difficulty: difficultyName, date: new Date().toLocaleDateString() });
        ranking.sort((a, b) => a.time - b.time);
        localStorage.setItem(key, JSON.stringify(ranking.slice(0, 10)));
    }

    function showRanking() {
        const difficulty = difficultySelect.value;
        const gameData = differenceData[difficulty];
        rankingLevelName.textContent = gameData.name;

        const key = 'hiddencatchRanking';
        const allRankings = JSON.parse(localStorage.getItem(key)) || [];
        const filteredRankings = allRankings.filter(r => r.difficulty === gameData.name);

        rankingList.innerHTML = filteredRankings.length === 0 ? '<li>기록이 없습니다.</li>' :
            filteredRankings.map((r, i) => `<li><span>${i + 1}등</span><span>${formatTime(r.time)}</span></li>`).join('');
        
        rankingPanel.classList.remove('hidden');
    }

    initGame();
});