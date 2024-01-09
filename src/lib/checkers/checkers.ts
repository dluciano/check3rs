import {
  diagonalDirections,
  getDirectionOfCellMovement,
  isBackwards,
  isBlackPiece,
  isEmpty,
  isEnemyPiece,
  isKing,
  isMenPiece,
  isPiece,
  isPlayerPiece,
  isRedPiece,
} from "./isFunc";
import {
  type PlayerPieceColour,
  type BoardCell,
  BlackMen,
  RedMen,
  EmptyCell,
  type Cell,
  type CellMovement,
  type GameState,
  type Board,
  RedKing,
  BlackKing,
} from "./types";
import { isValidMove } from "./isValidMoveForMen";
import { cloneDeep } from "lodash";

export const pieceHasAtLeastOneMove = (
  from: Cell,
  gameState: GameState
): boolean => {
  const { board } = gameState;
  const { row, col } = from;
  const piece = board[row][col];

  const cell: Cell = { row, col };
  if (isMenPiece(piece)) {
    const movementsForMen = getAllValidMovesForCurrentPlayerMen(
      gameState,
      cell
    );
    return movementsForMen.length > 0;
  }
  const movementsForKing = getAllValidMovesForCurrentPlayerKing(
    gameState,
    cell
  );
  return movementsForKing.length > 0;
};

const getValidCaptureMovementsForKing = (
  from: Cell,
  { board, flyingKing }: GameState
): CellMovement[] => {
  const movements: CellMovement[] = [];
  const ROWS = board.length;
  const COLS = board[0].length;
  const { row: fromRow, col: fromCol } = from;
  const fromCell = board[fromRow][fromCol];
  if (!isKing(fromCell)) return movements;
  if (!flyingKing) {
    for (const direction of diagonalDirections) {
      const to: Cell = {
        row: fromRow + direction[0],
        col: fromCol + direction[1],
      };
      const nextNext: Cell = {
        row: fromRow + direction[0] + direction[0],
        col: fromCol + direction[1] + direction[1],
      };
      if (
        nextNext.row < 0 ||
        nextNext.row >= ROWS ||
        nextNext.col < 0 ||
        nextNext.col >= COLS
      )
        continue;

      if (
        isEnemyPiece(fromCell, board[to.row][to.col]) &&
        isEmpty(board[nextNext.row][nextNext.col])
      )
        movements.push({ from, to: nextNext });
    }
    return movements;
  }

  for (const direction of diagonalDirections) {
    let row = fromRow + direction[0];
    let col = fromCol + direction[1];
    let killFound = false;

    while (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
      const nextBoardCell = board[row][col];
      if (!isEmpty(nextBoardCell)) {
        if (!isEnemyPiece(fromCell, nextBoardCell)) break;

        const nextNextCell: Cell = {
          row: row + direction[0],
          col: col + direction[1],
        };
        if (
          nextNextCell.row >= 0 &&
          nextNextCell.row < ROWS &&
          nextNextCell.col >= 0 &&
          nextNextCell.col < COLS &&
          isEmpty(board[nextNextCell.row][nextNextCell.col])
        ) {
          movements.push({ from, to: nextNextCell });
          row = nextNextCell.row;
          col = nextNextCell.col;
          killFound = true;
          continue;
        }
      }
      if (!flyingKing) break;
      if (killFound) movements.push({ from, to: { row, col } });
      row = row + direction[0];
      col = col + direction[1];
    }
  }
  return movements;
};

