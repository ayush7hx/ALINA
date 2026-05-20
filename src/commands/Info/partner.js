const { Message, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");

module.exports = {
  name: "partner",
  aliases: ["sponser"],
  description: "Get Bot Sponsers !!",
  // userPermissions: PermissionFlagsBits.SendMessages,
  // botPermissions: PermissionFlagsBits.SendMessages,
  category: "Info",
  cooldown: 5,

  run: async (client, message, args, prefix) => {
    const embed = new EmbedBuilder()
      .setColor(client.color)
      .setTitle(`${client.user.username} - Partners`)
      .setDescription(`**Join our Support Server for help and updates!**`);

    const button = new ButtonBuilder()
      .setLabel(`Support Server`)
      .setStyle(ButtonStyle.Link)
      .setEmoji("<:support:1465282678856220682>")
      .setURL(`https://discord.gg/7JaEAAnYzc`);

    const row = new ActionRowBuilder().addComponents(button);

    return message.reply({
      embeds: [embed],
      components: [row]
    });
  },
};
