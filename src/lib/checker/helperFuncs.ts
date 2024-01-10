import {
  type CheckersBoard,
  type Cell,
  getKMoves,
  BlackMen,
  RedMen,
  type PlayerPieceColour,
  type CellContent,
  isBlackPiece,
  isRedPiece,
  type MovePieceResult,
  type MovePiece,
} from ".";

export const getPlayerPieceColourForCell = (
  cell: CellContent
): PlayerPieceColour => {
  if (isBlackPiece(cell)) return BlackMen;
  else if (isRedPiece(cell)) return RedMen;
  throw new Error(
    `cannot get piece colour because cell: ${cell} is not a valid piece`
  );
};

export const getNextPlayerAndKeepCapturePiece = (
  moveResult: MovePieceResult,
  move: MovePiece,
  board: CheckersBoard,
  currentPlayer: PlayerPieceColour,
  flyingKing: boolean,
  canCaptureBackward: boolean,
  mustCapture: boolean
): {
  pieceThatMustKeepCapturing: Cell | undefined;
  nextPlayer: PlayerPieceColour;
} => {
  if (moveResult.capturedCells.length === 0) {
    return {
      pieceThatMustKeepCapturing: undefined,
      nextPlayer: getOpponentPlayerPieceColour(currentPlayer),
    };
  }
  const canKeepCapturing =
    getKMoves(
      board,
      currentPlayer,
      flyingKing,
      canCaptureBackward,
      move.to,
      true,
      1,
      true
    ).moves.length > 0;
  const nextPlayer = canKeepCapturing
    ? currentPlayer
    : getOpponentPlayerPieceColour(currentPlayer);
  const pieceThatMustKeepCapturing = canKeepCapturing ? move.to : undefined;
  return {
    pieceThatMustKeepCapturing,
    nextPlayer,
  };
};

export const getOpponentPlayerPieceColour = (
  currentPlayer: PlayerPieceColour
) => {
  if (isBlackPiece(currentPlayer)) return RedMen;
  else if (isRedPiece(currentPlayer)) return BlackMen;
  throw new Error(
    `cannot get opponent player piece colour becase ${currentPlayer} is not a player piece colour`
  );
};
