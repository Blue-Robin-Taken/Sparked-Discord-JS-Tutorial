import { SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('potato')
        .setDescription('TACTICAL POTATO INCOMING!'),
    async execute(interaction) {
        await interaction.reply('🥔');
    },
};
