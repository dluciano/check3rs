import { useEffect } from "react";
import BoardSvg from "./BoardSvg";
import { useP2PAndGameStore } from "../store/store";

export default function Board() {
  const { setIsLogOn, newGameP2PGame, newGameAgainstAi, updateAll } =
    useP2PAndGameStore();
  useEffect(() => {
    newGameAgainstAi();
    setIsLogOn(true);
  }, [newGameAgainstAi, setIsLogOn]);

  return (
    <>
      <form action="#" style={{ display: "inline" }}>
        <button
          type="button"
          onClick={(evt) => {
            evt.preventDefault();

            newGameP2PGame().then(() => {
              updateAll();
            });
          }}
        >
          New Online Game
        </button>
      </form>

      <form action="#" style={{ display: "inline" }}>
        <button
          type="button"
          onClick={(evt) => {
            evt.preventDefault();
            newGameAgainstAi();
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
