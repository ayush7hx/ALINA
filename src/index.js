const MainClient = require("./structure/client");
require("dotenv").config();

// ⚡ Keep-alive HTTP server (prevents Render free tier from sleeping)
require("./keepalive");

const client = new MainClient();
(async () => {
  await client.ConnectMongo();
  await client.loadEvents();
  await client.connect();
})();

module.exports = client;
