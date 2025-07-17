document.addEventListener('DOMContentLoaded', () => {
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach(card => {
        card.addEventListener('click', (event) => {
            event.preventDefault(); 
            card.style.transition = 'transform 0.1s ease';
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
                card.style.transform = 'scale(1)';
                window.location.href = card.href;
            }, 100);
        });
    });
    console.log("테크커넥트 게임 플랫폼이 준비되었습니다!");
});