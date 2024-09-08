import WebSocket from "ws";

export type Connections = {
  [uuid: string]: {
    webSocket: WebSocket;
    userName?: string;
    state?: {
      typing: boolean;
      talking: boolean;
    };
  };
};

export type Data = {
  message?: string;
  userName?: string;
  commonChat?: boolean;
  peerUuid?: string;
};
