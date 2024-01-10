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
