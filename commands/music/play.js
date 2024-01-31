const { SlashCommandBuilder } = require("discord.js")
const { play , getplayer } = require("./bin/functions.js")


module.exports = {
    data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("play youtube song")
    .addStringOption((url) => {
        return url
        .setName("url")
        .setDescription("string or url to request song")
        .setRequired(true)
    }),
    async execute(interaction){

        // if (interaction.user.id != OWNER_ID){
        //     const embed = new EmbedBuilder()
        //     .setTitle("ERROR:[403]")
        //     .setDescription("this command is on closebeta.")
        //     .setColor(0xfff200)
        //     await interaction.reply({embeds:[embed]})
        //     return
        // }
       
        await play(interaction,interaction.options.getString("url"))
        const player = getplayer(interaction,false)
        if (!player){return};

        player.on('error', error => {
            console.error('Error:', error.message);
        });
    },
}