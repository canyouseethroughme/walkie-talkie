import * as http from "http";
import {
  //  WebSocket,
  WebSocketServer,
} from "ws";

import * as url from "url";
import { randomUUID } from "node:crypto";
import { Connections, Data } from "./types.d";
import { sendToSelf, sendToUser } from "./utils";

const server = http.createServer();
const wsServer = new WebSocketServer({ server });
const port = 8000;
const connections: Connections = {};

const handleClose = (uuid: string) => {
  console.log(uuid);
};

wsServer.on("connection", (connection, request) => {
  const { username } = url.parse(request?.url as string, true).query;
  const uuid = randomUUID();

  connections[uuid] = {
    webSocket: connection,
    userName: username as string,
    state: { typing: false, talking: false },
  };

  // we want to show all online users
  Object.keys(connections).forEach((conn) => {
    connections[conn]?.webSocket?.send(
      JSON.stringify({
        newConnections: Object.keys(connections).map((conn) => ({
          uuid: conn,
          username: connections[conn].userName,
        })),
      })
    );
  });

  connection.on("message", (message) => {
    try {
      const data: Data = JSON.parse(message.toString());

      // if the message is a private chat message, we want to notify only the user and sender
      if (data.peerUuid) {
        sendToUser(connections, message, data.peerUuid);
        sendToSelf(connections, message, uuid);
      }
    } catch (err) {
      console.error("wsServer on message error", err);
    }
  });

  connection.on("close", () => {
    delete connections[uuid];
    console.log("Removed connection: ", uuid);
  });
});

server.listen(port, () => {
  console.log(`WebSocket Server is running on port ${port}`);
});
