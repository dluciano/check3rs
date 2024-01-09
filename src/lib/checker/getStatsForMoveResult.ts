import { type MovePieceResult } from ".";

export const getStatsForMoveResult = (
  moveResult: MovePieceResult,
  keepCapturing: boolean
): number => {
  const {
    numberOfCapturedMen,
    numberOfCapturedKings,
    isMenForwardStep,
    promotedToKing,
  } = moveResult;
  return (
    (isMenForwardStep ? 2 : 1) +
    numberOfCapturedMen * 0.1 +
    numberOfCapturedKings * 2.5 +
    (promotedToKing ? 5 : 0) +
    (keepCapturing ? 100 : 0)
  );
};
