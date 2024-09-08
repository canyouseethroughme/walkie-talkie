import WebSocket from "ws";

export type Connections = {
  [uuid: string]: {
    webSocket: WebSocket;
    username?: string;
  };
};
