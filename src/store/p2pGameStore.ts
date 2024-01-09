import type { StateCreator } from "zustand";
import {
  type P2PConnectionState,
  type P2PGameState,
  type GameStoreState,
} from "./types";
import {
  ai,
  BlackMen,
  RedMen,
  type PlayerPieceColour,
  isValidMove,
  wait,
  emptyBoard,
} from "@lib";
import { cloneDeep } from "lodash";

export const createP2PGameStoreSlice: StateCreator<
  GameStoreState & P2PConnectionState,
  [],
  [],
  P2PGameState
> = (set, get) => ({
  newGameP2PGame: async () => {
    // const messagesHandler = async (message: P2PMessage) => {
    //   if (message.type === "NewGameP2PMessageType") {
    //     const gameState: GameState = get();
    //     gameState.newGame(
    //       emptyBoard,
    //       RedMen,
    //       BlackMen,
    //       message.canCaptureBackwards,
    //       message.flyingKing,
    //       true
    //     );
    //   } else if (message.type === "MoveToP2PMessage") {
    //     get().move(
    //       message.fromRow,
    //       message.fromCol,
    //       message.toRow,
    //       message.toCol,
    //       true
    //     );
    //   } else throw new Error(`Cannot handle message of unknown type`);
    // };
    // await get().connect(messagesHandler, async () => {
    //   get().newGame(
    //     emptyBoard,
    //     BlackMen,
    //     BlackMen,
    //     canCaptureBackwards,
    //     flyingKing,
    //     true
    //   );
    //   const newGameMessage: NewGameP2PMessageType = {
    //     canCaptureBackwards,
    //     flyingKing,
    //     type: "NewGameP2PMessageType",
    //   };
    //   await get().sendMessage(newGameMessage);
    // });
  },
  playFirstMoveIfAiIsFirstPlayer: () => {
    const {
      gameState,
      aiPlayerPieceColour,
      moveTo,
      setSelectedCell,
      aiAlgorithm,
    } = get();
    if (!aiPlayerPieceColour && gameState.currentPlayer !== aiPlayerPieceColour)
      return;
    const cellMovement = ai.play(gameState, aiAlgorithm);
    setSelectedCell(cellMovement.from);
    moveTo(cellMovement.to);
  },
  newGameAgainstAi: async () => {
    const { newGame, moveTo, setSelectedCell } = get();
    let playerPieceColour: PlayerPieceColour = BlackMen;
    let firstPlayerColour: PlayerPieceColour = BlackMen;
    let aiPlayerPieceColour: PlayerPieceColour = RedMen;

    //TODO: uncommented for production
    // if (random(0, 1) === 1) {
    //   playerPieceColour = RedMen;
    //   aiPlayerPieceColour = BlackMen;
    // }
    //------
    //TODO: commented for testing purposes
    // if (random(0, 1) === 1) firstPlayerColour = RedMen;
    firstPlayerColour = playerPieceColour;
    //----

    const board = cloneDeep(emptyBoard);
    set((state) => ({
      aiPlayerPieceColour,
      playerPieceColour,
      gameState: {
        ...state.gameState,
        board,
        currentPlayer: firstPlayerColour,
        // TODO: these values must be configurable
        canCaptureBackward: true,
        flyingKing: true,
      },
    }));
    newGame();

    // TODO: more code commented for test
    // if (firstPlayerColour !== aiPlayerPieceColour) {
    //   return;
    // }

    // const aiMove = ai.play(get().gameState, get().aiAlgorithm);
    // setSelectedCell(aiMove.from);
    // await wait(500);
    // moveTo(aiMove.to);
  },
  moveAndSend: async (to) => {
    const {
      moveTo,
      gameState,
      selectedCell,
      setSelectedCell,
      aiAlgorithm,
      aiPlayerPieceColour,
    } = get();
    if (!selectedCell) {
      return false;
    }
    if (
      !isValidMove(gameState, {
        from: selectedCell,
        to,
      })
    )
      return false;

    let nextGameState = moveTo(to);

    // set((state) => ({
    //   playerPieceColour: state.gameState.currentPlayer,
    // }));

    while (
      aiPlayerPieceColour &&
      nextGameState.currentPlayer === aiPlayerPieceColour &&
      !nextGameState.winner
    ) {
      const aiMove = ai.play(nextGameState, aiAlgorithm);
      setSelectedCell(aiMove.from);
      await wait(500); //TODO: commented for testing
      nextGameState = moveTo(aiMove.to);
    }
    return true;
  },
});
