const {Client, GatewayIntentBits, REST, Routes, Collection } = require('discord.js')
const path = require('node:path')

const fs = require("node:fs")
const {load_config,get_cfg_value} = require("./module/config_loader")

//init
load_config()
const client = new Client({
	intents:[GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMembers],
})
module.exports.client = client
module.exports.server_version = "0.0.1b"
const rest = new REST({version:10}).setToken(get_cfg_value("config","MAIN","TOKEN",""))

function load_commands(){
		const commands = [];
		const foldersPath = path.join(__dirname, 'commands');
		const commandFolders = fs.readdirSync(foldersPath);
		client.commands = new Collection();
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
					console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
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

const commands = load_commands()
load_events()

async function main(){
	try {
		console.log(`Started refreshing ${commands.length} application </> commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(get_cfg_value("config", "MAIN", "APPLICATION_ID", "")),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application </> commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}

	client.login(get_cfg_value("config","MAIN","TOKEN",""))
}
if (require.main === module) {
	main()
}
