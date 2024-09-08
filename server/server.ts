import * as http from "http";
import {
  //  WebSocket,
  WebSocketServer,
} from "ws";

import * as url from "url";
import { randomUUID } from "node:crypto";
import { Connections, Data } from "./types.d";
import { sendToAll, sendToAllButSelf, sendToUser } from "./utils";

const server = http.createServer();
const wsServer: WebSocketServer = new WebSocketServer({ server });
const port = 8000;
const connections: Connections = {};

const handleClose = (uuid: string) => {
  console.log(uuid);
};

wsServer.on("connection", (connection, request) => {
  // ws://localhost:8000?username=Bob
  const { username } = url.parse(request?.url as string, true).query;
  const uuid = randomUUID();

  connections[uuid] = {
    webSocket: connection,
    userName: username as string,
    state: { typing: false, talking: false },
  };
  console.log(connections);

  // we want to notify all other users that a new user has joined
  sendToAllButSelf(
    connections,
    JSON.stringify({ message: `${username} is online`, userName: username }),
    uuid
  );

  connection.on("message", (message) => {
    try {
      const data: Data = JSON.parse(message.toString());

      // if the message is a common chat message, we want to notify all users
      if (data.commonChat) {
        sendToAll(
          connections,
          JSON.stringify({ message: data.message, userName: username })
        );
      }

      // if the message is a private chat message, we want to notify only the user
      if (data.peerUuid) {
        sendToUser(connections, message, data.peerUuid);
      }
    } catch (err) {
      console.error("wsServer on message error", err);
    }
  });

  connection.on("close", () => handleClose(uuid));
});

server.listen(port, () => {
  console.log(`WebSocket Server is running on port ${port}`);
});
