import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { renameFile } from "../fileops/github.js";
import { capitalizeWord, Gamemode, gamemodeOption, runFunction } from "../utils.js";
import { checkPerm } from "../commands.js";

export async function rename_map(interaction: CommandInteraction) {
	if(!checkPerm(interaction, "fullAccess")){
		await interaction.reply(`You do not have the required permissions to run this command`);
		return;
	}
	const gamemode = Gamemode(interaction.options.get('gamemode')!.value as string);
	const old_name = interaction.options.get('old_filename')!.value as string;
	const new_name = interaction.options.get('new_filename')!.value as string;
	await runFunction(interaction,
		() => renameFile(gamemode, old_name, new_name),
		`Successfully renamed map \`${old_name}\` to \`${new_name}\` in gamemode ${capitalizeWord(gamemode)}`
	);
}


export const renameMapCommand = new SlashCommandBuilder()
	.setName('rename_map')
	.setDescription('rename a select map from the fish repository')
	.addStringOption(gamemodeOption)
	.addStringOption(option =>
		option.setName('old_filename').setDescription('filename of the map to change names').setRequired(true))
	.addStringOption(option =>
		option.setName('new_filename').setDescription('new filename').setRequired(true))
