const { SlashCommandBuilder } = require("discord.js")
const { creat_queue_embed, ctxReplyer} = require("./bin/functions.js")


module.exports = {
    data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("show the song list")
    .addStringOption((page) =>{
        return page
        .setName("page")
        .setDescription("queue page")
        .setRequired(false)
    }),
    async execute(interaction){
        const e = creat_queue_embed(interaction)
        await ctxReplyer(interaction,e)
    }
}