const {
  EmbedBuilder,
  PermissionsBitField,
  Collection,
  WebhookClient,
} = require("discord.js");

const mongoose = require("mongoose");
const PrefixSchema = require("../models/PrefixSchema.js");
const BlacklistUserSchema = require("../models/BlacklistUserSchema.js");
const BlacklistServerSchema = require("../models/BlacklistServerSchema.js");
const NoPrefixSchema = require("../models/NoPrefixSchema.js");
const SetupSchema = require("../models/SetupSchema.js");
const IgnoreChannelSchema = require("../models/IgnoreChannelSchema.js");
const RestrictionSchema = require("../models/RestrictionSchema.js");
const PremiumGuildSchema = require("../models/PremiumGuildSchema.js");

// ⚡ In-memory cache with TTL to avoid DB on every message
const cache = {
  _store: new Map(),
  set(key, value, ttlMs = 30000) {
    this._store.set(key, { value, exp: Date.now() + ttlMs });
  },
  get(key) {
    const item = this._store.get(key);
    if (!item) return undefined;
    if (Date.now() > item.exp) { this._store.delete(key); return undefined; }
    return item.value;
  },
  del(key) { this._store.delete(key); }
};

// ⚡ Check if MongoDB is connected
function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

// ⚡ Cached DB fetch helpers
async function getSetupChannel(guildId) {
  const key = `setup:${guildId}`;
  let val = cache.get(key);
  if (val !== undefined) return val;
  if (!isDbConnected()) return null;
  const doc = await SetupSchema.findOne({ guildId }).lean();
  const channelId = doc?.channelId || null;
  cache.set(key, channelId, 60000);
  return channelId;
}

async function isUserBlacklisted(userId) {
  const key = `blUser:${userId}`;
  let val = cache.get(key);
  if (val !== undefined) return val;
  if (!isDbConnected()) return false;
  const doc = await BlacklistUserSchema.findOne({ userId }).lean();
  cache.set(key, !!doc, 120000);
  return !!doc;
}

async function isServerBlacklisted(serverId) {
  const key = `blServer:${serverId}`;
  let val = cache.get(key);
  if (val !== undefined) return val;
  if (!isDbConnected()) return false;
  const doc = await BlacklistServerSchema.findOne({ serverId }).lean();
  cache.set(key, !!doc, 120000);
  return !!doc;
}

async function getPrefix(serverId, defaultPrefix) {
  const key = `prefix:${serverId}`;
  let val = cache.get(key);
  if (val !== undefined) return val;
  if (!isDbConnected()) return defaultPrefix;
  const doc = await PrefixSchema.findOne({ serverId }).lean();
  const prefix = doc?.prefix || defaultPrefix;
  cache.set(key, prefix, 60000);
  return prefix;
}

async function hasNoPrefix(userId) {
  const key = `np:${userId}`;
  let val = cache.get(key);
  if (val !== undefined) return val;
  if (!isDbConnected()) return false;
  const doc = await NoPrefixSchema.findOne({ userId }).lean();
  cache.set(key, !!doc, 60000);
  return !!doc;
}

async function getRestriction(guildId) {
  const key = `restrict:${guildId}`;
  let val = cache.get(key);
  if (val !== undefined) return val;
  if (!isDbConnected()) return null;
  const doc = await RestrictionSchema.findOne({ guildId }).lean();
  cache.set(key, doc || null, 60000);
  return doc;
}

async function getIgnoredChannel(guildId, channelId) {
  const key = `ignore:${guildId}:${channelId}`;
  let val = cache.get(key);
  if (val !== undefined) return val;
  if (!isDbConnected()) return false;
  const doc = await IgnoreChannelSchema.findOne({ guildId, channelId }).lean();
  cache.set(key, !!doc, 60000);
  return !!doc;
}

async function getPremiumGuild(guildId) {
  const key = `premGuild:${guildId}`;
  let val = cache.get(key);
  if (val !== undefined) return val;
  if (!isDbConnected()) return null;
  const doc = await PremiumGuildSchema.findOne({ Guild: guildId }).lean();
  cache.set(key, doc || null, 120000);
  return doc;
}

