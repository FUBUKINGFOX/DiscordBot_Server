const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("show command list"),
    async execute(interaction){
        let commands = interaction.client.commands
        commands = Array.from(commands, ([name, value]) => ({ name, value }));
        const embed = new EmbedBuilder()
        .setTitle("Command List")
        .setDescription(`${interaction.client.user.toString()}的指令列表`)
        .setColor(0xff80ff)
        
        const fields = []
        for (const command of commands){
            let tag = ""
            if (command.value.beta){
                tag += " > Beta"
            }
            if (command.value.privit){
                tag += " > Admin"
            }
            let prefix = "/"
            if (command.value.data.type == 2){ // user ctx command
                prefix = "#"
            }
            fields.push({name:`${prefix}${command.value.data.name}`,value:`\`${command.value.data.description}\`${tag}`})
        }
        embed.addFields(fields)
        embed.setAuthor({name: `${interaction.client.user.username}`, iconURL: `${interaction.client.user.avatarURL()}`})
        await interaction.reply({ embeds:[embed]});
    }
    
}