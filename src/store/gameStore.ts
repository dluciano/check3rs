import { type StateCreator } from "zustand";
import {
  type BoardCell,
  RedMen,
  BlackMen,
  BlackKing,
  RedKing,
  type PlayerPieceColour,
  type Cell,
  WhiteSpaceCell,
  EmptyCell,
  type FromCellToCell,
  type GameState,
  type UpdateableCell,
  type P2PConnectionState,
} from "./types";

const isRedMen = (cell: BoardCell) => cell === RedMen;

const isBlackMen = (cell: BoardCell) => cell === BlackMen;

export const isBlackPiece = (cell: BoardCell) =>
  cell === BlackMen || cell === BlackKing;

export const isRedPiece = (cell: BoardCell) =>
  cell === RedMen || cell === RedKing;

export const isMenPiece = (cell: BoardCell) =>
  isBlackMen(cell) || isRedMen(cell);

const isPlayerPiece = (
  playerPieceColour: PlayerPieceColour,
  cell: BoardCell
) => {
  if (playerPieceColour === BlackMen) return isBlackPiece(cell);
  else if (playerPieceColour === RedMen) return isRedPiece(cell);
  return false;
};

const pieceHasAtLeastOneMove = (
  board: BoardCell[][],
  originCell: Cell,
  flyingKing: boolean,
  canCaptureBackwards: boolean
): boolean => {
  const ROWS = board.length;
  const COLS = board[0].length;
  const fromCell = board[originCell.row][originCell.col];
  const directions: number[][] = [];
  directions.push([-1, 1]);
  directions.push([1, 1]);
  directions.push([1, -1]);
  directions.push([-1, -1]);

  for (const direction of directions) {
    let captures: number = 0;
    let r = originCell.row + direction[0];
    let c = originCell.col + direction[1];

    while (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
      const cell = board[r][c];
      if (cell === WhiteSpaceCell)
        throw new Error(`Cannot move to white cell (${r}, ${c})`);
      if (cell === EmptyCell) {
        // Do nothing here
      } else if (!isEnemyPiece(fromCell, cell)) {
        break;
      } else {
        if (
          r + direction[0] < 0 ||
          r + direction[0] >= ROWS ||
          c + direction[1] < 0 ||
          c + direction[1] >= COLS ||
          board[r + direction[0]][c + direction[1]] !== EmptyCell
        )
          break;
        captures++;
        r = r + direction[0];
        c = c + direction[1];
        continue;
      }

      if (isMenPiece(fromCell) || !flyingKing) {
        if (
          captures > 0 &&
          isBackwards(fromCell, originCell.row, r) &&
          canCaptureBackwards
        )
          return true;
        if (!isBackwards(fromCell, originCell.row, r)) return true;
        r = r + direction[0];
        c = c + direction[1];
        continue;
      }
      if (isKing(fromCell) && flyingKing) {
        return true;
      }

      if (!isKing(cell) || !flyingKing) break;
      r = r + direction[0];
      c = c + direction[1];
    }
  }
  return false;
};

const pieceHasMoreCapture = (
  board: BoardCell[][],
  originCell: Cell,
  flyingKing: boolean,
  canCaptureBackwards: boolean
): boolean => {
  const ROWS = board.length;
  const COLS = board[0].length;
  const fromCell = board[originCell.row][originCell.col];
  const directions: number[][] = [];
  directions.push([-1, 1]);
  directions.push([1, 1]);
  directions.push([1, -1]);
  directions.push([-1, -1]);

  for (const direction of directions) {
    let captures: number = 0;
    let r = originCell.row + direction[0];
    let c = originCell.col + direction[1];

    while (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
      const cell = board[r][c];
      if (cell === WhiteSpaceCell)
        throw new Error(`Cannot move to white cell (${r}, ${c})`);
      if (cell === EmptyCell) {
        // Do nothing here
      } else if (!isEnemyPiece(fromCell, cell)) {
        break;
      } else {
        if (
          r + direction[0] < 0 ||
          r + direction[0] >= ROWS ||
          c + direction[1] < 0 ||
          c + direction[1] >= COLS ||
          board[r + direction[0]][c + direction[1]] !== EmptyCell
        )
          break;
        captures++;
        r = r + direction[0];
        c = c + direction[1];
        continue;
      }

      if (isMenPiece(fromCell) || !flyingKing) {
        if (
          captures > 0 &&
          isBackwards(fromCell, originCell.row, r) &&
          canCaptureBackwards
        )
          return true;
        if (!isBackwards(fromCell, originCell.row, r) && captures > 0)
          return true;
      } else if (isKing(fromCell) && flyingKing && captures > 0) {
        return true;
      }

      if (!isKing(fromCell) || !flyingKing) break;
      r = r + direction[0];
      c = c + direction[1];
    }
  }
  return false;
};