export const pieceHasAtLeastOneMoreCapture = (
  gameState: GameState,
  from: Cell
): boolean => {
  const { board, canCaptureBackward, flyingKing } = gameState;
  const ROWS = board.length;
  const COLS = board[0].length;
  const fromCell = board[from.row][from.col];

  if (isMenPiece(fromCell)) {
    for (const direction of diagonalDirections) {
      const r = from.row + direction[0];
      const c = from.col + direction[1];
      let r2 = from.row + direction[0] + direction[0];
      let c2 = from.col + direction[1] + direction[1];
      if (r2 < 0 || r2 >= ROWS || c2 < 0 || c2 >= COLS) continue;
      const nextCell = board[r][c];
      const nextNextCell = board[r2][c2];
      if (isEnemyPiece(fromCell, nextCell) && isEmpty(nextNextCell)) {
        if (
          isBackwards(board, { from, to: { row: r2, col: c2 } }) &&
          !canCaptureBackward
        )
          continue;
        return true;
      }
    }
  }

  const { row: fromRow, col: fromCol } = from;
  if (!flyingKing) {
    for (const direction of diagonalDirections) {
      const to: Cell = {
        row: fromRow + direction[0],
        col: fromCol + direction[1],
      };
      const nextNext: Cell = {
        row: fromRow + direction[0] + direction[0],
        col: fromCol + direction[1] + direction[1],
      };
      if (
        nextNext.row < 0 ||
        nextNext.row >= ROWS ||
        nextNext.col < 0 ||
        nextNext.col >= COLS
      )
        continue;
      if (
        isEnemyPiece(fromCell, board[to.row][to.col]) &&
        isEmpty(board[nextNext.row][nextNext.col])
      )
        return true;
    }
    return false;
  }
  for (const direction of diagonalDirections) {
    let row = fromRow + direction[0];
    let col = fromCol + direction[1];

    while (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
      const nextBoardCell = board[row][col];
      if (!isEmpty(nextBoardCell)) {
        if (!isEnemyPiece(fromCell, nextBoardCell)) break;

        const nextNextCell: Cell = {
          row: row + direction[0],
          col: col + direction[1],
        };
        if (
          nextNextCell.row >= 0 &&
          nextNextCell.row < ROWS &&
          nextNextCell.col >= 0 &&
          nextNextCell.col < COLS &&
          isEmpty(board[nextNextCell.row][nextNextCell.col])
        ) {
          return true;
        }
      }
      if (!flyingKing) break;
      row = row + direction[0];
      col = col + direction[1];
    }
  }
  return false;
};

const getAllValidMovesForCurrentPlayerMen = (
  gameState: GameState,
  from: Cell
): CellMovement[] => {
  const movements: CellMovement[] = [];
  if (!isMenPiece(gameState.board[from.row][from.col])) return movements;
  for (const direction of diagonalDirections) {
    const movement: CellMovement = {
      from,
      to: { row: from.row + direction[0], col: from.col + direction[1] },
    };

    if (isValidMove(gameState, movement)) movements.push(movement);

    const captureMovement: CellMovement = {
      from,
      to: {
        row: from.row + direction[0] + direction[0],
        col: from.col + direction[1] + direction[1],
      },
    };
    if (isValidMove(gameState, captureMovement))
      movements.push(captureMovement);
  }
  return movements;
};

