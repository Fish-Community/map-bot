import { SlashCommandBuilder } from "discord.js";
import { renameFile } from "../fileops/github.js";
export async function renameMap(interaction) {
    const gamemode = interaction.options.get('gamemode')?.value;
    const old_name = interaction.options.get('old_filename')?.value;
    const new_name = interaction.options.get('new_filename')?.value;
    try {
        await renameFile(gamemode, old_name, new_name);
        interaction.reply(`Successfully renamed ${old_name} to ${new_name}`);
    }
    catch (error) {
        interaction.reply(`Failed to rename file : ${error}`);
    }
}
export const renameMapCommand = new SlashCommandBuilder()
    .setName('rename_map')
    .setDescription('rename a select map from the fish repository')
    .addStringOption(option => option.setName('gamemode').setDescription('gamemode of the target map').setRequired(true))
    .addStringOption(option => option.setName('old_filename').setDescription('filename of the map to change names').setRequired(true))
    .addStringOption(option => option.setName('new_filename').setDescription('new filename').setRequired(true));
