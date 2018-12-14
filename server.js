const app = require("./app");
const server = require("http").createServer(app);

require("./socket")(server);

const port = process.env.PORT || 3000;

server.listen(port, () => console.log("Server started."));
