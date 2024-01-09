import type {
    ICommunicationHander,
    OnMessageReceive,
    OutputMessage,
  } from "./types";
  
  export class ServerSocket implements ICommunicationHander {
    sendMessage: <TOutputMessage extends OutputMessage>(
      message: TOutputMessage
    ) => Promise<void> = async () => {};
    onMessageReceiveListeners: OnMessageReceive[] = [];
  }
  