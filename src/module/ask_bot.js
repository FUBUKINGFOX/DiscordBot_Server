// === encoding in UTF-8 ===
const {Ollama} = require("ollama")
const { EmbedBuilder, AttachmentBuilder } = require("discord.js")

const {get_cfg_value} = require("./config_loader")
const {log_info, log_err} = require("../module/logger")

//init
const host = get_cfg_value("config","ASKFBK","host","http://127.0.0.1:8000")
const model = get_cfg_value("config","ASKFBK","model","fubuking")
const version = get_cfg_value("config","ASKFBK","version","latest")

async function  convert_URLToBase64(imageUrl) {
    const imageUrlData = await fetch(imageUrl)
    const buffer = await imageUrlData.arrayBuffer()
    const stringifiedBuffer = Buffer.from(buffer).toString('base64')
    return stringifiedBuffer
}


async function askBOT(message){
    //load image 
    imgstr_list = []
    for (const i of message.attachments){
        if (i[1].contentType == "image/png" || i[1].contentType == "image/jpeg"){
            img_str = await convert_URLToBase64(i[1].attachment)
            imgstr_list.push(img_str)
        }
        await message.channel.send(`> 已加入 ${i[1].name}`)
    }

    const message_c = message.content.replace(`<@${message.client.user.id}>`,"")
    if (message_c.replace(" ","")){
        await message.channel.sendTyping()
        const ollama = new Ollama({ host: host})
        const message_ = []
        // message.push({role: "assistant",content: }) 記憶

        message_.push({role: "user",content: message_c,images:imgstr_list})
        try{
            const response = await ollama.chat({model : `${model}:${version}`,
                messages: message_,
                stream:true
            })
            //字元組合邏輯
            let L = ""
            for await (const part of response) {
                L += part.message.content
                if (L.endsWith("\n")){
                    const code_block = (L.match(/```/g) || []).length
                    if (code_block != 1){
                        await message.channel.send(L)
                        L = ""
                    }
                    else{
                        if (code_block == 2){
                            await message.channel.send(L)
                            L = ""
                        }
                    }   
                }
            }

        }catch(error){
            log_err("module","<module> / ASKFBK","Net work ERROR:")
            console.error(error)
            const embed = new EmbedBuilder()
            .setTitle("Network Error")
            .setDescription("已將此問題回傳CORN Studio.")
            .setColor(0xfff200)
            await message.channel.send({embeds:[embed]})
        }
    }
    else{
        const file = new AttachmentBuilder("./module/resource/ASKFBK.jpg",{ name: "ASKFBK.jpg" })
        const embed = new  EmbedBuilder()
        .setTitle("歡迎使用 ASK FUBUKING!!!")
        .setDescription(`**HI 我是${message.client.user.username}很高興可以跟你聊天!!!**\n用 ${message.client.user.toString()} 來呼叫我\n我會用最快的速度來回答你`)
        .setThumbnail("attachment://ASKFBK.jpg")
        .setColor(0xff3376)
        .setFooter({ text: 'CORN Studio ASK BOT', iconURL: 'https://cdn.discordapp.com/emojis/1028895182290161746.webp?size=96' })

        await message.channel.send({embeds:[embed],files:[file]})
    }
}
module.exports.askBOT = askBOT
