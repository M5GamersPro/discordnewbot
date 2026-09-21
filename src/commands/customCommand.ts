import { SlashCommandBuilder } from 'discord.js';
import { prisma } from '../database/prisma.js';
import { premiumService } from '../services/premiumService.js';

export const customCommand = {
  data: new SlashCommandBuilder()
    .setName('custom-command')
    .setDescription('Create or manage premium custom commands.')
    .addSubcommand(s => s.setName('add').setDescription('Add a custom command.')
      .addStringOption(o => o.setName('name').setDescription('Command name').setRequired(true))
      .addStringOption(o => o.setName('response').setDescription('Response text').setRequired(true)))
    .addSubcommand(s => s.setName('remove').setDescription('Remove a custom command.')
      .addStringOption(o => o.setName('name').setDescription('Command name').setRequired(true))),
  async execute(interaction: any) {
    if (!interaction.guildId || !(await premiumService.requireActive(interaction.guildId))) return interaction.reply({ content: 'This is a premium feature.', ephemeral: true });
    const name = interaction.options.getString('name').toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (interaction.options.getSubcommand() === 'add') {
      await prisma.customCommand.upsert({ where: { guildId_name: { guildId: interaction.guildId, name } }, update: { response: interaction.options.getString('response'), enabled: true }, create: { guildId: interaction.guildId, name, response: interaction.options.getString('response') } });
      return interaction.reply({ content: `Custom command /${name} saved.`, ephemeral: true });
    }
    await prisma.customCommand.deleteMany({ where: { guildId: interaction.guildId, name } });
    return interaction.reply({ content: `Custom command /${name} removed.`, ephemeral: true });
  },
};
