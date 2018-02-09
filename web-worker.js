var ai, hu;
const MAX_DEPTH = 20; // The board is 4x4 = 16, 20 level deep is a safe number

addEventListener('message', function(e) {
  var data = e.data;
  if (data.length && data[0] === 'start') {
    const params = JSON.parse(data[1]);
    ai = params.ai;
    hu = params.hu;
    const move = minimax(params.board, params.player, 0);
    postMessage(move.index);
  } else {
    postMessage('Unknown command: ' + data.msg);
  }
}, false);

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

function emptyIndexes(newBoard) {
  return newBoard.filter(s => !isNaN(s));
}

function five(a, b, c, d, e) {
  if (a === b && a === c && a === d && a === e) {
    return true;
  } else {
    return false;
  }
}
