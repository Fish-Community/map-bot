import { SlashCommandBuilder } from 'discord.js';
import { addFile, deleteFile } from '../fileops/github.js';
export async function editmap(interaction) {
    const deletefile = interaction.options.get('old_filename')?.value;
    const addfile = interaction.options.get('filename')?.value;
    const gamemode = interaction.options.get('gamemode')?.value;
    const map = interaction.options.get('map')?.attachment;
    if (map === undefined) {
        interaction.reply(`E: Map option undefined.`);
        return;
    }
    let delres = await deleteFile(gamemode, deletefile);
    await interaction.reply(delres);
    let addres = await addFile(map, gamemode, addfile);
    await interaction.followUp(addres);
}
export const editmapCommand = new SlashCommandBuilder()
    .setName('edit_map')
    .setDescription('Upload a updated version of a map file to the fish servers')
    .addAttachmentOption(option => option.setName('map').setDescription('map file to upload').setRequired(true))
    .addStringOption(option => option.setName('gamemode').setDescription('the gamemode of the server you wish to upload the map too').setRequired(true))
    .addStringOption(option => option.setName('filename').setDescription('the new version of the map to replace the current one.').setRequired(true))
    .addStringOption(option => option.setName('old_filename').setDescription('the old version of the map to be replaced').setRequired(true));
