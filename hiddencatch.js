document.addEventListener('DOMContentLoaded', () => {
    // DOM 요소
    const gameArea = document.getElementById('game-area');
    const restartButton = document.getElementById('restartButton');
    const pauseButton = document.getElementById('pauseButton');
    const fullscreenButton = document.getElementById('fullscreenButton');
    const exitFullscreenBtn = document.getElementById('exitFullscreenBtn');
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
    const solutionImage = document.getElementById('solution-image');
    const rankingButton = document.getElementById('rankingButton');
    const rankingPanel = document.getElementById('ranking-panel');
    const rankingCloseBtn = document.getElementById('ranking-close-btn');
    const rankingList = document.getElementById('ranking-list');
    const resetRankingButton = document.getElementById('ranking-reset-btn');

    // 게임 상태 변수
    let timerInterval, seconds = 0, differences = [], foundCount = 0, totalDifferences = 0;
    let isGameActive = false, isPaused = false;
    let currentProblem;

    // 문제 데이터
    const problemData = [
        { 
            id: 1, name: '바닷속 풍경',
            images: { question: 'hiddencatch_q1.png', answer: 'hiddencatch_a1.png', solution: 'hiddencatch_s1.png' },
            spots: [ { x: 327, y: 64, r: 28 }, { x: 338, y: 125, r: 28 }, { x: 202, y: 126, r: 28 }, { x: 114, y: 412, r: 28 }, { x: 122, y: 541, r: 28 }, { x: 174, y: 646, r: 28 }, { x: 329, y: 675, r: 28 }, { x: 238, y: 684, r: 28 }, { x: 59, y: 715, r: 28 } ]
        },
        {
            id: 2, name: '선물보따리',
            images: { question: 'hiddencatch_q2.png', answer: 'hiddencatch_a2.png', solution: 'hiddencatch_s2.png' },
            spots: [ { x: 361, y: 7, r: 28 }, { x: 457, y: 89, r: 28 }, { x: 434, y: 121, r: 28 }, { x: 35, y: 231, r: 28 }, { x: 483, y: 240, r: 28 }, { x: 258, y: 292, r: 28 }, { x: 471, y: 361, r: 28 } ]
        },
        { 
            id: 3, name: '사무실',
            images: { question: 'hiddencatch_q3.png', answer: 'hiddencatch_a3.png', solution: 'hiddencatch_s3.png' },
            spots: [ { x: 515, y: 89, r: 28 }, { x: 200, y: 107, r: 28 }, { x: 665, y: 229, r: 28 }, { x: 382, y: 256, r: 28 }, { x: 637, y: 393, r: 28 }, { x: 202, y: 440, r: 28 } ]
        },
        { 
            id: 4, name: '원숭이와 동물들',
            images: { question: 'hiddencatch_q4.png', answer: 'hiddencatch_a4.png', solution: 'hiddencatch_s4.png' },
            spots: [ { x: 428, y: 25, r: 28 }, { x: 728, y: 185, r: 28 }, { x: 18, y: 301, r: 28 }, { x: 392, y: 335, r: 28 }, { x: 264, y: 363, r: 28 }, { x: 716, y: 443, r: 28 } ]
        },
        { 
            id: 5, name: '해적선',
            images: { question: 'hiddencatch_q5.png', answer: 'hiddencatch_a5.png', solution: 'hiddencatch_s5.png' },
            spots: [ { x: 262, y: 61, r: 28 }, { x: 583, y: 71, r: 28 }, { x: 164, y: 89, r: 28 }, { x: 649, y: 220, r: 28 }, { x: 285, y: 313, r: 28 }, { x: 586, y: 387, r: 28 }, { x: 74, y: 447, r: 28 } ]
        },
        { 
            id: 6, name: '아이스크림',
            images: { question: 'hiddencatch_q6.png', answer: 'hiddencatch_a6.png', solution: 'hiddencatch_s6.png' },
            spots: [ { x: 519, y: 28, r: 28 }, { x: 353, y: 62, r: 28 }, { x: 630, y: 89, r: 28 }, { x: 66, y: 153, r: 28 }, { x: 161, y: 205, r: 28 }, { x: 175, y: 328, r: 28 }, { x: 652, y: 431, r: 28 } ]
        },
        { 
            id: 7, name: '중재',
            images: { question: 'hiddencatch_q7.png', answer: 'hiddencatch_a7.png', solution: 'hiddencatch_s7.png' },
            spots: [ { x: 636, y: 49, r: 28 }, { x: 257, y: 54, r: 28 }, { x: 320, y: 107, r: 28 }, { x: 727, y: 117, r: 28 }, { x: 66, y: 391, r: 28 } ]
        },
        { 
            id: 8, name: '식탁',
            images: { question: 'hiddencatch_q8.png', answer: 'hiddencatch_a8.png', solution: 'hiddencatch_s8.png' },
            spots: [ { x: 545, y: 116, r: 28 }, { x: 436, y: 132, r: 28 }, { x: 310, y: 167, r: 28 }, { x: 124, y: 229, r: 28 }, { x: 229, y: 286, r: 28 }, { x: 422, y: 314, r: 28 } ]
        }
    ];

    // 이벤트 리스너
    overlayStartBtn.addEventListener('click', startGame);
    restartButton.addEventListener('click', initGame);
    pauseButton.addEventListener('click', togglePause);
    fullscreenButton.addEventListener('click', () => gameArea.requestFullscreen());
    exitFullscreenBtn.addEventListener('click', () => document.exitFullscreen());
    modifiedImageContainer.addEventListener('click', handleImageClick);
    closeGameOverModal.addEventListener('click', () => gameOverModal.classList.remove('show'));
    document.addEventListener('fullscreenchange', () => {
        exitFullscreenBtn.classList.toggle('hidden', !document.fullscreenElement);
        setTimeout(redrawMarkers, 50);
    });
    rankingButton.addEventListener('click', showRanking);
    rankingCloseBtn.addEventListener('click', () => rankingPanel.classList.add('hidden'));
    resetRankingButton.addEventListener('click', resetRanking);
    // ★★★ 창 크기가 변경될 때마다 마커를 다시 그리도록 이벤트 추가 ★★★
    window.addEventListener('resize', redrawMarkers);

    function initGame() {
        isGameActive = false; isPaused = false;
        clearInterval(timerInterval);
        seconds = 0; foundCount = 0;
        const problemIndex = Math.floor(Math.random() * problemData.length);
        currentProblem = problemData[problemIndex];
        originalImage.src = currentProblem.images.question;
        modifiedImage.src = currentProblem.images.answer;
        differences = currentProblem.spots.map(spot => ({ ...spot, found: false }));
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

    function startGame() { if (isGameActive) return; isGameActive = true; gameOverlay.classList.add('hidden'); timerInterval = setInterval(updateTimer, 1000); }
    function togglePause() { if (!isGameActive) return; isPaused = !isPaused; gameOverlay.classList.toggle('hidden', !isPaused); overlayStartBtn.classList.add('hidden'); pauseText.classList.toggle('hidden', !isPaused); pauseButton.textContent = isPaused ? '계속하기' : '일시정지'; }
    function updateTimer() { if (isPaused || !isGameActive) return; seconds++; updateUI(); }

    function getRenderedImageInfo(imgElement) {
        const { naturalWidth, naturalHeight, clientWidth, clientHeight } = imgElement;
        if (!naturalWidth || !naturalHeight) return null; // 이미지가 로드되지 않은 경우
        const naturalAspectRatio = naturalWidth / naturalHeight;
        const clientAspectRatio = clientWidth / clientHeight;
        let renderedWidth, renderedHeight, xOffset, yOffset;
        if (naturalAspectRatio > clientAspectRatio) {
            renderedWidth = clientWidth;
            renderedHeight = clientWidth / naturalAspectRatio;
            xOffset = 0;
            yOffset = (clientHeight - renderedHeight) / 2;
        } else {
            renderedHeight = clientHeight;
            renderedWidth = clientHeight * naturalAspectRatio;
            yOffset = 0;
            xOffset = (clientWidth - renderedWidth) / 2;
        }
        return { renderedWidth, renderedHeight, xOffset, yOffset };
    }

    function handleImageClick(event) {
        if (!isGameActive || isPaused) return;
        const img = modifiedImage;
        const info = getRenderedImageInfo(img);
        if (!info) return;
        const { renderedWidth, renderedHeight, xOffset, yOffset } = info;
        
        const clickX_in_box = event.offsetX;
        const clickY_in_box = event.offsetY;

        if (clickX_in_box < xOffset || clickX_in_box > xOffset + renderedWidth ||
            clickY_in_box < yOffset || clickY_in_box > yOffset + renderedHeight) {
            return; 
        }

        const clickX_on_image = clickX_in_box - xOffset;
        const clickY_on_image = clickY_in_box - yOffset;
        const scale = img.naturalWidth / renderedWidth;
        const finalX = clickX_on_image * scale;
        const finalY = clickY_on_image * scale;

        let foundDifference = false;
        for (const diff of differences) {
            if (diff.found) continue;
            const distance = Math.sqrt(Math.pow(finalX - diff.x, 2) + Math.pow(finalY - diff.y, 2));
            if (distance < diff.r) {
                diff.found = true; foundCount++; foundDifference = true;
                createMarker(diff, 'correct');
                updateUI();
                break;
            }
        }

        if (!foundDifference) {
            createMarker(event, 'incorrect');
        }

        if (foundCount === totalDifferences) endGame();
    }

    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    // ★ 최종 수정: 'O' 마커 표시 로직을 클릭 판정과 동일한 픽셀 기반으로 통일 ★
    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    function createMarker(data, type) {
        const marker = document.createElement('div');
        marker.className = `marker ${type}`;

        if (type === 'correct') {
            marker.textContent = 'O';
            const img = modifiedImage;
            const info = getRenderedImageInfo(img);
            if (!info) return; // 이미지가 준비되지 않았으면 마커를 그리지 않음
            const { renderedWidth, xOffset, yOffset } = info;
            
            const scale = renderedWidth / img.naturalWidth;
            const markerX = data.x * scale + xOffset;
            const markerY = data.y * scale + yOffset;
            
            marker.style.left = `${markerX}px`;
            marker.style.top = `${markerY}px`;
        } else { // incorrect
            marker.textContent = 'X';
            marker.style.left = `${data.offsetX}px`;
            marker.style.top = `${data.offsetY}px`;
            setTimeout(() => marker.remove(), 1000);
        }
        
        modifiedImageContainer.appendChild(marker);
    }

    function redrawMarkers() {
        if (!isGameActive) return;
        clearMarkers();
        differences.forEach(diff => {
            if (diff.found) {
                createMarker(diff, 'correct');
            }
        });
    }

    function clearMarkers() { modifiedImageContainer.querySelectorAll('.marker').forEach(m => m.remove()); }
    
    function endGame() { isGameActive = false; clearInterval(timerInterval); addScoreToRanking(seconds); finalTimeEl.textContent = `걸린 시간: ${formatTime(seconds)}`; solutionImage.src = currentProblem.images.solution; gameOverModal.classList.add('show'); }
    function updateUI() { if (isGameActive) timerEl.textContent = formatTime(seconds); foundCounterEl.textContent = `${foundCount} / ${totalDifferences}`; }
    function formatTime(s) { return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }
    function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
    function addScoreToRanking(time) { const playerName = prompt('🎉 성공! 랭킹에 등록할 이름을 입력하세요:', 'Player1'); if (!playerName || playerName.trim() === '') { alert('이름이 입력되지 않아 랭킹에 등록되지 않았습니다.'); return; } const key = 'hiddencatchRanking_unified'; const ranking = JSON.parse(localStorage.getItem(key)) || []; ranking.push({ name: playerName.trim(), time, date: new Date().toLocaleDateString() }); ranking.sort((a, b) => a.time - b.time); localStorage.setItem(key, JSON.stringify(ranking.slice(0, 10))); }
    function showRanking() { const key = 'hiddencatchRanking_unified'; const rankings = JSON.parse(localStorage.getItem(key)) || []; rankingList.innerHTML = rankings.length === 0 ? '<li>기록이 없습니다.</li>' : rankings.map((r, i) => `<li><span class="rank">${i + 1}등</span><span class="name">${escapeHtml(r.name)}</span><span class="time">${formatTime(r.time)}</span></li>`).join(''); rankingPanel.classList.remove('hidden'); }
    
    function resetRanking() {
        if (confirm('정말로 랭킹을 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            localStorage.removeItem('hiddencatchRanking_unified');
            alert('랭킹이 초기화되었습니다.');
            showRanking();
        }
    }

    initGame();
});