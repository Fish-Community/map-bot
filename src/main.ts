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
	if (interaction.isCommand()) {
		if(!checkPerm(interaction)){
			await interaction.reply(`You do not have the required permissions to run this command`)
			return;
		}		const handler = getProp(commands, interaction.commandName);
		if (handler) {
			await handler(interaction);
		} else {
			console.error(`Unknown interation ${interaction.commandName} occured.`)
		}
	}
});

client.login(config.discord.token);
