import {
  isPiece,
  type CheckersBoard,
  type MovePiece,
  type PlayerPieceColour,
  isEnemyPiece,
  diagonalDirections,
  isMenPiece,
  type Cell,
  isKing,
  isBackwardMove,
  isEmptyCell,
  type ValidMovePiece,
} from ".";

export const getKMoves = (
  board: CheckersBoard,
  player: PlayerPieceColour,
  flyingKing: boolean,
  canCaptureBackward: boolean,
  fromCell: Cell,
  fromCellMustCapture: boolean = false,
  k: number = Infinity,
  onlyCaptures: boolean = false
): {
  moves: ValidMovePiece[];
  hasAtLeastOneCapture: boolean;
} => {
  const fromCellContent = board[fromCell.row][fromCell.col];
  const ROWS = board.length;
  const COLS = board[0].length;
  const moves: ValidMovePiece[] = [];

  if (!isPiece(fromCellContent))
    throw new Error(
      `cannot find moves for the non piece '${fromCellContent}' located at (${fromCell.row},${fromCell.col}). The cell must be a piece`
    );
  if (k <= 0)
    throw new Error(
      `cannot find moves for the piece '${fromCellContent}' located at (${fromCell.row},${fromCell.col}) because k: '${k}' moves where requested. K must be a value between 1 and Infinity`
    );
  let hasAtLeastOneCapture = false;
  for (const direction of diagonalDirections) {
    let hasCapture = false;
    let r = fromCell.row + direction[0];
    let c = fromCell.col + direction[1];
    const movesTmp: ValidMovePiece[] = [];
    let captureCount = 0;

    while (
      r >= 0 &&
      r < ROWS &&
      c >= 0 &&
      c < COLS &&
      moves.length + movesTmp.length < k
    ) {
      const nextCell: Cell = { row: r, col: c };
      const nextCellContent = board[nextCell.row][nextCell.col];
      if (isMenPiece(fromCellContent) || !flyingKing) {
        if (isEmptyCell(nextCellContent) && !onlyCaptures) {
          const move: ValidMovePiece = {
            from: fromCell,
            to: nextCell,
            belongsToDiagonalCapturePath: false,
          };
          if (isKing(fromCellContent) || !isBackwardMove(board, move))
            movesTmp.push(move);
        } else if (isEnemyPiece(nextCellContent, player)) {
          const nextNextCell: Cell = {
            row: nextCell.row + direction[0],
            col: nextCell.col + direction[1],
          };
          if (
            nextNextCell.row >= 0 &&
            nextNextCell.row < ROWS &&
            nextNextCell.col >= 0 &&
            nextNextCell.col < COLS
          ) {
            const nextNextCellContent =
              board[nextNextCell.row][nextNextCell.col];
            if (isEmptyCell(nextNextCellContent)) {
              const move: MovePiece = {
                from: fromCell,
                to: nextNextCell,
              };
              if (
                isKing(fromCellContent) ||
                !isBackwardMove(board, move) ||
                canCaptureBackward
              ) {
                hasCapture = true;
                hasAtLeastOneCapture = true;
                movesTmp.push({ ...move, belongsToDiagonalCapturePath: true });
                captureCount++;
              }
            }
          }
        }
        break;
      } else {
        if (
          !isEmptyCell(nextCellContent) &&
          !isEnemyPiece(nextCellContent, player)
        )
          break;
        if (isEmptyCell(nextCellContent) && !onlyCaptures) {
          const move: MovePiece = { from: fromCell, to: nextCell };
          movesTmp.push({ ...move, belongsToDiagonalCapturePath: hasCapture });
        } else if (isEnemyPiece(nextCellContent, player)) {
          const nextNextCell: Cell = {
            row: nextCell.row + direction[0],
            col: nextCell.col + direction[1],
          };
          if (
            nextNextCell.row >= 0 &&
            nextNextCell.row < ROWS &&
            nextNextCell.col >= 0 &&
            nextNextCell.col < COLS
          ) {
            const nextNextCellContent =
              board[nextNextCell.row][nextNextCell.col];
            if (isEmptyCell(nextNextCellContent)) {
              const move: MovePiece = {
                from: fromCell,
                to: nextNextCell,
              };
              captureCount++;
              hasCapture = true;
              hasAtLeastOneCapture = true;
              movesTmp.push({ ...move, belongsToDiagonalCapturePath: true });
              r = nextNextCell.row + direction[0];
              c = nextNextCell.col + direction[1];
              continue;
            } else break;
          } else break;
        }
      }
      r += direction[0];
      c += direction[1];
    }
    if (fromCellMustCapture && captureCount === 0) continue;
    moves.push(...movesTmp);
  }

  return { moves, hasAtLeastOneCapture };
};
