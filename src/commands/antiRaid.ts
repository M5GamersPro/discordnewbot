import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { prisma } from '../database/prisma.js';

export const antiRaidCommand = {
  data: new SlashCommandBuilder()
    .setName('anti-raid')
    .setDescription('Manage anti-raid protection.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(sub => sub.setName('configure').setDescription('Configure anti-raid thresholds')
      .addBooleanOption(o => o.setName('enabled').setDescription('Enable anti-raid').setRequired(true))
      .addIntegerOption(o => o.setName('joins').setDescription('Number of joins within the window').setRequired(true).setMinValue(2).setMaxValue(100))
      .addIntegerOption(o => o.setName('window').setDescription('Time window in seconds').setRequired(true).setMinValue(5).setMaxValue(300))
      .addStringOption(o => o.setName('action').setDescription('Action to take').addChoices({ name: 'Kick', value: 'kick' }, { name: 'Timeout', value: 'timeout' }, { name: 'Ban', value: 'ban' }).setRequired(true)))
    .addSubcommand(sub => sub.setName('status').setDescription('Check anti-raid status')),
  async execute(interaction: any) {
    const sub = interaction.options.getSubcommand();
    if (sub === 'status') {
      const config = await prisma.antiRaidConfig.findUnique({ where: { guildId: interaction.guildId } });
      return interaction.reply({ content: config ? `Anti-raid is ${config.enabled ? 'enabled' : 'disabled'} with a threshold of ${config.joinThreshold} joins in ${config.windowSeconds}s.` : 'Anti-raid is not configured yet.', ephemeral: true });
    }
    const enabled = interaction.options.getBoolean('enabled');
    const joinThreshold = interaction.options.getInteger('joins');
    const windowSeconds = interaction.options.getInteger('window');
    const action = interaction.options.getString('action');
    await prisma.antiRaidConfig.upsert({
      where: { guildId: interaction.guildId },
      update: { enabled, joinThreshold, windowSeconds, action },
      create: { guildId: interaction.guildId, enabled, joinThreshold, windowSeconds, action },
    });
    return interaction.reply({ content: `Anti-raid ${enabled ? 'enabled' : 'disabled'} with ${joinThreshold} joins in ${windowSeconds} seconds.`, ephemeral: true });
  },
};
