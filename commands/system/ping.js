const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("show bot ping"),
    async execute(interaction){
        let embed = new EmbedBuilder()
			.setTitle("ping")
			.addFields(
				{name:`message ping :`,value:`${Date.now() - interaction.createdTimestamp}-ms`,inline:true},
				{name:`API ping :`,value:`${Math.round(interaction.client.ws.ping)}-ms`,inline:true}
			)
        await interaction.reply({embeds:[embed]})
    }
    
}