const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    AttachmentBuilder,
    ComponentType
} = require("discord.js");
const { createCanvas, loadImage, registerFont } = require("canvas");
const updateMessage = require("../handlers/setupQueue.js");
const db = require("../models/SetupSchema");
const formatDuration = require("../structure/formatDuration.js");

module.exports = async (client) => {
    const previousMessages = new Map();

    client.manager.on("trackStart", async (player, track) => {
        try {
            if (!player || !player.textChannel) return;

            // Update Setup Channel if applicable
            await updateMessage(player, client, track);

            const guildData = await db.findOne({ guildId: player.guildId });
            if (guildData && guildData.channelId === player.textChannel) return;

            const channel = client.channels.cache.get(player.textChannel);
            if (!channel) return;

            // Cleanup Previous Messages
            if (previousMessages.has(player.guildId)) {
                const oldMsgId = previousMessages.get(player.guildId);
                const oldMsg = await channel.messages.fetch(oldMsgId).catch(() => null);
                if (oldMsg && oldMsg.deletable) await oldMsg.delete();
                previousMessages.delete(player.guildId);
            }

            if (player.data.nplaying) {
                const oldMsg = await channel.messages.fetch(player.data.nplaying.id).catch(() => null);
                if (oldMsg && oldMsg.deletable) await oldMsg.delete();
                player.data.nplaying = null;
            }

            // --- Canvas Generation ---
            const generateCard = async (track) => {
                const canvas = createCanvas(1000, 350);
                const ctx = canvas.getContext("2d");
                const thumbnail = track.info.thumbnail || client.user.displayAvatarURL({ extension: "png" });

                // Background with blur effect
                ctx.fillStyle = "#0a0a0a";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                try {
                    const bg = await loadImage(thumbnail);
                    ctx.globalAlpha = 0.3;
                    ctx.drawImage(bg, -200, -200, canvas.width + 400, canvas.height + 400);
                    ctx.globalAlpha = 1;

                    // Gradient Overlay
                    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
                    gradient.addColorStop(0, "rgba(0,0,0,0.9)");
                    gradient.addColorStop(0.4, "rgba(0,0,0,0.6)");
                    gradient.addColorStop(1, "rgba(0,0,0,0.2)");
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                } catch (e) {
                    ctx.fillStyle = "#111";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }

                // Drop Shadow for Cover
                ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
                ctx.shadowBlur = 30;
                ctx.shadowOffsetX = 10;
                ctx.shadowOffsetY = 10;

                // Album Art
                try {
                    const cover = await loadImage(thumbnail);
                    const size = 260;
                    const x = 45;
                    const y = 45;
                    const radius = 20;

                    ctx.beginPath();
                    ctx.moveTo(x + radius, y);
                    ctx.lineTo(x + size - radius, y);
                    ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
                    ctx.lineTo(x + size, y + size - radius);
                    ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
                    ctx.lineTo(x + radius, y + size);
                    ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
                    ctx.lineTo(x, y + radius);
                    ctx.quadraticCurveTo(x, y, x + radius, y);
                    ctx.closePath();
                    ctx.save();
                    ctx.clip();
                    ctx.drawImage(cover, x, y, size, size);
                    ctx.restore();
                } catch (e) { }

                // Reset Shadow
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;

                const textX = 340;
                const maxWidth = 600;

                // "Now Playing" Text
                ctx.font = "bold 20px Sans";
                ctx.fillStyle = client.color || "#FFFFFF";
                ctx.fillText("NOW PLAYING", textX, 80);

                // Track Title
                ctx.font = "bold 55px Sans";
                ctx.fillStyle = "#FFFFFF";
                let title = track.info.title;
                if (ctx.measureText(title).width > maxWidth) {
                    while (ctx.measureText(title + "...").width > maxWidth && title.length > 0) {
                        title = title.substring(0, title.length - 1);
                    }
                    title += "...";
                }
                ctx.fillText(title, textX, 150);

                // Author
                ctx.font = "35px Sans";
                ctx.fillStyle = "#AAAAAA";
                let author = track.info.author;
                if (ctx.measureText(author).width > maxWidth) {
                    author = author.substring(0, 25) + "...";
                }
                ctx.fillText(author, textX, 200);

                // Static Progress Bar Design (Visual only, real one is in embed)
                const barY = 280;
                const barW = 580;
                const barH = 8;

                ctx.fillStyle = "#333333";
                ctx.beginPath();
                ctx.roundRect(textX, barY, barW, barH, 5);
                ctx.fill();

                ctx.fillStyle = client.color || "#FFFFFF";
                ctx.beginPath();
                ctx.roundRect(textX, barY, barW * 0.02, barH, 5); // Start slightly filled
                ctx.fill();

                ctx.shadowColor = client.color || "#FFFFFF";
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(textX + (barW * 0.02), barY + 4, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                ctx.font = "20px Sans";
                ctx.fillStyle = "#DDDDDD";
                ctx.fillText("0:00", textX, barY + 35);

                const durationText = track.info.isStream ? "LIVE" : formatDuration(track.info.length);
                const durWidth = ctx.measureText(durationText).width;
                ctx.fillText(durationText, textX + barW - durWidth, barY + 35);

                return canvas.toBuffer();
            };

            let attachment = null;
            try {
                const buffer = await generateCard(track);
                attachment = new AttachmentBuilder(buffer, { name: "nowplaying.png" });
            } catch (e) {
                console.error(e);
            }

            const getBar = (current, total) => {
                if (track.info.isStream) return "🔘 ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ [LIVE]";
                const size = 15;
                const percent = Math.min(current / total, 1);
                const progress = Math.round(size * percent);
                const empty = size - progress;
                return `\`${formatDuration(current)}\` [${"▬".repeat(progress)}🔘${"▬".repeat(empty)}] \`${formatDuration(total)}\``;
            };

            const embed = new EmbedBuilder()
                .setColor(client.color || "#2b2d31")
                .setDescription(
                    `## [${track.info.title}](${track.info.uri})\n` +
                    `> **By:** ${track.info.author}\n` +
                    `> **Requested By:** ${track.requester}\n\n` +
                    `${getBar(0, track.info.length)}`
                )
                .addFields(
                    { name: "Volume", value: `${player.volume}%`, inline: true },
                    { name: "Duration", value: track.info.isStream ? "LIVE" : formatDuration(track.info.length), inline: true },
                    { name: "Queue", value: `${player.queue.length} Songs`, inline: true }
                )
                .setImage("attachment://nowplaying.png") // Initial reference
                .setFooter({ text: `Playing in ${channel.guild.name}`, iconURL: channel.guild.iconURL() })
                .setTimestamp();

            // Button Rows
            const r1 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("p_prev").setEmoji("⏮️").setStyle(ButtonStyle.Secondary).setDisabled(!player.queue.previous),
                new ButtonBuilder().setCustomId("p_rewind").setEmoji("⏪").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("p_pause").setEmoji(player.paused ? "▶️" : "⏸️").setStyle(player.paused ? ButtonStyle.Success : ButtonStyle.Primary),
                new ButtonBuilder().setCustomId("p_forward").setEmoji("⏩").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("p_skip").setEmoji("⏭️").setStyle(ButtonStyle.Secondary)
            );

            const r2 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("p_loop").setEmoji(player.loop === "track" ? "🔂" : player.loop === "queue" ? "🔁" : "🔁").setStyle(player.loop !== "none" ? ButtonStyle.Success : ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("p_shuffle").setEmoji("🔀").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("p_stop").setEmoji("⏹️").setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId("p_save").setEmoji("💾").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("p_lyrics").setEmoji("📜").setStyle(ButtonStyle.Secondary)
            );

            const r3 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("p_voldown").setEmoji("🔉").setStyle(ButtonStyle.Secondary).setDisabled(player.volume <= 0),
                new ButtonBuilder().setCustomId("p_mute").setEmoji("🔇").setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId("p_volup").setEmoji("🔊").setStyle(ButtonStyle.Secondary).setDisabled(player.volume >= 150)
            );

            const msg = await channel.send({
                embeds: [embed],
                components: [r1, r2, r3],
                files: attachment ? [attachment] : []
            });

            player.data.nplaying = {
                id: msg.id,
                channelId: msg.channel.id
            };

            previousMessages.set(player.guildId, msg.id);

            // --- Progress Bar Update Interval ---
            const interval = setInterval(async () => {
                if (!player || !player.playing || !msg) return clearInterval(interval);

                try {
                    const fresh = await channel.messages.fetch(msg.id).catch(() => null);
                    if (!fresh) return clearInterval(interval);

                    const bar = getBar(player.position, track.info.length);

                    // IMPORTANT FIX: Re-assert the attachment link
                    // When fetching, Discord converts 'attachment://' to a 'https://' CDN link.
                    // We must force it back to 'attachment://nowplaying.png' so Discord knows it's the internal file.

                    const editEmbed = EmbedBuilder.from(fresh.embeds[0])
                        .setDescription(
                            `## [${track.info.title}](${track.info.uri})\n` +
                            `> **By:** ${track.info.author}\n` +
                            `> **Requested By:** ${track.requester}\n\n` +
                            `${bar}`
                        )
                        .setImage("attachment://nowplaying.png"); // <--- FIX HERE

                    await fresh.edit({ embeds: [editEmbed] });
                } catch (e) {
                    console.error(e);
                    clearInterval(interval);
                }
            }, 8000);

            // --- Collector Logic ---
            const collector = msg.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: track.info.length > 0 ? track.info.length : 600000
            });

            collector.on("collect", async (i) => {
                if (!player) return i.reply({ content: "No music playing", ephemeral: true });
                if (i.member.voice.channelId !== i.guild.members.me.voice.channelId) {
                    return i.reply({ content: "Join my voice channel first", ephemeral: true });
                }

                await i.deferUpdate();

                switch (i.customId) {
                    case "p_pause":
                        player.pause(!player.paused);
                        break;
                    case "p_skip":
                        clearInterval(interval);
                        player.stop();
                        break;
                    case "p_prev":
                        if (player.queue.previous) {
                            clearInterval(interval);
                            player.queue.unshift(player.queue.previous);
                            player.stop();
                        }
                        break;
                    case "p_stop":
                        clearInterval(interval);
                        player.destroy();
                        if (msg && msg.deletable) await msg.delete();
                        return;
                    case "p_loop":
                        if (player.loop === "none") player.setLoop("track");
                        else if (player.loop === "track") player.setLoop("queue");
                        else player.setLoop("none");
                        break;
                    case "p_shuffle":
                        player.queue.shuffle();
                        break;
                    case "p_rewind":
                        player.seek(Math.max(0, player.position - 10000));
                        break;
                    case "p_forward":
                        player.seek(Math.min(track.info.length, player.position + 10000));
                        break;
                    case "p_voldown":
                        player.setVolume(Math.max(0, player.volume - 10));
                        break;
                    case "p_volup":
                        player.setVolume(Math.min(150, player.volume + 10));
                        break;
                    case "p_mute":
                        player.setVolume(player.volume === 0 ? 100 : 0);
                        break;
                    case "p_save":
                        i.user.send({
                            embeds: [new EmbedBuilder().setColor(client.color).setTitle("Saved Track").setDescription(`[${track.info.title}](${track.info.uri})`)]
                        }).catch(() => { });
                        break;
                }

                // Update buttons
                if (i.customId !== "p_skip" && i.customId !== "p_prev" && i.customId !== "p_stop") {
                    // Rebuild rows to update button states (colors/disabled)
                    const uR1 = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId("p_prev").setEmoji("⏮️").setStyle(ButtonStyle.Secondary).setDisabled(!player.queue.previous),
                        new ButtonBuilder().setCustomId("p_rewind").setEmoji("⏪").setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId("p_pause").setEmoji(player.paused ? "▶️" : "⏸️").setStyle(player.paused ? ButtonStyle.Success : ButtonStyle.Primary),
                        new ButtonBuilder().setCustomId("p_forward").setEmoji("⏩").setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId("p_skip").setEmoji("⏭️").setStyle(ButtonStyle.Secondary)
                    );
                    // ... (include R2 and R3 updates similarly if button states change, e.g. Loop color or Mute color)
                    // For brevity, using the variables defined earlier or re-defining them is needed. 
                    // Ideally you should wrap button generation in a function `getButtons(player)`

                    // Using simple edit for now:
                    const rows = [r1, r2, r3];
                    // Note: You should regenerate these objects based on new player state (e.g. paused status)
                    // Implementing getButtons function helper:

                    const getButtons = (p) => {
                        const nr1 = new ActionRowBuilder().addComponents(
                            new ButtonBuilder().setCustomId("p_prev").setEmoji("⏮️").setStyle(ButtonStyle.Secondary).setDisabled(!p.queue.previous),
                            new ButtonBuilder().setCustomId("p_rewind").setEmoji("⏪").setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder().setCustomId("p_pause").setEmoji(p.paused ? "▶️" : "⏸️").setStyle(p.paused ? ButtonStyle.Success : ButtonStyle.Primary),
                            new ButtonBuilder().setCustomId("p_forward").setEmoji("⏩").setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder().setCustomId("p_skip").setEmoji("⏭️").setStyle(ButtonStyle.Secondary)
                        );
                        const nr2 = new ActionRowBuilder().addComponents(
                            new ButtonBuilder().setCustomId("p_loop").setEmoji(p.loop === "track" ? "🔂" : p.loop === "queue" ? "🔁" : "🔁").setStyle(p.loop !== "none" ? ButtonStyle.Success : ButtonStyle.Secondary),
                            new ButtonBuilder().setCustomId("p_shuffle").setEmoji("🔀").setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder().setCustomId("p_stop").setEmoji("⏹️").setStyle(ButtonStyle.Danger),
                            new ButtonBuilder().setCustomId("p_save").setEmoji("💾").setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder().setCustomId("p_lyrics").setEmoji("📜").setStyle(ButtonStyle.Secondary)
                        );
                        const nr3 = new ActionRowBuilder().addComponents(
                            new ButtonBuilder().setCustomId("p_voldown").setEmoji("🔉").setStyle(ButtonStyle.Secondary).setDisabled(p.volume <= 0),
                            new ButtonBuilder().setCustomId("p_mute").setEmoji(p.volume === 0 ? "🔊" : "🔇").setStyle(p.volume === 0 ? ButtonStyle.Secondary : ButtonStyle.Danger),
                            new ButtonBuilder().setCustomId("p_volup").setEmoji("🔊").setStyle(ButtonStyle.Secondary).setDisabled(p.volume >= 150)
                        );
                        return [nr1, nr2, nr3];
                    }

                    // Also fix the image url in this interaction update just in case
                    const currentEmbed = EmbedBuilder.from(i.message.embeds[0]);
                    currentEmbed.setImage("attachment://nowplaying.png");

                    await i.message.edit({
                        embeds: [currentEmbed],
                        components: getButtons(player)
                    });
                }
            });

            collector.on("end", () => {
                clearInterval(interval);
                if (msg && msg.editable) {
                    const disabled = msg.components.map(row => {
                        const r = new ActionRowBuilder();
                        row.components.forEach(c => r.addComponents(ButtonBuilder.from(c).setDisabled(true)));
                        return r;
                    });
                    msg.edit({ components: disabled }).catch(() => { });
                }
            });
        } catch (e) {
            console.error(e);
        }
    });

    client.manager.on("trackEnd", async (player) => {
        // Cleanup previous messages logic
        if (player.data.nplaying) {
            const channel = client.channels.cache.get(player.data.nplaying.channelId);
            if (channel) {
                const msg = await channel.messages.fetch(player.data.nplaying.id).catch(() => null);
                if (msg && msg.deletable) await msg.delete().catch(() => { });
            }
            player.data.nplaying = null;
        }
        if (previousMessages.has(player.guildId)) {
            const id = previousMessages.get(player.guildId);
            const channel = client.channels.cache.get(player.textChannel);
            if (channel) {
                const m = await channel.messages.fetch(id).catch(() => null);
                if (m && m.deletable) await m.delete();
            }
            previousMessages.delete(player.guildId);
        }
    });
};