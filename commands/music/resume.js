const { SlashCommandBuilder } =require("discord.js")
const { getplayer } = require("./bin/functions.js")
module.exports = {
    data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("resume the song"),
    async execute(interaction){
        const player = getplayer(interaction,false)
        if (player == false){
            await interaction.reply("please request a song first")
            return
        }
        player.unpause()
        await interaction.reply("resume:arrow_forward:")
    }
}