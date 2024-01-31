//  in this file:  ctx = interaction  //
const ytdl  = require("ytdl-core")
const { joinVoiceChannel,
    getVoiceConnection,
    createAudioResource,
    createAudioPlayer,
    NoSubscriberBehavior
} = require("@discordjs/voice")
const { EmbedBuilder } = require("discord.js")

const { search } = require("./net/search")
const { APPLICATION_tester } = require("../../../module/fetch_APPLICATION_tester")

var queue = {}
var queue_music = async function queue_music(ctx, song, creat_msg){
    const guild_id = ctx.guild.id
    song.requester = ctx.user.toString()
    try {
        queue[guild_id].push(song)
    }
    catch(err){
        queue[guild_id] = []
        queue[guild_id].push(song)
    }
    if (creat_msg){
        const embed = new EmbedBuilder()
        .setDescription(`Queued [${song.videoDetails.title}](${song.videoDetails.video_url})`)
        .setColor(0x00c6ff)
        if (ctx.replied || ctx.deferred) {
            await ctx.followUp({embeds:[embed]});
        } 
        else {
            await ctx.reply({embeds:[embed]});
        }
    }
}
module.exports.queue_music = queue_music
module.exports.queue = queue


var connect = async function connect(interaction){
    let channel = interaction.options.getChannel("channel")
    if(channel == null){
        channel = interaction.member.voice.channel
        if(channel == null){
            interaction.reply("you must in a voice channel to use this command")
            return false
        }
    }

    await interaction.reply("connecting...")
    if (channel.isVoiceBased() == true){
    const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guildId,
                adapterCreator: interaction.guild.voiceAdapterCreator,
                selfDeaf: false,
                selfMute: false // this may also be needed
            }
        )
    return connection
    }
    else {
        await interaction.followUp({content:`${channel.toString()} is not a voice channel`, ephemeral: true })
    }
}
module.exports.connect = connect



// getplayer(interaction, bool)
//                        ^^^^ ---> if true creat new player when can't find player in list 
var players = {}
var getplayer = function getplayer(ctx, creat_player){
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


var nowplaying = {}
module.exports.nowplaying = nowplaying
var duration_changer = function duration_changer(sec_num){
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

var creat_nowplaying_embed = function creat_nowplaying_embed(nowplaying_song){
    let color = 0x00ff40
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

var creat_resource = async function creat_resource(ctx){
    const guild_id = ctx.guild.id
    const song = queue[guild_id].shift()
    nowplaying[guild_id] = song
    const embed = creat_nowplaying_embed(song)
    await ctx.channel.send({embeds:[embed]})
   
        const stream = ytdl(song.videoDetails.video_url,
            { 
        filter : 'audioonly',
        quality: 'highestaudio',
        format: 'mp3',
        highWaterMark: 1 << 62,
        liveBuffer: 500,
        bitrate: 128,
        }
    )
    return createAudioResource(stream)
}


var destroy = function destroy(ctx){
    const guild_id = ctx.guild.id
    clearTimeout(channel_timeout[guild_id])
    delete channel_timeout[guild_id]
    delete players[guild_id]
    delete queue[guild_id]
    delete nowplaying[guild_id]
    const connection = getVoiceConnection(guild_id)
    if (connection == undefined){return false}
    connection.destroy()
}
module.exports.destroy = destroy


var channel_timeout = {}
module.exports.play = async function play(ctx, url){
    const guild_id = ctx.guild.id
    let connection = getVoiceConnection(guild_id)
    const player = getplayer(ctx,true)
   
    if (connection == undefined){
        connection = await connect(ctx)
        if (!connection){
            return
        }
    }
    let flag = true
    await ctx.channel.sendTyping()
    await search(url).then(async(song)=>{
        if (song == undefined){
            flag = false
            if (ctx.replied || ctx.deferred) {
                return await ctx.followUp("url error")
            } 
            else {
                return await ctx.reply("url error")
            }
        }
        else if (song.filt_tag && !(APPLICATION_tester.includes(ctx.user.id))){
            flag = false
            if (ctx.replied || ctx.deferred) {
                return await ctx.followUp("this song had been filted")
            } 
            else {
                return await ctx.reply("this song had been filted")
            }
        }
        else{
            await queue_music(ctx, song, true)
        }
    })
    console.log(queue)
    if(flag == true){ //when song undefind will skip script
        if (player.listenerCount("stateChange") < 1){
            let resource = await creat_resource(ctx)
            connection.subscribe(player)
            player.play(resource)
            player.addListener("stateChange", async(oldOne, newOne) => {
                    if (newOne.status == "idle") {

                        if (queue[guild_id][0] != undefined){
                            let resource = await creat_resource(ctx)
                            player.play(resource)
                        }
                        else{
                            channel_timeout[guild_id] = setTimeout(destroy, 300000, ctx)
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
}


