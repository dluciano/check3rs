import type {
  BlackKing,
  BlackMen,
  EmptyCell,
  RedKing,
  RedMen,
  WhiteSpaceCell,
  bottomLeftDiagonal,
  bottomRightDiagonal,
  topLeftDiagonal,
  topRightDiagonal,
} from "./constants";

export type PlayerPieceColour = typeof RedMen | typeof BlackMen;
export type MenPiece = typeof BlackMen | typeof RedMen;
export type KingPiece = typeof BlackKing | typeof RedKing;
export type Piece = MenPiece | KingPiece;
export type CellContent = Piece | typeof WhiteSpaceCell | typeof EmptyCell;

export type Cell = { readonly row: number; readonly col: number };

export type MovePiece = {
  readonly from: Cell;
  readonly to: Cell;
};

export type CheckersBoard = readonly (readonly CellContent[])[];

export type MutableCheckerBoard = CellContent[][];

export type GameStats = {
  readonly blackRewards: number;
  readonly redRewards: number;
};

export type GameState = {
  readonly board: CheckersBoard;
  readonly flyingKing: boolean;
  readonly canCaptureBackward: boolean;
  readonly gameStats: GameStats;
  readonly currentPlayer: PlayerPieceColour;
  readonly winner?: PlayerPieceColour;
  readonly keepCapturingPiece?: Cell;
};

export type TopRightDiagonal = typeof topRightDiagonal;
export type BottomRightDiagonal = typeof bottomRightDiagonal;
export type BottomLeftDiagonal = typeof bottomLeftDiagonal;
export type TopLeftDiagonal = typeof topLeftDiagonal;
export type DiagonalDirection =
  | BottomRightDiagonal
  | BottomLeftDiagonal
  | TopLeftDiagonal
  | TopRightDiagonal;

export type DiagonalDirectionTuple = readonly [
  1 | -1,
  1 | -1,
  DiagonalDirection
];

export type CapturedCell = Cell & { content: CellContent };

export type MovePieceResult = {
  fromPiece: Piece;
  board: CheckersBoard;
  capturedCells: CapturedCell[];
  numberOfCapturedKings: number;
  numberOfCapturedMen: number;
  promotedToKing: boolean;
  isMenForwardStep: boolean;
};
