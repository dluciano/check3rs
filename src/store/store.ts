import { create } from "zustand";
import { createGameStoreSlice } from "./gameStore";
import { createP2PGameStoreSlice } from "./p2pGameStore";
import { createP2PStoreSlice } from "./p2pStore";
import type { GameState, P2PConnectionState, P2PGameState } from "./types";
import { omit } from "lodash";
import { devtools, persist } from "zustand/middleware";

export const useP2PAndGameStore = create<
  GameState & P2PConnectionState & P2PGameState
>()(
  // devtools(
  //   persist(
      // init
      (...a) => ({
        ...createP2PStoreSlice(...a),
        ...createGameStoreSlice(...a),
        ...createP2PGameStoreSlice(...a),
      })
      //   end
  //     ,{
  //       name: "checkers-storage",
  //       partialize: (state) => {
  //         return omit(state, ["selectedPiece", "updates"]);
  //       },
  //       version: 0,
  //     }
  //   )
  // )
);
