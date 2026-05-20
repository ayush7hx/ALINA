const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "247",
  aliases: ["24/7", "nonstop", "stay"],
  description: "Toggle 24/7 mode — bot stays in VC even when queue ends.",
  category: "Music",
  cooldown: 5,
  inVc: true,
  sameVc: true,

  run: async (client, message, args, prefix, player) => {
    const tick = "<:check:1465237660301004884>";
    const cross = "<:cross:1465237676788813864>";

    if (!player) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setDescription(`${cross} | No active player. Use \`${prefix}play\` first.`)
            .setColor(client.config.color),
        ],
      });
    }

    player.data.is247 = !player.data.is247;
    const enabled = player.data.is247;

    return message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(client.config.color)
          .setAuthor({
            name: enabled ? "24/7 Mode Enabled" : "24/7 Mode Disabled",
            iconURL: client.user.displayAvatarURL(),
          })
          .setDescription(
            enabled
              ? `${tick} | I will stay in the voice channel even when the queue ends.`
              : `${cross} | I will leave when the queue is empty.`
          )
          .setFooter({ text: "Made by Ayush7hx" }),
      ],
    });
  },
};
