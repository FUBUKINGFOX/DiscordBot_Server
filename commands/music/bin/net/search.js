const fs = require("fs")
const ytdl = require("@distube/ytdl-core")
const ytsr = require("ytsr")

const { get_cfg_value } = require("../../../../module/config_loader")


const enable_filter = eval(get_cfg_value("CMD_config","music","enable_filter","false"))


function read_filter(){
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
const filter_list = read_filter()

var filter_ = function filter_(song){
    for (const i of filter_list){
        if ((song.videoDetails.title).includes(i)){
            return true
        }
    }
    return false
}

//       serch(ctx, string)
//                  ^^^^^^   ---> string or url   >> return {title:"value",...}
var search = async function search(string){
    if (string.startsWith("https://")){
        if (string.includes("youtu")){
            if (string.includes("@")){
                return undefined
            }
            let song = await ytdl.getBasicInfo(string)
            song.filt_tag = false
            if (enable_filter){
                song.filt_tag = filter_(song)
            }
            return song
        }
        else{
            return undefined
        }
    }
    else{
        const filters = await ytsr.getFilters(string)
        const filter = filters.get('Type').get('Video')
        const results = await ytsr(filter.url,{pages:1})
        let song = await ytdl.getBasicInfo(results["items"][0].url)
        song.filt_tag = false
        if (enable_filter){
            song.filt_tag = filter_(song)
        }
        return song
    }
}
module.exports.search = search