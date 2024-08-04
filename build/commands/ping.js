import { SlashCommandBuilder } from 'discord.js';
export async function ping(interaction) {
    await interaction.reply('pong');
}
export const pingCommand = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with pong');
