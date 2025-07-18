document.addEventListener('DOMContentLoaded', () => {
    const startLane = document.querySelector('.start-lane');
    const finishLane = document.querySelector('.finish-lane');
    const movingHorse = document.getElementById('moving-horse');
    const pathSvg = document.getElementById('path-svg');
    const resetButton = document.getElementById('reset-button');
    const resultModal = document.getElementById('result-modal');
    const modalText = document.getElementById('modal-text');
    const modalCloseButton = document.getElementById('modal-close-button');

    const horseData = [
        { name: '천리마', icon: '🐎' }, { name: '적토마', icon: '🐎' },
        { name: '백마', icon: '🐎' }, { name: '흑마', icon: '🐎' },
        { name: '조랑말', icon: '🐎' }, { name: '유니콘', icon: '🦄' }
    ];
    const prizeData = [
        '최신형 전자칠판', '고급 스타일러스 펜', '5만원 상품권',
        '블루투스 스피커', '고급 다이어리 세트', '참가상 (커피쿠폰)'
    ];

    let prizeMap;
    let gameInProgress = false;

    function shuffleArray(array) {
        return array.slice().sort(() => Math.random() - 0.5);
    }

    function initGame() {
        gameInProgress = false;
        startLane.innerHTML = '';
        finishLane.innerHTML = '';
        pathSvg.innerHTML = '';
        movingHorse.style.visibility = 'hidden';
        resetButton.classList.add('hidden');
        
        prizeMap = shuffleArray([...Array(prizeData.length).keys()]);

        horseData.forEach((horse, index) => {
            const horseEl = document.createElement('div');
            horseEl.className = 'horse';
            horseEl.dataset.index = index;
            // horse.png 파일이 있으면 이미지로, 없으면 이모지로 표시
            horseEl.innerHTML = `<img src="horse.png" alt="말" onerror="this.style.display='none'"><span>${horse.icon} ${horse.name}</span>`;
            horseEl.addEventListener('click', startRace);
            startLane.appendChild(horseEl);
        });

        prizeData.forEach(prize => {
            const prizeEl = document.createElement('div');
            prizeEl.className = 'prize';
            prizeEl.textContent = `🎁 ${prize}`;
            finishLane.appendChild(prizeEl);
        });
    }

    function startRace(event) {
        if (gameInProgress) return;
        gameInProgress = true;

        document.querySelectorAll('.horse').forEach(h => h.classList.add('disabled'));

        const selectedHorseIndex = parseInt(event.currentTarget.dataset.index);
        const destinationPrizeIndex = prizeMap[selectedHorseIndex];

        const startEl = event.currentTarget;
        const endEl = finishLane.children[destinationPrizeIndex];
        
        // 1. 경로 SVG 생성
        const path = createPath(startEl, endEl);
        pathSvg.appendChild(path);

        // 2. 달리는 말 준비
        const startRect = startEl.getBoundingClientRect();
        const trackRect = startLane.parentElement.getBoundingClientRect();
        movingHorse.style.top = `${startRect.top - trackRect.top + startRect.height / 4}px`;
        movingHorse.style.left = `-25px`; // 시작 위치 보정
        movingHorse.style.visibility = 'visible';
        movingHorse.innerHTML = startEl.innerHTML;

        // 3. 애니메이션 실행
        const pathLength = path.getTotalLength();
        path.style.strokeDasharray = pathLength;
        path.style.strokeDashoffset = pathLength;
        
        // 애니메이션 지속 시간 (초)
        const duration = 3; 

        path.style.animation = `draw-line ${duration}s ease-in-out forwards`;
        movingHorse.style.offsetPath = `path('${path.getAttribute('d')}')`;
        movingHorse.style.animation = `run-horse ${duration}s ease-in-out forwards`;

        // 4. 결과 표시
        setTimeout(() => {
            showResult(prizeData[destinationPrizeIndex]);
        }, duration * 1000);
    }

    function createPath(startEl, endEl) {
        const trackRect = document.querySelector('.race-track').getBoundingClientRect();
        const startRect = startEl.getBoundingClientRect();
        const endRect = endEl.getBoundingClientRect();

        const startY = startRect.top - trackRect.top + startRect.height / 2;
        const endY = endRect.top - trackRect.top + endRect.height / 2;
        const trackWidth = trackRect.width;

        // 지그재그 경로 생성
        const pathD = `M 0,${startY} C ${trackWidth*0.3},${startY} ${trackWidth*0.2},${endY} ${trackWidth*0.5},${endY} S ${trackWidth*0.7},${startY} ${trackWidth},${endY}`;
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathD);
        return path;
    }

    function showResult(prize) {
        modalText.textContent = `당첨! [${prize}]을(를) 획득하셨습니다!`;
        resultModal.classList.remove('hidden');
        resetButton.classList.remove('hidden');
    }
    
    modalCloseButton.addEventListener('click', () => resultModal.classList.add('hidden'));
    resetButton.addEventListener('click', initGame);

    initGame();
});