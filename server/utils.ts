import WebSocket from "ws";
import { Connections } from "./types.d";

export const sendToAll = (
  connections: Connections,
  message: string | WebSocket.RawData
) => {
  Object.keys(connections).forEach((conn) => {
    connections[conn]?.webSocket?.send(message);
  });
};

export const sendToUser = (
  connections: Connections,
  message: string | WebSocket.RawData,
  uuid: string
) => {
  connections[uuid]?.webSocket?.send(message);
};
