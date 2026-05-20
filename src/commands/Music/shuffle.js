const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "shuffle",
  aliases: ["shuffle"],
  description: `Shuffle the queue!`,
  category: "Music",
  cooldown: 5,
  inVc: true,
  sameVc: true,
  voteOnly: false,
  premium: false,
  dj: true,

  run: async (client, message, args, prefix, player) => {
    const tick = "<:check:1465237660301004884>";
    const cross = "<:cross:1465237676788813864>";

    if (!player || !player.queue || !player.queue.length) {
      const embed = new EmbedBuilder()
        .setColor(client.color)
        .setDescription(`${cross} | There's nothing in the queue to shuffle.\nAdd more songs first.`);
      return message.reply({ embeds: [embed] });
    }

    await player.queue.shuffle();

    const embed = new EmbedBuilder()
      .setColor(client.color)
      .setDescription(`${tick} | The queue has been shuffled successfully.\nEnjoy your music in a fresh random order!`);

    return message.reply({ embeds: [embed] });
  },
};