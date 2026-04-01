const cells = document.querySelectorAll('.cell');
const statusPx = document.querySelector('.player-score.px');
const statusPo = document.querySelector('.player-score.po');
const scoreXElement = document.getElementById('score-x');
const scoreOElement = document.getElementById('score-o');
const modal = document.getElementById('modal');
const modalText = document.getElementById('modal-text');
const restartBtn = document.getElementById('restart-btn');
const resetScoreBtn = document.getElementById('reset-score-btn');
const modePvpBtn = document.getElementById('mode-pvp');
const modePveBtn = document.getElementById('mode-pve');

let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let mode = 'PVP';
let scores = { X: 0, O: 0 };

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

function init() {
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });
    restartBtn.addEventListener('click', restartGame);
    resetScoreBtn.addEventListener('click', resetScores);

    modePvpBtn.addEventListener('click', () => setMode('PVP'));
    modePveBtn.addEventListener('click', () => setMode('PVE'));
}

function setMode(newMode) {
    if (mode === newMode) return;
    mode = newMode;

    if (mode === 'PVP') {
        modePvpBtn.classList.add('active');
        modePveBtn.classList.remove('active');
        document.querySelector('.player-score.po .label').textContent = 'PLAYER O';
    } else {
        modePveBtn.classList.add('active');
        modePvpBtn.classList.remove('active');
        document.querySelector('.player-score.po .label').textContent = 'AI (O)';
    }

    restartGame();
    resetScores();
}

function handleCellClick(e) {
    const cell = e.target;
    const index = parseInt(cell.getAttribute('data-index'));

    if (board[index] !== '' || !gameActive) return;

    makeMove(index, currentPlayer);

    if (gameActive && mode === 'PVE' && currentPlayer === 'O') {
        // AI Turn
        setTimeout(makeAIMove, 400);
    }
}

function makeMove(index, player) {
    board[index] = player;
    cells[index].textContent = player;
    cells[index].classList.add(player.toLowerCase());

    checkWin(player);

    if (gameActive) {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateTurnHighlight();
    }
}

function updateTurnHighlight() {
    if (currentPlayer === 'X') {
        statusPx.classList.add('active-turn');
        statusPo.classList.remove('active-turn');
    } else {
        statusPo.classList.add('active-turn');
        statusPx.classList.remove('active-turn');
    }
}

function checkWin(player) {
    let roundWon = false;
    let winningCells = [];

    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            roundWon = true;
            winningCells = [a, b, c];
            break;
        }
    }

    if (roundWon) {
        highlightWinningCells(winningCells);
        endGame(`Player ${player} Wins!`, player);
        return;
    }

    if (!board.includes('')) {
        endGame('Draw!', null);
        return;
    }
}

function highlightWinningCells(indices) {
    indices.forEach(index => {
        cells[index].classList.add('win-highlight');
    });
}

function endGame(message, winner) {
    gameActive = false;
    modalText.textContent = message;

    if (winner) {
        scores[winner]++;
        updateScores();
        if (winner === 'X') modalText.style.color = '#60a5fa';
        else modalText.style.color = '#f472b6';
    } else {
        modalText.style.color = '#f8fafc';
    }

    setTimeout(() => {
        modal.classList.add('show');
    }, 500);
}

function updateScores() {
    scoreXElement.textContent = scores.X;
    scoreOElement.textContent = scores.O;
}

function restartGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;

    cells.forEach(cell => {
        cell.textContent = '';
        cell.className = 'cell';
    });

    modal.classList.remove('show');
    updateTurnHighlight();
}

function resetScores() {
    scores = { X: 0, O: 0 };
    updateScores();
    restartGame();
}

function makeAIMove() {
    if (!gameActive) return;

    let bestScore = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = 'O';
            let score = minimax(board, 0, false);
            board[i] = '';
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }

    if (bestMove !== -1) {
        makeMove(bestMove, 'O');
    }
}

function minimax(newBoard, depth, isMaximizing) {
    let result = checkWinner(newBoard);
    if (result !== null) {
        if (result === 'O') return 10 - depth;
        if (result === 'X') return depth - 10;
        if (result === 'tie') return 0;
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (newBoard[i] === '') {
                newBoard[i] = 'O';
                let score = minimax(newBoard, depth + 1, false);
                newBoard[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (newBoard[i] === '') {
                newBoard[i] = 'X';
                let score = minimax(newBoard, depth + 1, true);
                newBoard[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinner(brd) {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (brd[a] && brd[a] === brd[b] && brd[a] === brd[c]) {
            return brd[a];
        }
    }
    if (!brd.includes('')) return 'tie';
    return null;
}

init();
