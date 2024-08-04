import { SlashCommandBuilder } from 'discord.js';
export async function downloadmap(interaction) {
    await interaction.reply('not yet implemented download');
}
export const downloadmapCommand = new SlashCommandBuilder()
    .setName('download_map')
    .setDescription('Fetches a download link to a fish mindustry map.')
    .addStringOption(option => option.setName('map_name').setDescription('filename of the map you wish to download').setRequired(true))
    .addStringOption(option => option.setName('map_gamemode').setDescription('server of the map you wish to download.').setRequired(true));
