const {
  Message,
  PermissionFlagsBits,
  EmbedBuilder,
  ButtonStyle,
  ButtonBuilder,
  ActionRowBuilder,
} = require("discord.js");

module.exports = {
  name: "vote",
  description: "Vote for ${client.user.username}",
  // userPermissions: PermissionFlagsBits.SendMessages,
  // botPermissions: PermissionFlagsBits.SendMessages,
  category: "Info",
  cooldown: 5,

  run: async (client, message, args, prefix) => {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Vote On DBL")
        .setStyle(ButtonStyle.Link)
        .setEmoji("<a:dance:1465287682728136849>")
        .setURL(`https://discord.gg/7JaEAAnYzc`)
    );
    const embed = new EmbedBuilder()
    .setAuthor({
        name: `Vote Me!`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setColor(client.color)
      .setDescription(
        "**Vote for ${client.user.username} on DBL to support its growth and development! Help us bring new features and improvements to this amazing bot that enhances your Discord experience. Your votes make a difference!**"
      );

    return message.reply({ embeds: [embed], components: [row] });
  },
};
