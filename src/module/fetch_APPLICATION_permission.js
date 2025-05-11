// === encoding in UTF-8 ===
// permission system
const { get_cfg_value } = require("./config_loader")

const APPLICATION_tester = []
const APPLICATION_OWNER = []

async function LoadApplicationPermission(client){
    if (get_cfg_value("config","MAIN","OWNER_ID","0") == "0"){
        await client.application.fetch(client.application.id).then((app)=>{
            // console.log(app)
            APPLICATION_tester.push(String(app.owner.id))// **need update**
            APPLICATION_OWNER.push(String(app.owner.id))
        })
    }
    else{
        APPLICATION_OWNER.push(String(get_cfg_value("config","MAIN","OWNER_ID","0")))
        APPLICATION_tester.push(String(get_cfg_value("config","MAIN","OWNER_ID","0")))
    }
    
}

module.exports.LoadApplicationPermission = LoadApplicationPermission
module.exports.APPLICATION_tester = APPLICATION_tester
module.exports.APPLICATION_OWNER = APPLICATION_OWNER