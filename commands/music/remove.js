const { SlashCommandBuilder } = require("discord.js")
const { queue } = require("./bin/functions.js")

module.exports = {
    data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("remove the song in queue")
    .addStringOption((index) => {
        return index
        .setName("index")
        .setDescription("the song's index you want to remove")
        .setRequired(true)
    }),
    async execute(interaction){
        const guild_id = interaction.guild.id
        const index = Number(interaction.options.getString("index"))
        if (index == NaN){
            await interaction.reply("index must be a number")
            return
        }
        if (index <= 0){
            await interaction.reply("index must > 0")
            return
        }
        if (queue[guild_id] == undefined){
            await interaction.reply("can't found queue please request a song")
            return
        }
        if (index > queue[guild_id].length){
            await interaction.reply("index of song is out of queue's range")
            return
        }
        const remove_song = queue[guild_id].splice(index - 1, 1)
        await interaction.reply({content:`removed [${remove_song[0].videoDetails.title}](${remove_song[0].videoDetails.video_url})`})
    }
}