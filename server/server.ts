import * as http from "http";
import { WebSocketServer } from "ws";
import * as url from "url";
import { randomUUID } from "node:crypto";
import { Connections } from "./types.d";

const server = http.createServer();
const wsServer: WebSocketServer = new WebSocketServer({ server });
const port = 8000;
const connections: Connections = {};

wsServer.on("connection", (connection, request) => {
  // ws://localhost:8000?username=Bob
  const { username } = url.parse(request?.url as string, true).query;
  const uuid = randomUUID();
  connections[uuid] = { webSocket: connection, username: username as string };

  console.log(connections);
});

server.listen(port, () => {
  console.log(`WebSocket Server is running on port ${port}`);
});
