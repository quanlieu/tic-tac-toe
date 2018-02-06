// The board appear to user as a matrix, but inside the code only a simple array
// Trade-off: 2-dimensional array check row easier, simple array check column easier
// 0 === empty cell, x === player x, o === player o
var board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
var turn = 'x'; // Player to place: x always first
var totalMove = 0; // Total moves have been place so far, max 9;
var ended = false;
var winner;
var turnNode;
var cells;

function init() {
  cells = document.getElementsByClassName('cell');
  turnNode = document.getElementById('turn');
  for (let i = 0; i < cells.length; i++) {
    cells[i].addEventListener('click', handleCellClick);
  }

  document.getElementById('ok').addEventListener('click', reInit);
}

function reInit() {
  board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  turn = 'x';
  totalMove = 0;
  ended = false;
  winner = undefined;
  turnNode.className = '';
  turnNode.innerText = 'X turn';

  for (let i = 0; i < 9; i++) {
    cells[i].className = 'cell';
  }
}

function handleCellClick(e) {
  if (ended) {
    return;
  }
  place(e.currentTarget.dataset.index);
}

function place(index) {
  board[index] = turn;
  totalMove++;
  updateGameStatus();
  if (!ended) {
    turn = turn === 'x' ? 'o' : 'x';
  }
  updateView();
}

function updateGameStatus() {
  // Update ended and winner here
  // Check if there is a row, column, diagonal match winning condition
  const rowWin =
    shallowEqual([board[0], board[1], board[2]], turn) ||
    shallowEqual([board[3], board[4], board[5]], turn) ||
    shallowEqual([board[6], board[7], board[8]], turn);
  const colWin =
    shallowEqual([board[0], board[3], board[6]], turn) ||
    shallowEqual([board[1], board[4], board[7]], turn) ||
    shallowEqual([board[2], board[5], board[8]], turn);
  const diaWin =
    shallowEqual([board[0], board[4], board[8]], turn) ||
    shallowEqual([board[2], board[4], board[6]], turn);

  if (rowWin || colWin || diaWin) {
    ended = true;
    winner = turn;
  } else if (totalMove === 9) {
    ended = true;
    winner = 'draw';
  }
}

function updateView() {
  for (let i = 0; i < 9; i++) {
    cells[i].className = 'cell ' + board[i];
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

function shallowEqual(array, value) {
  for (let i = 0; i < array.length; i++) {
    if (array[i] !== value) {
      return false;
    }
  }
  return true;
}

window.onload = init();

// AI section
