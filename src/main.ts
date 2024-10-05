import { Client, GatewayIntentBits } from 'discord.js';
import config from './config.js';

import { checkPerm, registerCommands } from './commands.js';
import { ping } from './commands/ping.js';
import { maps } from './commands/showMaps.js'
import { add_map } from './commands/addMap.js';
import { delete_map } from './commands/deleteMap.js';
import { rename_map } from './commands/renameMap.js';
import { update_map } from './commands/updatemap.js';
import { getProp } from './utils.js';


const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

client.once('ready', () => {
	console.log(`Logged in as ${client.user?.tag}`);
	registerCommands().catch(console.error);
});

const commands = {
	ping, maps, add_map, delete_map, rename_map, update_map
};
Object.setPrototypeOf(commands, null); //safety

client.on('interactionCreate', async (interaction) => {
	if(interaction.guildId !== config.discord.guildID) return; //Only allow running commands in the configured server
	if (interaction.isCommand()) {
		console.log(`User ${interaction.user.tag}(${interaction.user.id}) ran command ${interaction.commandName}`);
		const handler = getProp(commands, interaction.commandName);
		if (handler) {
			try {
				await handler(interaction);
			} catch(err){
				interaction.reply(`An error occured while executing the command.`);
				console.error(err);
			}
		} else {
			console.error(`Unknown interation ${interaction.commandName} occured.`)
		}
	}
});

client.login(config.discord.token);
