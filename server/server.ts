import * as http from "http";
import { WebSocketServer } from "ws";

import * as url from "url";
import { randomUUID } from "node:crypto";
import { Connections } from "./types.d";
import { sendToAll, sendToUser } from "./utils";

const server = http.createServer();
const wsServer = new WebSocketServer({ server });
const port = 8000;
const connections: Connections = {};

wsServer.on("connection", (connection, request) => {
  const { username } = url.parse(request?.url as string, true).query;
  const uuid = randomUUID();

  connections[uuid] = {
    webSocket: connection,
    userName: username as string,
  };

  // we want to show all online users
  sendToAll(
    connections,
    JSON.stringify({
      newConnections: Object.keys(connections).map((conn) => ({
        uuid: conn,
        username: connections[conn].userName,
      })),
    })
  );

  connection.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());

      // if the message is a private chat message, we want to notify only the user and sender
      if (data.peerUuid) {
        // we use same method to send to peer user connection
        sendToUser(connections, message, data.peerUuid);
        // and we send to the sender
        sendToUser(connections, message, uuid);
      }
    } catch (err) {
      console.error("wsServer on message error", err);
    }
  });

  connection.on("close", () => {
    // on close we want to remove the connections from the list of online connections
    // and notify all other connections
    delete connections[uuid];
    sendToAll(connections, JSON.stringify({ disconnected: { uuid } }));
  });
});

server.listen(port, () => {
  console.log(`WebSocket Server is running on port ${port}`);
});
