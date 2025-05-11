const { Events, EmbedBuilder, time } = require('discord.js')
const {get_cfg_value} = require("../module/config_loader")
const { APPLICATION_tester } = require("../module/fetch_APPLICATION_permission")
const {test_ARG} = require("../main")
const {log_info,log_err} = require("../module/logger")

module.exports = {
	name: Events.InteractionCreate,
	once: false,
	async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            log_err(undefined,"CALL",`No command matching ${interaction.commandName} was found.`);
            const embed = new EmbedBuilder()
            .setTitle("Execute Error")
            .setDescription(`No command matching ${interaction.commandName} was found`)
            .addFields({name:"error code:", value:"```css\n404 Not Found                    ```"})
            .setColor(0xff2f2f)
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds:[embed], ephemeral: false });
            } 
            else {
                await interaction.reply({ embeds:[embed], ephemeral: false });
            }
            return;
        }

        log_info("</>CMD","CALL",`\x1b[92m${interaction.commandName}`)

        try {
            if (command.privit == true){
                if (APPLICATION_tester.includes(interaction.user.id)){
                    await command.execute(interaction);
                }
                else{
                    const embed = new EmbedBuilder()
                    .setTitle("Execute Error")
                    .setDescription("伺服器拒絕存取[權限不足]")
                    .addFields({name:"error code:", value:"```css\n403 Forbidden                    ```"})
                    .setColor(0xfff200)
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({ embeds:[embed], ephemeral: false});
                    } 
                    else {
                        await interaction.reply({ embeds:[embed], ephemeral: false});
                    }
                }
            }
            else if (command.beta == true){
                if (APPLICATION_tester.includes(interaction.user.id)){
                    await command.execute(interaction);
                }
                else{
                    const embed = new EmbedBuilder()
                    .setTitle("Execute Error")
                    .setDescription("指令封測中")
                    .addFields({name:"error code:", value:"```css\n403 Forbidden                    ```"})
                    .setColor(0xfff200)
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({ embeds:[embed], ephemeral: false});
                    } 
                    else {
                        await interaction.reply({ embeds:[embed], ephemeral: false});
                    }
                }
            }
            else if (process.argv[2] === test_ARG){
                if (APPLICATION_tester.includes(interaction.user.id)){
                    await command.execute(interaction);
                }
                else{
                    const embed = new EmbedBuilder()
                    .setTitle("Execute Error")
                    .setDescription("應用程序封測中")
                    .addFields({name:"error code:", value:"```css\n403 Forbidden                    ```"})
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
            log_err(undefined,"CMD<LOADER>",error);
            const guild = await interaction.client.guilds.fetch(get_cfg_value("config","MAIN","GUILD_ID",""))
            const ch = await guild.channels.fetch(get_cfg_value("config","MAIN","DEBUG_MSG",""))
            await ch.send(`CMD Error report:\ncommand-id:       </${interaction.commandName}:${interaction.commandId}>\ntime:                       ${time(new Date())}\nguild:                      ${interaction.guild.name}\nchannel:                ${interaction.channel.name}\nuser:                       ${interaction.user.username}\`\`\`js\n${error}\`\`\``)
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