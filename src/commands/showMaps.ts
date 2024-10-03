import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { gamemodePaths } from "../config.js";
import { getFileListClean } from '../fileops/github.js'
import { gamemodeChoices, gamemodes, splitReply } from '../utils.js';
import { checkPerm } from '../commands.js';

export async function maps(interaction: CommandInteraction) {
	if(!checkPerm(interaction, "updateOnlyRoleID")){
		await interaction.reply(`You do not have the required permissions to run this command`)
		return;
	}
	const gamemode = interaction.options.get('gamemode')?.value as string;
	if (gamemodes.includes(gamemode)) {
		let gameModeMaps = await getFileListClean(gamemodePaths[gamemode])
		await splitReply(interaction, `## Fish ${gamemode} Maps\n${gameModeMaps}`);
	} else {
		const [attackMaps, survivalMaps, pvpMaps, sandboxMaps] = await Promise.all(
			gamemodes.map(n => getFileListClean(gamemodePaths[n]))
		);
		await splitReply(interaction,
`## Fish Server Maps
### Attack Maps
${attackMaps}
### Survival Maps
${survivalMaps}
### PvP Maps
${pvpMaps}
### Sandbox Maps
${sandboxMaps}`
		);
	}

}
export const showMapCommand = new SlashCommandBuilder()
	.setName('maps')
	.setDescription('List all maps on the fish servers.')
	.addStringOption(option =>
		option.setName('gamemode').setDescription('Gamemode of maps to list').setRequired(false).setChoices(gamemodeChoices))
