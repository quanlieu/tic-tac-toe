// ------------- Global variable -----------
// The board appear to user as a matrix, but inside the code only a simple array
// 0 === empty cell, x === player x, o === player o
// isNaN(board[i]) === true means that i is occupied
var board = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
var turn = 'x'; // Player to move: x always first
var ai; // ai is player x or y, default ai doesn't play
var hu; // hu is player x or y, versus mode hu is undefined
var round = 0; // Total moves so far, max 16;
var ended = false;
var winner;
var turnNode;
var cells;
var thinking;
const MAX_DEPTH = 20; // The board is 4x4 = 16, 20 level deep is a safe number

// ------------- Board initiate -----------
window.onload = init();
function init() {
  cells = document.getElementsByClassName('cell');
  turnNode = document.getElementById('turn');
  thinking = document.getElementById('thinking');
  for (let i = 0; i < cells.length; i++) {
    cells[i].addEventListener('click', handleCellClick);
  }

  document.getElementById('ok').addEventListener('click', reInit);
}

function reInit() {
  // Re initiate value
  board = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  turn = 'x';
  round = 0;
  ended = false;
  winner = undefined;
  turnNode.className = '';
  turnNode.innerText = 'X turn';

  for (let i = 0; i < 16; i++) {
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
    setTimeout(aiMove, 500); // Make sure UI update before recursive
  }
}

function updateGameStatus() {
  // Update ended and winner here
  if (winning(board, turn)) {
    ended = true;
    winner = turn;
  } else if (round === 16) {
    ended = true;
    winner = 'draw';
  }
}

function updateView() {
  for (let i = 0; i < 16; i++) {
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
    five(board[0], board[1], board[2], board[3], player) ||
    five(board[4], board[5], board[6], board[7], player) ||
    five(board[8], board[9], board[10], board[11], player) ||
    five(board[12], board[13], board[14], board[15], player) ||
    five(board[0], board[4], board[8], board[12], player) ||
    five(board[1], board[5], board[9], board[13], player) ||
    five(board[2], board[6], board[10], board[14], player) ||
    five(board[3], board[7], board[11], board[15], player) ||
    five(board[0], board[5], board[10], board[15], player) ||
    five(board[3], board[6], board[9], board[12], player)
  ) {
    return true;
  } else {
    return false;
  }
}

function five(a, b, c, d, e) {
  if (a === b && a === c && a === d && a === e) {
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
    // ai go first, take among the 4 center cells
    var centerIndex = [5, 6, 9, 10];
    move(centerIndex[getRandomInt(0, 3)]);
  } else {
    const bestMove = minimax(board, ai, 0);
    move(bestMove.index);
  }
}

function scoring(newBoard, depth) {
  // The board is 4x4 = 16, 20 level deep is a safe number
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

function minimax(prevBoard, player, depth, alpha, beta) {
  // Recursive function where the ai calculate moves in its virtual game board
  const emptyCells = emptyIndexes(prevBoard);
  depth++;
  // ----- Try all possible move -----
  let move;
  for (let i = 0; i < emptyCells.length; i++) {
    if (move && move.score) {
      const score = move.score;
      // Assign new alpha, beta
      if (player === ai && (!alpha || alpha < score)) {
        alpha = score;
      }
      if (player === hu && (!beta || beta > score)) {
        beta = score;
      }

      // Pruning
      if (player === ai && beta < score) {
        break;
      }
      if (player === hu && alpha > score) {
        break;
      }
    }
    // Avoid board mutation help coding easier
    const newBoard = prevBoard.slice();
    const cell = emptyCells[i];
    newBoard[cell] = player;

    const score = scoring(newBoard, depth);
    if (score) {
      return { index: cell, score };
    }

    // ----- Recursive ----
    move = minimax(newBoard, player === ai ? hu : ai, depth, alpha, beta);
  }

  return move;
}

function emptyIndexes(newBoard) {
  return newBoard.filter(s => !isNaN(s));
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
