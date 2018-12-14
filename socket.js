const WebSocket = require("ws");

module.exports = server => {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", ws => {
    console.log("connected");
    ws.on("message", message => console.log(message));
    ws.send("something");
  });
}
