import type { CheckersBoard } from "@lib";
import { CheckersBoardComponent } from "components/CheckersBoard/CheckersBoardComponent";
import { useEffect, useRef } from "react";
import { useCheckersGameStore } from "store/store";

export const emptyBoard: CheckersBoard = [
  ["b", "x", "b", "x", "b", "x", "b", "x"],
  ["x", "b", "x", "b", "x", "b", "x", "b"],
  ["b", "x", "b", "x", "b", "x", "b", "x"],
  ["x", ".", "x", ".", "x", ".", "x", "."],
  [".", "x", ".", "x", ".", "x", ".", "x"],
  ["x", "r", "x", "r", "x", "r", "x", "r"],
  ["r", "x", "r", "x", "r", "x", "r", "x"],
  ["x", "r", "x", "r", "x", "r", "x", "r"],
];

// [
//   [".", "x", "B", "x", ".", "x", ".", "x"],
//   ["x", ".", "x", ".", "x", ".", "x", "."],
//   ["r", "x", ".", "x", ".", "x", "b", "x"],
//   ["x", ".", "x", "r", "x", ".", "x", "b"],
//   [".", "x", ".", "x", ".", "x", ".", "x"],
//   ["x", ".", "x", ".", "x", "r", "x", "r"],
//   [".", "x", ".", "x", ".", "x", ".", "x"],
//   ["x", ".", "x", ".", "x", ".", "x", "."],
// ];

// [
//   [".", "x", ".", "x", ".", "x", "b", "x"],
//   ["x", ".", "x", ".", "x", "b", "x", "b"],
//   ["b", "x", "b", "x", "b", "x", "b", "x"],
//   ["x", "r", "x", "b", "x", "b", "x", "r"],
//   [".", "x", "B", "x", "b", "x", "r", "x"],
//   ["x", ".", "x", ".", "x", "r", "x", "r"],
//   ["r", "x", "r", "x", ".", "x", "r", "x"],
//   ["x", ".", "x", ".", "x", ".", "x", "."],
// ];
// [
//   [".", "x", ".", "x", ".", "x", ".", "x"],
//   ["x", ".", "x", ".", "x", ".", "x", "."],
//   ["b", "x", "b", "x", ".", "x", ".", "x"],
//   ["x", "r", "x", ".", "x", ".", "x", "."],
//   [".", "x", "B", "x", ".", "x", ".", "x"],
//   ["x", ".", "x", ".", "x", ".", "x", "."],
//   ["r", "x", "r", "x", ".", "x", ".", "x"],
//   ["x", ".", "x", ".", "x", ".", "x", "."],
// ];

// [
//   [".", "x", ".", "x", ".", "x", ".", "x"],
//   ["x", ".", "x", ".", "x", ".", "x", "."],
//   [".", "x", ".", "x", ".", "x", ".", "x"],
//   ["x", ".", "x", ".", "x", ".", "x", "."],
//   [".", "x", ".", "x", ".", "x", ".", "x"],
//   ["x", ".", "x", ".", "x", ".", "x", "."],
//   [".", "x", ".", "x", ".", "x", ".", "x"],
//   ["x", ".", "x", ".", "x", ".", "x", "."],
// ];
// [
//   [".", "x", ".", "x", ".", "x", ".", "x"],
//   ["x", ".", "x", ".", "x", ".", "x", "."],
//   [".", "x", ".", "x", ".", "x", ".", "x"],
//   ["x", "b", "x", ".", "x", "b", "x", "."],
//   ["r", "x", ".", "x", ".", "x", ".", "x"],
//   ["x", ".", "x", "r", "x", ".", "x", "."],
//   [".", "x", ".", "x", ".", "x", ".", "x"],
//   ["x", ".", "x", ".", "x", ".", "x", "."],
// ];
// [
//   [".", "x", ".", "x", ".", "x", ".", "x"],
//   ["x", "r", "x", ".", "x", ".", "x", "."],
//   [".", "x", ".", "x", ".", "x", ".", "x"],
//   ["x", "r", "x", "r", "x", "r", "x", "."],
//   [".", "x", ".", "x", ".", "x", ".", "x"],
//   ["x", ".", "x", "b", "x", "r", "x", "."],
//   [".", "x", "r", "x", "b", "x", ".", "x"],
//   ["x", ".", "x", ".", "x", ".", "x", "B"],
// ];
// [
//   [".", "x", ".", "x", ".", "x", ".", "x"],
//   ["x", "r", "x", ".", "x", ".", "x", "."],
//   [".", "x", "r", "x", ".", "x", ".", "x"],
//   ["x", "r", "x", "r", "x", "r", "x", "."],
//   [".", "x", ".", "x", ".", "x", ".", "x"],
//   ["x", ".", "x", ".", "x", "r", "x", "."],
//   [".", "x", "r", "x", "b", "x", ".", "x"],
//   ["x", ".", "x", ".", "x", ".", "x", "B"],
// ];

export default function MainGameScene() {
  const { setInitialBoard, newGame, setOnMove } = useCheckersGameStore();
  const moveAudioRef = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    setInitialBoard(emptyBoard);
    newGame();
    setOnMove(async () => {
      const audioElement = moveAudioRef.current;
      if (!audioElement || !audioElement.paused) return;
      await audioElement.play();
    });
  }, []);
  return (
    <>
      <form action="#" style={{ display: "inline" }}>
        <button
          type="button"
          onClick={(evt) => {
            evt.preventDefault();
          }}
        >
          New Game
        </button>
      </form>
      <CheckersBoardComponent />
      <audio ref={moveAudioRef} src={"/move.mp3"} />
    </>
  );
}
