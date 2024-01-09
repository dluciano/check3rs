import {
  type DiagonalDirectionTuple,
  topRightDiagonal,
  bottomRightDiagonal,
  bottomLeftDiagonal,
  topLeftDiagonal,
  type MovePiece,
  type DiagonalDirection,
} from ".";

export const diagonalDirections: readonly DiagonalDirectionTuple[] = [
  [-1, 1, topRightDiagonal],
  [1, 1, bottomRightDiagonal],
  [1, -1, bottomLeftDiagonal],
  [-1, -1, topLeftDiagonal],
] as const;

export const getDirectionOfMovePiece = ({
  from: { row: fromRow, col: fromCol },
  to: { row: toRow, col: toCol },
}: MovePiece): DiagonalDirection => {
  if (toRow > fromRow && toCol > fromCol) return bottomRightDiagonal;
  else if (toRow > fromRow && toCol < fromCol) return bottomLeftDiagonal;
  else if (toRow < fromRow && toCol < fromCol) return topLeftDiagonal;
  return topRightDiagonal;
};
