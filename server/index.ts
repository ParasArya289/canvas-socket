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
  name: string;
};

type User = {
  name: string;
  currentPoint: {
    x: number;
    y: number;
  };
};

let activeUsers: User[] = [];

io.on("connection", (socket) => {
  socket.on("client-ready", () => {
    socket.broadcast.emit("get-canvas-state");
  });

  socket.on("canvas-state", (state) => {
    socket.broadcast.emit("canvas-state-from-server", state);
  });

  socket.on("mouse-not-pressed", ({ mouseNotPressed, name }) => {
    if (mouseNotPressed === false) {
      activeUsers = activeUsers.filter((user) => user.name !== name);
      socket.broadcast.emit("mouse-not-pressed", {
        activeUsers
      });

      console.log("control", { mouseNotPressed, name, activeUsers });
    }
  });

  socket.on(
    "draw-line",
    ({ prevPoint, currentPoint, color, eraserMode, name }: DrawLine) => {
      // console.log(prevPoint, currentPoint, color, eraserMode, name);
      const userIndex = activeUsers.findIndex((user) => user.name === name);

      if (userIndex !== -1) {
        activeUsers[userIndex] = { ...activeUsers[userIndex], currentPoint };
      } else {
        activeUsers.push({ currentPoint, name });
      }

      // console.log(activeUsers);
      console.log("drw");

      socket.broadcast.emit("draw-line", {
        prevPoint,
        currentPoint,
        color,
        eraserMode,
        name,
        activeUsers,
      });
    }
  );

  socket.on("clear", () => io.emit("clear"));
});

server.listen(3001, () => {
  console.log("server listening");
});
