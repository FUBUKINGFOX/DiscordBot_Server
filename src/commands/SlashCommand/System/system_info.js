const { SlashCommandBuilder, EmbedBuilder, version } = require("discord.js")
const { server_version } = require("../../../main.js")

module.exports = {
    data: new SlashCommandBuilder()
    .setName("system_info")
    .setDescription("show bot information"),
    async execute(interaction){
        let embed = new EmbedBuilder()
			.setTitle("System INFO")
            .setDescription(`Client ID \`\`\`js\n${interaction.client.user.id}                                        \`\`\``)
            .setColor(0xff55fc)
			.addFields(
				{name:`node`,value:`> \`${process.version}\``, inline:true},
				{name:`server`,value:`> \`${server_version}\``, inline:true},
                {name:`discord.js`,value:`> \`v${version}\``, inline:true}
			)
            .setFooter({ text: 'CORN Studio', iconURL: 'https://cdn.discordapp.com/emojis/1028895182290161746.webp?size=96' });
        await interaction.reply({embeds:[embed]})
    },
    beta:true
}