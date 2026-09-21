import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { prisma } from '../database/prisma.js';

export const announcementCommand = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Schedule an announcement.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(o => o.setName('channel').setDescription('Channel to post in').setRequired(true))
    .addStringOption(o => o.setName('message').setDescription('Announcement message').setRequired(true))
    .addIntegerOption(o => o.setName('minutes').setDescription('Minutes until it sends').setRequired(true).setMinValue(1).setMaxValue(10080)),
  async execute(interaction: any) {
    const channel = interaction.options.getChannel('channel');
    const message = interaction.options.getString('message');
    const minutes = interaction.options.getInteger('minutes');
    await prisma.scheduledAnnouncement.create({
      data: {
        guildId: interaction.guildId,
        channelId: channel.id,
        content: message,
        runAt: new Date(Date.now() + minutes * 60 * 1000),
      },
    });
    return interaction.reply({ content: `Announcement scheduled for <#${channel.id}> in ${minutes} minute(s).`, ephemeral: true });
  },
};
