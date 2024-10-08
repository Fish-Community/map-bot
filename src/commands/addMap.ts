import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { addFileAttached } from '../fileops/github.js';
import { capitalizeWord, Gamemode, gamemodeOption, runFunction } from '../utils.js';
import { checkPerm } from '../commands.js';

export async function add_map(interaction: CommandInteraction) {
	if(!checkPerm(interaction, "fullAccess")){
		await interaction.reply(`You do not have the required permissions to run this command`);
		return;
	}
	const filename = interaction.options.get('filename')!.value as string;
	const gamemode = Gamemode(interaction.options.get('gamemode')!.value as string);
	const map = interaction.options.get('map')!.attachment!;
	await runFunction(interaction,
		() => addFileAttached(map, gamemode, filename),
		`Successfully added map \`${filename}\` to ${capitalizeWord(gamemode)}.`
	);
}
export const addmapCommand = new SlashCommandBuilder()
	.setName('add_map')
	.setDescription('Uploads a map to the fish mindustry server')
	.addAttachmentOption(option =>
		option.setName('map').setDescription('mindustry map to upload').setRequired(true))
	.addStringOption(gamemodeOption)
	.addStringOption(option =>
		option.setName('filename').setDescription('filename of the file to upload').setRequired(true));
