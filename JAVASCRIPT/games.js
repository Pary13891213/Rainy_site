document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const gameName = urlParams.get('game');

    if (gameName === '2048') {
        initGame2048();
    } else {
        showGameMessage("Game not found.");
    }
});

function showGameMessage(msg) {
    const msgDiv = document.getElementById('game-message');
    const board = document.getElementById('game-board');
    if (msgDiv) {
        msgDiv.textContent = msg;
        msgDiv.style.display = 'block';
    }
    if (board) board.innerHTML = '';
}

function updateScoreDisplay(score, highScore) {
    document.getElementById('score').textContent = score;
    document.getElementById('high-score').textContent = highScore;
}

function initGame2048() {
    // تنظیم تم
    const themeOptions = [
        { name: 'DEFAULT', value: 'default' },
        { name: 'WINERED', value: 'winered' },
        { name: 'ROYALGREEN', value: 'royalgreen' },
        { name: 'ROYALBLUE', value: 'royalblue' },
        { name: 'WHITE', value: 'white' }
    ];
    const savedTheme = localStorage.getItem('selectedTheme');
    let currentIndex = 0;
    if (savedTheme) {
        const foundIndex = themeOptions.findIndex(opt => opt.value === savedTheme);
        if (foundIndex !== -1) currentIndex = foundIndex;
    }
    document.documentElement.setAttribute('data-theme', themeOptions[currentIndex].value);

    // متغیرهای بازی
    let board = [];
    let score = 0;
    let highScore = localStorage.getItem('2048-high-score') || 0;
    const size = 4;
    let gameOver = false;
    let won = false;

    const boardElement = document.getElementById('game-board');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    const messageElement = document.getElementById('game-message');
    const restartBtn = document.getElementById('restart-btn');

    updateScoreDisplay(score, highScore);

    // ساخت صفحه
    function createBoard() {
        boardElement.innerHTML = '';
        board = Array(size).fill().map(() => Array(size).fill(0));
        
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                cell.id = `cell-${r}-${c}`;
                boardElement.appendChild(cell);
            }
        }
        addRandomTile();
        addRandomTile();
        updateBoardUI();
    }

    function addRandomTile() {
        const emptyCells = [];
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (board[r][c] === 0) emptyCells.push({r, c});
            }
        }
        if (emptyCells.length > 0) {
            const {r, c} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            board[r][c] = Math.random() < 0.9 ? 2 : 4;
            const cell = document.getElementById(`cell-${r}-${c}`);
            if(cell) cell.classList.add('new-tile');
        }
    }

    function updateBoardUI() {
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                const cell = document.getElementById(`cell-${r}-${c}`);
                const value = board[r][c];
                cell.textContent = value === 0 ? '' : value;
                cell.setAttribute('data-val', value);
                cell.classList.remove('new-tile');
            }
        }
        scoreElement.textContent = score;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('2048-high-score', highScore);
            highScoreElement.textContent = highScore;
        }
    }

    // منطق حرکت
    function slide(row) {
        let arr = row.filter(val => val);
        let missing = size - arr.length;
        let zeros = Array(missing).fill(0);
        arr = arr.concat(zeros);

        for (let i = 0; i < size - 1; i++) {
            if (arr[i] !== 0 && arr[i] === arr[i + 1]) {
                arr[i] *= 2;
                score += arr[i];
                arr[i + 1] = 0;
            }
        }
        arr = arr.filter(val => val);
        missing = size - arr.length;
        zeros = Array(missing).fill(0);
        arr = arr.concat(zeros);
        return arr;
    }

    function moveLeft() {
        let moved = false;
        for (let r = 0; r < size; r++) {
            const original = [...board[r]];
            board[r] = slide(board[r]);
            if (original.toString() !== board[r].toString()) moved = true;
        }
        return moved;
    }

    function moveRight() {
        let moved = false;
        for (let r = 0; r < size; r++) {
            const original = [...board[r]];
            let reversed = board[r].slice().reverse();
            let slid = slide(reversed);
            board[r] = slid.reverse();
            if (original.toString() !== board[r].toString()) moved = true;
        }
        return moved;
    }

    function moveUp() {
        let moved = false;
        for (let c = 0; c < size; c++) {
            let col = [board[0][c], board[1][c], board[2][c], board[3][c]];
            let original = [...col];
            let slid = slide(col);
            for (let r = 0; r < size; r++) board[r][c] = slid[r];
            if (original.toString() !== slid.toString()) moved = true;
        }
        return moved;
    }

    function moveDown() {
        let moved = false;
        for (let c = 0; c < size; c++) {
            let col = [board[0][c], board[1][c], board[2][c], board[3][c]];
            let original = [...col];
            let reversed = col.slice().reverse();
            let slid = slide(reversed);
            let finalCol = slid.reverse();
            for (let r = 0; r < size; r++) board[r][c] = finalCol[r];
            if (original.toString() !== finalCol.toString()) moved = true;
        }
        return moved;
    }

    function checkGameState() {
        let hasEmpty = false;
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (board[r][c] === 0) hasEmpty = true;
                if (c < size - 1 && board[r][c] === board[r][c+1]) return;
                if (r < size - 1 && board[r][c] === board[r+1][c]) return;
            }
        }
        if (hasEmpty) return;
        gameOver = true;
        messageElement.textContent = "Game Over! Score: " + score;
        messageElement.classList.add('show');
    }

    function checkWin() {
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (board[r][c] === 2048) {
                    won = true;
                    messageElement.textContent = "You Win! Score: " + score;
                    messageElement.classList.add('show');
                }
            }
        }
    }

    // مدیریت کلیدهای کیبورد
    function handleInput(e) {
        if (gameOver) return;
        let moved = false;
        switch(e.key) {
            case 'ArrowLeft': moved = moveLeft(); break;
            case 'ArrowRight': moved = moveRight(); break;
            case 'ArrowUp': moved = moveUp(); break;
            case 'ArrowDown': moved = moveDown(); break;
            default: return;
        }
        if (moved) {
            addRandomTile();
            updateBoardUI();
            checkWin();
            checkGameState();
        }
    }

    // مدیریت لمس (Swipe)
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    const boardArea = document.getElementById('game-board');

    boardArea.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, {passive: false});

    boardArea.addEventListener('touchend', (e) => {
        if (gameOver) return;
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, {passive: false});

    function handleSwipe() {
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        // حداقل فاصله برای تشخیص حرکت
        if (Math.max(absDx, absDy) < 30) return;

        let moved = false;
        if (absDx > absDy) {
            // حرکت افقی
            if (dx > 0) moved = moveRight();
            else moved = moveLeft();
        } else {
            // حرکت عمودی
            if (dy > 0) moved = moveDown();
            else moved = moveUp();
        }

        if (moved) {
            addRandomTile();
            updateBoardUI();
            checkWin();
            checkGameState();
        }
    }

    restartBtn.addEventListener('click', () => {
        score = 0;
        gameOver = false;
        won = false;
        messageElement.classList.remove('show');
        createBoard();
    });

    document.addEventListener('keydown', handleInput);
    createBoard();
}
