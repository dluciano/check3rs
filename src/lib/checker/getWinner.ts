import {
  isPiece,
  type CheckersBoard,
  type PlayerPieceColour,
  getKMoves,
  type Cell,
  isBlackPiece,
  BlackMen,
  RedMen,
  isRedPiece,
} from ".";

export const getWinner = (
  board: CheckersBoard,
  flyingKing: boolean,
  canCaptureBackward: boolean,
  currentPlayer: PlayerPieceColour
): PlayerPieceColour | undefined => {
  const ROWS = board.length;
  const COLS = board[0].length;
  let canBlackMove = false;
  let canRedMove = false;
  let hasBlack = false;
  let hasRed = false;

  for (let row = 0; row < ROWS; ++row) {
    for (let col = 0; col < COLS; ++col) {
      if (canBlackMove && canRedMove) break;

      const fromCell: Cell = { row, col };
      const fromCellContent = board[fromCell.row][fromCell.col];
      if (!isPiece(fromCellContent)) continue;
      const isBlackPiecePlayer = isBlackPiece(fromCellContent);

      if (isBlackPiecePlayer) hasBlack = true;
      else hasRed = true;
      const canMove =
        getKMoves(
          board,
          currentPlayer,
          flyingKing,
          canCaptureBackward,
          fromCell,
          false,
          1
        ).length >= 1;
      if (canMove && isBlackPiece(fromCellContent)) canBlackMove = true;
      else if (canMove && isRedPiece(fromCellContent)) canRedMove = true;
    }
    if (canBlackMove && canRedMove) break;
  }

  if (!hasRed || (!canRedMove && isRedPiece(currentPlayer))) return BlackMen;
  if (!hasBlack || (!canBlackMove && isBlackPiece(currentPlayer)))
    return RedMen;

  return undefined;
};
