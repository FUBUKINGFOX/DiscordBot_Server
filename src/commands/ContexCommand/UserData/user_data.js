const {ContextMenuCommandBuilder, ApplicationCommandType} = require("discord.js")

module.exports = {      //this is test mod for CTX command
    data: new ContextMenuCommandBuilder()
    .setName("user_data")
    .setType(ApplicationCommandType.User),
    async execute(interaction){
        await interaction.reply(`user tag: ${interaction.targetMember}`)
    },
    bata:true
}