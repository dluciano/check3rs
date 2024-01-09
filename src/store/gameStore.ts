import type { StateCreator } from "zustand";
import {
  type GameStoreState,
  type OnUpdateCell,
  type P2PConnectionState,
} from "./types";
import {
  BlackMen,
  pieceHasAtLeastOneMove,
  type CellMovement,
  move,
  type GameState,
  isPlayerPiece,
  getAllValidMovesForCurrentPlayer,
} from "@lib";

export const createGameStoreSlice: StateCreator<
  GameStoreState & P2PConnectionState,
  [],
  [],
  GameStoreState
> = (set, state) => ({
  gameState: {
    board: [],
    currentPlayer: BlackMen,
    canCaptureBackward: false,
    flyingKing: false,
    winner: undefined,
    blackPlayerStats: {
      numberOfCapturedPieces: 0,
      reward: 0,
      penalty: 0,
    },
    redPlayerStats: {
      numberOfCapturedPieces: 0,
      reward: 0,
      penalty: 0,
    },
  },
  playerPieceColour: BlackMen,
  boardSize: 0,
  selectedCell: undefined,
  gameStatus: "idle",
  aiPlayerPieceColour: undefined,
  updates: [],
  aiAlgorithm: "minmax",
  newGame: () => {
    const {
      gameStatus,
      gameState: { board, currentPlayer, canCaptureBackward, flyingKing },
    } = state();
    if (gameStatus === "playing")
      throw new Error(
        `Cannot create a new game until current game is finished`
      );
    //TODO: this will be used somewhere else
    // we must clone the initial board, to avoid modifying template boards
    // const board: Board = [];
    // for (let r = 0; r < initialBoard.length; ++r) {
    //   const cells: BoardCell[] = [];
    //   for (let c = 0; c < initialBoard[0].length; ++c) {
    //     cells.push(initialBoard[r][c]);
    //   }
    //   board.push(cells);
    // }
    const gameState: GameState = {
      board,
      currentPlayer,
      canCaptureBackward,
      flyingKing,
      winner: undefined,
      blackPlayerStats: {
        numberOfCapturedPieces: 0,
        reward: 0,
        penalty: 0,
      },
      redPlayerStats: {
        numberOfCapturedPieces: 0,
        reward: 0,
        penalty: 0,
      },
    };
    set(() => ({
      gameState,
      boardSize: board.length,
      selectedCell: undefined,
      gameStatus: "playing",
      updates: [],
    }));
  },
  setSelectedCellForPlayer: (cell) => {
    const { row, col } = cell;
    const {
      gameState,
      playerPieceColour,
      setSelectedCell,
    } = state();
    const { board, currentPlayer } = gameState;

    if (currentPlayer !== playerPieceColour) return;
    if (!isPlayerPiece(playerPieceColour, board[row][col])) return;
    setSelectedCell(cell);
  },
  setSelectedCell: (cell) => {
    const { row, col } = cell;
    const { gameState, selectedCell, updates } = state();
    const { board, winner } = gameState;
    if (winner) return;

    if (!pieceHasAtLeastOneMove(cell, gameState)) return;
    if (selectedCell && selectedCell.row === row && selectedCell.col === col)
      return;
    if (selectedCell)
      // unselect the current selected cell
      updates[selectedCell.row][selectedCell.col](
        { row: selectedCell.row, col: selectedCell.col },
        board[selectedCell.row][selectedCell.col],
        false
      );

    set(() => ({ selectedCell: cell }));
    updates[row][col](cell, board[row][col], true);
  },
  moveTo: (to) => {
    const { gameState, updates, selectedCell } = state();
    if (!selectedCell)
      throw new Error(
        `Cannot move to (${to.row},${to.col}), because there is no a piece selected`
      );

    const cellMovement: CellMovement = {
      from: selectedCell,
      to,
    };

    const { nextGameState, capturedPieces } = move(cellMovement, gameState);

    set(() => ({
      gameState: {
        ...nextGameState,
      },
      selectedCell: nextGameState.pieceThatMustKeepCapturing,
      gameStatus: nextGameState.winner ? "finish" : "playing",
    }));
    for (const cell of capturedPieces)
      updates[cell.row][cell.col](
        cell,
        nextGameState.board[cell.row][cell.col]
      );
    updates[cellMovement.from.row][cellMovement.from.col](
      cellMovement.from,
      nextGameState.board[cellMovement.from.row][cellMovement.from.col]
    );
    updates[cellMovement.to.row][cellMovement.to.col](
      cellMovement.to,
      nextGameState.board[cellMovement.to.row][cellMovement.to.col]
    );

    // TODO: more testing... maybe I can leave this one here
    const validMoves = getAllValidMovesForCurrentPlayer(nextGameState);

    for (let r = 0; r < nextGameState.board.length; ++r) {
      for (let c = 0; c < nextGameState.board.length; ++c) {
        if (validMoves.find((v) => v.from.row === r && v.from.col === c)) {
          updates[r][c](
            { row: r, col: c },
            nextGameState.board[r][c],
            false,
            true,
            false
          );
        } else if (validMoves.find((v) => v.to.row === r && v.to.col === c)) {
          updates[r][c](
            { row: r, col: c },
            nextGameState.board[r][c],
            false,
            false,
            true
          );
        } else {
          updates[r][c](
            { row: r, col: c },
            nextGameState.board[r][c],
            false,
            false,
            false
          );
        }
      }
    }
    return nextGameState;
  },
  setUpdatableCell: (cell, update) => {
    const { row, col } = cell;
    const {
      updates,
      gameState: { board },
    } = state();

    updates[row][col] = update;
    update(cell, board[row][col], false);
  },
  initUpdatables: () => {
    const {
      gameState: { board },
      updates: curUpdates,
    } = state();
    if (curUpdates.length === board.length) return;
    const updates: OnUpdateCell[][] = [];
    for (let r = 0; r < board.length; ++r) {
      const updatesFunc: OnUpdateCell[] = [];
      for (let c = 0; c < board[0].length; ++c) {
        updatesFunc.push(() => {});
      }
      updates.push(updatesFunc);
    }
    set(() => ({
      updates,
    }));
  },
  updateAll: () => {
    const {
      gameState: { board },
      updates,
    } = state();
    for (let row = 0; row < updates.length; ++row)
      for (let col = 0; col < updates[0].length; ++col)
        updates[row][col]({ row, col }, board[row][col]);
  },
});
