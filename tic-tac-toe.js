// ------------- Global variable -----------
// The board appear to user as a matrix, but inside the code only a simple array
// 0 === empty cell, x === player x, o === player o
// isNaN(board[i]) === true means that i is occupied
var board = [0, 1, 2, 3, 4, 5, 6, 7, 8];
var turn = 'x'; // Player to move: x always first
var ai; // ai is player x or y, default ai doesn't play
var round = 0; // Total moves so far, max 9;
var ended = false;
var winner;
var turnNode;
var cells;

window.onload = init();

// ------------- Board initiate -----------
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
    calculateMove();
  } else if (document.getElementById('hf').checked) {
    ai = 'o';
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
    calculateMove();
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
    (board[0] == player && board[1] == player && board[2] == player) ||
    (board[3] == player && board[4] == player && board[5] == player) ||
    (board[6] == player && board[7] == player && board[8] == player) ||
    (board[0] == player && board[3] == player && board[6] == player) ||
    (board[1] == player && board[4] == player && board[7] == player) ||
    (board[2] == player && board[5] == player && board[8] == player) ||
    (board[0] == player && board[4] == player && board[8] == player) ||
    (board[2] == player && board[4] == player && board[6] == player)
  ) {
    return true;
  } else {
    return false;
  }
}

// ----------- AI section -----------
function calculateMove() {
  if (ended) {
    return;
  }

  const availSpots = emptyIndexes(board);
  move(availSpots[0]);
}

function firstAiMove() {
  // ai go first, always take the corner
  move(0);
}

function emptyIndexes(reboard) {
  return reboard.filter(s => !isNaN(s));
}