const getAllValidMovesForCurrentPlayerKing = (
  { board, flyingKing }: GameState,
  from: Cell
): CellMovement[] => {
  const movements: CellMovement[] = [];
  const ROWS = board.length;
  const COLS = board[0].length;
  const { row: fromRow, col: fromCol } = from;
  const fromCell = board[fromRow][fromCol];
  if (!isKing(fromCell)) return movements;
  if (!flyingKing) {
    for (const direction of diagonalDirections) {
      const to: Cell = {
        row: fromRow + direction[0],
        col: fromCol + direction[1],
      };
      const nextNext: Cell = {
        row: fromRow + direction[0] + direction[0],
        col: fromCol + direction[1] + direction[1],
      };
      if (to.row < 0 || to.row >= ROWS || to.col < 0 || to.col >= COLS)
        continue;

      const toCell = board[to.row][to.col];
      if (isEmpty(toCell)) {
        movements.push({ from, to });
      }

      if (
        isEnemyPiece(fromCell, toCell) &&
        nextNext.row >= 0 &&
        nextNext.row < ROWS &&
        nextNext.col >= 0 &&
        nextNext.col < COLS &&
        isEmpty(board[nextNext.row][nextNext.col])
      ) {
        movements.push({ from, to: nextNext });
      }
    }
    return movements;
  }
  for (const direction of diagonalDirections) {
    let row = fromRow + direction[0];
    let col = fromCol + direction[1];

    while (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
      const nextBoardCell = board[row][col];
      if (!isEmpty(nextBoardCell)) {
        if (!isEnemyPiece(fromCell, nextBoardCell)) break;

        const nextNextCell: Cell = {
          row: row + direction[0],
          col: col + direction[1],
        };
        if (
          nextNextCell.row >= 0 &&
          nextNextCell.row < ROWS &&
          nextNextCell.col >= 0 &&
          nextNextCell.col < COLS &&
          isEmpty(board[nextNextCell.row][nextNextCell.col])
        ) {
          movements.push({ from, to: nextNextCell });
          row = row + direction[0];
          col = col + direction[1];
          continue;
        }
      }
      if (!flyingKing) break;
      movements.push({
        from,
        to: {
          row,
          col,
        },
      });
      row = row + direction[0];
      col = col + direction[1];
    }
  }
  return movements;
};

const getValidCaptureMovementsForMen = (
  from: Cell,
  gameState: GameState
): CellMovement[] => {
  const captures: CellMovement[] = [];
  const { board, canCaptureBackward } = gameState;
  const ROWS = board.length;
  const COLS = board[0].length;
  const fromCell = board[from.row][from.col];
  for (const direction of diagonalDirections) {
    const r = from.row + direction[0];
    const c = from.col + direction[1];
    let r2 = from.row + direction[0] + direction[0];
    let c2 = from.col + direction[1] + direction[1];
    if (r2 < 0 || r2 >= ROWS || c2 < 0 || c2 >= COLS) continue;
    const nextCell = board[r][c];
    const nextNextCell = board[r2][c2];
    if (isEnemyPiece(fromCell, nextCell) && isEmpty(nextNextCell)) {
      const movement = { from, to: { row: r2, col: c2 } };
      if (isBackwards(board, movement) && !canCaptureBackward) continue;
      captures.push(movement);
    }
  }
  return captures;
};

export const getAllValidMovesForCurrentPlayer = (
  gameState: GameState
): CellMovement[] => {
  const { board, currentPlayer, pieceThatMustKeepCapturing } = gameState;
  const cellMovements: CellMovement[] = [];
  if (pieceThatMustKeepCapturing) {
    const piece =
      board[pieceThatMustKeepCapturing.row][pieceThatMustKeepCapturing.col];
    if (isMenPiece(piece))
      return getValidCaptureMovementsForMen(
        pieceThatMustKeepCapturing,
        gameState
      );

    return getValidCaptureMovementsForKing(
      pieceThatMustKeepCapturing,
      gameState
    );
  }
  for (let row = 0; row < board.length; ++row) {
    for (let col = 0; col < board[0].length; ++col) {
      const piece = board[row][col];
      if (!isPlayerPiece(currentPlayer, piece)) continue;
      const cell: Cell = { row, col };
      if (isMenPiece(piece)) {
        const movementsForMen = getAllValidMovesForCurrentPlayerMen(
          gameState,
          cell
        );
        cellMovements.push(...movementsForMen);
        continue;
      }
      const movementsForKing = getAllValidMovesForCurrentPlayerKing(
        gameState,
        cell
      );
      cellMovements.push(...movementsForKing);
    }
  }
  return cellMovements;
};

type RewardPenalty = {
  reward: number;
  penalty: number;
};

