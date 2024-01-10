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
    numberOfCapturedKings * 5.5 +
    (promotedToKing ? 20 : 0) +
    (keepCapturing ? 13 : 0)
  );
};
