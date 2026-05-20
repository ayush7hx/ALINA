const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "replay",
  description: `Replay the current song.`,
  category: "Music",
  cooldown: 5,
  inVc: true,
  sameVc: true,
  voteOnly: false,
  dj: true,
  premium: false,

  run: async (client, message, args, prefix, player) => {
    const tick = "<:check:1465237660301004884>";
    const cross = "<:cross:1465237676788813864>";

    if (!player || !player.current) {
      const embed = new EmbedBuilder()
        .setColor(client.color)
        .setDescription(`${cross} | There's no song currently playing.\nPlay something first to use the replay command.`);
      return message.reply({ embeds: [embed] });
    }

    await player.seek(0);

    const embed = new EmbedBuilder()
      .setColor(client.color)
      .setDescription(`${tick} | The song has been restarted from the beginning.\nEnjoy the track once again!`);

    return message.reply({ embeds: [embed] });
  },
};