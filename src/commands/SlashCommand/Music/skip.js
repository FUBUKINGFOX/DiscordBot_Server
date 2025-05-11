const { SlashCommandBuilder} = require("discord.js")
const { getplayer } = require("./bin/functions.js")

module.exports = {
    data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("skip the song "),
    async execute(interaction){
        const player = getplayer(interaction,false)
        if (player == false){
            await interaction.reply("there is no song playing now\nplease request a song.")
            return
        }
        player.stop()
        const msg = await interaction.reply({content:"skip",withResponse: true})
    }
}