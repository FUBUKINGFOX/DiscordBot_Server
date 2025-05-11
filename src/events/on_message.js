// === encoding in UTF-8 ===
const { Events ,EmbedBuilder } = require('discord.js')

const { get_cfg_value } = require("../module/config_loader")
const { askBOT } = require("../module/ask_bot")
const { test_ARG } = require("../main")
const { APPLICATION_tester } = require("../module/fetch_APPLICATION_permission")


module.exports = {
	name: Events.MessageCreate,
	once: false,
	async execute(message) {
        const on_memtion = []
        for (const i of message.mentions.members){
            on_memtion.push(i[0])
        }

        if (on_memtion.includes(message.client.user.id)){
            if (APPLICATION_tester.includes(message.author.id)){
                if(get_cfg_value("config","ASKFBK","enable_ASKFBK",false)){
                    await askBOT(message)
                }
                else{
                    const embed = new EmbedBuilder()
                    .setTitle("ASK_BOT function is closed")
                    .setDescription("this function is closed by BOT owner.")
                    .setColor(0xfff200)
                    .setFooter({ text: 'CORN Studio ASK BOT', iconURL: 'https://cdn.discordapp.com/emojis/1028895182290161746.webp?size=96' });
                    await message.channel.send({embeds:[embed]})
                }
            }
            else{
                const embed = new EmbedBuilder()
                .setTitle("Execute Error")
                .setDescription("伺服器拒絕存取[權限不足]")
                .addFields({name:"error code:", value:"```css\n403 Forbidden                    ```"})
                .setColor(0xfff200)
                await message.channel.send({embeds:[embed]})
            }
        }
	},
};