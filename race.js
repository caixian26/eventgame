/* --- 전체 race.js 코드 (다시하기/초기화 기능 분리 및 수량 숨김) --- */

document.addEventListener('DOMContentLoaded', () => {
    const startLane = document.getElementById('start-lane');
    const finishLane = document.getElementById('finish-lane');
    const raceTrack = document.querySelector('.race-track');
    const pathSvg = document.getElementById('path-svg');
    const resultModal = document.getElementById('result-modal');
    const modalText = document.getElementById('modal-text');
    const modalCloseButton = document.getElementById('modal-close-button');

    // [핵심 수정 1] 버튼 DOM 요소를 모두 가져옵니다. (HTML에 full-reset-button 추가 필요)
    const resetButton = document.getElementById('reset-button'); // 다시하기 버튼
    const fullResetButton = document.getElementById('full-reset-button'); // 초기화 버튼

    modalCloseButton.addEventListener('click', () => resultModal.classList.add('hidden'));

    // [핵심 수정 2] '다시하기' 버튼은 이제 수량을 초기화하지 않는 함수를 호출합니다.
    resetButton.addEventListener('click', () => {
        resultModal.classList.add('hidden');
        resetRaceLayout(); // initGame() 대신 이 함수를 호출
    });

    // [핵심 수정 3] '초기화' 버튼을 위한 새로운 이벤트 리스너를 추가합니다.
    fullResetButton.addEventListener('click', () => {
        resultModal.classList.add('hidden');
        fullResetGame(); // 모든 것을 초기화하는 함수 호출
    });


    const SPRITE_FRAMES = 8;
    const FRAME_WIDTH = 80;
    const FRAME_HEIGHT = 80;
    const RACE_DURATION = 6;

    const horseData = [
        { name: '천리마', iconImage: 'horse_천리마_icon.png', sprite: 'horse_천리마.png' },
        { name: '적토마', iconImage: 'horse_적토마_icon.png', sprite: 'horse_적토마.png' },
        { name: '백마', iconImage: 'horse_백마_icon.png', sprite: 'horse_백마.png' },
        { name: '흑마', iconImage: 'horse_흑마_icon.png', sprite: 'horse_흑마.png' },
        { name: '조랑말', iconImage: 'horse_조랑말_icon.png', sprite: 'horse_조랑말.png' },
    ];
    
    let prizeData = [
        { name: '50% 할인권', initialCount: 1, currentCount: 1 },
        { name: '30% 할인권', initialCount: 3, currentCount: 3 },
        { name: '에코백', initialCount: 51, currentCount: 51 },
        { name: '큐브메모함', initialCount: 49, currentCount: 49 },
        { name: '꽝', initialCount: 16, currentCount: 16 }
    ];

    let gameInProgress = false;

    // [핵심 수정 4] 기존 initGame() 함수의 역할을 분리합니다.
    // 이 함수는 이제 화면 레이아웃만 리셋하고, 경품 수량은 건드리지 않습니다.
    function resetRaceLayout() {
        gameInProgress = false;
        startLane.innerHTML = '';
        finishLane.innerHTML = '';
        pathSvg.innerHTML = '';
        
        raceTrack.querySelectorAll('.horse-runner, .track-point').forEach(el => el.remove());
        
        resetButton.classList.add('hidden');
        fullResetButton.classList.add('hidden'); // 초기화 버튼도 숨김

        // prizeData.forEach(...) -> 이 부분은 여기서 제거되었습니다!
        
        horseData.forEach((horse, index) => {
            const horseEl = document.createElement('div');
            horseEl.className = 'horse';
            horseEl.dataset.index = index;
            horseEl.innerHTML = `<img class="horse-icon-img" src="${horse.iconImage}" alt="${horse.name}"><span>${horse.name}</span>`;
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

    // [핵심 수정 5] 경품 수량까지 모두 초기화하는 새로운 함수를 만듭니다.
    function fullResetGame() {
        // 1. 경품 수량을 초기값으로 되돌립니다.
        prizeData.forEach(prize => {
            prize.currentCount = prize.initialCount;
        });
        // 2. 화면 레이아웃을 리셋합니다.
        resetRaceLayout();
    }

    // (이하 다른 함수들은 수정할 필요가 없습니다)
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
        const availablePrizes = prizeData.filter(prize => prize.currentCount > 0);

        if (availablePrizes.length === 0) {
            console.warn("모든 경품이 소진되었습니다!");
            return -1;
        }

        const totalAvailableCount = availablePrizes.reduce((sum, prize) => sum + prize.currentCount, 0);
        let randomNum = Math.random() * totalAvailableCount;

        for (let i = 0; i < availablePrizes.length; i++) {
            if (randomNum < availablePrizes[i].currentCount) {
                availablePrizes[i].currentCount--;
                
                // [추가] 수량이 변경된 직후, 전체 경품 데이터를 콘솔에 출력
                console.log("🎉 경품 당첨! 현재 남은 수량:", prizeData); 

                return prizeData.findIndex(p => p.name === availablePrizes[i].name);
            }
            randomNum -= availablePrizes[i].currentCount;
        }
        
        const lastPrizeIndex = prizeData.findIndex(p => p.name === availablePrizes[availablePrizes.length - 1].name);
        if (lastPrizeIndex !== -1) {
            prizeData[lastPrizeIndex].currentCount--;
        }
        return lastPrizeIndex;
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
            runner.textContent = '🐎';
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
            const prizeName = destinationPrizeIndex !== -1 ? prizeData[destinationPrizeIndex].name : undefined;
            showResult(prizeName);
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
        if (prizeName === undefined) {
            modalText.textContent = `아쉽게도 모든 경품이 소진되었습니다. 다음에 다시 시도해주세요!`;
        } else {
            modalText.textContent = `🎉 축하합니다! [${prizeName}]을(를) 획득하셨습니다!`;
        }
        resultModal.classList.remove('hidden');
        // [핵심 수정 6] 두 버튼을 모두 보여줍니다.
        resetButton.classList.remove('hidden');
        fullResetButton.classList.remove('hidden');
    }

    // [핵심 수정 7] 페이지가 처음 로드될 때 initGame() 대신 fullResetGame()을 호출하여 시작합니다.
    fullResetGame();
});