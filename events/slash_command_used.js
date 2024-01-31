const { Events, EmbedBuilder } = require('discord.js')
const {get_cfg_value} = require("../module/config_loader")


module.exports = {
	name: Events.InteractionCreate,
	once: false,
	async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }
        const APPLICATION_tester = [ get_cfg_value("config", "MAIN", "OWNER_ID", "0") ]
        try {
            if (command.beta == true){
                if (APPLICATION_tester.includes(interaction.user.id)){
                    await command.execute(interaction);
                }
                else{
                    const embed = new EmbedBuilder()
                    .setTitle("Execute Error")
                    .setDescription("This command is on close beta")
                    .addFields({name:"error code:", value:"```css\n403 Forbidden```"})
                    .setColor(0xfff200)
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({ embeds:[embed], ephemeral: false});
                    } 
                    else {
                        await interaction.reply({ embeds:[embed], ephemeral: false});
                    }
                }
            }
            else{
                await command.execute(interaction);
            }
        } 
        catch (error) {
            console.error(error);
            const guild = await interaction.client.guilds.fetch(get_cfg_value("config","MAIN","GUILD_ID",""))
            let ch = await guild.channels.fetch(get_cfg_value("config","MAIN","ON_READY_MSG",""))
            if (get_cfg_value("config","MAIN","DEBUG_MSG","auto") != "auto"){
                ch = await guild.channels.fetch(get_cfg_value("config","MAIN","DEBUG_MSG","auto"))
            }
            await ch.send(`CMD Error report:\ncommand-id:       ${interaction.commandName}\ntime:                       ${new Date().toLocaleDateString()}\nguild:                      ${interaction.guild.name}\nchannel:                ${interaction.channel.name}\nuser:                       ${interaction.user.username}\`\`\`js\n${error}\`\`\``)
            const embed = new EmbedBuilder()
            .setTitle("Execute Error")
            .setDescription("There was an error while executing this command")
            .addFields({name:"error code:", value:"```css\n500 Internal Server Error```"})
            .setColor(0xff2f2f)
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds:[embed], ephemeral: false });
            } 
            else {
                await interaction.reply({ embeds:[embed], ephemeral: false });
            }
        }
	},
};