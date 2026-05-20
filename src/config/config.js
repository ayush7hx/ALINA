require("dotenv").config();

module.exports = {
  token: process.env.TOKEN || process.env.token || "",
  prefix: ".",
  color: "#bb00ff",
  Mongo: process.env.MONGO_URI || process.env.Mongo || "",
  ownerIDS: process.env.OWNER_IDS ? process.env.OWNER_IDS.split(",") : [""],
  vote: false,
  image: "https://media.discordapp.net/attachments/1392487471370997761/1433841399110828204/Profile_Banner.png?ex=6906285d&is=6904d6dd&hm=be6fb1bef07b8641d8501a618ffca7068822a299f8f7733e6d6bae741c646b99&=&format=webp&quality=lossless&width=544&height=192",
  setupBgLink: "https://media.discordapp.net/attachments/1392487471370997761/1433841399110828204/Profile_Banner.png?ex=6906285d&is=6904d6dd&hm=be6fb1bef07b8641d8501a618ffca7068822a299f8f7733e6d6bae741c646b99&=&format=webp&quality=lossless&width=544&height=192",
  invite: "https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&integration_type=0&scope=bot",
  inviteTwo: "https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&integration_type=0&scope=bot",
  inviteThree: "https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&integration_type=0&scope=bot",
  ssLink: "https://discord.gg/7JaEAAnYzc",
  topGg: "https://discord.gg/7JaEAAnYzc",
  topgg_Api: process.env.TOPGG_API_KEY || "",
  noprefixLog: process.env.NOPREFIX_LOG || "",
  cmd_log: process.env.CMD_LOG || "",
  error_log: process.env.ERROR_LOG || "",
  blacklist_log: process.env.BLACKLIST_LOG || "",
  join_log: process.env.JOIN_LOG || "",
  leave_log: process.env.LEAVE_LOG || "",
  spotiId: process.env.SPOTIFY_CLIENT_ID || "",
  spotiSecret: process.env.SPOTIFY_CLIENT_SECRET || "",
  nodes: [
    {
      name: 'Node 1',
      host: process.env.LAVALINK_HOST || 'lavalink.jirayu.net',
      port: parseInt(process.env.LAVALINK_PORT) || 13592,
      password: process.env.LAVALINK_PASSWORD || 'youshallnotpass',
      secure: process.env.LAVALINK_SECURE === 'true' || false
    }
  ],
};
