//  in this file:  ctx = interaction  //
const ytdl = require("@distube/ytdl-core")
const { joinVoiceChannel,
    getVoiceConnection,
    createAudioResource,
    createAudioPlayer,
    NoSubscriberBehavior
} = require("@discordjs/voice")
const { EmbedBuilder ,AttachmentBuilder, MessageFlags} = require("discord.js")
const fs = require("node:fs")

const { search } = require("./net/search")
const { APPLICATION_tester } = require("../../../../module/fetch_APPLICATION_permission")
const { get_cfg_value } = require("../../../../module/config_loader")
const { log_info } = require("../../../../module/logger")


function load_cookie(){
    let COOKIE = {}
    try{
        COOKIE = JSON.parse(fs.readFileSync("./config/COOKIE/COOKIE.json","utf-8"))
    }
    catch(error){
        fs.promises.mkdir("./config/COOKIE",{recursive:false})
        fs.writeFileSync("./config/COOKIE/COOKIE.json","","utf-8")
    }

    log_info("MODULE","<music>LOADER","\x1b[93mCOOKIE.json\x1b[92m loaded")
    let cookie_s = ""
    for (const i of COOKIE) {
        for (const [key,value]  of Object.entries(i)) {
            cookie_s += `\x1b[93m${key}: ${value}\x1b[0m\n`
        }
        cookie_s += "\x1b[96m==========\x1b[0m\n"
    }
    log_info("MODULE","<music>LOADER",`\x1b[93mCOOKIE:\n${cookie_s}\x1b[93m===============================================`)
    return COOKIE
}

let COOKIE = []
if (get_cfg_value("CMD_config","music","load_cookie",false)){
    COOKIE = load_cookie()
}

const ctxReplyer = async function ctxReplyer(interaction,obj,flags=undefined){
    if (typeof obj == "object"){
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({embeds:[obj],flags:flags});
        } 
        else {
            await interaction.reply({embeds:[obj],flags:flags});
        }
    }
    else{
        const str = String(obj)
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({content:str,flags:flags});
        } 
        else {
            await interaction.reply({content:str,flags:flags});
        }
    }
    
}
module.exports.ctxReplyer = ctxReplyer

const queue = {}
const queue_music = async function queue_music(ctx, song, creat_msg){
    const guild_id = ctx.guild.id
    song.requester = ctx.user.toString()
    try {
        queue[guild_id].push(song)
    }
    catch(err){
        queue[guild_id] = []
        queue[guild_id].push(song)
    }
    let list_c = []
    const list_1 = []
    const list_2 = []
    for(const song of queue[guild_id]){
        if(!song.playlist_tag){
            list_1.push(song)
        }
        else{
            list_2.push(song)
        }
    }
    list_c = list_1.concat(list_2)
    queue[guild_id] = list_c
    if (creat_msg){
        const embed = new EmbedBuilder()
        .setDescription(`Queued [${song.videoDetails.title}](${song.videoDetails.video_url})`)
        .setColor(0x00c6ff)
        await ctxReplyer(ctx,embed)
    }
}
module.exports.queue_music = queue_music
module.exports.queue = queue


// getplayer(interaction, bool)
//                        ^^^^ ---> if true creat new player when can't find player in list 
const players = {}
const getplayer = function getplayer(ctx, creat_player){
    const guild_id = ctx.guild.id
    if (players[guild_id] == undefined){
            const player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            },
        })
        if (!creat_player){
            return false
        }
        players[guild_id] = player
        return players[guild_id]
    }
    return players[guild_id]
}
module.exports.getplayer = getplayer


const nowplaying = {}
const duration_changer = function duration_changer(sec_num){
    if (sec_num == 0){return "Live"}
    let m = Math.trunc(sec_num/60)
    let h = Math.trunc(m/60)
    m = m - h*60
    let s = sec_num%60
    s = s.toFixed(0).padStart(2,"0")
    if (h < 1){
        return `${m}:${s}`
    }
    else{
        return `${h}:${m}:${s}`
    }
    
}
module.exports.duration_changer = duration_changer

