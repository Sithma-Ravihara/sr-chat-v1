const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

const users = new Map();

io.on("connection", (socket) => {
socket.on("join", (name) => {
if (typeof name !== "string") return;

const username = name.trim().slice(0, 20);
if (!username) return;

users.set(socket.id, username);

socket.emit("system", {
  text: "Welcome to SR Chat!"
});

io.emit("online", users.size);

io.emit("system", {
  text: `${username} joined the chat`
});

});

socket.on("chat message", (text) => {
const username = users.get(socket.id);

if (!username || typeof text !== "string") return;

const message = text.trim().slice(0, 1000);
if (!message) return;

io.emit("chat message", {
  username,
  text: message,
  time: new Date().toISOString()
});

});

socket.on("disconnect", () => {
const username = users.get(socket.id);

if (username) {
  users.delete(socket.id);

  io.emit("online", users.size);

  io.emit("system", {
    text: `${username} left the chat`
  });
}

});
});

server.listen(PORT, "0.0.0.0", () => {
console.log("SR Chat running on port ${PORT}");
});
