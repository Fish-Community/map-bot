import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { deleteFile } from '../fileops/github.js';
import { Gamemode, gamemodeOption, runFunction } from '../utils.js';

export async function delete_map(interaction: CommandInteraction) {
  const filename = interaction.options.get('filename')!.value as string;
  const gamemode = Gamemode(interaction.options.get('gamemode')!.value as string);
  await runFunction(interaction,
    () => deleteFile(gamemode, filename),
    `Successfully deleted map ${filename}`
  );
}

export const deleteMapCommand = new SlashCommandBuilder()
  .setName('delete_map')
  .setDescription('Deletes a map from fish servers.')
  .addStringOption(gamemodeOption)
  .addStringOption(option =>
    option.setName('filename').setDescription('Filename of map to be deleted').setRequired(true))
