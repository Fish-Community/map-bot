import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { deleteFile } from '../fileops/github.js';

export async function deletemap(interaction: CommandInteraction) {
  const filename = interaction.options.get('filename')!.value as string;
  const gamemode = interaction.options.get('gamemode')!.value as string;
  try {
    await deleteFile(gamemode, filename);
    interaction.reply(`Map ${filename} deleted from repository`);
  } catch (error) {
    interaction.reply(`Failed to delete map: ${error}`)
  }
}

export const deleteMapCommand = new SlashCommandBuilder()
  .setName('delete_map')
  .setDescription('Deletes a map from fish servers.')
  .addStringOption(option =>
    option.setName('gamemode').setDescription('Server gamemode of the map file to be deleted').setRequired(true))
  .addStringOption(option =>
    option.setName('filename').setDescription('Filename of map to be deleted').setRequired(true))