export const calculateStats = (
  currentPlayer: PlayerPieceColour,
  numberOfCapturedMen: number,
  numberOfCapturedKings: number,
  isBackwardMove: boolean,
  isKing: boolean,
  keepCapturing: boolean,
  nextWinner: PlayerPieceColour | undefined,
  becomeKing: boolean
): {
  blackPlayerPoints: RewardPenalty;
  redPlayerPoints: RewardPenalty;
} => {
  const reward =
    (isKing ? 2 : isBackwardMove ? 1 : 2) +
    numberOfCapturedMen * 0.1 +
    numberOfCapturedKings * 0.4 +
    (keepCapturing ? 1 : 0) +
    (becomeKing ? 5 : 0);
  const penalty = -(
    numberOfCapturedMen * 0.1 +
    numberOfCapturedKings * 0.4 +
    (becomeKing ? 10 : 0)
  );
  if (isBlackPiece(currentPlayer)) {
    return {
      blackPlayerPoints: {
        reward,
        penalty: nextWinner && isRedPiece(nextWinner) ? -10000 : 0,
      },
      redPlayerPoints: {
        reward: 0,
        penalty:
          penalty + (nextWinner && isBlackPiece(nextWinner) ? -10000 : 0),
      },
    };
  }

  return {
    blackPlayerPoints: {
      reward: 0,
      penalty: penalty + (nextWinner && isRedPiece(nextWinner) ? -10000 : 0),
    },
    redPlayerPoints: {
      reward,
      penalty: nextWinner && isBlackPiece(nextWinner) ? -10000 : 0,
    },
  };
};

export const getWinner = (game: GameState): PlayerPieceColour | undefined => {
  const { board } = game;
  let canBlackMove = false;
  let canRedMove = false;
  for (let row = 0; row < board.length; ++row) {
    for (let col = 0; col < board[0].length; ++col) {
      const cell = board[row][col];
      if (!isPiece(cell)) continue;
      if (isBlackPiece(cell) && canBlackMove) continue;
      if (isRedPiece(cell) && canRedMove) continue;
      if (!pieceHasAtLeastOneMove({ row, col }, game)) continue;
      if (isBlackPiece(cell)) canBlackMove = true;
      if (isRedPiece(cell)) canRedMove = true;
      if (canBlackMove && canRedMove) break;
    }
  }
  if (!canRedMove) return BlackMen;
  if (!canBlackMove) return RedMen;
  return undefined;
};