const tryMove: (
  board: BoardCell[][],
  cellMovement: FromCellToCell,
  flyingKing: boolean,
  canCaptureBackwards: boolean
) => {
  captures: Cell[];
  pointFound: boolean;
} = (
  board: BoardCell[][],
  { fromRow, fromCol, toRow, toCol }: FromCellToCell,
  flyingKing,
  canCaptureBackwards
) => {
  const ROWS = board.length;
  const COLS = board[0].length;
  const fromCell = board[fromRow][fromCol];
  const directions: number[][] = [];
  directions.push([-1, 1]);
  directions.push([1, 1]);
  directions.push([1, -1]);
  directions.push([-1, -1]);

  for (const direction of directions) {
    const captures: Cell[] = [];
    let r = fromRow + direction[0];
    let c = fromCol + direction[1];

    while (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
      const cell = board[r][c];
      if (cell === WhiteSpaceCell)
        throw new Error(`Cannot move to white cell (${r}, ${c})`);
      if (cell === EmptyCell) {
        // Do nothing here
      } else if (!isEnemyPiece(fromCell, cell)) {
        break;
      } else {
        if (
          r + direction[0] < 0 ||
          r + direction[0] >= ROWS ||
          c + direction[1] < 0 ||
          c + direction[1] >= COLS ||
          board[r + direction[0]][c + direction[1]] !== EmptyCell
        )
          break;
        captures.push({ row: r, col: c });
        r = r + direction[0];
        c = c + direction[1];
        continue;
      }

      if (r === toRow && c === toCol) {
        if (isMenPiece(fromCell) || !flyingKing) {
          if (
            captures.length > 0 &&
            isBackwards(fromCell, fromRow, r) &&
            canCaptureBackwards
          )
            return { captures, pointFound: true };
          if (!isBackwards(fromCell, fromRow, r))
            return { captures, pointFound: true };
          return { captures: [], pointFound: false };
        }
        if (isKing(fromCell) && flyingKing) {
          return { captures, pointFound: true };
        }
      }

      if (!isKing(fromCell) || !flyingKing) break;
      r = r + direction[0];
      c = c + direction[1];
    }
  }
  return { captures: [], pointFound: false };
};

const isBlackKing = (cell: BoardCell) => cell === BlackKing;

const isRedKing = (cell: BoardCell) => cell === RedKing;

export const isKing = (cell: BoardCell) => isBlackKing(cell) || isRedKing(cell);

const isEmpty = (cell: BoardCell) => cell === EmptyCell;

const isEnemyPiece = (cell: BoardCell, otherCell: BoardCell) =>
  (isBlackPiece(cell) && isRedPiece(otherCell)) ||
  (isRedPiece(cell) && isBlackPiece(otherCell));

const isBackwards = (cell: BoardCell, fromRow: number, toRow: number) => {
  if (isBlackPiece(cell) && toRow < fromRow) return true;
  else if (isRedPiece(cell) && toRow > fromRow) return true;
  else false;
};

export const createGameStoreSlice: StateCreator<
  GameState & P2PConnectionState,
  [],
  [],
  GameState
