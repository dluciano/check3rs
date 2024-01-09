import {
  BottomLeftDiagonal,
  BottomRightDiagonal,
  TopLeftDiagonal,
  TopRightDiagonal,
  diagonalDirections,
  getDirectionOfCellMovement,
  isBlackMen,
  isEmpty,
  isEnemyPiece,
  isKing,
  isMenPiece,
  isRedMen,
} from "./isFunc";
import type { Cell, GameState, CellMovement, Board } from "./types";

export const isValidSingleStepForMen = (
  board: Board,
  cellMovement: CellMovement
) => {
  const ROWS = board.length;
  const COLS = board[0].length;
  const {
    from: { row: fromRow, col: fromCol },
    to: { row: toRow, col: toCol },
  } = cellMovement;
  const fromCell = board[fromRow][fromCol];
  if (!isMenPiece(fromCell)) return false;
  for (const direction of diagonalDirections) {
    const nextCell: Cell = {
      row: fromRow + direction[0],
      col: fromCol + direction[1],
    };

    if (
      nextCell.row >= 0 &&
      nextCell.row < ROWS &&
      nextCell.col >= 0 &&
      nextCell.col < COLS &&
      toRow === nextCell.row &&
      toCol === nextCell.col &&
      isEmpty(board[nextCell.row][nextCell.col])
    ) {
      if (
        (direction[2] === TopLeftDiagonal ||
          direction[2] === TopRightDiagonal) &&
        isBlackMen(fromCell)
      )
        return false;

      if (
        (direction[2] === BottomLeftDiagonal ||
          direction[2] === BottomRightDiagonal) &&
        isRedMen(fromCell)
      )
        return false;
      return true;
    }
  }
  return false;
};

export const isValidCaptureForMen = (
  { board, canCaptureBackward }: GameState,
  cellMovement: CellMovement
) => {
  const ROWS = board.length;
  const COLS = board[0].length;
  const {
    from: { row: fromRow, col: fromCol },
    to: { row: toRow, col: toCol },
  } = cellMovement;
  const fromCell = board[fromRow][fromCol];
  if (!isMenPiece(fromCell)) return false;
  const dir = getDirectionOfCellMovement(cellMovement);
  const direction = diagonalDirections[dir];

  const nextCell: Cell = {
    row: fromRow + direction[0],
    col: fromCol + direction[1],
  };

  const nextNextCell: Cell = {
    row: nextCell.row + direction[0],
    col: nextCell.col + direction[1],
  };

  if (
    nextNextCell.row >= 0 &&
    nextNextCell.row < ROWS &&
    nextNextCell.col >= 0 &&
    nextNextCell.col < COLS &&
    toRow === nextNextCell.row &&
    toCol === nextNextCell.col &&
    isEnemyPiece(fromCell, board[nextCell.row][nextCell.col]) &&
    isEmpty(board[nextNextCell.row][nextNextCell.col])
  ) {
    if (
      !canCaptureBackward &&
      (direction[2] === TopLeftDiagonal || direction[2] === TopRightDiagonal) &&
      isBlackMen(fromCell)
    )
      return false;

    if (
      !canCaptureBackward &&
      (direction[2] === BottomLeftDiagonal ||
        direction[2] === BottomRightDiagonal) &&
      isRedMen(fromCell)
    )
      return false;
    return true;
  }

  return false;
};

export const isValidKingMove = (
  { board, flyingKing }: GameState,
  {
    from: { row: fromRow, col: fromCol },
    to: { row: toRow, col: toCol },
  }: CellMovement
) => {
  const ROWS = board.length;
  const COLS = board[0].length;
  const fromCell = board[fromRow][fromCol];
  if (!isKing(fromCell)) return false;
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
          row = row + direction[0];
          col = col + direction[1];
          continue;
        }
      }
      if (toRow === row && toCol === col) return true;
      if (!flyingKing) break;
      row = row + direction[0];
      col = col + direction[1];
    }
  }
  return false;
};

export const isValidMove = (
  gameState: GameState,
  cellMovement: CellMovement
) => {
  const {
    from: { row: fromRow, col: fromCol },
  } = cellMovement;
  if (gameState.winner) return false;
  if (
    gameState.pieceThatMustKeepCapturing &&
    (gameState.pieceThatMustKeepCapturing.row !== fromRow ||
      gameState.pieceThatMustKeepCapturing.col !== fromCol)
  )
    return false;

  return (
    isValidSingleStepForMen(gameState.board, cellMovement) ||
    isValidCaptureForMen(gameState, cellMovement) ||
    isValidKingMove(gameState, cellMovement)
  );
};
