import { SlashCommandBuilder } from 'discord.js';
import { addFileAttached } from '../fileops/github.js';
export async function addmap(interaction) {
    const filename = interaction.options.get('filename')?.value;
    const gamemode = interaction.options.get('gamemode')?.value;
    const map = interaction.options.get('map')?.attachment;
    if (map === undefined) {
        interaction.reply(`Map option undefined`);
        return;
    }
    try {
        addFileAttached(map, gamemode, filename);
        interaction.reply(`Map ${filename} added to servers.`);
    }
    catch (error) {
        interaction.reply(`Failed to upload map : ${error}`);
    }
}
export const addmapCommand = new SlashCommandBuilder()
    .setName('add_map')
    .setDescription('Uploads a map to the fish mindustry server')
    .addAttachmentOption(option => option.setName('map').setDescription('mindustry map to upload').setRequired(true))
    .addStringOption(option => option.setName('gamemode').setDescription('server gamemode of select map').setRequired(true))
    .addStringOption(option => option.setName('filename').setDescription('filename of the file to upload').setRequired(true));
