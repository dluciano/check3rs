import {
  BlackKing,
  BlackMen,
  EmptyCell,
  RedKing,
  RedMen,
  type BoardCell,
  type PlayerPieceColour,
  type CellMovement,
  type DiagonalDirection,
  type Board,
} from "./types";

export const TopRightDiagonal = 0;
export const BottomRightDiagonal = 1;
export const BottomLeftDiagonal = 2;
export const TopLeftDiagonal = 3;

type DiagonalDirectionTuple = [1 | -1, 1 | -1, DiagonalDirection];

export const diagonalDirections: readonly DiagonalDirectionTuple[] = [
  [-1, 1, TopRightDiagonal],
  [1, 1, BottomRightDiagonal],
  [1, -1, BottomLeftDiagonal],
  [-1, -1, TopLeftDiagonal],
] as const;

export const isRedMen = (cell: BoardCell) => cell === RedMen;

export const isBlackMen = (cell: BoardCell) => cell === BlackMen;

export const isBlackPiece = (cell: BoardCell) =>
  cell === BlackMen || cell === BlackKing;

export const isRedPiece = (cell: BoardCell) =>
  cell === RedMen || cell === RedKing;

export const isMenPiece = (cell: BoardCell) =>
  isBlackMen(cell) || isRedMen(cell);

export const isBlackKing = (cell: BoardCell) => cell === BlackKing;

export const isRedKing = (cell: BoardCell) => cell === RedKing;

export const isKing = (cell: BoardCell) => isBlackKing(cell) || isRedKing(cell);

export const isEmpty = (cell: BoardCell) => cell === EmptyCell;

export const isPiece = (cell: BoardCell) => isMenPiece(cell) || isKing(cell);

export const isEnemyPiece = (cell: BoardCell, otherCell: BoardCell) =>
  (isBlackPiece(cell) && isRedPiece(otherCell)) ||
  (isRedPiece(cell) && isBlackPiece(otherCell));

export const isBackwards = (
  board: Board,
  cellMovement: CellMovement
): boolean => {
  const cell = board[cellMovement.from.row][cellMovement.from.col];
  const fromRow = cellMovement.from.row;
  const toRow = cellMovement.to.row;
  if (isBlackPiece(cell) && toRow < fromRow) return true;
  else if (isRedPiece(cell) && toRow > fromRow) return true;
  return false;
};

export const isPlayerPiece = (
  playerPieceColour: PlayerPieceColour,
  cell: BoardCell
) => {
  if (playerPieceColour === BlackMen) return isBlackPiece(cell);
  else if (playerPieceColour === RedMen) return isRedPiece(cell);
  return false;
};

export const getDirectionOfCellMovement = ({
  from: { row: fromRow, col: fromCol },
  to: { row: toRow, col: toCol },
}: CellMovement): DiagonalDirection => {
  if (toRow > fromRow && toCol > fromCol) return BottomRightDiagonal;
  else if (toRow > fromRow && toCol < fromCol) return BottomLeftDiagonal;
  else if (toRow < fromRow && toCol < fromCol) return TopLeftDiagonal;
  return TopRightDiagonal;
};

