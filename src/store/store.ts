import { create } from "zustand";
import { createGameStoreSlice } from "./gameStore";
import type { GameStoreState, MultiplayerStoreState } from "./types";
import { devtools } from "zustand/middleware";
import { createMultiplayerStoreSlice } from "./multiplayerStore";

export const useCheckersGameStore = create<
  GameStoreState & MultiplayerStoreState
>()(
  devtools(
    // persist(
    // init
    (...a) => ({
      ...createGameStoreSlice(...a),
      ...createMultiplayerStoreSlice(...a),
    })
    //   end
    //   ,{
    //     name: "checkers-storage",
    //     // partialize: (state) => {
    //     //   return omit(state);
    //     // },
    //     version: 0,
    //   }
    // )
  )
);
