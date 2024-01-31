const { get_cfg_value } = require("./config_loader")

var APPLICATION_tester = []

async function load_APPLICATIONtester(client){
    const guild = await client.guilds.fetch(get_cfg_value("config","MAIN","GUILD_ID",""))
    const guild_f = await guild.fetch()
    guild_f.members.fetch()
    .then((members)=>{
        members.forEach(i => {
            if (!i.user.bot){
                APPLICATION_tester.push(i.user.id)
            }
        })
    })
}

module.exports.load_APPLICATIONtester = load_APPLICATIONtester
module.exports.APPLICATION_tester = APPLICATION_tester