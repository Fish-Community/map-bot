import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { checkPerm } from '../commands.js';
import { updateFileAttached } from '../fileops/github.js';
import { Gamemode, runFunction } from '../utils.js';

export async function test_map(interaction: CommandInteraction) {
	if(!checkPerm(interaction, "update")){
		await interaction.reply(`You do not have the required permissions to run this command`);
		return;
	}
	const filename = "map.msav";
	const gamemode:Gamemode = "testsrv";
	const map = interaction.options.get('map')!.attachment!;
	await runFunction(interaction,
		() => updateFileAttached(map, gamemode, filename),
		`Successfully uploaded map \`${filename}\` to the testing server.`
	);
}
export const testmapCommand = new SlashCommandBuilder()
	.setName('test_map')
	.setDescription('Uploads a map to the testing server')
	.addAttachmentOption(option =>
		option.setName('map').setDescription('mindustry map to upload').setRequired(true));
