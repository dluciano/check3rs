import type { CheckersBoard } from "@lib";
import { CheckersBoardComponent } from "components/CheckersBoard/CheckersBoardComponent";
import { useEffect, useRef, useState } from "react";
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

// Given the following checkers board:
//   A B C D E F G H
// 0 b x b x b x b x
// 1 x b x b x b x b
// 2 b x b x b x b x
// 3 x . x . x . x .
// 4 . x . x . x . x
// 5 x r x r x r x r
// 6 r x r x r x r x
// 7 x r x r x r x r
// You are the red player, and it's your turn. Provide the next (from, to) move to ensure your red piece wins. Use the format ROW[0-7], Column[A-H]. For example, 'B5 C4' represents moving a piece from B5 to C4. Please respond with the move only. Next move:

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
  const [playingGame, setPlayingGame] = useState(false);
  const moveAudioRef = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    setInitialBoard(emptyBoard);
    setOnMove(async () => {
      const audioElement = moveAudioRef.current;
      if (!audioElement || !audioElement.paused) return;
      await audioElement.play();
    });
  }, []);
  return (
    <main className="container mx-auto max-h-screen h-screen w-screen">
      <CheckersBoardComponent className="w-full h-full max-h-screen px-3" />
      {!playingGame && (
        <div className="w-full h-full fixed top-0 left-0 bg-gray-500 bg-opacity-65 flex items-center justify-center rounded-lg">
          <form
            action="#"
            className="w-3/4 h-1/2 bg-[#a85d5d] flex items-center justify-center"
          >
            <button
              type="button"
              className="rounded-xl p-8 bg-orange-400 w-1/2"
              onClick={(evt) => {
                evt.preventDefault();
                newGame();
                setPlayingGame(true);
              }}
            >
              New Game
            </button>
          </form>
        </div>
      )}

      <audio ref={moveAudioRef} src={"/move.mp3"} />
    </main>
  );
}
