import {
  type Cell,
  type PlayerPieceColour,
  type MovePiece,
  type GameState,
} from "lib/checker";
import { minMaxAi } from "./minMax";

export type AIAlgorithm = "minmax" | "RL-1";

export const ai = {
  play: (
    gameState: GameState,
    initialCell: Cell | undefined,
    aiPlayerPieceColour: PlayerPieceColour,
    aiAlgorithm: AIAlgorithm
  ): MovePiece => {
    if (aiAlgorithm === "minmax")
      return minMaxAi(
        gameState.board,
        initialCell,
        aiPlayerPieceColour,
        gameState.flyingKing,
        gameState.canCaptureBackward,
        gameState.mustCapture,
        gameState.gameStats,
        8
      );

    throw new Error(`AI ${aiAlgorithm} algorithm not implemented yet`);
  },
};
