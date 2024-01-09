import type { StateCreator } from "zustand";
import { type GameStoreState, type MultiplayerStoreState } from "./types";
import {
  moveToCell,
  type GameState,
  type MovePiece,
  getWinner,
  getNextPlayerAndKeepCapturePiece,
  getStatsForMoveResult,
  isBlackPiece,
  isRedPiece,
  getKMoves,
  ai,
  getOpponentPlayerPieceColour,
  wait,
} from "@lib";

export const createMultiplayerStoreSlice: StateCreator<
  GameStoreState & MultiplayerStoreState,
  [],
  [],
  MultiplayerStoreState
> = (set, get) => ({
  onMove: () => {},
  setOnMove: (onMove) => {
    set((state) => ({ onMove }));
  },
  play: async (to) => {
    const {
      onMove,
      setSelectedCell,
      gameState,
      myPlayerPieceColour,
      moveToCell,
    } = get();

    if (gameState.currentPlayer === myPlayerPieceColour) {
      moveToCell(to);
      await onMove();
    }
    let currentGameState = get().gameState;
    const aiPlayerPieceColour =
      getOpponentPlayerPieceColour(myPlayerPieceColour);

    while (
      currentGameState.currentPlayer === aiPlayerPieceColour &&
      !currentGameState.winner
    ) {
      const bestMove = ai.play(
        currentGameState,
        currentGameState.keepCapturingPiece,
        aiPlayerPieceColour,
        "minmax"
      );
      await wait(500);
      setSelectedCell(bestMove.from);
      await wait(500);
      moveToCell(bestMove.to);
      currentGameState = get().gameState;
      await onMove();
    }
  },
});