export const move = (
  cellMovement: CellMovement,
  currentGameState: GameState
): {
  nextGameState: GameState;
  capturedPieces: Cell[];
  ai: {
    reward: number;
    nextPlayerPenalty: number;
  };
} => {
  const {
    board,
    pieceThatMustKeepCapturing,
    currentPlayer,
    canCaptureBackward,
    flyingKing,
    winner,
  } = currentGameState;
  const {
    from,
    to: { row: toRow, col: toCol },
  } = cellMovement;

  const { row: fromRow, col: fromCol } = from;
  if (winner)
    throw new Error(
      `Cannot move from: (${fromRow}, ${fromCol}) to: (${toRow},${toCol}) because the game the winner is: ${winner}`
    );
  if (
    pieceThatMustKeepCapturing &&
    (pieceThatMustKeepCapturing.row !== fromRow ||
      pieceThatMustKeepCapturing.col !== fromCol)
  )
    throw new Error(
      `Cannot move from: (${fromRow}, ${fromCol}) to: (${toRow},${toCol}) because piece on (${pieceThatMustKeepCapturing.row},${pieceThatMustKeepCapturing.col}) must keep capturing`
    );
  if (!isValidMove(currentGameState, cellMovement)) {
    //TODO: remove only for testing
    const x = getAllValidMovesForCurrentPlayer(currentGameState);
    //-----
    throw new Error(
      `Cannot move from: (${fromRow}, ${fromCol}) to: (${toRow},${toCol}) because it is not a valid move`
    );
  }

  const fromCell = board[fromRow][fromCol];
  const ROWS = board.length;
  const COLS = board.length;
  const directionIndex = getDirectionOfCellMovement(cellMovement); // assume the top right diagonal is the index

  if (directionIndex >= diagonalDirections.length)
    throw new Error(
      `Cannot move from: (${fromRow}, ${fromCol}) to: (${toRow},${toCol}) because the move is invalid. The move direction cannot determined`
    );

  const direction = diagonalDirections[directionIndex];

  let numberOfCapturedMen = 0;
  let numberOfCapturedKings = 0;
  const becomeKing = !isMenPiece(fromCell)
    ? false
    : isRedPiece(fromCell)
    ? toRow === 0
    : toRow === board.length - 1;
  const capturedPieces: Cell[] = [];
  const isBackwardMove = isBackwards(board, cellMovement);

  const nextBoard = cloneDeep(board) as BoardCell[][];
  let row = fromRow + direction[0];
  let col = fromCol + direction[1];

  while (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
    const cell = nextBoard[row][col];
    if (isEnemyPiece(fromCell, cell)) {
      if (isMenPiece(cell)) numberOfCapturedMen++;
      if (isKing(cell)) numberOfCapturedKings++;
      capturedPieces.push({ row, col });
    }
    nextBoard[row][col] = EmptyCell;
    if (toRow === row && toCol === col) break;
    row = row + direction[0];
    col = col + direction[1];
  }

  nextBoard[toRow][toCol] = becomeKing
    ? isRedPiece(fromCell)
      ? RedKing
      : BlackKing
    : fromCell;
  nextBoard[fromRow][fromCol] = EmptyCell;

  // ---- these must be called after updating the board ----
  const tempGameState: GameState = {
    board: nextBoard,
    flyingKing,
    canCaptureBackward,
    blackPlayerStats: {
      reward: currentGameState.blackPlayerStats.reward,
      penalty: currentGameState.blackPlayerStats.penalty,
      numberOfCapturedPieces: isBlackPiece(fromCell)
        ? numberOfCapturedMen + numberOfCapturedMen
        : currentGameState.blackPlayerStats.numberOfCapturedPieces,
    },
    redPlayerStats: {
      reward: currentGameState.redPlayerStats.reward,
      penalty: currentGameState.redPlayerStats.penalty,
      numberOfCapturedPieces: isRedPiece(fromCell)
        ? numberOfCapturedMen + numberOfCapturedMen
        : currentGameState.blackPlayerStats.numberOfCapturedPieces,
    },
    currentPlayer: currentGameState.currentPlayer,
    winner: undefined,
    pieceThatMustKeepCapturing: currentGameState.pieceThatMustKeepCapturing,
  };

  const keepCapturing =
    capturedPieces.length === 0
      ? false
      : pieceHasAtLeastOneMoreCapture(tempGameState, cellMovement.to);
  const nextWinner = getWinner(tempGameState);
  const nextPlayer = keepCapturing
    ? currentPlayer
    : isBlackPiece(fromCell)
    ? RedMen
    : BlackMen;
  const nextPieceThatMustKeepCapturing = nextWinner
    ? undefined
    : keepCapturing
    ? cellMovement.to
    : undefined;

  const { blackPlayerPoints, redPlayerPoints } = calculateStats(
    currentGameState.currentPlayer,
    numberOfCapturedMen,
    numberOfCapturedKings,
    isBackwardMove,
    isKing(fromCell),
    keepCapturing,
    nextWinner,
    becomeKing
  );

  const nextGameState: GameState = {
    board: nextBoard,
    flyingKing,
    canCaptureBackward,
    blackPlayerStats: {
      reward:
        currentGameState.blackPlayerStats.reward + blackPlayerPoints.reward,
      penalty:
        currentGameState.blackPlayerStats.penalty + blackPlayerPoints.penalty,
      numberOfCapturedPieces: isBlackPiece(fromCell)
        ? numberOfCapturedMen + numberOfCapturedMen
        : currentGameState.blackPlayerStats.numberOfCapturedPieces,
    },
    redPlayerStats: {
      reward: currentGameState.redPlayerStats.reward + redPlayerPoints.reward,
      penalty:
        currentGameState.redPlayerStats.penalty + redPlayerPoints.penalty,
      numberOfCapturedPieces: isRedPiece(fromCell)
        ? numberOfCapturedMen + numberOfCapturedMen
        : currentGameState.blackPlayerStats.numberOfCapturedPieces,
    },
    currentPlayer: nextPlayer,
    winner: nextWinner,
    pieceThatMustKeepCapturing: nextPieceThatMustKeepCapturing,
  };

  return {
    nextGameState,
    capturedPieces,
    ai: {
      //TODO: add the reward/penalty for RL AI
      reward: 0,
      nextPlayerPenalty: 0,
    },
  };
};

