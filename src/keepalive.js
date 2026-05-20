const http = require("http");

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("ALINA is alive!");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[KEEPALIVE] HTTP server running on port ${PORT}`);
});

module.exports = server;
