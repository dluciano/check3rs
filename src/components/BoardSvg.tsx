import { calculateCircleCenter } from "../lib/math";
import { isBlackPiece, isRedPiece, isKing } from "../store/gameStore";
import { useP2PAndGameStore } from "../store/store";
import {
  type BoardCell,
  WhiteSpaceCell,
  EmptyCell,
  BlackMen,
  RedMen,
  RedKing,
  BlackKing,
} from "../store/types";
import styles from "./BoardSvg.module.css";
import { useEffect, useState } from "react";
type CellProps = { row: number; col: number; cellSize: number };

const BoardCellComponent = ({ row, col, cellSize }: CellProps) => {
  const { setSelectedPiece, moveAndSend, setUpdatableCell, initUpdatables } =
    useP2PAndGameStore();

  const [cell, setCell] = useState<{
    row: number;
    col: number;
    boardCellType: BoardCell | undefined;
    isSelected: boolean;
    isHighlighted: boolean;
  }>({
    row,
    col,
    boardCellType: undefined,
    isSelected: false,
    isHighlighted: false,
  });

  useEffect(() => {
    if (cell.boardCellType === WhiteSpaceCell) return;
    initUpdatables();
    setUpdatableCell(
      row,
      col,
      (newRow, newCol, newBoardCellType, isSelected) => {
        setCell((state) => ({
          ...state,
          row: newRow,
          col: newCol,
          boardCellType: newBoardCellType,
          isSelected: isSelected === true || false,
        }));
      }
    );
  }, [setUpdatableCell, initUpdatables, setCell, row, col]);

  if (cell.boardCellType === undefined) return <></>;
  if (cell.boardCellType === WhiteSpaceCell) return <></>;

  const setHighlight = (isOn: boolean) => {
    setCell((state) => ({ ...state, isHighlighted: isOn }));
  };

  if (cell.boardCellType === EmptyCell) {
    return (
      <rect
        style={{ fill: "transparent", stroke: "none" }}
        width={cellSize}
        height={cellSize}
        className="black-cell"
        x={cell.col * cellSize}
        y={cell.row * cellSize}
        onClick={() => {
          moveAndSend(-Infinity, -Infinity, cell.row, cell.col);
        }}
      />
    );
  }
  if (
    cell.boardCellType === BlackMen ||
    cell.boardCellType === RedMen ||
    cell.boardCellType === RedKing ||
    cell.boardCellType === BlackKing
  ) {
    let fill = "";
    if (isBlackPiece(cell.boardCellType))
      fill = "url(#black-men-linear-gradient)";
    else if (isRedPiece(cell.boardCellType))
      fill = "url(#red-men-linear-gradient)";
    else
      throw new Error(
        `Invalid board cell type. Cannot render piece component for the invalid men piece type: ${cell.boardCellType}`
      );
    const radius = 40;
    const { cx, cy } = calculateCircleCenter(
      cell.row,
      cell.col,
      cellSize,
      radius
    );
    return (
      <g
        onMouseOver={(e) => setHighlight(true)}
        onMouseLeave={(e) => setHighlight(false)}
        onClick={() => {
          setSelectedPiece(cell.row, cell.col);
        }}
        className={`${cell.isSelected ? styles["selected-piece"] : ""}`}
      >
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill={fill}
          className={`${cell.isHighlighted ? styles["highlight"] : ""}`}
        />
        {isKing(cell.boardCellType) && (
          <path
            transform={`translate(${cx}, ${cy})`}
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
  }
  throw new Error(
    `Cannot render piece component for the invalid men piece type: ${cell.boardCellType}`
  );
};

const CheckersBoard = () => {
  const boardSize = useP2PAndGameStore((state) => state.boardSize);
  return (
    <svg
      version="1.1"
      id="checkersboard"
      viewBox="0 0 800 1020"
      xmlSpace="preserve"
      width="800"
      height="1020"
      fill="#000000"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs id="colour-definitions">
        <linearGradient id="black-men-linear-gradient">
          <stop
            style={{ stopColor: "#434a54", stopOpacity: 1 }}
            offset="0"
            id="stop23"
          />
          <stop
            style={{ stopColor: "#16181b", stopOpacity: 1 }}
            offset="1"
            id="stop24"
          />
        </linearGradient>
        <linearGradient id="red-men-linear-gradient">
          <stop
            style={{ stopColor: "#ed5564", stopOpacity: 1 }}
            offset="0"
            id="stop21"
          />
          <stop
            style={{ stopColor: "#a93237", stopOpacity: 1 }}
            offset="1"
            id="stop22"
          />
        </linearGradient>
        <pattern
          xlinkHref="#Checkerboard"
          preserveAspectRatio="xMidYMid"
          id="checkboard-pattern"
          patternTransform="scale(100)"
          x="0"
          y="0"
        />
        <pattern
          style={{ fill: "#a85d5d" }}
          patternUnits="userSpaceOnUse"
          width="2"
          height="2"
          patternTransform="translate(0,0) scale(10,10)"
          id="Checkerboard"
          preserveAspectRatio="xMidYMid"
        >
          <rect
            style={{ stroke: "none" }}
            x="0"
            y="0"
            width="1"
            height="1"
            id="rect209"
          />
          <rect
            style={{ stroke: "none" }}
            x="1"
            y="1"
            width="1"
            height="1"
            id="rect211"
          />
        </pattern>
      </defs>
      <g id="table" style={{ display: "inline" }}>
        <rect
          width="800"
          height="200"
          id="background-footer"
          y="820"
          x="0"
          style={{ display: "inline", fill: "#965353", fillOpacity: 1 }}
        />
        <rect
          x="0"
          y="800.02423"
          width="800"
          height="20"
          id="decoration-bar-footer"
          style={{ display: "inline", fill: "#7f4545", fillOpacity: 1 }}
        />
        <path
          d="m 406.67091,803.34654 c 3.69055,3.69143 3.69055,9.6639 0,13.35532 -3.67727,3.67728 -9.66478,3.67728 -13.34117,0 -3.69143,-3.69142 -3.69143,-9.66389 0,-13.35532 3.6764,-3.67728 9.66391,-3.67728 13.34117,0 z"
          id="decoration-ball-footer"
          style={{ display: "inline", fill: "#ffce54", fillOpacity: 1 }}
        />
        <rect
          x="0"
          width="800"
          height="800"
          id="white-cells-background"
          y="0"
          style={{ display: "inline", fill: "#ffd2a6", fillOpacity: 1 }}
        />
        <rect
          style={{
            display: "inline",
            fill: "url(#checkboard-pattern)",
            fillOpacity: 1,
          }}
          id="background-pattern"
          width="800"
          height="800"
          x="0"
          y="0"
        />
      </g>

      {[...Array(boardSize)].map((_, row) => {
        return [...Array(boardSize)].map((__, col) => {
          return (
            <BoardCellComponent
              key={row * boardSize + col}
              row={row}
              col={col}
              cellSize={100}
            />
          );
        });
      })}
    </svg>
  );
};

export default CheckersBoard;
