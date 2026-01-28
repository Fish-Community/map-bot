
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { CommandInteraction, GuildMember, GuildMemberRoleManager } from 'discord.js';

import config from './config.js';
import { addmapCommand } from './commands/addMap.js';
import { deleteMapCommand } from './commands/deleteMap.js';
import { pingCommand } from './commands/ping.js';
import { renameMapCommand } from './commands/renameMap.js';
import { showMapCommand } from './commands/showMaps.js';
import { testmapCommand } from './commands/testMap.js';
import { updateMapCommand } from './commands/updatemap.js';
import { crash } from './utils.js';

const commands = [
	pingCommand,
	showMapCommand,
	addmapCommand,
	deleteMapCommand,
	renameMapCommand,
	updateMapCommand,
	testmapCommand,
].map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(config.discord.token);

export async function registerCommands() {
	console.log('Started refreshing application (/) commands.');
	const commandsRoute = Routes.applicationCommands(config.discord.appID);
	const existingCommands = (await rest.get(commandsRoute)) as {
		id: string;
	}[];
	if (!Array.isArray(existingCommands)) crash(`Unexpected reponse from discord API: not an array`);
	await Promise.all(existingCommands.map(command =>
		rest.delete(`${commandsRoute}/${command.id}`)
	));
	await rest.put(
		Routes.applicationGuildCommands(config.discord.appID, config.discord.guildID),
		{ body: commands },
	);

	console.log('Successfully reloaded application (/) commands.');
}
export function checkPerm(interaction:CommandInteraction, role:"update" | "fullAccess"):boolean {
	let member = interaction.member as GuildMember;
	if(member?.roles instanceof GuildMemberRoleManager){
		if(role == "fullAccess"){
			return config.discord.fullAccessRoleIDs.some(x => member.roles.cache.has(x));
		} else {
			return config.discord.updateOnlyRoleIDs.some(x => member.roles.cache.has(x));
		}
	} else {
		console.error(`Out-Of-Date discord.js, please use v13+`);
		return false;
	}
}