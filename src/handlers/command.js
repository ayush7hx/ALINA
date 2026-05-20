const { readdirSync } = require("fs");
const { white, green } = require("chalk");
const { WebhookClient, EmbedBuilder } = require("discord.js");

module.exports = async (client) => {
  // Create webhook client
  const webhook = new WebhookClient({
    url: "https://discord.com/api/webhooks/1464942191138050190/06nEpQMXTy6AvAgA96jEr-KncVVRPl-Zq6WwSIBqHh-P4dzOpYjmovTuMqVvKvIzCQkH"
  });

  try {
    // Load commands dynamically
    readdirSync("./src/commands/").forEach((dir) => {
      const commands = readdirSync(`./src/commands/${dir}`).filter((f) =>
        f.endsWith(".js")
      );

      for (const cmd of commands) {
        const command = require(`../commands/${dir}/${cmd}`);
        if (command.name) {
          client.mcommands.set(command.name, command);
        } else {
          console.log(`${cmd} is not ready`);
        }
      }
    });

    console.log(
      white("[") + green("INFO") + white("] ") + green("Command ") + white("Events") + green(" Loaded!")
    );
  } catch (error) {
    console.log(error);
  }
  // Create embed for startup message (manual description)
  // Use safe fallbacks because `client.user` may be null before the 'ready' event
  const botName = client.user?.username || "Bot";
  const botId = client.user?.id || "0";
  const botAvatar = client.user?.displayAvatarURL() || null;

  const embed = new EmbedBuilder()
    .setColor("#ffffff")
    .setTitle(`${botName} Startup Initiated`)
    .setDescription(
      `> Commands Loaded\n` +
      `> Riffy Initialized\n` +
      `> Database Connected\n` +
      `> ${botName} Ready\n` +
      `> Event Listeners Registered\n` +
      `> Webhook Connected`
    )
    .setThumbnail(botAvatar)
    .setImage("https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExZHNkZGtsZzkxZHFtMmtiMWxmaGR6MDRobTRvZ2V6em83bjVpMXB6byZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/25ckx2IRr8kq8XrqxQ/giphy.gif")
    .setFooter({ text: `${botName} is Love`, iconURL: botAvatar })
    .setTimestamp();

  // Send the embed to the webhook
  webhook.send({ embeds: [embed] }).catch(() => {});
};