> = (set, state) => ({
  board: [],
  boardSize: 0,
  playerPieceColour: BlackMen,
  currentPlayer: BlackMen,
  winner: undefined,
  updates: [],
  gameState: "idle",
  capturedPieces: {
    b: 0,
    r: 0,
  },
  selectedPiece: undefined,
  canCaptureBackwards: false,
  continuesCapture: undefined,
  flyingKing: true,
  isP2PGame: false,
  newGame: (
    initialBoard: BoardCell[][],
    playerPieceColour,
    currentPlayer,
    canCaptureBackwards,
    flyingKing,
    isP2PGame: boolean
  ) => {
    const board: BoardCell[][] = [];

    for (let r = 0; r < initialBoard.length; ++r) {
      const cells: BoardCell[] = [];
      for (let c = 0; c < initialBoard[0].length; ++c) {
        cells.push(initialBoard[r][c]);
      }
      board.push(cells);
    }
    set(() => ({
      board,
      boardSize: board.length,
      playerPieceColour,
      capturedPieces: {
        b: 0,
        r: 0,
      },
      currentPlayer,
      canCaptureBackwards,
      flyingKing,
      selectedPiece: undefined,
      continuesCapture: undefined,
      winner: undefined,
      gameState: "playing",
      isP2PGame,
    }));
  },
  setSelectedPiece: (row, col) => {
    const {
      selectedPiece,
      playerPieceColour,
      board,
      currentPlayer,
      winner,
      flyingKing,
      canCaptureBackwards,
      updates,
    } = state();
    if (winner) return;
    if (currentPlayer !== playerPieceColour) return;
    if (!isPlayerPiece(playerPieceColour, board[row][col])) return;

    if (
      !pieceHasAtLeastOneMove(
        board,
        { row, col },
        flyingKing,
        canCaptureBackwards
      )
    )
      return;
    if (selectedPiece && selectedPiece.row === row && selectedPiece.col === col)
      return;
    if (selectedPiece)
      updates[selectedPiece.row][selectedPiece.col](
        selectedPiece.row,
        selectedPiece.col,
        board[selectedPiece.row][selectedPiece.col],
        false
      );

    set(() => ({ selectedPiece: { row, col } }));
    updates[row][col](row, col, board[row][col], true);
  },
  move: (fromRow, fromCol, toRow, toCol, isRemoteGameState) => {
    const {
      board,
      continuesCapture,
      playerPieceColour: myPlayerPieceColour,
      currentPlayer,
      selectedPiece,
      canCaptureBackwards,
      flyingKing,
      winner,
      updates,
      gameState,
    } = state();
    if (gameState === "finish" || gameState === "idle")
      throw new Error(
        `Cannot move to (${toRow},${toCol}) because the game state is ${gameState}`
      );
    if (winner) return false;

    if (!isRemoteGameState && !selectedPiece) return false;
    let playerPieceColour = myPlayerPieceColour;
    if (isRemoteGameState)
      playerPieceColour = myPlayerPieceColour === BlackMen ? RedMen : BlackMen;
    if (currentPlayer !== playerPieceColour) return false;

    const fromCell = board[fromRow][fromCol];

    if (!isPlayerPiece(playerPieceColour, fromCell)) return false;
    if (!isEmpty(board[toRow][toCol])) return false;

    // move

    const { captures, pointFound } = tryMove(
      board,
      { fromRow, fromCol, toRow, toCol },
      flyingKing,
      canCaptureBackwards
    );

    if (!pointFound) return false;
    if (continuesCapture && captures.length === 0) return false;

    // clone the board to operate on the movement/capture algorithms
    const copyBoard: BoardCell[][] = [];
    for (const row of board) copyBoard.push([...row]);

    const capture = (capturedPieces: Cell[]) => {
      for (const cell of capturedPieces) {
        const piece = copyBoard[cell.row][cell.col];
        const capPieces = state().capturedPieces;

        if (piece === BlackMen) {
          capPieces.b += 1;
        }
        if (piece == BlackKing) {
          capPieces.b += 2;
        }
        if (piece === RedMen) {
          capPieces.r += 1;
        }
        if (piece === RedKing) {
          capPieces.r += 2;
        }
        set((state) => ({
          capturedPieces: {
            ...state.capturedPieces,
            ...capPieces,
          },
        }));
        copyBoard[cell.row][cell.col] = EmptyCell;
        updates[cell.row][cell.col](
          cell.row,
          cell.col,
          copyBoard[cell.row][cell.col],
          false
        );
      }
    };
    capture(captures);
    let nextPlayer = currentPlayer;
    let nextPiece = copyBoard[fromRow][fromCol];
    if (toRow === 0 && isRedMen(fromCell)) {
      nextPiece = RedKing;
      set((s) => ({
        capturedPieces: {
          b: s.capturedPieces.b,
          r: s.capturedPieces.r - 2,
        },
      }));
    } else if (toRow === board.length - 1 && isBlackMen(fromCell)) {
      nextPiece = BlackKing;
      set((s) => ({
        capturedPieces: {
          b: s.capturedPieces.b - 2,
          r: s.capturedPieces.r,
        },
      }));
    }

    copyBoard[fromRow][fromCol] = EmptyCell;
    copyBoard[toRow][toCol] = nextPiece;
    updates[fromRow][fromCol](
      fromRow,
      fromCol,
      copyBoard[fromRow][fromCol],
      false
    );

    const hasMoreCaptures = pieceHasMoreCapture(
      copyBoard,
      { row: toRow, col: toCol },
      flyingKing,
      canCaptureBackwards
    );

    if (captures.length === 0 || !hasMoreCaptures) {
      nextPlayer = currentPlayer === BlackMen ? RedMen : BlackMen;
      set(() => ({
        selectedPiece: undefined,
        continuesCapture: undefined,
      }));
      updates[toRow][toCol](toRow, toCol, copyBoard[toRow][toCol], false);
    } else if (captures.length > 0 && hasMoreCaptures) {
      updates[toRow][toCol](toRow, toCol, copyBoard[toRow][toCol], true);
      set(() => ({
        selectedPiece: {
          row: toRow,
          col: toCol,
        },
        continuesCapture: {
          row: toRow,
          col: toCol,
        },
      }));
    }

    set(() => ({
      currentPlayer: nextPlayer,
      // playerPieceColour: nextPlayer, //TODO: remove, added only for testing
      board: [...copyBoard],
    }));

    // find winner
    // NOTE: conditions based in other discrete states are not going to be implemented now

    // 1. any player without any pieces left
    // 2. any player that cannot move anymore
    let redCount = 0;
    let blackCount = 0;
    let canBlackMove = false;
    let canRedMove = false;
    let r = 0;
    for (const row of copyBoard) {
      let c = 0;
      for (const cell of row) {
        if (isRedPiece(cell)) {
          redCount++;
          if (
            !canRedMove &&
            pieceHasAtLeastOneMove(
              copyBoard,
              { row: r, col: c },
              flyingKing,
              canCaptureBackwards
            )
          )
            canRedMove = true;
        }
        if (isBlackPiece(cell)) {
          blackCount++;
          if (
            !canBlackMove &&
            pieceHasAtLeastOneMove(
              copyBoard,
              { row: r, col: c },
              flyingKing,
              canCaptureBackwards
            )
          )
            canBlackMove = true;
        }
        c++;
      }
      r++;
    }
    if (redCount === 0)
      set(() => ({
        winner: BlackMen,
        gameState: "finish",
        selectedPiece: undefined,
      }));
    if (blackCount === 0)
      set(() => ({
        winner: RedMen,
        gameState: "finish",
        selectedPiece: undefined,
      }));
    if (!canBlackMove)
      set(() => ({
        winner: RedMen,
        gameState: "finish",
        selectedPiece: undefined,
      }));
    if (!canRedMove)
      set(() => ({
        winner: BlackMen,
        gameState: "finish",
        selectedPiece: undefined,
      }));
    return true;
  },
  setUpdatableCell: (row, col, update) => {
    const { updates, board } = state();

    updates[row][col] = update;
    update(row, col, board[row][col], false);
  },
  initUpdatables: () => {
    const { board, updates: curUpdates } = state();
    if (curUpdates.length === board.length) return;
    const updates: UpdateableCell[][] = [];
    for (let r = 0; r < board.length; ++r) {
      const cellRefs: UpdateableCell[] = [];
      for (let c = 0; c < board[0].length; ++c) {
        cellRefs.push(() => {});
      }
      updates.push(cellRefs);
    }
    set(() => ({
      updates,
    }));
  },
  updateAll: () => {
    const { board, updates } = state();
    for (let r = 0; r < updates.length; ++r)
      for (let c = 0; c < updates[0].length; ++c)
        updates[r][c](r, c, board[r][c]);
  },
});
