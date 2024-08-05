import { CommandInteraction, SlashCommandBuilder } from 'discord.js';

export async function ping(interaction: CommandInteraction) {
	await interaction.reply('pong');
}
export const pingCommand = new SlashCommandBuilder()
	.setName('ping')
	.setDescription('Replies with pong');
