document.addEventListener('DOMContentLoaded', () => {
    // DOM 요소
    const questionEl = document.getElementById('quiz-question');
    const canvas = document.getElementById('drawing-canvas');
    const ctx = canvas.getContext('2d');
    const hintTextEl = document.getElementById('hint-text');
    const timerProgress = document.getElementById('timer-progress');
    const scoreDisplay = document.getElementById('score-display');
    const progressDisplay = document.getElementById('progress-display');
    
    const hintBtn = document.getElementById('hint-btn');
    const answerBtn = document.getElementById('answer-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const restartBtnMain = document.getElementById('restart-btn-main');
    
    const overlay = document.getElementById('overlay');
    
    const answerModal = document.getElementById('answer-modal');
    const modalAnswerText = document.getElementById('modal-answer-text');
    const correctBtn = document.getElementById('correct-btn');
    const incorrectBtn = document.getElementById('incorrect-btn');

    const resultModal = document.getElementById('result-modal');
    const resultTitle = document.getElementById('result-title');
    const finalScoreText = document.getElementById('final-score-text');
    const showRankingBtn = document.getElementById('show-ranking-btn');
    const restartBtnModal = document.getElementById('restart-btn-modal');

    // 퀴즈 데이터
    const fullQuizData = [
        { question: "타이타닉의 구명보트는 몇 명이 탈수 있을까?", answer: "9명" },
        { question: "초등학생이 가장 좋아하는 동네는?", answer: "방학동" },
        { question: "진짜 문제투성이인 것은?", answer: "시험지" },
        { question: "폭력배가 많은 나라?", answer: "칠레" },
        { question: "아무리 예뻐도 미녀라고 못하는 이사람은?", answer: "미남" },
        { question: "세상에서 가장 빠른 닭은?", answer: "후다닥" },
        { question: "못팔고도 돈 번 사람은?", answer: "철물점 주인" },
        { question: "많이 맞을수록 좋은 것은?", answer: "시험문제" },
        { question: "날마다 가슴에 흑심을 품고 있는 사람은?", answer: "연필" },
        { question: "도둑이 가장 싫어하는 아이스크림은?", answer: "누가바" },
        { question: "소가 가장 무서워하는 말은?", answer: "소피보러 간다" },
        { question: "한국에서 가장 급하게 만든 떡은?", answer: "헐레벌떡" },
        { question: "새 중에서 가장 빠른 새는?", answer: "눈깜작할 새" },
        { question: "미소의 반대말은?", answer: "당기소" },
        { question: "친구들과 술집에 가서 술값 안내려고 추는 춤은?", answer: "주춤주춤" },
        { question: "호주의 돈을 뭐라고 하는가?", answer: "호주머니" },
        { question: "텔레토비가 차린 안경점 이름은?", answer: "아이조아" },
        { question: "엉덩이가 뚱뚱한 사람은?", answer: "엉뚱한 사람" },
        { question: "소나타는 누가 탈까?", answer: "소" },
        { question: "처녀가 타서는 안 되는 차는?", answer: "아벨라" },
        { question: "여자만 먹는 음식은?", answer: "여탕" },
        { question: "여자만 갖은 권리는?", answer: "여권" },
        { question: "학생들이 싫어하는 피자는?", answer: "책 피자" },
        { question: "신이 화가 나면?", answer: "신발끈" },
        { question: "개가 사람을 가르친다를 4자로 줄이면?", answer: "개인지도" },
        { question: "공이 웃으면?", answer: "풋볼" },
        { question: "광부가 가장 많은 나라은?", answer: "케냐" },
        { question: "울다가 다시 웃는 사람을 다섯 글자로?", answer: "아까운사람" },
        { question: "세상에서 가장 쉬운 숫자는?", answer: "십구만" },
        { question: "세상에서 제일 뜨거운 과일은?", answer: "천도복숭아" },
        { question: "왕이 헤어질 때 하는 인사는?", answer: "바이킹" },
        { question: "동생과 형이 싸우는데 엄마가 동생 편만 드는 세상은?", answer: "형편없는 세상" },
        { question: "방금 화장실에서 나온 사람은?", answer: "일본사람" },
        { question: "정말 어렵게 지은 절 이름은?", answer: "우여곡절" },
        { question: "나무들이 나오는 드라마는?", answer: "수목드라마" },
        { question: "차도가 없는 나라는?", answer: "인도" },
        { question: "반성문을 영어로 하면?", answer: "글로벌" },
        { question: "베를린 음식을 먹으면 안 되는 이유?", answer: "독일 수도" },
        { question: "아마존에 살고있는 사람 이름은?", answer: "아마.존?" },
        { question: "땅은 어떻게 울까?", answer: "흙흙" },
        { question: "세상에서 가장 가난한 왕은?", answer: "최저임금" },
        { question: "영희는 오빠만 5명이다.첫째는 일남 둘째는 이남 셋째는 삼남 넷째는 사남,그렇다면 막내의 이름은?", answer: "영희" },
        { question: "갈매기가 좋아하는 룩은?", answer: "끼룩" },
        { question: "바나나가 웃으면?", answer: "바나나킥" },
        { question: "왕이넘어지면?", answer: "킹콩" },
        { question: "가장 무서운 전화는?", answer: "무선전화" },
        { question: "스님이 내리면서 하는 말은?", answer: "중도하차" },
        { question: "자동차를 발로 차려고 하면?", answer: "카놀라유" },
        { question: "마른 옷은 벗고,젖은 옷만 입는 것은?", answer: "빨랫줄" },
        { question: "수학책을 난로 위에 두면?", answer: "수학익힘책" },
        { question: "왕에게 공을 던질 때 하는 말은?", answer: "송구하옵니다" },
        { question: "치과의사가 가장 싫어하는 아파트는?", answer: "이편한세상" },
        { question: "깨뜨리고 칭찬받는 것은?", answer: "신기록" },
        { question: "남자 두명이 연애를 하면?", answer: "사내연애" },
        { question: "미국에 비가오면?", answer: "USB" },
        { question: "뱃사람들이 제일 싫어하는 가수는?", answer: "배철수" },
        { question: "새우가 출연하는 드라마는?", answer: "대하드라마" },
        { question: "스캔들 없이 사생활이 깨끗한 가수는?", answer: "노사연" },
        { question: "세상에서 가장 잘 자는 사람은?", answer: "이미자" },
        { question: "스님들이 절에 없으면?", answer: "부재중" },
        { question: "신경통 환자들이 제일 싫어하는 악기는?", answer: "비올라" },
        { question: "인수가 화를 내면?", answer: "인수분해" },
        { question: "자전거를 탈 줄 모르는 사람을 5글자로 말하면?", answer: "모타사이클" },
        { question: "청소년들이 타고 다니는 차는?", answer: "청소차" },
        { question: "팥이 목마를 때 콩에게 하는 말은?", answer: "콩나물" },
        { question: "해가 우는 곳은?", answer: "해운대" },
        { question: "신사가 하는 인사는?", answer: "신사임당" },
        { question: "세 사람만 탈 수 있는 차는?", answer: "인삼차" },
        { question: "먹고살기 위해 하는 내기는?", answer: "모내기" },
        { question: "아홉 명의 자식을 세글자로 말하면?", answer: "아이고" },
        { question: "사람들이 가장 좋아하는 영화는?", answer: "부귀영화" },
        { question: "노인들이 가장 좋아하는 목포는?", answer: "나이아가라 폭포" },
        { question: "동생이 형을 좋아하는 것은?", answer: "형광펜" },
        { question: "사람들을 다 일어나게 하는 숫자는?", answer: "다섯" },
        { question: "머리가 아플 때 얼마나 먹어야 할까?", answer: "두통" },
        { question: "고랑 개랑 부딪히면?", answer: "소개팅" },
        { question: "스님이 열 받을 때 먹는 음식은?", answer: "중화요리" },
        { question: "전주비빔밥보다 늦게 나온 비빔밥은?", answer: "이번주비빔밥" },
        { question: "꽃가게 주인이 가장 싫어하는 나라는?", answer: "시드니" },
        { question: "세상에서 가장 잔인한 비빔밥은?", answer: "산채비빔밥" },
        { question: "자가용의 반대말은?", answer: "커요" },
        { question: "똥싸고 나온 물고기는?", answer: "일본어" },
        { question: "김치와 케이크를 섞으면?", answer: "버려야 함" },
        { question: "사람이 사는 동안 가장 많이 하는 소리는?", answer: "숨소리" },
        { question: "세상에서 가장 야한 닭은?", answer: "홀딱" },
        { question: "가장 빨리 먹는 떡은?", answer: "헐레벌떡" },
        { question: "물고기 중에서 가장 학벌이 좋은 물고기는?", answer: "고등어" },
        { question: "바다에서 해도 되는 욕은?", answer: "해수욕" },
        { question: "전쟁에서 장군이 가장 받고 싶어 하는 복은?", answer: "항복" },
        { question: "창으로 찌를 때 하는 말은?", answer: "창피해" },
        { question: "이상한 사람들이 모여있는 곳은?", answer: "치과" },
        { question: "모든 소들이 밭에서 일하는데 놀고 있는 소는?", answer: "깜찍이 소다" },
        { question: "물 없는 곳에서도 할 수 있는 물놀이는?", answer: "사물놀이" },
        { question: "처음 만나는 소가 하는 말은?", answer: "반갑소" },
        { question: "형제가 싸울 때 동생 편만 드는 곳은?", answer: "형편없는 곳" },
        { question: "흑인이 시험을 보면?", answer: "검정고시" },
        { question: "정삼각형의 동생 이름은?", answer: "정삼각" },
        { question: "해와 달중 해만 전문적으로 취재하는 사람은?", answer: "해리포터" },
        { question: "개가 사람을 가르친다를 네 글자로 줄이면?", answer: "개인지도" },
        { question: "산부인과 의사가 가장 싫어하는 말은?", answer: "무자식이 상팔자다" },
        { question: "60명이 정원인 잠수함에 남자 30명 여자 29명이 탑승했는데 갑자기 가라 앉은이유?", answer: "잠수함이니깐" },
        { question: "부산에서 가장 추운곳은?", answer: "영도" },
        { question: "펭귄이 다니는 중학교?", answer: "냉방중" },
        { question: "투수 김병헌 선수가 미국에서 던지는 공은?", answer: "해외직구" },
        { question: "“어른은 알겠다”를 다르게 표현하면?", answer: "에라 모르겠다" },
        { question: "신하가 왕에게 공을 던지면서 하는 말은?", answer: "송구하옵니다 전하" },
        { question: "자동차를 발로 차면 하는 말은?", answer: "카놀라유" },
        { question: "할아버지가 가장 좋아하는 돈은?", answer: "할머니" },
        { question: "한의사가 가장 싫어하는 말은?", answer: "밥이 보약이다" },
        { question: "털이 길게 자란 남자를 다른 말로?", answer: "모자란놈" },
        { question: "개리가 온천에 갔다를 네 글자로 표현하면?", answer: "스파게리" },
        { question: "절대로 놀라지 않는 연예인은?", answer: "태연" },
        { question: "바람이 귀엽게 부는 동네는?", answer: "분당" },
        { question: "소변과 대변중 먼저 나오는 것은?", answer: "급한 것" }
    ];

    const GAME_ID = 'nonsense_quiz';
    const TOTAL_ROUNDS = 5;
    const TIME_LIMIT = 30 * 1000;
    let quizSet = [], currentRound = 0, score = 0, currentQuiz = {};
    let timerId, isPaused = false, isGameActive = false, isDrawing = false;
    let timerStartTime, timeRemainingOnPause;

    function initGame() {
        isGameActive = false;
        isPaused = false;
        cancelAnimationFrame(timerId);
        
        overlay.classList.add('visible');
        overlay.innerHTML = '<div class="overlay-content"><button id="start-btn">시작하기</button></div>';
        document.getElementById('start-btn').addEventListener('click', startGame);

        questionEl.textContent = "아래 '시작하기' 버튼을 눌러주세요!";
        progressDisplay.textContent = `문제: 0/${TOTAL_ROUNDS}`;
        scoreDisplay.textContent = `점수: 0점`;
        timerProgress.style.transition = 'none';
        timerProgress.style.width = '100%';
        hintTextEl.textContent = '';
        clearCanvas();
        
        hintBtn.disabled = true;
        answerBtn.disabled = true;
        pauseBtn.disabled = true;
        pauseBtn.textContent = '일시정지';
    }

    function startGame() {
        isGameActive = true;
        overlay.classList.remove('visible');
        
        const shuffled = [...fullQuizData].sort(() => 0.5 - Math.random());
        quizSet = shuffled.slice(0, TOTAL_ROUNDS);
        
        currentRound = 0;
        score = 0;
        resultModal.classList.remove('visible');
        answerModal.classList.remove('visible');
        updateScore();
        
        pauseBtn.disabled = false;
        loadNextQuiz();
    }

    function loadNextQuiz() {
        if (currentRound >= TOTAL_ROUNDS) {
            endGame();
            return;
        }
        
        currentQuiz = quizSet[currentRound];
        currentRound++;

        questionEl.textContent = currentQuiz.question;
        progressDisplay.textContent = `문제: ${currentRound}/${TOTAL_ROUNDS}`;
        hintTextEl.textContent = '';
        hintBtn.disabled = false;
        answerBtn.disabled = false;
        clearCanvas();
        startTimer(TIME_LIMIT);
    }

    // ✨ [핵심 수정] requestAnimationFrame 기반의 정확한 타이머
    function startTimer(duration) {
        cancelAnimationFrame(timerId);
        timerStartTime = Date.now();
        
        function timerLoop() {
            if (isPaused) return;

            const elapsedTime = Date.now() - timerStartTime;
            const remainingTime = duration - elapsedTime;
            
            if (remainingTime <= 0) {
                timerProgress.style.width = '0%';
                showAnswer();
                return;
            }
            
            const widthPercent = (remainingTime / TIME_LIMIT) * 100;
            timerProgress.style.width = `${widthPercent}%`;
            
            timerId = requestAnimationFrame(timerLoop);
        }
        timerId = requestAnimationFrame(timerLoop);
    }

    // ✨ [핵심 수정] 오버레이 없이 타이머만 제어하는 일시정지
    function togglePause() {
        if (!isGameActive) return;
        isPaused = !isPaused;
        
        if (isPaused) {
            cancelAnimationFrame(timerId);
            const elapsedTime = Date.now() - timerStartTime;
            timeRemainingOnPause = (timeRemainingOnPause || TIME_LIMIT) - elapsedTime;
            pauseBtn.textContent = '계속하기';
        } else {
            startTimer(timeRemainingOnPause);
            pauseBtn.textContent = '일시정지';
        }
    }

    function showHint() {
        const answer = currentQuiz.answer;
        let hint = '힌트: ';
        for (let i = 0; i < answer.length; i++) {
            if (i === 0) {
                hint += answer[i];
            } else if (answer[i] === ' ') {
                hint += ' ';
            } else {
                hint += 'O';
            }
        }
        hintTextEl.textContent = hint;
        hintBtn.disabled = true;
    }

    function showAnswer() {
        cancelAnimationFrame(timerId);
        modalAnswerText.textContent = currentQuiz.answer;
        answerModal.classList.add('visible');
    }

    function handleAnswer(isCorrect) {
        if (isCorrect) {
            score += 20;
            updateScore();
        }
        answerModal.classList.remove('visible');
        loadNextQuiz();
    }

    function updateScore() {
        scoreDisplay.textContent = `점수: ${score}점`;
    }

    function endGame() {
        isGameActive = false;
        pauseBtn.disabled = true;
        cancelAnimationFrame(timerId);
        resultTitle.textContent = score === 100 ? '🎉 완벽해요! 🎉' : '게임 종료!';
        finalScoreText.textContent = `${score}점`;
        resultModal.classList.add('visible');
    }

    // ✨ [핵심 수정] 랭킹 시스템에 점수를 객체 형태로 전달
    function showAndRegisterRanking() {
        rankingModule.addScore(GAME_ID, { score: score }, "넌센스 퀴즈");
    }

    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#000';
    }
    function startDrawing(e) { if(isGameActive && !isPaused) { isDrawing = true; ctx.beginPath(); ctx.moveTo(e.offsetX, e.offsetY); } }
    function draw(e) { if(isDrawing) { ctx.lineTo(e.offsetX, e.offsetY); ctx.stroke(); } }
    function stopDrawing() { isDrawing = false; }
    function clearCanvas() { ctx.clearRect(0, 0, canvas.width, canvas.height); }

    hintBtn.addEventListener('click', showHint);
    answerBtn.addEventListener('click', showAnswer);
    pauseBtn.addEventListener('click', togglePause);
    restartBtnMain.addEventListener('click', initGame);
    restartBtnModal.addEventListener('click', () => { resultModal.classList.remove('visible'); initGame(); });
    correctBtn.addEventListener('click', () => handleAnswer(true));
    incorrectBtn.addEventListener('click', () => handleAnswer(false));
    showRankingBtn.addEventListener('click', showAndRegisterRanking);

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startDrawing({ offsetX: e.touches[0].clientX - canvas.getBoundingClientRect().left, offsetY: e.touches[0].clientY - canvas.getBoundingClientRect().top }); });
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw({ offsetX: e.touches[0].clientX - canvas.getBoundingClientRect().left, offsetY: e.touches[0].clientY - canvas.getBoundingClientRect().top }); });
    canvas.addEventListener('touchend', stopDrawing);

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    initGame();
});