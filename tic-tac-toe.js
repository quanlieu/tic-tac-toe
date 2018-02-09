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
    const bestMoveIndex = minimax(board, ai).index;
    move(bestMoveIndex);
  }
}

function minimax(prevBoard, player) {
  // Recursive function where the ai calculate moves in its virtaul game board
  const emptyCells = emptyIndexes(prevBoard);

  // ----- Recursive -----
  // Try all the possible movesets, get the score of each moveset
  let moves = [];
  for (let i = 0; i < emptyCells.length; i++) {
    // Avoid board mutation
    const newboard = prevBoard.slice();
    const cell = emptyCells[i];
    let move = { index: cell };
    // Make brute-force move
    newboard[cell] = player;
    let stop = false;

    // Stop recursive and assign score base on whether ai won or lost in the virtual board
    // If neither win and the board is full, the game is draw, score 0
    if (winning(newboard, ai)) {
      move.score = 1;
      stop = true;
    }
    if (winning(newboard, hu)) {
      move.score = -1;
      stop = true;
    }
    if (emptyCells.length === 1) {
      // prevBoard's emptyCells == 1 => newBoard's emptyCells == 0 => board full
      move.score = 0;
      stop = true;
    }

    // Recursive through all possible movesets
    if (!stop) {
      move.score = minimax(newboard, player === ai ? hu : ai).score;
    }
    moves.push(move);
  }

  // Find the best move
  let bestMove;
  if (player === ai) {
    // If the move is made by ai, return max score
    let bestScore = -100;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    // If the move is made by human, return min score
    let bestScore = 100;
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
