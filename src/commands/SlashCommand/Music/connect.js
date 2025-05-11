const { SlashCommandBuilder} = require("discord.js")
const { connect } = require("./bin/functions.js")


module.exports = {
    data: new SlashCommandBuilder()
    .setName("connect")
    .setDescription("connect to voice channel")
    .addChannelOption((channel) =>{
        return channel
        .setName("channel")
        .setDescription("the channel which bot to connect")
        .setRequired(false)
    }),
    async execute(interaction){
       await connect(interaction)
    }
}