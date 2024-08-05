import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { gamemodePaths } from "../config.js";
import { getFileListClean } from '../fileops/github.js'
import { gamemodeChoices, gamemodes, splitReply } from '../utils.js';

export async function maps(interaction: CommandInteraction) {
    const gamemode = interaction.options.get('gamemode')?.value as string;
    if(gamemodes.includes(gamemode)){
        let gameModeMaps = await getFileListClean(gamemodePaths[gamemode])
        splitReply(interaction, `** Fish ${gamemode} Maps** \n ${gameModeMaps}`);
    }else{
        let attackMaps = await getFileListClean(gamemodePaths['attack']);
        let survivalMaps = await getFileListClean(gamemodePaths['survival']);
        let pvpMaps = await getFileListClean(gamemodePaths['pvp']);
        let hexedMaps = await getFileListClean(gamemodePaths['hexed']);
        splitReply(interaction, `## Fish Server Maps\n** Attack Maps**\n${attackMaps}** Survival Maps**\n${survivalMaps}** PvP Maps**\n${pvpMaps}** Hexed Maps**\n${hexedMaps}`);
    }
    
}
export const showMapCommand = new SlashCommandBuilder()
    .setName('maps')
    .setDescription('List all maps on the fish servers.')
    .addStringOption(option =>
        option.setName('gamemode').setDescription('Gamemode of maps to list').setRequired(false).setChoices(gamemodeChoices))
