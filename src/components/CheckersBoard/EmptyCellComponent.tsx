import type { CellProps } from "components/types";
import styles from "./EmptyCellComponent.module.css";
import { useCheckersGameStore } from "store/store";

export const EmptyCellComponent = ({ cell, cellSize }: CellProps) => {
  const { row, col } = cell;
  const validMoves = useCheckersGameStore((state) => state.validMoves);
  const selectedCell = useCheckersGameStore((state) => state.selectedCell);
  const { play } = useCheckersGameStore();
  const moveTo = validMoves.find((m) => m.to.row === row && m.to.col === col);

  return (
    <rect
      width={cellSize}
      height={cellSize}
      className={`${styles["empty-cell"]} ${
        moveTo ? styles["can-move-to"] : ""
      }`}
      x={col * cellSize}
      y={row * cellSize}
      onClick={() => {
        if (!moveTo) return;
        if (!selectedCell) return;

        if (
          validMoves.findIndex(
            (m) =>
              m.from.row === selectedCell.row &&
              m.from.col === selectedCell.col &&
              m.to.row === row &&
              m.to.col === col
          ) !== -1
        )
          play(cell);
      }}
    />
  );
};
