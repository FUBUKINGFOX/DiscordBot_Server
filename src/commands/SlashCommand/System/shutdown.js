const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")
const {save_config} = require("../../../module/config_loader")

module.exports = {
    data: new SlashCommandBuilder()
    .setName("shutdown")
    .setDescription("shutdown this bot"),
    async execute(interaction){
        await interaction.reply("> おやすみ~~")
        interaction.client.user.setStatus("invisible")
        await interaction.client.destroy()
        save_config()
        process.exit(0)

    },
    privit: true
}