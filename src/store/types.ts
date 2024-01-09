import type {
  Cell,
  CheckersBoard,
  GameState,
  MovePiece,
  PlayerPieceColour,
} from "@lib";

export interface GameStoreState {
  readonly initialBoard: CheckersBoard;
  readonly gameState: GameState;
  readonly myPlayerPieceColour: PlayerPieceColour;
  selectedCell?: Cell;
  canMoveTo: Cell[];
  firstPlayer: PlayerPieceColour;
  validMoves: MovePiece[];
  setInitialBoard: (board: CheckersBoard) => void;
  setSelectedCell: (cell: Cell) => void;
  newGame: () => void;
  moveToCell: (to: Cell) => void;
}

export interface MultiplayerStoreState {
  onMove: () => Promise<void>;
  play: (to: Cell) => Promise<void>;
  setOnMove: (onMove: () => Promise<void>) => void;
}
