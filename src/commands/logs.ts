import { SlashCommandBuilder } from 'discord.js';
import { prisma } from '../database/prisma.js';

export const logsCommand = {
  data: new SlashCommandBuilder()
    .setName('logchannel')
    .setDescription('Set the log channel.')
    .setDefaultMemberPermissions(0)
    .addChannelOption(o => o.setName('channel').setDescription('Channel for logs').setRequired(true)),
  async execute(interaction: any) {
    const channel = interaction.options.getChannel('channel');
    await prisma.logChannel.upsert({
      where: { guildId: interaction.guildId },
      update: { channelId: channel.id },
      create: { guildId: interaction.guildId, channelId: channel.id },
    });
    await interaction.reply({ content: `Logs channel set to <#${channel.id}>.`, ephemeral: true });
  },
};
