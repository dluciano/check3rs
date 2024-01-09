export const WhiteSpaceCell = "x";
export const BlackMen = "b";
export const BlackKing = "B";
export const RedMen = "r";
export const RedKing = "R";
export const EmptyCell = ".";
export type PlayerPieceColour = typeof RedMen | typeof BlackMen;
export type MenPiece = typeof BlackMen | typeof RedMen;
export type KingPiece = typeof BlackKing | typeof RedKing;
export type PieceType = MenPiece | KingPiece;
export type BoardCell = PieceType | typeof WhiteSpaceCell | typeof EmptyCell;

export type Cell = { readonly row: number; readonly col: number };

export type CellMovement = {
  readonly from: Cell;
  readonly to: Cell;
};

export type Board = readonly (readonly BoardCell[])[];

export type GameStats = {
  readonly reward: number;
  readonly penalty: number;
  readonly numberOfCapturedPieces: number;
};

export type GameState = {
  readonly board: Board;
  readonly flyingKing: boolean;
  readonly canCaptureBackward: boolean;
  readonly blackPlayerStats: GameStats;
  readonly redPlayerStats: GameStats;
  readonly currentPlayer: PlayerPieceColour;
  readonly winner?: PlayerPieceColour;
  readonly pieceThatMustKeepCapturing?: Cell;
};
type TopRightDiagonal = 0;
type BottomRightDiagonal = 1;
type BottomLeftDiagonal = 2;
type TopLeftDiagonal = 3;
export type DiagonalDirection =
  | BottomRightDiagonal
  | BottomLeftDiagonal
  | TopLeftDiagonal
  | TopRightDiagonal;
