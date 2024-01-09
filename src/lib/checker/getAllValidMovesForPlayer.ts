import {
  isPiece,
  type CheckersBoard,
  type MovePiece,
  type PlayerPieceColour,
  isEnemyPiece,
  type Cell,
} from ".";
import { getKMoves } from "./getKMoves";

export const getAllValidMovesForPlayer = (
  board: CheckersBoard,
  player: PlayerPieceColour,
  flyingKing: boolean,
  canCaptureBackward: boolean
): MovePiece[] => {
  const ROWS = board.length;
  const COLS = board[0].length;
  const moves: MovePiece[] = [];
  for (let row = 0; row < ROWS; ++row) {
    for (let col = 0; col < COLS; ++col) {
      const fromCell: Cell = { row, col };
      const fromCellContent = board[fromCell.row][fromCell.col];
      if (!isPiece(fromCellContent) || isEnemyPiece(fromCellContent, player))
        continue;

      moves.push(
        ...getKMoves(board, player, flyingKing, canCaptureBackward, fromCell)
      );
    }
  }
  return moves;
};
