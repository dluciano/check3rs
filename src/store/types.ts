import type { LibP2PLogLevel } from "../lib/p2p";
import { boolean, number, z } from "zod";

export const NewGameP2PMessage = z.object({
  canCaptureBackwards: boolean(),
  flyingKing: boolean(),
});

export type NewGameP2PMessageType = z.infer<typeof NewGameP2PMessage> & {
  type: "NewGameP2PMessageType";
};

export const MoveToP2PMessage = z.object({
  fromRow: number().nonnegative(),
  fromCol: number().nonnegative(),
  toRow: number().nonnegative(),
  toCol: number().nonnegative(),
});

export type MoveToP2PMessageType = z.infer<typeof MoveToP2PMessage> & {
  type: "MoveToP2PMessage";
};

export type P2PMessage = NewGameP2PMessageType | MoveToP2PMessageType;

export type Cell = { row: number; col: number };
export type FromCellToCell = {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
};
export const WhiteSpaceCell = "x";
export const BlackMen = "b";
export const BlackKing = "B";
export const RedMen = "r";
export const RedKing = "R";
export const EmptyCell = ".";
export type PlayerPieceColour = typeof RedMen | typeof BlackMen;
export type MenPiece = typeof BlackMen | typeof RedMen;
export type PieceType =
  | typeof BlackMen
  | typeof BlackKing
  | typeof RedMen
  | typeof RedKing;
export type BoardCell = PieceType | typeof WhiteSpaceCell | typeof EmptyCell;

export type UpdateableCell = (
  row: number,
  col: number,
  cell: BoardCell,
  isSelected?: boolean
) => void;

export interface P2PConnectionState {
  logLevel: LibP2PLogLevel;
  isLogOn: boolean;
  connectionStatus: "initial" | "connected" | "stopped";
  messages: P2PMessage[];
  connect: (
    onMessage: (message: P2PMessage) => Promise<void>,
    onPeerDiscovered: (otherPeerId: string) => Promise<void>
  ) => Promise<void>;
  sendMessage: (value: P2PMessage) => Promise<void>;
  disconnect: () => Promise<void>;
  setIsLogOn: (isLogOn: boolean) => void;
  setLogLevel: (logLevel: LibP2PLogLevel) => void;
}

export interface GameState {
  board: BoardCell[][];
  playerPieceColour: PlayerPieceColour;
  capturedPieces: Record<MenPiece, number>;
  currentPlayer: PlayerPieceColour;
  updates: UpdateableCell[][];
  canCaptureBackwards: boolean;
  flyingKing: boolean;
  selectedPiece?: Cell;
  winner: PlayerPieceColour | undefined;
  gameState: "idle" | "playing" | "finish";
  boardSize: number;
  continuesCapture?: Cell;
  isP2PGame: boolean;
  newGame: (
    initialBoard: BoardCell[][],
    playerPieceColour: PlayerPieceColour,
    currentPlayer: PlayerPieceColour,
    canCaptureBackwards: boolean,
    flyingKing: boolean,
    isP2PGame: boolean
  ) => void;
  move: (
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
    isRemoteGameState: boolean
  ) => boolean;
  setSelectedPiece: (row: number, col: number) => void;
  setUpdatableCell: (row: number, col: number, update: UpdateableCell) => void;
  initUpdatables: () => void;
  updateAll: () => void;
}

export interface P2PGameState {
  newGameP2PGame: (
    canCaptureBackwards: boolean,
    flyingKing: boolean
  ) => Promise<void>;
  moveAndSend: (
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number
  ) => Promise<boolean>;
}

export interface UserSession {
  userId: string;
  userName: string;
  isSessionLoaded: boolean;
  configureSession: () => Promise<void>;
}

export const emptyBoard: BoardCell[][] = [
  [
    BlackMen,
    WhiteSpaceCell,
    BlackMen,
    WhiteSpaceCell,
    BlackMen,
    WhiteSpaceCell,
    BlackMen,
    WhiteSpaceCell,
  ],
  [
    WhiteSpaceCell,
    BlackMen,
    WhiteSpaceCell,
    BlackMen,
    WhiteSpaceCell,
    BlackMen,
    WhiteSpaceCell,
    BlackMen,
  ],
  [
    BlackMen,
    WhiteSpaceCell,
    BlackMen,
    WhiteSpaceCell,
    BlackMen,
    WhiteSpaceCell,
    BlackMen,
    WhiteSpaceCell,
  ],
  [
    WhiteSpaceCell,
    EmptyCell,
    WhiteSpaceCell,
    EmptyCell,
    WhiteSpaceCell,
    EmptyCell,
    WhiteSpaceCell,
    EmptyCell,
  ],
  [
    EmptyCell,
    WhiteSpaceCell,
    EmptyCell,
    WhiteSpaceCell,
    EmptyCell,
    WhiteSpaceCell,
    EmptyCell,
    WhiteSpaceCell,
  ],
  [
    WhiteSpaceCell,
    RedMen,
    WhiteSpaceCell,
    RedMen,
    WhiteSpaceCell,
    RedMen,
    WhiteSpaceCell,
    RedMen,
  ],
  [
    RedMen,
    WhiteSpaceCell,
    RedMen,
    WhiteSpaceCell,
    RedMen,
    WhiteSpaceCell,
    RedMen,
    WhiteSpaceCell,
  ],
  [
    WhiteSpaceCell,
    RedMen,
    WhiteSpaceCell,
    RedMen,
    WhiteSpaceCell,
    RedMen,
    WhiteSpaceCell,
    RedMen,
  ],
];
