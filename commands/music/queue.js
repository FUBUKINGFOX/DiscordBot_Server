const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")
const { queue, nowplaying, duration_changer } = require("./bin/functions.js")

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
        const guild_id = interaction.guild.id
        if (queue[guild_id] == null){
            await interaction.reply("queue is empty")
            return
        }
        let page = interaction.options.getString("page")
        if (page == null){
            page = 1
        }
        page = Number(page)
        if (page == NaN){
            await interaction.reply("page must be a number")
            return
        }

        page = Math.trunc(page)
       
        if (page <= 0){
            await interaction.reply("page must > 0")
            return
        }
        const embed = new EmbedBuilder()
        .setTitle(`**queue for ${interaction.guild.name}**`)
        .setColor(0x00c6ff)
        .setDescription(`**Now playing**  [${nowplaying[guild_id].videoDetails.title}](${nowplaying[guild_id].videoDetails.video_url})`)
        const p_start = page*10-10
        let counter = 0
        for (const i of queue[guild_id]){
            if (counter>=p_start && counter<(p_start+10)){
                embed.addFields(
                    {name: `\`${counter + 1}\` ${i.videoDetails.title}`,value: `> duration: \`${duration_changer(Number(i.videoDetails.lengthSeconds))}\`\n `}
                )
            }
            counter += 1
        }
        embed.setFooter({text: `Page: ${page}/${Math.trunc(counter/10)+1}`})
        await interaction.reply({embeds:[embed]})
    }
}