import type { StateCreator } from "zustand";
import { type GameStoreState, type MultiplayerStoreState } from "./types";
import {
  BlackMen,
  moveToCell,
  type GameState,
  type MovePiece,
  getWinner,
  getNextPlayerAndKeepCapturePiece,
  getStatsForMoveResult,
  isBlackPiece,
  isRedPiece,
  getKMoves,
  RedMen,
} from "@lib";
import { cloneDeep } from "lodash";
import { getAllValidMovesForPlayer } from "@lib";

export const createGameStoreSlice: StateCreator<
  GameStoreState & MultiplayerStoreState,
  [],
  [],
  GameStoreState
> = (set, state) => ({
  initialBoard: [],
  myPlayerPieceColour: RedMen,
  firstPlayer: RedMen,
  selectedCell: undefined,
  canMoveTo: [],
  validMoves: [],
  gameState: {
    currentPlayer: BlackMen,
    board: [],
    winner: undefined,
    keepCapturingPiece: undefined,
    canCaptureBackward: true,
    flyingKing: true,
    mustCapture: true,
    gameStats: {
      blackRewards: 0,
      redRewards: 0,
    },
  },
  newGame: () => {
    const { firstPlayer, initialBoard, gameState } = state();
    const initialGameState: GameState = {
      ...gameState,
      currentPlayer: firstPlayer,
      board: cloneDeep(initialBoard),
      keepCapturingPiece: undefined,
      winner: undefined,
      gameStats: {
        blackRewards: 0,
        redRewards: 0,
      },
    };
    const validMoves = getAllValidMovesForPlayer(
      initialGameState.board,
      initialGameState.currentPlayer,
      initialGameState.flyingKing,
      initialGameState.canCaptureBackward,
      initialGameState.mustCapture
    );
    set(() => ({
      validMoves: validMoves,
      gameState: { ...initialGameState },
    }));
  },
  setInitialBoard: (initialBoard) => {
    set(() => ({
      initialBoard: initialBoard,
    }));
  },
  setSelectedCell: (cell) => {
    set(() => ({
      selectedCell: cell,
    }));
  },
  moveToCell: (to) => {
    const { selectedCell, gameState, myPlayerPieceColour } = state();

    if (!selectedCell)
      throw new Error(
        `cannot move to: (${to.row},${to.col}) because there is not a 'from' piece selected`
      );

    const move: MovePiece = { from: selectedCell, to };

    const moveResult = moveToCell(gameState.board, move, false);

    const { nextPlayer, pieceThatMustKeepCapturing } =
      getNextPlayerAndKeepCapturePiece(
        moveResult,
        move,
        moveResult.board,
        gameState.currentPlayer,
        gameState.flyingKing,
        gameState.canCaptureBackward,
        gameState.mustCapture
      );

    const winner = getWinner(
      moveResult.board,
      gameState.flyingKing,
      gameState.canCaptureBackward,
      gameState.mustCapture,
      nextPlayer
    );

    const rewards = getStatsForMoveResult(
      moveResult,
      pieceThatMustKeepCapturing !== undefined
    );

    const blackRewards = isBlackPiece(gameState.currentPlayer)
      ? gameState.gameStats.blackRewards + rewards
      : gameState.gameStats.blackRewards;
    const redRewards = isRedPiece(gameState.currentPlayer)
      ? gameState.gameStats.redRewards + rewards
      : gameState.gameStats.redRewards;

    const validMoves: MovePiece[] = pieceThatMustKeepCapturing
      ? getKMoves(
          moveResult.board,
          nextPlayer,
          gameState.flyingKing,
          gameState.canCaptureBackward,
          pieceThatMustKeepCapturing,
          true
        ).moves
      : getAllValidMovesForPlayer(
          moveResult.board,
          nextPlayer,
          gameState.flyingKing,
          gameState.canCaptureBackward,
          gameState.mustCapture
        );

    const nextGameState: GameState = {
      ...state().gameState,
      board: moveResult.board,
      winner: winner,
      currentPlayer: winner ? gameState.currentPlayer : nextPlayer,
      keepCapturingPiece: winner ? undefined : pieceThatMustKeepCapturing,
      gameStats: {
        blackRewards,
        redRewards,
      },
    };
    set(() => ({
      validMoves: validMoves,
      selectedCell: winner ? undefined : pieceThatMustKeepCapturing,
      gameState: nextGameState,
    }));
  },
});
