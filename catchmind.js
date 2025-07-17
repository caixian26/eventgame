window.addEventListener('load', () => {
    const canvas = document.getElementById('draw-canvas');
    const ctx = canvas.getContext('2d');
    const colorPicker = document.getElementById('color-picker');
    const brushSize = document.getElementById('brush-size');
    const clearBtn = document.getElementById('clear-btn');
    const newGameBtn = document.getElementById('new-game-btn');
    const keywordEl = document.getElementById('keyword');

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    let isPainting = false;
    const keywords = ["노트북", "스마트폰", "전자칠판", "사무실", "키보드", "마우스", "커피", "모니터", "의자", "책상"];
    
    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    }

    function startPosition(e) {
        e.preventDefault();
        isPainting = true;
        draw(e);
    }

    function finishedPosition() {
        isPainting = false;
        ctx.beginPath();
    }

    function draw(e) {
        if (!isPainting) return;
        e.preventDefault();
        const { x, y } = getPos(e);
        ctx.lineWidth = brushSize.value;
        ctx.lineCap = 'round';
        ctx.strokeStyle = colorPicker.value;
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }

    function startNewGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        keywordEl.textContent = keywords[Math.floor(Math.random() * keywords.length)];
    }

    canvas.addEventListener('mousedown', startPosition);
    canvas.addEventListener('mouseup', finishedPosition);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseout', finishedPosition);
    canvas.addEventListener('touchstart', startPosition, { passive: false });
    canvas.addEventListener('touchend', finishedPosition);
    canvas.addEventListener('touchmove', draw, { passive: false });
    
    clearBtn.addEventListener('click', () => ctx.clearRect(0, 0, canvas.width, canvas.height));
    newGameBtn.addEventListener('click', startNewGame);
    startNewGame();
});