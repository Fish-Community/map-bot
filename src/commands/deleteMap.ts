import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { deleteFile } from '../fileops/github.js';
import { Gamemode, gamemodeOption } from '../utils.js';

export async function deletemap(interaction: CommandInteraction) {
  const filename = interaction.options.get('filename')!.value as string;
  const gamemode = Gamemode(interaction.options.get('gamemode')!.value as string);
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
  .addStringOption(gamemodeOption)
  .addStringOption(option =>
    option.setName('filename').setDescription('Filename of map to be deleted').setRequired(true))