module.exports = async (client) => {
  client.on("messageCreate", async (message) => {
    try {
      if (message.author.bot || !message.guild || !message.id) return;

      // ⚡ FAST: Check setup channel from cache
      const setupChannelId = await getSetupChannel(message.guild.id);
      if (setupChannelId && setupChannelId === message.channel.id) return;

      // ⚡ FAST: Get prefix first, then check if message is a command — exit early if not
      const prefix = await getPrefix(message.guild.id, client.config.prefix);
      const npUser = await hasNoPrefix(message.author.id);
      const botMentionRegex = new RegExp(`^<@!?${client.user.id}>`);
      const startsWithMention = botMentionRegex.test(message.content);

      if (!npUser && !message.content.startsWith(prefix) && !startsWithMention) return;

      // ⚡ Only now check blacklists (message is likely a command)
      if (await isUserBlacklisted(message.author.id)) return;
      if (await isServerBlacklisted(message.guild.id)) return;

      message.guild.prefix = prefix;

      const pre = startsWithMention
        ? message.content.match(botMentionRegex)[0]
        : prefix;

      let args = npUser
        ? message.content.startsWith(pre)
          ? message.content.slice(pre.length).trim().split(/ +/)
          : message.content.trim().split(/ +/)
        : message.content.slice(pre.length).trim().split(/ +/);

      const cmd = args.shift()?.toLowerCase();
      const botTag = `<@${client.user.id}>`;

      if (!cmd && message.content === botTag) {
        const tagEmbed = new EmbedBuilder()
          .setColor("#bb00ff")
          .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
          .setThumbnail(client.user.displayAvatarURL())
          .setDescription(
            `> **Prefix:** \`${prefix}\`\n\n> Use **\`${prefix}help\`** to see all my commands.\n\nHello ${message.author}, Thanks for Using ${client.user.username}`
          )
          .setImage("https://media.discordapp.net/attachments/1390938110929666058/1434405765321592842/Profile_Banner_1.png")
          .setFooter({ text: `${client.user.username} is Love`, iconURL: message.author.displayAvatarURL() });

        return message.reply({ embeds: [tagEmbed] });
      }

      if (!cmd) return;

      const command =
        client.mcommands.get(cmd) ||
        client.mcommands.find((c) => c.aliases && c.aliases.includes(cmd));
      if (!command) return;

      const player = client.manager?.players.get(message.guild.id);

      // Permission checks
      if (!["help", "stats", "ping", "invite", "support"].includes(cmd)) {
        const requiredPerms = [
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.EmbedLinks,
          PermissionsBitField.Flags.Connect,
          PermissionsBitField.Flags.Speak,
        ];
        const missing = message.guild.members.me.permissions.missing(requiredPerms);
        if (missing.length > 0) {
          return message.channel.send({
            embeds: [
              new EmbedBuilder()
                .setColor("Red")
                .setTitle("❌ Missing Permissions")
                .setDescription(`I don't have the required permissions.\n\n${missing.map(p => `\`${p}\``).join(", ")}`),
            ],
          });
        }
      }

      // Premium check
      if (command.premium) {
        const premiumData = await getPremiumGuild(message.guild.id);
        if (!premiumData) {
          return message.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(client.color)
                .setTitle("Premium Required")
                .setDescription(`Hello, ${message.author}!\nYou've discovered an exclusive **premium command**.\n\n[Click here to upgrade](https://discord.gg/7JaEAAnYzc)`),
            ],
          });
        }
        if (!premiumData.Permanent && Date.now() > premiumData.Expire) {
          if (isDbConnected()) await PremiumGuildSchema.deleteOne({ Guild: message.guild.id });
          cache.del(`premGuild:${message.guild.id}`);
          return message.reply({
            embeds: [new EmbedBuilder().setColor(client.color).setDescription(`Your premium subscription has expired.`)],
          });
        }
      }

      // Cooldowns
      if (!client.config.ownerIDS.includes(message.author.id)) {
        if (!client.cooldowns) client.cooldowns = new Collection();
        if (!client.cooldowns.has(command.name)) client.cooldowns.set(command.name, new Collection());
        const now = Date.now();
        const timestamps = client.cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || 3) * 1000;
        if (timestamps.has(message.author.id)) {
          const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
          if (now < expirationTime) {
            const timeLeft = ((expirationTime - now) / 1000).toFixed(1);
            return message.channel
              .send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`⏳ Wait **${timeLeft}s** before using this again.`)] })
              .then((msg) => setTimeout(() => msg.delete().catch(() => {}), 3000));
          }
        }
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
      }

      // User permissions
      if (command.userPermissions && !message.member.permissions.has(PermissionsBitField.resolve(command.userPermissions))) {
        return message.reply({
          embeds: [new EmbedBuilder().setColor(client.config.color).setDescription(`❌ | You don't have permission for this command.`)],
        });
      }

      // Bot permissions
      if (command.botPermissions && !message.guild.members.me.permissions.has(PermissionsBitField.resolve(command.botPermissions))) {
        return message.reply({
          embeds: [new EmbedBuilder().setColor(client.config.color).setDescription(`❌ | I don't have required permissions.`)],
        });
      }

      if (command.inVc && !message.member.voice.channel) {
        return message.reply({
          embeds: [new EmbedBuilder().setColor(client.config.color).setDescription("🎧 Join a voice channel first.")],
        });
      }

      if (command.sameVc && message.guild.members.me.voice.channel &&
          message.member.voice.channelId !== message.guild.members.me.voice.channel.id) {
        return message.reply({
          embeds: [new EmbedBuilder().setColor(client.config.color).setDescription("❌ | You must be in the same VC as me.")],
        });
      }

      // Restriction check
      const restrictionData = await getRestriction(message.guild.id);
      if (restrictionData?.restrictedTextChannels?.includes(message.channel.id)) {
        return message.reply({
          embeds: [new EmbedBuilder().setColor(client.config.color).setDescription("🚫 | Commands disabled here.")],
        });
      }

      // Ignored channel check
      if (await getIgnoredChannel(message.guild.id, message.channel.id)) {
        return message.reply({
          embeds: [new EmbedBuilder().setColor(client.config.color).setDescription("⚠️ | Commands disabled in this channel.")],
        });
      }

      // Execute command
      if (command.execute) {
        await command.execute(client, message, args);
      } else if (command.run) {
        await command.run(client, message, args, prefix, player);
      }

      // ⚡ Optional webhook logging — only if URL is set
      if (client.config.cmd_log) {
        try {
          const commandlogs = new WebhookClient({ url: client.config.cmd_log });
          commandlogs.send({
            embeds: [
              new EmbedBuilder()
                .setTitle("Command Logs")
                .setColor(client.color)
                .addFields([{
                  name: "Information",
                  value: `Author: ${message.author.tag}\nCommand: \`${command.name}\`\nGuild: ${message.guild.name} (${message.guild.id})\nChannel: ${message.channel.name} (${message.channel.id})`,
                }])
                .setThumbnail(message.guild.iconURL({ dynamic: true })),
            ],
          }).catch(() => {});
        } catch {}
      }

    } catch (err) {
      console.error(err);
      message.reply({
        embeds: [new EmbedBuilder().setColor("Red").setDescription("❌ | An error occurred while executing the command.")],
      }).catch(() => {});
    }
  });

  // ⚡ Expose cache invalidation so other commands can clear stale data
  client.clearCache = (type, id) => {
    switch (type) {
      case "prefix": cache.del(`prefix:${id}`); break;
      case "setup": cache.del(`setup:${id}`); break;
      case "blacklistUser": cache.del(`blUser:${id}`); break;
      case "blacklistServer": cache.del(`blServer:${id}`); break;
      case "noprefix": cache.del(`np:${id}`); break;
      case "ignore": cache.del(`ignore:${id}`); break;
      case "restrict": cache.del(`restrict:${id}`); break;
      case "premium": cache.del(`premGuild:${id}`); break;
    }
  };
};
