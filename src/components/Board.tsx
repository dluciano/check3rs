import { useEffect } from "react";
import BoardSvg from "./BoardSvg";
import { type BoardCell, BlackMen, emptyBoard } from "../store/types";
import { useP2PAndGameStore } from "../store/store";

let initialBoard: BoardCell[][] = emptyBoard;
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

// initialBoard = [
//   [".", "x", ".", "x", ".", "x", ".", "x"],
//   ["x", ".", "x", ".", "x", ".", "x", "."],
//   [".", "x", ".", "x", "b", "x", ".", "x"],
//   ["x", ".", "x", "R", "x", "r", "x", "."],
//   [".", "x", ".", "x", ".", "x", ".", "x"],
//   ["x", ".", "x", "r", "x", "r", "x", "."],
//   [".", "x", ".", "x", ".", "x", ".", "x"],
//   ["x", ".", "x", ".", "x", ".", "x", "."],
// ];

// initialBoard = [
//   [".", "x", ".", "x", ".", "x", "B", "x"],
//   ["x", ".", "x", ".", "x", ".", "x", "."],
//   [".", "x", ".", "x", ".", "x", ".", "x"],
//   ["x", "r", "x", "R", "x", "r", "x", "."],
//   [".", "x", ".", "x", ".", "x", ".", "x"],
//   ["x", ".", "x", "r", "x", "r", "x", "."],
//   [".", "x", ".", "x", ".", "x", ".", "x"],
//   ["x", ".", "x", ".", "x", ".", "x", "."],
// ];

// initialBoard = [
//   ["b", "x", ".", "x", ".", "x", ".", "x"],
//   ["x", ".", "x", "b", "x", ".", "x", "."],
//   [".", "x", ".", "x", ".", "x", ".", "x"],
//   ["x", ".", "x", ".", "x", ".", "x", "."],
//   [".", "x", ".", "x", "B", "x", "b", "x"],
//   ["x", ".", "x", "r", "x", ".", "x", "."],
//   [".", "x", ".", "x", ".", "x", ".", "x"],
//   ["x", ".", "x", ".", "x", ".", "x", "."],
// ];

initialBoard = emptyBoard;

export default function Board() {
  const { setIsLogOn, newGameP2PGame, newGame, updateAll } =
    useP2PAndGameStore();
  const gameState = useP2PAndGameStore((state) => state.gameState);

  useEffect(() => {
    if (gameState === "idle") {
      newGame(initialBoard, BlackMen, BlackMen, true, true, false);
      setIsLogOn(true);
    }
  }, [setIsLogOn, newGame, gameState, initialBoard, BlackMen]);

  return (
    <>
      <form action="#" style={{ display: "inline" }}>
        <button
          type="button"
          onClick={(evt) => {
            evt.preventDefault();

            newGameP2PGame(true, true).then(() => {
              updateAll();
            });
          }}
        >
          New P2P Game
        </button>
      </form>

      <form action="#" style={{ display: "inline" }}>
        <button
          type="button"
          onClick={() => {
            newGame(initialBoard, BlackMen, BlackMen, true, true, false);
            updateAll();
          }}
        >
          New Game
        </button>
      </form>
      <BoardSvg />
    </>
  );
}
