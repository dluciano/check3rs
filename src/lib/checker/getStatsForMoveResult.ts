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
    numberOfCapturedMen * 2.3 +
    numberOfCapturedKings * 5.3 +
    (promotedToKing ? 30 : 0) +
    (keepCapturing ? 30 : 0)
  );
};
