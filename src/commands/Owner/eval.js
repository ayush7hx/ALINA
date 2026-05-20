const { EmbedBuilder } = require("discord.js");
const { inspect } = require(`util`);
module.exports = {
    name: "eval",
    aliases: ["jsk","brahmastra"],
    description: "Eval Command",
    // userPermissions: PermissionFlagsBits.SendMessages,
    // botPermissions: PermissionFlagsBits.SendMessages,
    category: "Owner",
    ownerOnly: false,
    run: async (client, message, args, prefix) => {
      let sumant = ['1383706658315960330'];
      if (!sumant.includes(message.author.id)) return;
        else{
            if(!args[0])
            {
                return message.channel.send({embeds : [new EmbedBuilder().setColor(client.color).setDescription(`<:warn:1465237717725085739> | Provide me something to evaluate`)]})
            }
            let ok;
            try{
                ok = await eval(args.join(' '));
                ok = inspect(ok,{depth : 0});
            } catch(e) { ok = inspect(e,{depth : 0}) }
            let em = new EmbedBuilder().setColor(client.color).setDescription(`\`\`\`js\n${ok}\`\`\``);
            return message.channel.send({embeds : [em]});
        }
    }
}