const creat_nowplaying_embed = function creat_nowplaying_embed(nowplaying_song){
    let color = 0xff006f
    const duration = Number(nowplaying_song.videoDetails.lengthSeconds)
    if (duration == 0){
        color = 0xff3f3f
    }
    
    return new EmbedBuilder()
    .setTitle("**Now playing**")
    .setDescription(`\`\`\`css\n${nowplaying_song.videoDetails.title}\`\`\``)
    .setThumbnail(nowplaying_song.videoDetails.thumbnails[nowplaying_song.videoDetails.thumbnails.length-1].url)
    .setColor(color)
    .addFields(
        {name: "duration", value: `> ${duration_changer(duration)}`, inline: true},
        {name: "Requested by", value: `${nowplaying_song.requester}`, inline: true},
        {name: "Uploader", value: `[${nowplaying_song.videoDetails.author.name}](${nowplaying_song.videoDetails.author.user_url})`, inline: true},
        {name: "URL", value: `[click](${nowplaying_song.videoDetails.video_url})`}
    )
}

const creat_queue_embed = function creat_queue_embed(ctx){
    const guild_id = ctx.guild.id
        if (queue[guild_id] == null){
            return "queue is empty"
        }
        let page = ctx.options.getString("page")
        if (page == null){
            page = 1
        }
        page = Number(page)
        if (page == NaN){
            return "page must be a number"
        }

        page = Math.trunc(page)
       
        if (page <= 0){
            return "page must > 0"
        }
        const embed = new EmbedBuilder()
        .setTitle(`**queue for ${ctx.guild.name}**`)
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
        return embed
}
module.exports.creat_queue_embed = creat_queue_embed

const creat_resource = async function creat_resource(ctx,send_msg=true){
    const guild_id = ctx.guild.id
    const song = queue[guild_id].shift()
    nowplaying[guild_id] = song
    const embed = creat_nowplaying_embed(song)
    if(send_msg){
        if (song.local_tag){
            const file = new AttachmentBuilder("./commands/SlashCommand/music/bin/resource/FBK_DEF.png",{ name: "FBK_DEF.png" })
            await ctx.channel.send({embeds:[embed],files:[file]})
        }
        else{
            await ctx.channel.send({embeds:[embed]})
        }
    }
    
    const agent = ytdl.createAgent(COOKIE)
    let stream = ""
    if (!song.local_tag){
        stream = ytdl(song.videoDetails.video_url,{
            agent : agent,
            filter : 'audioonly',
            quality : 'highestaudio',
            format : 'mp3',
            highWaterMark : 1 << 62,
            liveBuffer : 500,
            bitrate : 128,
        })
    }
    else{
        stream = song.videoDetails.title
    }
    
    return createAudioResource(stream)
}

const connect = async function connect(interaction){
    let channel = interaction.options.getChannel("channel")
    if(channel == null){
        channel = interaction.member.voice.channel
        if(channel == null){
            interaction.reply("you must in a voice channel to use this command")
            return false
        }
    }

    if (channel.isVoiceBased() == true){
    await ctxReplyer(interaction,`> connecting to ${channel.toString()} voice channel...`)
    const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guildId,
                adapterCreator: interaction.guild.voiceAdapterCreator,
                selfDeaf: false,
                selfMute: false // this may also be needed
            }
        )
    const player = getplayer(interaction,true)
    const res = createAudioResource("./commands/SlashCommand/music/bin/resource/connect.wav")
    connection.subscribe(player)
    player.play(res)
    return connection
    }
    else {
        await ctxReplyer(interaction,`${channel.toString()} is not a voice channel`,MessageFlags.Ephemeral)
    }
}
module.exports.connect = connect

const destroy = function destroy(ctx){
    const guild_id = ctx.guild.id
    const connection = getVoiceConnection(guild_id)

    clearTimeout(channel_timeout[guild_id])
    delete channel_timeout[guild_id]
    delete players[guild_id]
    delete queue[guild_id]
    delete nowplaying[guild_id]

    if (connection == undefined){return false}
    const player = getplayer(ctx,true)
    const res = createAudioResource("./commands/SlashCommand/music/bin/resource/disconnect.wav")
    connection.subscribe(player)
    player.play(res)
    
    
    player.addListener("stateChange", async(oldOne, newOne) => {
        if(newOne.status == "idle"){
            delete players[guild_id]
            connection.destroy()
        }
    })
}
module.exports.destroy = destroy

