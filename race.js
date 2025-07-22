document.addEventListener('DOMContentLoaded', () => {
    const startLane = document.getElementById('start-lane');
    const finishLane = document.getElementById('finish-lane');
    const raceTrack = document.querySelector('.race-track');
    const pathSvg = document.getElementById('path-svg');
    const resetButton = document.getElementById('reset-button');
    const resultModal = document.getElementById('result-modal');
    const modalText = document.getElementById('modal-text');
    const modalCloseButton = document.getElementById('modal-close-button');

    const SPRITE_FRAMES = 8;
    const FRAME_WIDTH = 80;
    const FRAME_HEIGHT = 80;
    // ✨ [핵심 수정] 경주 시간을 4초에서 6초로 늘려 속도를 늦춤
    const RACE_DURATION = 6;

    const horseData = [
        { name: '천리마', icon: '🐎', sprite: 'horse_천리마.png' },
        { name: '적토마', icon: '🐎', sprite: 'horse_적토마.png' },
        { name: '백마', icon: '🐎', sprite: 'horse_백마.png' },
        { name: '흑마', icon: '🐎', sprite: 'horse_흑마.png' },
        { name: '조랑말', icon: '🐎', sprite: 'horse_조랑말.png' },
        { name: '유니콘', icon: '🦄', sprite: 'horse_유니콘.png' }
    ];
    
    const prizeData = [
        { name: '최신형 전자칠판', weight: 1 },
        { name: '보스턴 백', weight: 5 },
        { name: '빈티지 에코백', weight: 10 },
        { name: '고급 다이어리', weight: 20 },
        { name: '큐브 메모함', weight: 30 },
        { name: '아이스크림', weight: 134 }
    ];

    let gameInProgress = false;

    function initGame() {
        gameInProgress = false;
        startLane.innerHTML = '';
        finishLane.innerHTML = '';
        pathSvg.innerHTML = '';
        
        raceTrack.querySelectorAll('.horse-runner, .track-point').forEach(el => el.remove());
        
        resetButton.classList.add('hidden');
        
        horseData.forEach((horse, index) => {
            const horseEl = document.createElement('div');
            horseEl.className = 'horse';
            horseEl.dataset.index = index;
            horseEl.innerHTML = `<span class="horse-icon">${horse.icon}</span><span>${horse.name}</span>`;
            horseEl.addEventListener('click', startRace);
            startLane.appendChild(horseEl);
        });

        prizeData.forEach(prize => {
            const prizeEl = document.createElement('div');
            prizeEl.className = 'prize';
            prizeEl.innerHTML = `<span>🎁 ${prize.name}</span>`;
            finishLane.appendChild(prizeEl);
        });

        setTimeout(createTrackPoints, 0);
    }

    function createTrackPoints() {
        const trackRect = raceTrack.getBoundingClientRect();
        const trackWidth = raceTrack.clientWidth;
        const horizontalOffset = 30;

        const horseElements = startLane.querySelectorAll('.horse');
        horseElements.forEach((horseEl, i) => {
            const horseRect = horseEl.getBoundingClientRect();
            const yPos = (horseRect.top - trackRect.top) + (horseRect.height / 2);

            const startPoint = document.createElement('div');
            startPoint.className = 'track-point start-point';
            startPoint.style.left = `${horizontalOffset}px`;
            startPoint.style.top = `${yPos}px`;
            startPoint.dataset.index = i;
            raceTrack.appendChild(startPoint);
        });

        const prizeElements = finishLane.querySelectorAll('.prize');
        prizeElements.forEach((prizeEl, i) => {
            const prizeRect = prizeEl.getBoundingClientRect();
            const yPos = (prizeRect.top - trackRect.top) + (prizeRect.height / 2);

            const endPoint = document.createElement('div');
            endPoint.className = 'track-point end-point';
            endPoint.style.left = `${trackWidth - horizontalOffset}px`;
            endPoint.style.top = `${yPos}px`;
            endPoint.dataset.index = i;
            raceTrack.appendChild(endPoint);
        });
    }

    function determinePrize() {
        const totalWeight = prizeData.reduce((sum, prize) => sum + prize.weight, 0);
        let randomNum = Math.random() * totalWeight;
        for (let i = 0; i < prizeData.length; i++) {
            if (randomNum < prizeData[i].weight) return i;
            randomNum -= prizeData[i].weight;
        }
        return prizeData.length - 1;
    }

    function startRace(event) {
        if (gameInProgress) return;
        gameInProgress = true;

        document.querySelectorAll('.horse').forEach(h => h.classList.add('disabled'));

        const selectedHorseIndex = parseInt(event.currentTarget.dataset.index, 10);
        const destinationPrizeIndex = determinePrize();
        const selectedHorseData = horseData[selectedHorseIndex];

        const startPoint = raceTrack.querySelector(`.start-point[data-index='${selectedHorseIndex}']`);
        const endPoint = raceTrack.querySelector(`.end-point[data-index='${destinationPrizeIndex}']`);
        
        const path = createPath(startPoint, endPoint);
        pathSvg.appendChild(path);

        const runner = document.createElement('div');
        runner.className = 'horse-runner';
        
        const horseImg = new Image();
        horseImg.src = selectedHorseData.sprite;
        
        horseImg.onload = () => {
            runner.style.backgroundImage = `url(${selectedHorseData.sprite})`;
            runner.style.animation = `run-on-path ${RACE_DURATION}s ease-in-out forwards, run-sprite 0.8s steps(${SPRITE_FRAMES}) infinite`;
        };
        horseImg.onerror = () => {
            runner.textContent = selectedHorseData.icon;
            runner.style.fontSize = '2.5rem';
            runner.style.display = 'flex';
            runner.style.justifyContent = 'center';
            runner.style.alignItems = 'center';
            runner.style.animation = `run-on-path ${RACE_DURATION}s ease-in-out forwards`;
        };
        
        runner.style.width = `${FRAME_WIDTH}px`;
        runner.style.height = `${FRAME_HEIGHT}px`;
        
        runner.style.visibility = 'visible';
        runner.style.offsetPath = `path('${path.getAttribute('d')}')`;
        raceTrack.appendChild(runner);

        setTimeout(() => {
            if (runner) {
                runner.style.animationPlayState = 'paused';
            }
            showResult(prizeData[destinationPrizeIndex].name);
        }, RACE_DURATION * 1000);
    }

    function createPath(startPointEl, endPointEl) {
        const trackRect = raceTrack.getBoundingClientRect();
        const startRect = startPointEl.getBoundingClientRect();
        const endRect = endPointEl.getBoundingClientRect();

        const startX = startRect.left - trackRect.left + startRect.width / 2;
        const startY = startRect.top - trackRect.top + startRect.height / 2;
        const endX = endRect.left - trackRect.left + endRect.width / 2;
        const endY = endRect.top - trackRect.top + endRect.height / 2;

        const midX1 = startX + (endX - startX) * 0.25;
        const midX2 = startX + (endX - startX) * 0.75;
        const midY1 = startY + (endY - startY) * (0.3 + Math.random() * 0.4);

        const pathD = `M ${startX},${startY} C ${midX1},${startY} ${midX1},${midY1} ${(startX + endX)/2},${midY1} S ${midX2},${endY} ${endX},${endY}`;
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathD);
        return path;
    }

    function showResult(prizeName) {
        modalText.textContent = `당첨! [${prizeName}]을(를) 획득하셨습니다!`;
        resultModal.classList.remove('hidden');
        resetButton.classList.remove('hidden');
    }
    
    modalCloseButton.addEventListener('click', () => resultModal.classList.add('hidden'));
    resetButton.addEventListener('click', initGame);

    window.addEventListener('resize', () => {
        if (!gameInProgress) {
            raceTrack.querySelectorAll('.track-point').forEach(el => el.remove());
            setTimeout(createTrackPoints, 0);
        }
    });

    initGame();
});