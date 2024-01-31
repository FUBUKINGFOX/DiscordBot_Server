const { SlashCommandBuilder} = require("discord.js")
const { getplayer } = require("./bin/functions.js")

module.exports = {
    data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("skip the song "),
    async execute(interaction){
        const player = getplayer(interaction,false)
        if (player == false){
            await interaction.reply("no song playing \nplease request a song first")
            return
        }
        player.stop()
        const msg = await interaction.reply({content:"skip",fetchReply: true})
        msg.react("<:skip:1131089446222184468>")
    }
}