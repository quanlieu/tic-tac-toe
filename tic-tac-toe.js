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
function aiMove() {
  if (ended) {
    return;
  }

  if (round === 0) {
    // ai go first, randomly take a corner or the center
    const cornerAndCenterIndexes = [0, 2, 4, 6, 8];
    move(cornerAndCenterIndexes[getRandomInt(0, 4)]);
  } else {
    const bestMoveIndex = minimax(board, ai).index;
    move(bestMoveIndex);
  }
}

function minimax(reboard, player) {
  // Recursive function where the ai calculate moves in its virtaul game board
  const availCells = emptyIndexes(reboard);

  // ----- Recursive stop condition -----
  // Return the score depend on whether ai won or lost in the virtual board
  // If the game is draw, return 0
  if (winning(reboard, ai)) {
    return { score: 1 };
  }
  if (winning(reboard, hu)) {
    return { score: -1 };
  }
  if (availCells.length === 0) {
    return { score: 0 };
  }

  // ----- Recursive main code -----
  // Try all the possible movesets, get the score of each moveset
  let moves = [];
  for (let i = 0; i < availCells.length; i++) {
    let move = {};
    const cell = availCells[i];
    move.index = cell;
    const newboard = reboard.slice();
    newboard[cell] = player;
    move.score = minimax(newboard, player === ai ? hu : ai).score;

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

function emptyIndexes(reboard) {
  return reboard.filter(s => !isNaN(s));
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
