document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.querySelector('.memory-game');
    const timerProgress = document.querySelector('.timer-progress');
    const gameOverModal = document.getElementById('gameOverModal');
    const modalMessage = document.getElementById('modalMessage');
    const modalDetail = document.getElementById('modalDetail');
    const modalRestartButton = document.getElementById('modalRestartButton');
    const mainRestartButton = document.getElementById('mainRestartButton');
    const pauseButton = document.getElementById('pauseButton');
    const pauseOverlay = document.getElementById('pauseOverlay');
    const levelButtons = document.querySelectorAll('.level-btn');
    const matchedPairsDisplay = document.getElementById('matchedPairs');
    const totalPairsDisplay = document.getElementById('totalPairs');
    const showRankingBtn = document.getElementById('showRankingBtn');
    const rankingLevelNameEl = document.getElementById('ranking-level-name');

    const GAME_ID = 'match';

    // ✨ [수정 1] 고정 단어를 '테크커넥트'로 변경
    const ourCompany = '테크커넥트';

    // ✨ [수정 2] 단어 목록을 새 리스트로 교체
    const companyList = [
        '터치스크린', '디스플레이', '백라이트', '내장 컴퓨터 슬롯', '안드로이드 운영체제',
        '카메라', '마이크', '스피커', '전자펜', 'USB 단자',
        'HDMI 단자', '타입-C 단자', '디스플레이포트', '저장장치', '무선인터넷',
        '블루투스', '근거리 무선 통신', '리모컨', '전면 조작 버튼', '판서 프로그램',
        '화면 캡처', '파일 저장', '화면 공유', '무선 화면 미러링', '다중 터치 기능',
        '화면 분할', '여러 앱 동시 실행', '화상회의 프로그램', '원격 제어 기능', '학습관리시스템 연동',
        '실시간 판서', '메모', '지우기', '스크린샷 저장', 'QR 코드 공유',
        '동영상 재생', '문서 열기', '화면 잠금', '보안 설정', '양방향 제어',
        '음성 인식 기능', '스피커폰', '무선 연결 동글', '이동형 받침대', '벽걸이 거치대',
        '모듈형 카메라', '모듈형 컴퓨터', '무선 키보드', '무선 마우스', '회의실',
        '원격회의', '협업 공간', '스마트교실', '원격 수업', '교육기관',
        '기업 연수', '공공기관 발표', '재난대응 브리핑', '병동 회의', '공장 교육',
        '전자칠판', '전자 화이트보드', '일체형 디스플레이', '운영체제 인증', '판서 기능',
        '터치 정확도', '반응 속도', '패널 수명', '맥스허브'
    ];

    const gameConfigs = {
        '4x3': { rows: 3, cols: 4, time: 60, name: '초급' },
        '4x4': { rows: 4, cols: 4, time: 90, name: '중급' },
        '5x4': { rows: 4, cols: 5, time: 180, name: '고급' },
    };
    
    let currentLevelId = '4x3';
    let currentConfig = gameConfigs[currentLevelId];

    let cards = [];
    let firstCard = null, secondCard = null;
    let lockBoard = false;
    let matchedPairs = 0;
    let timer;
    let timeLeft;
    let timeElapsed = 0;
    let isPaused = false;

    function startGame() {
        isPaused = false;
        lockBoard = false;
        matchedPairs = 0;
        firstCard = null;
        secondCard = null;
        timeElapsed = 0;
        timeLeft = currentConfig.time;

        pauseButton.textContent = '멈추기';
        gameOverModal.style.display = 'none';
        pauseOverlay.style.display = 'none';
        updateMatchCounter();

        setupBoard();
        createCards();
        shuffleCards();
        addCardsToBoard();

        startTimer();
    }

    function setupBoard() {
        gameBoard.style.gridTemplateColumns = `repeat(${currentConfig.cols}, 1fr)`;
        gameBoard.style.gridTemplateRows = `repeat(${currentConfig.rows}, 1fr)`;
    }

    function createCards() {
        const pairCount = (currentConfig.rows * currentConfig.cols) / 2;
        const otherCompanies = companyList.filter(c => c !== ourCompany);
        otherCompanies.sort(() => 0.5 - Math.random());
        const neededOtherCompanyCount = pairCount - 1;
        const selectedOtherCompanies = otherCompanies.slice(0, neededOtherCompanyCount);
        const finalUniqueItems = [ourCompany, ...selectedOtherCompanies];
        const cardSet = [...finalUniqueItems, ...finalUniqueItems];

        cards = cardSet.map(item => {
            const card = document.createElement('div');
            card.classList.add('memory-card');
            card.dataset.item = item;
            card.innerHTML = `<div class="front-face">${item}</div><div class="back-face"></div>`;
            card.addEventListener('click', flipCard);
            return card;
        });
    }

    function shuffleCards() {
        cards.forEach(card => {
            card.style.order = Math.floor(Math.random() * cards.length);
        });
    }

    function addCardsToBoard() {
        gameBoard.innerHTML = '';
        cards.forEach(card => gameBoard.appendChild(card));
    }

    function flipCard() {
        if (lockBoard || isPaused || this === firstCard) return;
        this.classList.add('flip');
        if (!firstCard) {
            firstCard = this;
            return;
        }
        secondCard = this;
        lockBoard = true;
        checkForMatch();
    }

    function checkForMatch() {
        const isMatch = firstCard.dataset.item === secondCard.dataset.item;
        isMatch ? disableCards() : unflipCards();
    }

    function disableCards() {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        
        matchedPairs++;
        updateMatchCounter();
        resetBoard();
        
        if (matchedPairs === (currentConfig.rows * currentConfig.cols) / 2) {
            clearInterval(timer);
            showEndGameMessage(true);
        }
    }

    function unflipCards() {
        setTimeout(() => {
            firstCard.classList.remove('flip');
            secondCard.classList.remove('flip');
            resetBoard();
        }, 1000);
    }

    function resetBoard() {
        [firstCard, secondCard, lockBoard] = [null, null, false];
    }

    function startTimer() {
        clearInterval(timer);
        timeElapsed = 0;
        
        timerProgress.style.transition = 'none';
        timerProgress.style.width = '100%';
        
        setTimeout(() => {
            timerProgress.style.transition = `width 1s linear`;
        }, 100);

        timer = setInterval(() => {
            if (!isPaused) {
                timeLeft--;
                timeElapsed++;
                const widthPercent = (timeLeft / currentConfig.time) * 100;
                timerProgress.style.width = `${widthPercent}%`;

                if (timeLeft <= 0) {
                    clearInterval(timer);
                    lockBoard = true;
                    showEndGameMessage(false);
                }
            }
        }, 1000);
    }

    function togglePause() {
        isPaused = !isPaused;
        pauseButton.textContent = isPaused ? '계속하기' : '멈추기';
        pauseOverlay.style.display = isPaused ? 'flex' : 'none';
    }

    function updateMatchCounter() {
        matchedPairsDisplay.textContent = matchedPairs;
        totalPairsDisplay.textContent = (currentConfig.rows * currentConfig.cols) / 2;
    }

    function showEndGameMessage(isSuccess) {
        clearInterval(timer);
        setTimeout(() => {
            if (isSuccess) {
                const minutes = Math.floor(timeElapsed / 60);
                const seconds = timeElapsed % 60;
                modalMessage.textContent = '🎉 축하합니다! 성공! 🎉';
                modalDetail.textContent = `걸린 시간: ${minutes > 0 ? `${minutes}분 ` : ''}${seconds}초`;
                
                const storageKey = `${GAME_ID}_${currentLevelId}`;
                rankingModule.addScore(storageKey, { time: timeElapsed }, currentConfig.name);

            } else {
                modalMessage.textContent = '😭 아쉽네요, 시간 초과! 😭';
                modalDetail.textContent = '다시 도전해보세요!';
            }
            gameOverModal.style.display = 'flex';
        }, 500);
    }

    levelButtons.forEach(button => {
        button.addEventListener('click', () => {
            levelButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            currentLevelId = button.dataset.size;
            currentConfig = gameConfigs[currentLevelId];
            
            startGame();
        });
    });

    showRankingBtn.addEventListener('click', () => {
        const storageKey = `${GAME_ID}_${currentLevelId}`;
        rankingModule.show(storageKey, currentConfig.name);
    });

    pauseButton.addEventListener('click', togglePause);
    mainRestartButton.addEventListener('click', startGame);
    modalRestartButton.addEventListener('click', startGame);

    startGame();
});