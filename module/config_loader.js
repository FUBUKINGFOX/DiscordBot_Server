const fs = require("fs")
const ini = require("ini")

var config = {}

function load_config(){
    const files = fs.readdirSync("./config","utf-8")
    for(let file of files){
        if (file.endsWith(".ini") && !(file.includes("example"))){
            config[file.replace(".ini","")] = ini.parse(fs.readFileSync(`./config/${file}`,"utf-8"))
            console.log(`\x1b[94m${file} \x1b[92mloaded\x1b[0m`)
        }
    }
}


function get_cfg_value(file, title, key, defult_value){
    if(config[file] == undefined){
        config[file] = {}
    }
    if(config[file][title] == undefined){
        config[file][title] = {}
    }
    if(config[file][title][key] == undefined){
        return config[file][title][key] = defult_value
    }
    return config[file][title][key]
}

function save_config(){
    const files = Object.keys(config)
    for(const file of files){
        fs.writeFileSync(`./config/${file}.ini`,ini.stringify(config[file]),"utf-8")
        console.log(`\x1b[94m${file}.ini \x1b[92msaved\x1b[0m`)
    }
}


module.exports.load_config = load_config
module.exports.get_cfg_value = get_cfg_value
module.exports.save_config = save_config

//debug
module.exports.config = config
