import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { deleteFile } from '../fileops/github.js';
import { capitalizeWord, Gamemode, gamemodeOption, runFunction } from '../utils.js';
import { checkPerm } from '../commands.js';

export async function delete_map(interaction: CommandInteraction) {
	if(!checkPerm(interaction, "fullAccess")){
		await interaction.reply(`You do not have the required permissions to run this command`);
		return;
	}
	const filename = interaction.options.get('filename')!.value as string;
	const gamemode = Gamemode(interaction.options.get('gamemode')!.value as string);
	await runFunction(interaction,
		() => deleteFile(gamemode, filename),
		`Successfully deleted map \`${filename}\` from gamemode ${capitalizeWord(gamemode)}`
	);
}

export const deleteMapCommand = new SlashCommandBuilder()
	.setName('delete_map')
	.setDescription('Deletes a map from fish servers.')
	.addStringOption(gamemodeOption)
	.addStringOption(option =>
		option.setName('filename').setDescription('Filename of map to be deleted').setRequired(true))
