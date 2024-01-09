import { BlackMen, BlackKing, EmptyCell, RedKing, RedMen } from "./constants";
import {
  type CellContent,
  type PlayerPieceColour,
  type MovePiece,
  type CheckersBoard,
} from "./types";

export const isRedMen = (cell: CellContent) => cell === RedMen;

export const isBlackMen = (cell: CellContent) => cell === BlackMen;

export const isBlackPiece = (cell: CellContent) =>
  cell === BlackMen || cell === BlackKing;

export const isRedPiece = (cell: CellContent) =>
  cell === RedMen || cell === RedKing;

export const isMenPiece = (cell: CellContent) =>
  isBlackMen(cell) || isRedMen(cell);

export const isBlackKing = (cell: CellContent) => cell === BlackKing;

export const isRedKing = (cell: CellContent) => cell === RedKing;

export const isKing = (cell: CellContent) =>
  isBlackKing(cell) || isRedKing(cell);

export const isEmptyCell = (cell: CellContent) => cell === EmptyCell;

export const isPiece = (cell: CellContent) => isMenPiece(cell) || isKing(cell);

export const isEnemyPiece = (cell: CellContent, otherCell: CellContent) =>
  (isBlackPiece(cell) && isRedPiece(otherCell)) ||
  (isRedPiece(cell) && isBlackPiece(otherCell));

export const isBackwardMove = (
  board: CheckersBoard,
  move: MovePiece
): boolean => {
  const cell = board[move.from.row][move.from.col];
  const fromRow = move.from.row;
  const toRow = move.to.row;
  if (isBlackPiece(cell) && toRow < fromRow) return true;
  else if (isRedPiece(cell) && toRow > fromRow) return true;
  return false;
};

export const isPlayerPiece = (
  playerPieceColour: PlayerPieceColour,
  cell: CellContent
) => (playerPieceColour === BlackMen ? isBlackPiece(cell) : isRedPiece(cell));

export const isMenPromotionCell = (
  boardLength: number,
  move: MovePiece,
  fromPiece: Piece
): boolean => {
  if (isBlackMen(fromPiece) && move.to.row === boardLength - 1) return true;
  if (isRedMen(fromPiece) && move.to.row === 0) return true;
  return false;
};
