const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("show bot ping"),
    async execute(interaction){
        const msg = await interaction.reply({content:`> 延遲計算中...`,withResponse:true})
        let embed = new EmbedBuilder()
			.setTitle("ping")
			.addFields(
				{name:`message ping :`,value:`${msg.resource.message.createdTimestamp - interaction.createdTimestamp}-ms`,inline:true},
				{name:`API ping :`,value:`${Math.round(interaction.client.ws.ping)}-ms`,inline:true}
			)
        await interaction.editReply({embeds:[embed]})
    }
    
}