// ------------- Global variable -----------
// The board appear to user as a matrix, but inside the code only a simple array
// 0 === empty cell, x === player x, o === player o
// isNaN(board[i]) === true means that i is occupied
var board = [0, 1, 2, 3, 4, 5, 6, 7, 8];
var turn = 'x'; // Player to move: x always first
var ai; // ai is player x or y, default ai doesn't play
var hu; // hu is player x or y, versus mode hu is undefined
var round = 0; // Total moves so far, max 9;
var ended = false;
var winner;
var turnNode;
var cells;
const MAX_DEPTH = 12 // The board is 3x3 = 9, 12 level deep is a safe number

// ------------- Board initiate -----------
window.onload = init();
function init() {
  cells = document.getElementsByClassName('cell');
  turnNode = document.getElementById('turn');
  for (let i = 0; i < cells.length; i++) {
    cells[i].addEventListener('click', handleCellClick);
  }

  document.getElementById('ok').addEventListener('click', reInit);
}

function reInit() {
  // Re initiate value
  board = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  turn = 'x';
  round = 0;
  ended = false;
  winner = undefined;
  turnNode.className = '';
  turnNode.innerText = 'X turn';

  for (let i = 0; i < 9; i++) {
    cells[i].className = 'cell';
  }

  // Check if play mode is set to ai
  // af === ai first, hf === human first
  if (document.getElementById('cf').checked) {
    ai = 'x';
    hu = 'o';
    aiMove();
  } else if (document.getElementById('hf').checked) {
    ai = 'o';
    hu = 'x';
  } else {
    ai = undefined;
    hu = undefined;
  }
}

// ----------- Board move handler -----------

function handleCellClick(e) {
  // Do nothing if the game has ended or played on an occupied cell
  const index = e.currentTarget.dataset.index;
  if (ended || isNaN(board[index])) {
    return;
  }
  move(index);
}

function move(index) {
  board[index] = turn;
  round++;
  updateGameStatus();
  if (!ended) {
    turn = turn === 'x' ? 'o' : 'x';
  }
  updateView();

  // Handle ai turn
  if (turn === ai) {
    aiMove();
  }
}

function updateGameStatus() {
  // Update ended and winner here
  if (winning(board, turn)) {
    ended = true;
    winner = turn;
  } else if (round === 9) {
    ended = true;
    winner = 'draw';
  }
}

function updateView() {
  for (let i = 0; i < 9; i++) {
    if (isNaN(board[i])) {
      cells[i].className = 'cell ' + board[i];
    }
  }
  if (winner === 'x') {
    turnNode.className = 'ended';
    turnNode.innerText = 'X won';
  } else if (winner === 'o') {
    turnNode.className = 'ended';
    turnNode.innerText = 'O won';
  } else if (winner === 'draw') {
    turnNode.className = 'draw';
    turnNode.innerText = 'Draw';
  } else {
    turnNode.innerText = turn.toUpperCase() + ' turn';
  }
}

// ------------- Winning checker -----------
function winning(board, player) {
  // Check if there is a row, column, diagonal matches winning combination
  if (
    (board[0] === player && board[1] === player && board[2] === player) ||
    (board[3] === player && board[4] === player && board[5] === player) ||
    (board[6] === player && board[7] === player && board[8] === player) ||
    (board[0] === player && board[3] === player && board[6] === player) ||
    (board[1] === player && board[4] === player && board[7] === player) ||
    (board[2] === player && board[5] === player && board[8] === player) ||
    (board[0] === player && board[4] === player && board[8] === player) ||
    (board[2] === player && board[4] === player && board[6] === player)
  ) {
    return true;
  } else {
    return false;
  }
}

// ----------- AI section -----------
function aiMove() {
  if (ended) {
    return;
  }

  if (round === 0) {
    // ai go first, take a random cell
    move(getRandomInt(0, 8));
  } else {
    const bestMove = minimax(board, ai, 0);
    move(bestMove.index);
  }
}

function scoring(newBoard, depth) {
  if (winning(newBoard, ai)) {
    // Win, the earlier the more score
    return MAX_DEPTH - depth;
  }
  if (winning(newBoard, hu)) {
    // Lose, the later the more score. But can never be more than win or draw
    return depth - MAX_DEPTH;
  }
  if (emptyIndexes(newBoard).length === 0) {
    // Draw, 1 instead of zero for easier check
    return 1;
  }
  // Terminal state is not reach, return 0
  return 0;
}

function minimax(prevBoard, player, depth) {
  // Recursive function where the ai calculate moves in its virtual game board
  const emptyCells = emptyIndexes(prevBoard);
  depth++;
  // ----- Try all possible move -----
  let moves = [];
  for (let i = 0; i < emptyCells.length; i++) {
    // Avoid board mutation help coding easier
    const newBoard = prevBoard.slice();
    const cell = emptyCells[i];
    let move = { index: cell };
    newBoard[cell] = player;
    let stop = false;

    const score = scoring(newBoard, depth);
    if (score) {
      stop = true;
      move.score = score;
    }

    // ----- Recursive ----
    if (!stop) {
      const nextPlayer = player === ai ? hu : ai;
      move.score = minimax(newBoard, nextPlayer, depth).score;
    }
    moves.push(move);
  }

  // Find the best move
  let bestMove;
  if (player === ai) {
    // If the move is made by ai, return max score
    let bestScore = -Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    // If the move is made by human, return min score
    let bestScore = Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }

  // The final result
  return moves[bestMove];
}

function emptyIndexes(currentBoard) {
  return currentBoard.filter(s => !isNaN(s));
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
