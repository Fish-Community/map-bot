import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { addFileAttached } from '../fileops/github.js';
import { Gamemode, gamemodeOption, runFunction } from '../utils.js';

export async function addmap(interaction: CommandInteraction) {
  const filename = interaction.options.get('filename')!.value as string;
  const gamemode = Gamemode(interaction.options.get('gamemode')!.value as string);
  const map = interaction.options.get('map')!.attachment!;
  await runFunction(interaction,
    () => addFileAttached(map, gamemode, filename),
    `Successfully added map ${filename}.`
  );
}
export const addmapCommand = new SlashCommandBuilder()
  .setName('add_map')
  .setDescription('Uploads a map to the fish mindustry server')
  .addAttachmentOption(option =>
    option.setName('map').setDescription('mindustry map to upload').setRequired(true))
  .addStringOption(gamemodeOption)
  .addStringOption(option =>
    option.setName('filename').setDescription('filename of the file to upload').setRequired(true))