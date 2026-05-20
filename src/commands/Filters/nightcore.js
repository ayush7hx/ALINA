const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "nightcore",
  aliases: ["nc"],
  description: "Toggle the Nightcore filter for the current song.",
  category: "Filters",
  cooldown: 5,
  inVc: true,
  sameVc: true,
  dj: true,
  voteOnly: false,
  premium: true,

  run: async (client, message, args, prefix, player) => {
    if (!player) {
      const embed = new EmbedBuilder()
        .setDescription("<:cross:1465237676788813864> | No player found in this guild!")
        .setColor(client.config.color);
      return message.reply({ embeds: [embed] });
    }

    try {
      if (!player.filters) player.filters = {};

      // 🎧 Detect if Nightcore filter is already active
      const isActive =
        player.filters.timescale?.speed === 1.5 &&
        player.filters.timescale?.pitch === 1.5;

      // 🎛 Lavalink v4 filter payload
      const filterData = {
        op: "filters",
        guild_id: message.guild.id, // ✅ correct key
        timescale: isActive
          ? { speed: 1.0, pitch: 1.0, rate: 1.0 } // Reset to normal
          : { speed: 1.5, pitch: 1.5, rate: 1.0 }, // Apply Nightcore effect
      };

      // 🛰 Send safely to Lavalink/Riffy
      if (player.node && typeof player.node.send === "function") {
        await player.node.send(filterData);
      } else if (client.manager && typeof client.manager.send === "function") {
        await client.manager.send(filterData);
      } else if (client.riffy?.send) {
        await client.riffy.send(filterData);
      } else {
        throw new Error("No valid Lavalink node found to send filter data.");
      }

      // 💾 Cache new state
      player.filters.timescale = filterData.timescale;

      // 🔄 Apply instantly
      player.pause(true);
      await delay(200);
      player.pause(false);

      // 🖼 Embed feedback
      const embed = new EmbedBuilder()
        .setColor(isActive ? "#FF5555" : "#00FF9C")
        .setDescription(
          isActive
            ? "<:cross:1465237676788813864> | **Nightcore filter disabled.** Back to normal speed"
            : "<:check:1465237660301004884> | **Nightcore filter enabled!** Enjoy the fast beats"
        )
        .setFooter({
          text: `Requested by ${message.author.tag}`,
          iconURL: message.author.displayAvatarURL(),
        })
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    } catch (error) {
      console.error("[FILTER] Nightcore error:", error);
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setDescription(
          "<:cross:1465237676788813864> | Failed to toggle Nightcore filter. Lavalink node may be offline!"
        );
      return message.reply({ embeds: [embed] });
    }
  },
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
