const express = require("express");
const WebSocket = require("ws");
const net = require("net");
const EventEmitter = require("events");

const emitter = new EventEmitter();

const port = process.env.PORT || 3000;
const TCPPort = port + 1;

const app = express().use(express.static("./public"));

const server = require("http").createServer(app);
const TCPServer = net.createServer();

const wss = new WebSocket.Server({ server });

wss.on("connection", ws => {
  emitter.on("data", data => {
    ws.send(data, error => {
      if (error) {
        ws.terminate();
      }
    });
  });
});

server.listen(port, () => console.log("Server started."));
TCPServer.listen(TCPPort, () => console.log("TCP Server Started"));

let buffered = "";

TCPServer.on("connection", sock => {
  sock.on("data", data => {
    buffered += data;
    processReceived();
  });
});

function processReceived() {
  let received = buffered.split(".");
  while (received.length > 1) {
    emitter.emit("data", received[0]);
    buffered = received.slice(1).join(".");
    received = buffered.split(".");
  }
}
