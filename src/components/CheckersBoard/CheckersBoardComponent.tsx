import { useCheckersGameStore } from "store/store";
import { isEmptyCell, isPiece, type Cell, type Piece } from "@lib";
import { PieceCellComponent } from "./PieceCellComponent";
import { EmptyCellComponent } from "./EmptyCellComponent";

export const CheckersBoardComponent = () => {
  const board = useCheckersGameStore((state) => state.gameState.board);
  const cellSize = 100;
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

      {board.map((rowContent, row) => {
        return rowContent.map((cellContent, col) => {
          const key = row * board.length + col;
          const cell: Cell = { row, col };
          if (isPiece(cellContent)) {
            return (
              <PieceCellComponent
                key={key}
                cell={cell}
                cellSize={cellSize}
                radius={40}
                piece={cellContent as Piece}
              />
            );
          }
          if (isEmptyCell(cellContent)) {
            return (
              <EmptyCellComponent key={key} cell={cell} cellSize={cellSize} />
            );
          }
        });
      })}
    </svg>
  );
};
