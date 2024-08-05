import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import config, { gamemodePath } from "../config.js";
import { getFileListClean } from '../fileops/github.js'
import { splitReply } from '../utils.js';

export async function maps(interaction: CommandInteraction) {
    const gamemode = interaction.options.get('gamemode')?.value as string;
    if(gamemode && config.github.paths.hasOwnProperty(gamemode.toLowerCase())){
        let gameModeMaps = await getFileListClean(gamemodePath[gamemode])
        splitReply(interaction, `** Fish ${gamemode} Maps** \n ${gameModeMaps}`);
    }else{
        let attackMaps = await getFileListClean(gamemodePath['attack']);
        let survivalMaps = await getFileListClean(gamemodePath['survival']);
        let pvpMaps = await getFileListClean(gamemodePath['pvp']);
        let hexedMaps = await getFileListClean(gamemodePath['hexed']);
        splitReply(interaction, `## Fish Server Maps\n** Attack Maps**\n${attackMaps}** Survival Maps**\n${survivalMaps}** PvP Maps**\n${pvpMaps}** Hexed Maps**\n${hexedMaps}`);
    }
    
}
export const showMapCommand = new SlashCommandBuilder()
    .setName('maps')
    .setDescription('List all maps on the fish servers.')
    .addStringOption(option =>
        option.setName('gamemode').setDescription('Gamemode of maps to list').setRequired(false))
