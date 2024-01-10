import {
  isPiece,
  type CheckersBoard,
  type MovePiece,
  type PlayerPieceColour,
  isEnemyPiece,
  type Cell,
  type ValidMovePiece,
} from ".";
import { getKMoves } from "./getKMoves";

export const getAllValidMovesForPlayer = (
  board: CheckersBoard,
  player: PlayerPieceColour,
  flyingKing: boolean,
  canCaptureBackward: boolean,
  mustCapture: boolean
): MovePiece[] => {
  const ROWS = board.length;
  const COLS = board[0].length;
  const validMovesTmp: ValidMovePiece[] = [];
  let hasCaptures = false;
  for (let row = 0; row < ROWS; ++row) {
    for (let col = 0; col < COLS; ++col) {
      const fromCell: Cell = { row, col };
      const fromCellContent = board[fromCell.row][fromCell.col];
      if (!isPiece(fromCellContent) || isEnemyPiece(fromCellContent, player))
        continue;
      const { moves, hasAtLeastOneCapture } = getKMoves(
        board,
        player,
        flyingKing,
        canCaptureBackward,
        fromCell
      );
      if (hasAtLeastOneCapture) hasCaptures = true;
      validMovesTmp.push(...moves);
    }
  }
  if (mustCapture && hasCaptures) {
    return validMovesTmp.filter((v) => v.belongsToDiagonalCapturePath);
  }
  return validMovesTmp;
};
