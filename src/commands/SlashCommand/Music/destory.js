const { SlashCommandBuilder } =require("discord.js")
const { destroy } = require("./bin/functions.js")

module.exports = {
    data: new SlashCommandBuilder()
    .setName("destory")
    .setDescription("disconnect and clear the queue"),
    async execute(interaction){

        const i = destroy(interaction)
        if(i == false){
            await interaction.reply("no channel to disconnect \nplease call \`/connect\` command first")
            return
        }
        await interaction.reply("disconnect...")
    }
}