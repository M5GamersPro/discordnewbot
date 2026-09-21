import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { premiumService } from '../services/premiumService.js';
import { prisma } from '../database/prisma.js';

export const customCommand = {
  data: new SlashCommandBuilder()
    .setName('custom-command')
    .setDescription('Create premium custom commands.')
    .addSubcommand(sub => sub.setName('add').setDescription('Add a custom command').addStringOption(o => o.setName('name').setDescription('Command name').setRequired(true)).addStringOption(o => o.setName('response').setDescription('Response text').setRequired(true)))
    .addSubcommand(sub => sub.setName('remove').setDescription('Remove a custom command').addStringOption(o => o.setName('name').setDescription('Command name').setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction: any) {
    const name = interaction.options.getString('name')?.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (!name) return interaction.reply({ content: 'The command name is invalid.', ephemeral: true });
    const premiumReady = await premiumService.isFeatureEnabled(interaction.guildId, 'custom-commands');
    if (!premiumReady) return interaction.reply({ content: 'Custom commands are a premium feature.', ephemeral: true });
    if (interaction.options.getSubcommand() === 'add') {
      const response = interaction.options.getString('response');
      await prisma.customCommand.upsert({
        where: { guildId_name: { guildId: interaction.guildId, name } },
        update: { response, enabled: true },
        create: { guildId: interaction.guildId, name, response },
      });
      return interaction.reply({ content: `Custom command /${name} created.`, ephemeral: true });
    }
    await prisma.customCommand.deleteMany({ where: { guildId: interaction.guildId, name } });
    return interaction.reply({ content: `Custom command /${name} deleted.`, ephemeral: true });
  },
};
