
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import config from './config.js';

import { pingCommand } from './commands/ping.js';
import { showMapCommand } from './commands/showMaps.js';
import { addmapCommand } from './commands/addMap.js';
import { deleteMapCommand } from './commands/deleteMap.js';
import { renameMapCommand } from './commands/renameMap.js';
import { updateMapCommand } from './commands/updatemap.js';
import { crash } from './utils.js';

const commands = [
	pingCommand,
	showMapCommand,
	addmapCommand,
	deleteMapCommand,
	renameMapCommand,
	updateMapCommand
].map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(config.discord.token);

export async function registerCommands() {
	console.log('Started refreshing application (/) commands.');
	const commandsRoute = Routes.applicationCommands(config.discord.appID);
	const existingCommands = (await rest.get(commandsRoute)) as {
		id: string;
	}[];
	if(!Array.isArray(existingCommands)) crash(`Unexpected reponse from discord API: not an array`);
	for (const command of existingCommands) {
		await rest.delete(`${commandsRoute}/${command.id}`);
	}
	await rest.put(
		Routes.applicationGuildCommands(config.discord.appID, config.discord.guildID),
		{ body: commands },
	);

	console.log('Successfully reloaded application (/) commands.');
}
