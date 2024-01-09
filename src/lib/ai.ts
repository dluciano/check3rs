import {
  move,
  type CellMovement,
  type GameState,
  isRedPiece,
  getAllValidMovesForCurrentPlayer,
} from "./checkers";

export type AiAlgorithm = "minmax" | "RL-1";
const minMaxAi = (
  initialGameState: GameState,
  maxDepth: number,
  maxIterations: number
) => {
  let iter = 0;
  const minMax = (
    curGameState: GameState,
    depth: number,
    alpha: number,
    beta: number,
    maximizing: boolean
  ): number => {
    iter++;
    if (depth === 0 || curGameState.winner || iter > maxIterations) {
      if (isRedPiece(curGameState.currentPlayer))
        //TODO: explore calculating inverse here, black for red and red for black
        return (
          curGameState.redPlayerStats.reward -
          curGameState.redPlayerStats.penalty
        );
      return (
        curGameState.blackPlayerStats.reward -
        curGameState.blackPlayerStats.penalty
      );
    }

    let ans = maximizing ? -Infinity : Infinity;

    const validMoves: CellMovement[] =
      getAllValidMovesForCurrentPlayer(curGameState);

    for (const cellMovement of validMoves) {
      // TODO: (hack) to avoid backtracking I create a new instance of the game...

      const { nextGameState } = move(cellMovement, curGameState);
      const curAns = minMax(
        // TODO: (hack) to avoid backtracking I create a new instance of the game...
        nextGameState,
        depth - 1,
        alpha,
        beta,
        !maximizing
      );
      // TODO: backtrack move
      if (maximizing) {
        ans = Math.max(ans, curAns);
        // pruning
        alpha = Math.max(alpha, ans);
      } else {
        ans = Math.min(ans, curAns);
        // pruning
        beta = Math.min(alpha, curAns);
      }
      if (beta <= alpha) break;
    }

    return ans;
  };

  const validMoves: CellMovement[] =
    getAllValidMovesForCurrentPlayer(initialGameState);
  let max = -Infinity;
  let bestMove: CellMovement | undefined = undefined;
  for (const cellMovement of validMoves) {
    const { nextGameState } = move(cellMovement, initialGameState);
    const ans = minMax(nextGameState, maxDepth, -Infinity, Infinity, false);
    if (ans > max) {
      max = ans;
      bestMove = cellMovement;
    }
    // TODO: backtrack move
  }
  if (!bestMove) throw new Error("Cannot determine best move for minmax ai");
  return bestMove;
};

export const ai = {
  play: (gameState: GameState, aiAlgorithm: AiAlgorithm): CellMovement => {
    if (aiAlgorithm === "minmax") return minMaxAi(gameState, 6, Infinity);

    throw new Error(`AI ${aiAlgorithm} algorithm not implemented yet`);
  },
};
