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
    // ✨ 랭킹판 제목을 위한 span 요소 추가
    const rankingLevelNameEl = document.getElementById('ranking-level-name');

    // ✨ 게임 고유 ID 정의
    const GAME_ID = 'match';

    const ourCompany = '(주)테크커넥트';
    const companyList = [
        '영디스', '㈜바찌코리아', '㈜아이클', '㈜필메드', '(주)제이앤에스이엔지',
        '동아전기', '자이브스토리', '㈜네로', '오진시스', '영우트레이딩',
        '팀버우드', '㈜제이오에스이엔씨', '(주)스타네트웍스', '아로니아오리지날코리아㈜',
        '셀붐', '서비스케어', '서현', '가함디앤씨', '신진이앤씨', '신흥콘트롤㈜',
        '㈜우도상역', '(주)하이큐시스템', '인젤산업', '다온텍', '대진P&C',
        '티케이몰', '㈜알씨티랩', '㈜엠비코리아', '이솔테크', '아주메디칼㈜',
        '두원F&C', '베네탑', '㈜거동기업', '유니아이앤지㈜', '먼데이피크닉(먼데이팩토리)',
        '진명통신㈜', '엔스텔정보통신㈜', '㈜케이엠스테이트', '㈜로스코파인푸드',
        '㈜밀텍엔지니어', '(주)브이알네이쳐', '㈜포엘디자인', '팅크웨어㈜',
        '화이트비전', '플레이버랩', '㈜장성', '㈜테라하임', '(주)지노프로',
        '㈜코사바이오', '㈜제이앤이', '관세법인 보강(보강에프에스)', '주식회사 더셀',
        '(주)동방메디컬', '㈜구정덴텍', '(주)디지트론', '애널라이즈주식회사',
        '㈜에스엠아이엔씨', '㈜고일', '(주)아이티브릭', '㈜세큐젠코리아',
        '지오미디어', '남호실업', '㈜이엔지아이', '㈜무유', '㈜고일플러스',
        '㈜이노파크텍', '(주)에이스하드웨어', '㈜에이펙스아이앤씨', '투케엔씨㈜',
        'Mastech', '오픈스택㈜', '㈜에이원알폼', '제닉스㈜'
    ];

    // ✨ 난이도별 표시 이름을 추가
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
                
                // ✨ 랭킹 모듈 호출 시, 게임 ID와 난이도 ID를 조합한 고유 키와 제목을 전달
                const storageKey = `${GAME_ID}_${currentLevelId}`;
                rankingModule.addScore(storageKey, timeElapsed, currentConfig.name);

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
        // ✨ 랭킹 모듈에 고유 키와 제목을 전달
        const storageKey = `${GAME_ID}_${currentLevelId}`;
        rankingModule.show(storageKey, currentConfig.name);
    });

    pauseButton.addEventListener('click', togglePause);
    mainRestartButton.addEventListener('click', startGame);
    modalRestartButton.addEventListener('click', startGame);

    startGame();
});