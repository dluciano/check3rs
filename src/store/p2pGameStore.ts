import type { StateCreator } from "zustand";
import {
  BlackMen,
  emptyBoard,
  RedMen,
  type GameState,
  type P2PConnectionState,
  type P2PGameState,
  type P2PMessage,
  type NewGameP2PMessageType,
  type MoveToP2PMessageType,
} from "./types";

export const createP2PGameStoreSlice: StateCreator<
  GameState & P2PConnectionState,
  [],
  [],
  P2PGameState
> = (_, get) => ({
  newGameP2PGame: async (canCaptureBackwards, flyingKing) => {
    const messagesHandler = async (message: P2PMessage) => {
      if (message.type === "NewGameP2PMessageType") {
        const gameState: GameState = get();
        gameState.newGame(
          emptyBoard,
          RedMen,
          BlackMen,
          message.canCaptureBackwards,
          message.flyingKing,
          true
        );
      } else if (message.type === "MoveToP2PMessage") {
        get().move(
          message.fromRow,
          message.fromCol,
          message.toRow,
          message.toCol,
          true
        );
      } else throw new Error(`Cannot handle message of unknown type`);
    };
    await get().connect(messagesHandler, async () => {
      get().newGame(
        emptyBoard,
        BlackMen,
        BlackMen,
        canCaptureBackwards,
        flyingKing,
        true
      );
      const newGameMessage: NewGameP2PMessageType = {
        canCaptureBackwards,
        flyingKing,
        type: "NewGameP2PMessageType",
      };
      await get().sendMessage(newGameMessage);
    });
  },
  moveAndSend: async (fromRow, fromCol, toRow, toCol) => {
    if (fromRow === -Infinity && fromCol === -Infinity) {
      const selectedPiece = get().selectedPiece;
      if (!selectedPiece) return false;
      fromRow = selectedPiece.row;
      fromCol = selectedPiece.col;
    }

    const canMove = get().move(fromRow, fromCol, toRow, toCol, false);

    if (canMove && get().isP2PGame) {
      const message: MoveToP2PMessageType = {
        fromRow,
        fromCol,
        toRow,
        toCol,
        type: "MoveToP2PMessage",
      };
      await get().sendMessage(message);
    }

    return canMove;
  }
});
