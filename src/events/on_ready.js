const { Events, ActivityType } = require('discord.js')
const {get_cfg_value} = require("../module/config_loader")
const {LoadApplicationPermission} = require("../module/fetch_APPLICATION_permission")
const {test_ARG} = require("../main")
const {log_info} = require("../module/logger")

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		await LoadApplicationPermission(client)
		log_info(undefined,"INIT","\x1b[92mlog in as:")
        console.log(`\x1b[96m └─\x1b[95m${client.user.username}\x1b[0m\n`)
		if (process.argv[2] === test_ARG){
			log_info(undefined,"DEBUG",`start with DEBUG MOD`)
			client.user.setStatus("dnd")
			client.user.setActivity("🔶除錯執行中",{type:ActivityType.Custom})

		}
		else{
			client.user.setStatus("idle")
			client.user.setActivity("youtube",{type:ActivityType.Listening})
		}
		const guild = await client.guilds.fetch(get_cfg_value("config","MAIN","GUILD_ID",""))
		const ch = await guild.channels.fetch(get_cfg_value("config","MAIN","ON_READY_MSG",""))
		await ch.send(`${client.user.username}\`${client.user.id}\``)
	},
};