import type {
  ICommunicationHander,
  OnMessageReceive,
  OutputMessage,
} from "./types";

export class P2PHandler implements ICommunicationHander {
  sendMessage: <TOutputMessage extends OutputMessage>(
    message: TOutputMessage
  ) => Promise<void> = async () => {};
  onMessageReceiveListeners: OnMessageReceive[] = [];
}
