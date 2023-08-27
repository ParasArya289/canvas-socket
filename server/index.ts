declare var require: any;

const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);

import { Server } from "socket.io";

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

type Point = {
  x: number;
  y: number;
};
type DrawLine = {
  prevPoint: Point;
  currentPoint: Point;
  color: string;
  eraserMode: boolean;
};

io.on("connection", (socket) => {
  socket.on("client-ready", () => {
    socket.broadcast.emit("get-canvas-state");
  });

  socket.on("canvas-state", (state) => {
    socket.broadcast.emit("canvas-state-from-server", state);
  });

  socket.on(
    "draw-line",
    ({ prevPoint, currentPoint, color, eraserMode }: DrawLine) => {
      console.log(prevPoint, currentPoint, color, eraserMode);
      socket.broadcast.emit("draw-line", {
        prevPoint,
        currentPoint,
        color,
        eraserMode,
      });
    }
  );
  socket.on("clear", () => io.emit("clear"));
});

server.listen(3001, () => {
  console.log("server listening");
});
