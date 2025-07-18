/* ranking.js */
const rankingModule = (() => {
    const MAX_RANKINGS = 20;

    let rankingBoardEl, rankingListEl, rankingCloseBtn, rankingLevelNameEl, rankingResetBtn;
    let currentDisplayedKey = null; // 현재 보여주고 있는 랭킹의 키

    document.addEventListener('DOMContentLoaded', () => {
        rankingBoardEl = document.getElementById('ranking-board');
        rankingListEl = document.getElementById('ranking-list');
        rankingCloseBtn = document.getElementById('ranking-close-btn');
        rankingLevelNameEl = document.getElementById('ranking-level-name');
        rankingResetBtn = document.getElementById('ranking-reset-btn');

        if (rankingCloseBtn) {
            rankingCloseBtn.addEventListener('click', hideRankingBoard);
        }
        if (rankingResetBtn) {
            rankingResetBtn.addEventListener('click', resetCurrentRanking);
        }
    });

    function loadRankings(storageKey) {
        const rankingsJSON = localStorage.getItem(storageKey);
        return rankingsJSON ? JSON.parse(rankingsJSON) : [];
    }

    function saveRankings(rankings, storageKey) {
        const sorted = rankings.sort((a, b) => a.time - b.time);
        const topRankings = sorted.slice(0, MAX_RANKINGS);
        localStorage.setItem(storageKey, JSON.stringify(topRankings));
    }

    function displayRankings(storageKey) {
        if (!rankingListEl) return;
        
        const rankings = loadRankings(storageKey);
        rankingListEl.innerHTML = '';

        if (rankings.length === 0) {
            rankingListEl.innerHTML = '<li style="justify-content: center;">아직 랭킹이 없습니다.</li>';
            return;
        }

        rankings.forEach((entry, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="rank">${index + 1}등</span>
                <span class="name">${escapeHtml(entry.name)}</span>
                <span class="time">${entry.time}초</span>
            `;
            rankingListEl.appendChild(li);
        });
    }
    
    // 직접 수정해주신 올바른 escapeHtml 함수
    function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function showRankingBoard(storageKey, title) {
        if (!rankingBoardEl || !rankingLevelNameEl) return;
        
        currentDisplayedKey = storageKey;
        rankingLevelNameEl.textContent = title;
        
        displayRankings(storageKey);
        rankingBoardEl.classList.add('visible');
    }

    function hideRankingBoard() {
        if (!rankingBoardEl) return;
        rankingBoardEl.classList.remove('visible');
    }

    function resetCurrentRanking() {
        if (!currentDisplayedKey) {
            alert('초기화할 랭킹이 선택되지 않았습니다.');
            return;
        }
        
        const title = rankingLevelNameEl.textContent;
        if (confirm(`정말로 '${title}' 랭킹을 모두 삭제하시겠습니까?`)) {
            localStorage.removeItem(currentDisplayedKey);
            displayRankings(currentDisplayedKey);
            alert(`'${title}' 랭킹이 초기화되었습니다.`);
        }
    }

    function addScore(storageKey, timeInSeconds, title) {
        const playerName = prompt(`🎉 ${title} 성공! 랭킹에 등록할 이름을 입력하세요:`, 'Player1');

        if (!playerName || playerName.trim() === '') {
            alert('이름이 입력되지 않아 랭킹에 등록되지 않았습니다.');
            return;
        }

        const rankings = loadRankings(storageKey);
        const newEntry = {
            name: playerName.trim(),
            time: timeInSeconds
        };
        rankings.push(newEntry);
        saveRankings(rankings, storageKey);
        
        showRankingBoard(storageKey, title);
    }
    
    return {
        addScore: addScore,
        show: showRankingBoard
    };
})();