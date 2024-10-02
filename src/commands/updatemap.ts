import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { updateFileAttached } from "../fileops/github.js";
import { capitalizeWord, Gamemode, gamemodeOption, runFunction } from "../utils.js";

export async function update_map(interaction: CommandInteraction) {
	const filename = interaction.options.get('filename')!.value as string;
	const gamemode = Gamemode(interaction.options.get('gamemode')!.value as string);
	const map = interaction.options.get('map')!.attachment!;
	await runFunction(interaction,
		() => updateFileAttached(map, gamemode, filename),
		`Successfully updated map \`${filename}\` for gamemode ${capitalizeWord(gamemode)}`
	);
}
export const updateMapCommand = new SlashCommandBuilder()
	.setName('update_map')
	.setDescription('Update a map from the fish repository')
	.addAttachmentOption(option =>
		option.setName('map').setDescription('mindustry map to upload').setRequired(true))
	.addStringOption(gamemodeOption)
	.addStringOption(option =>
		option.setName('filename').setDescription('filename of the map you wish to replace').setRequired(true))
