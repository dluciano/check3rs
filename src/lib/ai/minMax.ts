import {
  type CheckersBoard,
  type Cell,
  type PlayerPieceColour,
  isBlackPiece,
  type MovePiece,
  getKMoves,
  getAllValidMovesForPlayer,
  moveToCell,
  getNextPlayerAndKeepCapturePiece,
  getStatsForMoveResult,
  type MutableCheckerBoard,
  EmptyCell,
  getWinner,
  type GameStats,
} from "lib/checker";

const minMax = (
  initialBoard: CheckersBoard,
  initialFrom: Cell | undefined,
  aiPlayerPieceColour: PlayerPieceColour,
  currentPlayer: PlayerPieceColour,
  flyingKing: boolean,
  canCaptureBackward: boolean,
  mustCapture: boolean,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  aiRewards: number,
  opponentRewards: number
): number => {
  const winner = getWinner(
    initialBoard,
    flyingKing,
    canCaptureBackward,
    mustCapture,
    currentPlayer
  );
  if (depth === 0 || winner) {
    let winReward = 0;
    if (winner && winner === aiPlayerPieceColour) winReward = 100_000;
    else if (winner && winner !== aiPlayerPieceColour) winReward = -100_000;
    return aiRewards - opponentRewards + winReward;
  }

  let ans = maximizing ? -Infinity : Infinity;

  const validMoves: MovePiece[] = initialFrom
    ? getKMoves(
        initialBoard,
        currentPlayer,
        flyingKing,
        canCaptureBackward,
        initialFrom,
        true
      ).moves
    : getAllValidMovesForPlayer(
        initialBoard,
        currentPlayer,
        flyingKing,
        canCaptureBackward,
        mustCapture
      );

  for (const move of validMoves) {
    const moveResult = moveToCell(initialBoard, move, true);
    const { board: nextBoard, capturedCells, fromPiece } = moveResult;
    const { nextPlayer, pieceThatMustKeepCapturing } =
      getNextPlayerAndKeepCapturePiece(
        moveResult,
        move,
        nextBoard,
        currentPlayer,
        flyingKing,
        canCaptureBackward,
        mustCapture
      );

    const rewards = getStatsForMoveResult(
      moveResult,
      pieceThatMustKeepCapturing !== undefined
    );
    const nextAiRewards =
      currentPlayer === aiPlayerPieceColour ? aiRewards + rewards : aiRewards;
    const nextOpponentRewards =
      currentPlayer !== aiPlayerPieceColour
        ? opponentRewards + rewards
        : opponentRewards;
    const curAns = minMax(
      nextBoard,
      pieceThatMustKeepCapturing,
      aiPlayerPieceColour,
      nextPlayer,
      flyingKing,
      canCaptureBackward,
      mustCapture,
      depth - 1,
      alpha,
      beta,
      pieceThatMustKeepCapturing !== undefined ? maximizing : !maximizing,
      nextAiRewards,
      nextOpponentRewards
    );
    // TODO: backtrack move
    const board = nextBoard as MutableCheckerBoard;
    for (const { row, col, content } of capturedCells) {
      board[row][col] = content;
    }
    board[move.from.row][move.from.col] = fromPiece;
    board[move.to.row][move.to.col] = EmptyCell;
    // pruning
    if (maximizing) {
      ans = Math.max(ans, curAns);
      alpha = Math.max(alpha, ans);
    } else {
      ans = Math.min(ans, curAns);
      beta = Math.min(beta, curAns);
    }
    if (beta <= alpha) break;
  }

  return ans;
};

export const minMaxAi = (
  initialBoard: CheckersBoard,
  initialFrom: Cell | undefined,
  aiPlayerColour: PlayerPieceColour,
  flyingKing: boolean,
  canCaptureBackward: boolean,
  mustCapture: boolean,
  currentGameStats: GameStats,
  maxDepth: number
) => {
  const validMoves: MovePiece[] = initialFrom
    ? getKMoves(
        initialBoard,
        aiPlayerColour,
        flyingKing,
        canCaptureBackward,
        initialFrom,
        true
      ).moves
    : getAllValidMovesForPlayer(
        initialBoard,
        aiPlayerColour,
        flyingKing,
        canCaptureBackward,
        mustCapture
      );
  let currentBestReward = -Infinity;
  let bestMove: MovePiece | undefined = undefined;
  const aiRewards = isBlackPiece(aiPlayerColour)
    ? currentGameStats.blackRewards
    : currentGameStats.redRewards;
  const opponentRewards = isBlackPiece(aiPlayerColour)
    ? currentGameStats.redRewards
    : currentGameStats.blackRewards;
  for (const move of validMoves) {
    const moveResult = moveToCell(initialBoard, move, true);
    const { board: nextBoard, capturedCells, fromPiece } = moveResult;
    const { nextPlayer, pieceThatMustKeepCapturing } =
      getNextPlayerAndKeepCapturePiece(
        moveResult,
        move,
        nextBoard,
        aiPlayerColour,
        flyingKing,
        canCaptureBackward,
        mustCapture
      );
    const rewards = getStatsForMoveResult(
      moveResult,
      pieceThatMustKeepCapturing !== undefined
    );

    const ans = minMax(
      nextBoard,
      pieceThatMustKeepCapturing,
      aiPlayerColour,
      nextPlayer,
      flyingKing,
      canCaptureBackward,
      mustCapture,
      maxDepth,
      -Infinity,
      Infinity,
      pieceThatMustKeepCapturing !== undefined,
      aiRewards + rewards,
      opponentRewards
    );

    if (ans > currentBestReward) {
      currentBestReward = ans;
      bestMove = move;
    }
    // backtrack
    const board = nextBoard as MutableCheckerBoard;
    for (const { row, col, content } of capturedCells) {
      board[row][col] = content;
    }
    board[move.from.row][move.from.col] = fromPiece;
    board[move.to.row][move.to.col] = EmptyCell;
  }
  if (!bestMove) throw new Error("Cannot determine best move for minmax ai");
  return bestMove;
};