// final method module export //
const channel_timeout = {}
module.exports.play = async function play(ctx, url){
    //init
    const guild_id = ctx.guild.id
    let connection = getVoiceConnection(guild_id)
    const player = getplayer(ctx,true)
   
    //try to connect voice_channel
    if (connection == undefined){
        connection = await connect(ctx)
        if (!connection){
            return
        }
    }
    
    let flag = true
    await ctx.channel.sendTyping()
    await search(ctx,url).then(async(song)=>{
        if (song == undefined){
            flag = false
            const embed = new EmbedBuilder()
            .setTitle("URL Error")
            .setDescription("URL 格式錯誤請詳細檢查連結")
            .setColor(0xfff200)
            await ctxReplyer(ctx,embed)
        }
        else if (song.filt_tag && !(APPLICATION_tester.includes(ctx.user.id))){
            flag = false
            const embed = new EmbedBuilder()
            .setTitle("拒絕存取")
            .setDescription("權限不足,或這首歌已被CORN Studio.列入黑名單")
            .setColor(0xfff200)
            await ctxReplyer(ctx,embed)
        }
        else if (Array.isArray(song)){
            for (const i of song){
                await queue_music(ctx, i, false)
            }
            
            const e = creat_queue_embed(ctx)
            await ctxReplyer(ctx,e)
        }
        else{
            await queue_music(ctx, song, true)
        }

        // console.log(queue) // DEBUG
        let queue_d = Object.keys(queue)
        let queue_data = ""
        for(const i of queue_d){
            if (i == queue_d[(queue_d.length-1)]){
                queue_data += `\x1b[96m └─ID: ${i}\x1b[0m\n`
            }else{
                queue_data += `\x1b[96m ├─ID: ${i}\x1b[0m\n`
            }
            let counter = 0
            for(const i_ of queue[i]){
                counter ++
                let filt = ""
                if (i_.filt_tag == true){
                    filt = "\x1b[93m[#FILT]\x1b[0m"
                }
                let playlst_tag = ""
                if (i_.playlist_tag == true){
                    playlst_tag = "\x1b[94m[#PLST]\x1b[0m"
                }
                let local_tag = ""
                if (i_.local_tag == true){
                    local_tag = "\x1b[91m[#LOCAL]\x1b[0m"
                }
                if (i == queue_d[(queue_d.length-1)]){
                    if (queue[i].length == counter){
                        queue_data += `\x1b[96m   └─${i_.videoDetails.title}\x1b[0m${filt}${playlst_tag}${local_tag}\n`
                    }else{
                        queue_data += `\x1b[96m   ├─${i_.videoDetails.title}\x1b[0m${filt}${playlst_tag}${local_tag}\n`
                    }
                }else{
                    if (queue[i].length == counter){
                        queue_data += `\x1b[96m │ └─${i_.videoDetails.title}\x1b[0m${filt}${playlst_tag}${local_tag}\n`
                    }else{
                        queue_data += `\x1b[96m │ ├─${i_.videoDetails.title}\x1b[0m${filt}${playlst_tag}${local_tag}\n`
                    }
                }
            }
        }
        delete queue_d
        log_info("MODULE","<music>FUNC",`\x1b[92mQUEUE DATA\x1b[96m\n${queue_data}\x1b[0m`)
        if(flag == true){ //when song undefind will skip script
            if (player.listenerCount("stateChange") < 1){
                if (player.state.status == "idle"){
                    let resource = await creat_resource(ctx)
                    connection.subscribe(player)
                    player.play(resource)
                }
                player.addListener("stateChange", async(oldOne, newOne) => {
                        if (newOne.status == "idle") {

                            if (queue[guild_id][0] != undefined){
                                let resource = await creat_resource(ctx)
                                player.play(resource)
                                
                            }
                            else{
                                channel_timeout[guild_id] = setTimeout(destroy, 300000, ctx)// 5 min time out ==> call : destroy() method
                            }
                        }
                    }
                )
                return
            }

            if (channel_timeout[guild_id] != null){
                clearTimeout(channel_timeout[guild_id])
                delete channel_timeout[guild_id]
                let resource = await creat_resource(ctx)
                player.play(resource)
            }
        }
    })
}


