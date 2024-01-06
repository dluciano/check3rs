import { type StateCreator } from "zustand";
import { withLog } from "../lib/logger";
import p2pHandler, { type LibP2PLogLevel } from "../lib/p2p";
import {
  NewGameP2PMessage,
  type GameState,
  type P2PConnectionState,
  type P2PMessage,
  MoveToP2PMessage,
} from "./types";
import { createSecp256k1PeerId } from "@libp2p/peer-id-factory";

const onMessageParse: (jsonMessage: string) => Promise<P2PMessage> = async (
  jsonMessage
) => {
  //TODO: sanitize jsonMessage here
  const fullMessage = JSON.parse(jsonMessage);

  if (!("type" in fullMessage) || !("value" in fullMessage))
    throw new Error("Invalid message does not contains the type property");

  if (fullMessage.type === "NewGameP2PMessageType") {
    return {
      ...(await NewGameP2PMessage.parseAsync(fullMessage.value)),
      type: "NewGameP2PMessageType",
    };
  } else if (fullMessage.type === "MoveToP2PMessage") {
    return {
      ...(await MoveToP2PMessage.parseAsync(fullMessage.value)),
      type: "MoveToP2PMessage",
    };
  }
  throw new Error("Invalid message type");
};

export const createP2PStoreSlice: StateCreator<
  P2PConnectionState & GameState,
  [],
  [],
  P2PConnectionState
> = (set, state) => ({
  logLevel: "all",
  isLogOn: false,
  connectionStatus: "initial",
  messages: [],
  connect: async (onMessage, onPeerConnected) => {
    await withLog(async (logger) => {
      if (state().connectionStatus === "connected") {
        logger.warn("Cannot connect when node is connected");
        return;
      }

      const peerId = await createSecp256k1PeerId();
      await p2pHandler.start(
        peerId,
        async (jsonMessage) => {
          const message = await onMessageParse(jsonMessage);
          set((state) => ({
            messages: [...state.messages, message],
          }));
          await onMessage(message);
        },
        onPeerConnected
      );

      set({
        connectionStatus: "connected",
      });
      await logger.log(`client started`);
    });
  },
  sendMessage: async (message: P2PMessage) => {
    await withLog(async (logger) => {
      const json = {
        type: message.type,
        value: message,
      };
      await p2pHandler.sendMessage(message);
      await logger.log(`Message sent: ${json}`);
    });
  },
  disconnect: async () => {
    await withLog(async (logger) => {
      if (
        state().connectionStatus === "stopped" ||
        state().connectionStatus === "initial"
      ) {
        await logger.warn(
          `Cannot stop connection when node state is: ${
            state().connectionStatus
          }`
        );
        return;
      }
      await p2pHandler.stop();
      set(() => ({ messages: [], connectionStatus: "initial" }));
      await logger.log(`client stopped`);
    });
  },
  setIsLogOn: (isLogOn: boolean) => {
    set({
      isLogOn: isLogOn,
    });
    p2pHandler.updateLibP2PDebugging(state().logLevel, !state().isLogOn);
  },
  setLogLevel: (logLevel: LibP2PLogLevel) => {
    set({
      logLevel,
    });
    p2pHandler.updateLibP2PDebugging(state().logLevel, !state().isLogOn);
  },
});
