/* ranking.js */
const rankingModule = (() => {
    const MAX_RANKINGS = 20;

    let rankingBoardEl, rankingListEl, rankingCloseBtn, rankingLevelNameEl, rankingResetBtn;
    let currentDisplayedKey = null;

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
        // ✨ [핵심 수정] 정렬 기준을 동적으로 변경
        // entry.score가 있으면 점수(내림차순), 없으면 시간(오름차순)으로 정렬
        const sorted = rankings.sort((a, b) => {
            if (a.score !== undefined && b.score !== undefined) {
                return b.score - a.score; // 점수는 높을수록 좋음
            }
            return a.time - b.time; // 시간은 낮을수록 좋음
        });
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
            // ✨ [핵심 수정] 점수인지 시간인지에 따라 다른 단위 표시
            const value = entry.score !== undefined ? `${entry.score}점` : `${entry.time}초`;
            
            li.innerHTML = `
                <span class="rank">${index + 1}등</span>
                <span class="name">${escapeHtml(entry.name)}</span>
                <span class="time">${value}</span>
            `;
            rankingListEl.appendChild(li);
        });
    }
    
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

    // ✨ [핵심 수정] addScore 함수가 옵션 객체를 받도록 변경하여 유연성 확보
    function addScore(storageKey, options, title) {
        const { score, time } = options;
        const playerName = prompt(`🎉 ${title} 성공! 랭킹에 등록할 이름을 입력하세요:`, 'Player1');

        if (!playerName || playerName.trim() === '') {
            alert('이름이 입력되지 않아 랭킹에 등록되지 않았습니다.');
            return;
        }

        const rankings = loadRankings(storageKey);
        const newEntry = { name: playerName.trim() };

        if (score !== undefined) {
            newEntry.score = score;
        } else if (time !== undefined) {
            newEntry.time = time;
        } else {
            console.error("점수 또는 시간이 제공되지 않았습니다.");
            return;
        }

        rankings.push(newEntry);
        saveRankings(rankings, storageKey);
        
        showRankingBoard(storageKey, title);
    }
    
    return {
        addScore: addScore,
        show: showRankingBoard
    };
})();