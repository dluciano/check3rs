import type {
  AiAlgorithm,
  BoardCell,
  Cell,
  GameState,
  PlayerPieceColour,
} from "@lib";
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

export type OnUpdateCell = (
  cell: Cell,
  boardCell: BoardCell,
  isSelected?: boolean,
  canMoveFrom?: boolean,
  canMoveTo?: boolean
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

export interface GameStoreState {
  boardSize: number;
  playerPieceColour: PlayerPieceColour;
  updates: OnUpdateCell[][];
  gameState: GameState;
  aiAlgorithm: AiAlgorithm;
  selectedCell?: Cell;
  gameStatus: "idle" | "playing" | "finish";
  aiPlayerPieceColour?: PlayerPieceColour;
  newGame: () => void;
  moveTo: (to: Cell) => GameState;
  setSelectedCell: (cell: Cell) => void;
  setSelectedCellForPlayer: (cell: Cell) => void;
  setUpdatableCell: (cell: Cell, update: OnUpdateCell) => void;
  initUpdatables: () => void;
  updateAll: () => void;
}

export interface P2PGameState {
  newGameP2PGame: () => Promise<void>;
  moveAndSend: (to: Cell) => Promise<boolean>;
  playFirstMoveIfAiIsFirstPlayer: () => void;
  newGameAgainstAi: () => void;
}