// [
//   [".", "x", ".", "x", ".", "x", ".", "x"],
//   ["x", ".", "x", ".", "x", ".", "x", "."],
//   [".", "x", ".", "x", ".", "x", ".", "x"],
//   ["x", ".", "x", ".", "x", ".", "x", "."],
//   [".", "x", ".", "x", ".", "x", ".", "x"],
//   ["x", ".", "x", ".", "x", ".", "x", "."],
//   [".", "x", ".", "x", ".", "x", ".", "x"],
//   ["x", ".", "x", ".", "x", ".", "x", "."],
// ];

export const emptyBoard: Board = [
  [".", "x", ".", "x", ".", "x", ".", "x"],
  ["x", "r", "x", ".", "x", ".", "x", "."],
  [".", "x", ".", "x", ".", "x", ".", "x"],
  ["x", "r", "x", "r", "x", "r", "x", "."],
  [".", "x", ".", "x", ".", "x", ".", "x"],
  ["x", ".", "x", ".", "x", "r", "x", "."],
  [".", "x", ".", "x", ".", "x", ".", "x"],
  ["x", ".", "x", ".", "x", ".", "x", "B"],
];
// [
//   [
//     BlackMen,
//     WhiteSpaceCell,
//     BlackMen,
//     WhiteSpaceCell,
//     BlackMen,
//     WhiteSpaceCell,
//     BlackMen,
//     WhiteSpaceCell,
//   ],
//   [
//     WhiteSpaceCell,
//     BlackMen,
//     WhiteSpaceCell,
//     BlackMen,
//     WhiteSpaceCell,
//     BlackMen,
//     WhiteSpaceCell,
//     BlackMen,
//   ],
//   [
//     BlackMen,
//     WhiteSpaceCell,
//     BlackMen,
//     WhiteSpaceCell,
//     BlackMen,
//     WhiteSpaceCell,
//     BlackMen,
//     WhiteSpaceCell,
//   ],
//   [
//     WhiteSpaceCell,
//     EmptyCell,
//     WhiteSpaceCell,
//     EmptyCell,
//     WhiteSpaceCell,
//     EmptyCell,
//     WhiteSpaceCell,
//     EmptyCell,
//   ],
//   [
//     EmptyCell,
//     WhiteSpaceCell,
//     EmptyCell,
//     WhiteSpaceCell,
//     EmptyCell,
//     WhiteSpaceCell,
//     EmptyCell,
//     WhiteSpaceCell,
//   ],
//   [
//     WhiteSpaceCell,
//     RedMen,
//     WhiteSpaceCell,
//     RedMen,
//     WhiteSpaceCell,
//     RedMen,
//     WhiteSpaceCell,
//     RedMen,
//   ],
//   [
//     RedMen,
//     WhiteSpaceCell,
//     RedMen,
//     WhiteSpaceCell,
//     RedMen,
//     WhiteSpaceCell,
//     RedMen,
//     WhiteSpaceCell,
//   ],
//   [
//     WhiteSpaceCell,
//     RedMen,
//     WhiteSpaceCell,
//     RedMen,
//     WhiteSpaceCell,
//     RedMen,
//     WhiteSpaceCell,
//     RedMen,
//   ],
// ];
