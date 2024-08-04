import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { updateFileAttached } from "../fileops/github.js";

export async function updateMap(interaction:CommandInteraction){
    const filename = interaction.options.get('filename')?.value as string;
    const gamemode = interaction.options.get('gamemode')?.value as string;
    const map = interaction.options.get('map')?.attachment
    try {
        updateFileAttached(map,gamemode,filename);
        await interaction.reply(`Updated stored version of ${filename}`);
    } catch (error) {
        await interaction.reply(`failed to update map : ${error}`)
    }
}
export const updateMapCommand = new SlashCommandBuilder()
  .setName('update_map')
  .setDescription('Update a map from the fish repository')
  .addAttachmentOption(option =>
    option.setName('map').setDescription('mindustry map to upload').setRequired(true))
  .addStringOption(option =>
      option.setName('gamemode').setDescription('server gamemode of select map').setRequired(true))
  .addStringOption(option =>
    option.setName('filename').setDescription('filename of the map you wish to replace').setRequired(true))