// === encoding in UTF-8 ===
// URL 處理邏輯
const fs = require("node:fs")
const ytdl = require("@distube/ytdl-core")
const ytpl = require("@distube/ytpl")
const ytsr = require("@distube/ytsr")
const { EmbedBuilder, MessageFlags } = require("discord.js")

const { get_cfg_value } = require("../../../../../module/config_loader")
const { APPLICATION_OWNER } = require("../../../../../module/fetch_APPLICATION_permission")
const { log_err } = require("../../../../../module/logger")


const enable_filter = get_cfg_value("CMD_config","music","enable_filter",false)

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

function load_filter(){
    let filter_string = ""
    try{
        filter_string = fs.readFileSync("./config/filter/filter.txt","utf-8")
    }
    catch(error){
        fs.promises.mkdir("./config/filter",{recursive:false})
        fs.writeFileSync("./config/filter/filter.txt","","utf-8")
    }
    let filter_list = []
    filter_string.split(/\r?\n/).forEach((line)=>{
        filter_list.push(line)
    })
    return filter_list
}
const filter_list = load_filter()

var filter_ = function filter_(song){
    for (const i of filter_list){
        if ((song.videoDetails.title).includes(i)){
            return true
        }
    }
    return false
}

async function list_exploer(url){
    const list = []
    let list_o = await ytpl(url)
    list_o = list_o.items
    for (const i of list_o){
        list.push(i.shortUrl)
    }
        
    return list
}

//       serch(ctx, string)
//                  ^^^^^^   ---> string or url   >> return {title:"value",...}
var search = async function search(ctx,string){
    if (string.startsWith("https://")){
        if (string.includes("youtu")){
            if (string.includes("/@")){ //  channel url filter
                return undefined
            }
            if (string.includes("/live/")){// live url
                string = string.substring(0,(string.indexOf("?")))
                string = string.replace("live/","watch?v=")
            }
            if (string.includes("/playlist?")){
                let embed = new EmbedBuilder()
                    .setTitle("資料讀取中...")
                    .setColor(0xfff200)
                await ctxReplyer(ctx,embed)
                const list_o = []
                const list = await list_exploer(string)
                    for (const i of list){
                        try {
                            let song = await ytdl.getBasicInfo(i)
                            song.playlist_tag = true
                            song.filt_tag = false
                            if (enable_filter){
                                song.filt_tag = filter_(song)
                            }
                            list_o.push(song)
                        }
                        catch(err){
                            log_err("MODULE","<music>searcher",`${err}`)
                            return undefined
                        }
                    }
                return list_o
            }
            else{
                try {
                    let song = await ytdl.getBasicInfo(string)
                    song.filt_tag = false// 賦予屬性值 filter tag [false]
                    if (enable_filter){
                        song.filt_tag = filter_(song)// 改變屬性值 filter tag [true] ==> 過濾
                    }
                    return song
                }
                catch(err){
                    log_err("MODULE","<music>searcher",`${err}`)
                    return undefined
                }
            }    
        }
        else{
            return undefined
        }    
    }
    else if (string.startsWith("#") && APPLICATION_OWNER.includes(ctx.user.id)){
        const path = string.replace("#","")
        const song = {
            videoDetails : {
                video_url : "",
                title : path,
                author : {name : "==="},
                duration : 0,
                thumbnails : [{url : "attachment://FBK_DEF.png"}]
            },
            local_tag : true
        }
        return song
    }
    else{
        const results = await ytsr(string, { safeSearch: true, limit: 1 })
        let song = await ytdl.getBasicInfo(results["items"][0].url)
        song.filt_tag = false
        if (enable_filter){
            song.filt_tag = filter_(song)
        }
        return song
    }    
}
    
module.exports.search = search