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
var worker = new Worker('web-worker.js');
var timer;
var timerTick = 0;
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

  worker.addEventListener(
    'message',
    function(e) {
      // Get back the board index from service worker
      move(+e.data);
    },
    false
  );
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
    aiMove();
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

  if (turn === ai) {
    timerTick = 0;
    thinking.innerText = 'Thinking: ' + timerTick + 's';
    timer = setInterval(thinkingTimer, 1000);
  } else if (timer) {
    clearInterval(timer);
  }
}

function thinkingTimer() {
  timerTick++;
  thinking.innerText = 'Thinking: ' + timerTick + 's';
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
    const postData = { board, player: ai, ai, hu };
    worker.postMessage(['start', JSON.stringify(postData)]);
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
