import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, PermissionFlagsBits, TextChannel } from 'discord.js';
import { prisma } from '../database/prisma.js';
import { config } from '../config.js';
import { ticketEmbed, colors } from '../lib/embeds.js';
import { logger } from '../lib/logger.js';

const panelRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
  new ButtonBuilder().setCustomId('ticket:create').setLabel('Create ticket').setEmoji('🎫').setStyle(ButtonStyle.Primary),
);

function controls() {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('ticket:claim').setLabel('Claim').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('ticket:close').setLabel('Close').setStyle(ButtonStyle.Danger),
  );
}

async function getConfig(guildId: string) {
  return prisma.guildConfig.upsert({ where: { guildId }, update: {}, create: {
    guildId, supportRoleId: config.supportRoleId ?? null, ticketCategoryId: config.ticketCategoryId ?? null, ticketLogChannelId: config.logsChannelId ?? null,
  } });
}

export const ticketService = {
  async postPanel(interaction: any) {
    const embed = ticketEmbed('Need help?', 'Press **Create ticket** to open a private support channel. Please explain your issue clearly.');
    await interaction.channel.send({ embeds: [embed], components: [panelRow] });
    await interaction.reply({ content: 'Ticket panel posted.', ephemeral: true });
  },

  async create(interaction: any) {
    const guild = interaction.guild;
    const existing = await prisma.ticket.findFirst({ where: { guildId: guild.id, creatorId: interaction.user.id, status: 'open' } });
    if (existing) return interaction.reply({ content: `You already have an open ticket: <#${existing.channelId}>`, ephemeral: true });
    const cfg = await getConfig(guild.id);
    const channel = await guild.channels.create({ name: `ticket-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 90), type: ChannelType.GuildText, parent: cfg.ticketCategoryId ?? undefined, permissionOverwrites: [
      { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
      { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
      ...(cfg.supportRoleId ? [{ id: cfg.supportRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }] : []),
    ] });
    await prisma.ticket.create({ data: { guildId: guild.id, channelId: channel.id, creatorId: interaction.user.id, status: 'open' } });
    const embed = ticketEmbed('Ticket opened', `Welcome <@${interaction.user.id}>! Support will be with you soon.`, colors.success);
    await channel.send({ content: cfg.supportRoleId ? `<@&${cfg.supportRoleId}>` : undefined, embeds: [embed], components: [controls()] });
    await interaction.reply({ content: `Your ticket is ready: ${channel}`, ephemeral: true });
    logger.info('Ticket created', { guildId: guild.id, channelId: channel.id, userId: interaction.user.id });
  },

  async close(interaction: any, reason = 'Closed by staff.') {
    const ticket = await prisma.ticket.findUnique({ where: { channelId: interaction.channelId } });
    if (!ticket) return interaction.reply({ content: 'This is not a ticket channel.', ephemeral: true });
    await prisma.ticket.update({ where: { id: ticket.id }, data: { status: 'closed', closedAt: new Date(), closeReason: reason } });
    if (interaction.channel instanceof TextChannel) await interaction.channel.permissionOverwrites.edit(ticket.creatorId, { SendMessages: false });
    await interaction.reply({ embeds: [ticketEmbed('Ticket closed', reason, colors.danger)] });
  },

  async claim(interaction: any) {
    const ticket = await prisma.ticket.findUnique({ where: { channelId: interaction.channelId } });
    if (!ticket) return interaction.reply({ content: 'This is not a ticket channel.', ephemeral: true });
    await prisma.ticket.update({ where: { id: ticket.id }, data: { claimedById: interaction.user.id } });
    await interaction.reply({ content: `This ticket has been claimed by ${interaction.user}.` });
  },

  async addMember(interaction: any, user: any) {
    if (!interaction.channel?.isTextBased()) return interaction.reply({ content: 'Use this inside a ticket.', ephemeral: true });
    await interaction.channel.permissionOverwrites.edit(user.id, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
    await interaction.reply({ content: `${user} was added to the ticket.` });
  },

  async removeMember(interaction: any, user: any) {
    if (!interaction.channel?.isTextBased()) return interaction.reply({ content: 'Use this inside a ticket.', ephemeral: true });
    await interaction.channel.permissionOverwrites.delete(user.id);
    await interaction.reply({ content: `${user} was removed from the ticket.` });
  },
};
