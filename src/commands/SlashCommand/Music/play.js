const { SlashCommandBuilder ,EmbedBuilder} = require("discord.js")
const { play ,getplayer ,ctxReplyer} = require("./bin/functions.js")
const { log_err } = require("../../../module/logger.js")


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
       
        await play(interaction,interaction.options.getString("url"))
        const player = getplayer(interaction,false)
        if (!player){return log_err("MODULE","<music>CMD","get player faild")};

        if (player.listenerCount("error") < 1){
            player.on('error', async(error) => {
                log_err("MODULE","<music>CMD",error.message);
                const embed = new EmbedBuilder()
                .setTitle("Network Error")
                .setDescription("已將此問題回傳CORN Studio.")
                .setColor(0xfff200)
                await ctxReplyer(interaction,embed)
            });
        }
        
    },
}