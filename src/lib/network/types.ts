export interface OutputMessage {}
export interface InputMessage {}

export type OnMessageReceive = <TInputMessage>(
  message: TInputMessage
) => Promise<void>;

export interface ICommunicationHander {
  sendMessage: <TOutputMessage extends OutputMessage>(
    message: TOutputMessage
  ) => Promise<void>;
  onMessageReceiveListeners: OnMessageReceive[];
}
