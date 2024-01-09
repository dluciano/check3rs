import {
  isBackwardMove,
  isBlackMen,
  isEnemyPiece,
  isMenPromotionCell,
  isMenPiece,
  isPiece,
} from "./isFuncs";
import { BlackKing, EmptyCell, RedKing } from "./constants";
import type {
  CapturedCell,
  CheckersBoard,
  MovePiece,
  MovePieceResult,
  MutableCheckerBoard,
  Piece,
} from "./types";
import { cloneDeep } from "lodash";
import {
  diagonalDirections,
  getDirectionOfMovePiece,
} from "./diagonalDirections";

const _moveTo = (
  board: MutableCheckerBoard,
  move: MovePiece
): MovePieceResult => {
  const fromPiece = board[move.from.row][move.from.col];
  if (!isPiece(fromPiece))
    throw new Error(
      `Cannot move from: (${move.from.row},${move.from.col}) to: (${move.to.row},${move.to.col}) because the cell: '${fromPiece}' is not a checker piece`
    );
  const moveDirection = getDirectionOfMovePiece(move);
  const direction = diagonalDirections[moveDirection];
  const capturedCells: CapturedCell[] = [];
  let r = move.from.row + direction[0];
  let c = move.from.col + direction[1];
  board[move.from.row][move.from.col] = EmptyCell;
  let numberOfCapturedKings = 0;
  let numberOfCapturedMen = 0;
  let promotedToKing = false;
  let isMenForwardStep = isMenPiece(fromPiece) && !isBackwardMove(board, move);
  while (r !== move.to.row && c !== move.to.col) {
    const curCell = board[r][c];
    if (isEnemyPiece(fromPiece, curCell)) {
      if (isMenPiece(curCell)) numberOfCapturedMen++;
      else numberOfCapturedKings++;
      capturedCells.push({ row: r, col: c, content: curCell });
    }

    board[r][c] = EmptyCell;
    r += direction[0];
    c += direction[1];
  }
  if (isMenPromotionCell(board.length, move, fromPiece)) {
    promotedToKing = true;
    board[move.to.row][move.to.col] = isBlackMen(fromPiece)
      ? BlackKing
      : RedKing;
  } else board[move.to.row][move.to.col] = fromPiece;
  const fPiece = fromPiece as Piece; // TODO: can we type this better, we can assume this is true
  return {
    board,
    fromPiece: fPiece,
    capturedCells,
    numberOfCapturedKings,
    numberOfCapturedMen,
    promotedToKing,
    isMenForwardStep,
  };
};

/**
 * Move a piece from a cell to another. This method assumes that the move is valid and no checks will be done, please call `isValidMove` before using this method.
 * @param initialBoard
 * @param move
 * @param inline indicates whether or not the board argument will be modified. If false, a new instance of board will be created to apply the move. Set this to true if efficiency is required
 */
export const moveToCell = (
  initialBoard: CheckersBoard,
  move: MovePiece,
  inline: boolean
): MovePieceResult => {
  const board: MutableCheckerBoard = (
    inline ? initialBoard : cloneDeep(initialBoard)
  ) as MutableCheckerBoard;
  return _moveTo(board, move);
};
// getAllValidMovesForPlayer
// player must select one of the valid moves
// move
// using the updated board
// getWinner
// calculate stats
// update game stats

//   get next player
//     if piece can keep capturing `getKMoves(currentMove, k: 1, onlyCapture: true)`
//       next player is current player
//     otherwise next player is opponent

// if keep capturing move is null
//   getAllValidMovesForPlayer
//   ai select one of the valid moves
// move
// getWinner
// calculate stats
// update game stats

// if no winner
//   get next player
//     if piece can keep capturing `getKCaptureForPiece`
//       next player is current player
//     otherwise next player is opponent

// undo stats
// undo winner
// undo moves
