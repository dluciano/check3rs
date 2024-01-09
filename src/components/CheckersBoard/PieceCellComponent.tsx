import {
  getMiddlePoint,
  type Piece,
  isBlackPiece,
  isEnemyPiece,
  isKing,
} from "@lib";
import type { CellProps } from "components/types";
import { useState } from "react";
import styles from "./PieceCellComponent.module.css";
import { useCheckersGameStore } from "store/store";
export const PieceCellComponent = ({
  cell,
  cellSize,
  radius,
  piece,
}: CellProps & { readonly radius: number; piece: Piece }) => {
  const { row, col } = cell;
  const { setSelectedCell } = useCheckersGameStore();
  const currentPlayer = useCheckersGameStore(
    (state) => state.gameState.currentPlayer
  );
  const myPlayerPieceColour = useCheckersGameStore(
    (state) => state.myPlayerPieceColour
  );
  const selectedCell = useCheckersGameStore((state) => state.selectedCell);
  const [isHighlighted, setIsHighlighted] = useState(false);

  const setHighlight = (isHighlighted: boolean) => {
    setIsHighlighted((state) => !state);
  };
  const isSelected =
    selectedCell && selectedCell.row === row && selectedCell.col === col;
  const className = isBlackPiece(piece)
    ? styles["black-piece"]
    : styles["red-piece"];

  const { x, y } = getMiddlePoint(row, col, cellSize);
  return (
    <g
      onMouseOver={(e) => setHighlight(true)}
      onMouseLeave={(e) => setHighlight(false)}
      onClick={() => {
        if (myPlayerPieceColour !== currentPlayer) return;
        if (isEnemyPiece(myPlayerPieceColour, piece)) return;
        if (
          selectedCell &&
          selectedCell.row === row &&
          selectedCell.col === col
        )
          return;
        setSelectedCell(cell);
      }}
      className={`${className} ${isSelected ? styles["selected-piece"] : ""} 
      `}
    >
      <circle
        cx={x}
        cy={y}
        r={radius}
        className={`${isHighlighted ? styles["highlight"] : ""}`}
      />
      {isKing(piece) && (
        <path
          transform={`translate(${x}, ${y})`}
          fill="#4e4d4e"
          d="m 13.829158,-6.3560915
              v -8.0922445
              c -3.571382,0.658276 -7.1427585,1.060326 -10.7142503,1.208711 0.2121322,-4.101712 0.5217751,-8.203425 0.931159,-12.305136
              h -8.0921338
              c 0.4092691,4.101711 0.7190286,8.203424 0.9311598,12.305136 -3.5713762,-0.148262 -7.1427597,-0.550325 -10.7142507,-1.208711
              v 8.0922445
              c 3.648239,-0.6724921 7.2963654,-1.0776571 10.9445977,-1.2179278
              C -2.5579207,3.4655339 -2.9444155,14.5052 -4.0460671,25.544761
              H 4.0461768
              C 2.9445351,14.5052 2.5580296,3.4655339 2.8846698,-7.5740193
              c 3.6481226,0.140262 7.2963602,0.5454357 10.9444882,1.2179278
              z"
        />
      )}
    </g>
  );
};
