const {Client, GatewayIntentBits, REST, Routes, Collection } = require('discord.js')
const path = require('node:path')

const fs = require("node:fs")
const {load_config,get_cfg_value} = require("./module/config_loader")
const {log_info,log_warn} = require("./module/logger")

//init
load_config()
const client = new Client({
	intents:[
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent
	],
})
module.exports.client = client
module.exports.server_version = "2.0.1c"
module.exports.test_ARG = "-test"
const rest = new REST({version:10}).setToken(get_cfg_value("config","MAIN","TOKEN",""))

client.commands = new Collection();
function load_commands(folder){
		const commands = [];
		const foldersPath = path.join(__dirname, `commands/${folder}`);
		const commandFolders = fs.readdirSync(foldersPath);
		for (const folder of commandFolders) {
		// Grab all the command files from the commands directory you created earlier
		const commandsPath = path.join(foldersPath, folder);
		const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
		// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);
			const command = require(filePath);
				if ('data' in command && 'execute' in command) {
					commands.push(command.data.toJSON());
					client.commands.set(command.data.name, command);
				} 
				else {
					log_warn(undefined,"INIT",`\x1b[93mThe command at ${filePath} is missing a required "data" or "execute" property.`);
			}
		}
	}
	return commands
}


function load_events(){
	const eventsPath = path.join(__dirname, 'events');
	const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
	for (const file of eventFiles) {
		const filePath = path.join(eventsPath, file);
		const event = require(filePath);
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		} else {
			client.on(event.name, (...args) => event.execute(...args));
		}
	}
}

const SlashCommand = load_commands("SlashCommand")
const ContexCommand = load_commands("ContexCommand")
let commands = []
commands = commands.concat(SlashCommand)
commands = commands.concat(ContexCommand)
load_events()

async function main(){
	try {
		log_info(undefined,"INIT",`Started refreshing application commands...`)
		console.log(`\x1b[96m ├─</>.. : \x1b[92m${SlashCommand.length}\x1b[0m`)
		console.log(`\x1b[96m └─<CTX> : \x1b[92m${ContexCommand.length}\x1b[0m`)
		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(get_cfg_value("config","MAIN","APPLICATION_ID","")),
			{ body: commands },
		);

		log_info(undefined,"INIT",`\x1b[94mSuccessfully reloaded \x1b[92m${data.length} \x1b[94mapplication commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}

	client.login(get_cfg_value("config","MAIN","TOKEN",""))
}
if (require.main === module) {
	main()
}
