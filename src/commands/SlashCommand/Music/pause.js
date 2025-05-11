const { SlashCommandBuilder } =require("discord.js")
const { getplayer } = require("./bin/functions.js")
module.exports = {
    data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("pause the song"),
    async execute(interaction){
        const player = getplayer(interaction,false)
        if (player == false){
            await interaction.reply("please request a song first")
            return
        }
        player.pause()
        await interaction.reply("pause:pause_button:")
    }
}