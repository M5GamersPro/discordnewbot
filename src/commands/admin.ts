import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { prisma } from '../database/prisma.js';

export const adminCommand = {
  data: new SlashCommandBuilder()
    .setName('admin').setDescription('Configure server systems.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(s => s.setName('automod').setDescription('Configure automod.')
      .addBooleanOption(o => o.setName('enabled').setDescription('Enable automod').setRequired(true))
      .addBooleanOption(o => o.setName('anti-invites').setDescription('Block Discord invites'))
      .addBooleanOption(o => o.setName('anti-links').setDescription('Block links')))
    .addSubcommand(s => s.setName('welcome').setDescription('Configure welcome messages.')
      .addChannelOption(o => o.setName('channel').setDescription('Welcome channel'))
      .addStringOption(o => o.setName('message').setDescription('Use {user} and {server}'))
      .addBooleanOption(o => o.setName('enabled').setDescription('Enable welcome messages').setRequired(true)))
    .addSubcommand(s => s.setName('settings').setDescription('Show current settings.')),
  async execute(interaction: any) {
    const sub = interaction.options.getSubcommand();
    if (sub === 'automod') {
      const data = { enabled: interaction.options.getBoolean('enabled'), antiInvite: interaction.options.getBoolean('anti-invites') ?? true, antiLinks: interaction.options.getBoolean('anti-links') ?? false };
      await prisma.autoModConfig.upsert({ where: { guildId: interaction.guildId }, update: data, create: { guildId: interaction.guildId, ...data } });
      return interaction.reply({ content: `Automod ${data.enabled ? 'enabled' : 'disabled'}.`, ephemeral: true });
    }
    if (sub === 'welcome') {
      const data = { enabled: interaction.options.getBoolean('enabled'), channelId: interaction.options.getChannel('channel')?.id, message: interaction.options.getString('message') ?? 'Welcome {user} to {server}!' };
      await prisma.welcomeConfig.upsert({ where: { guildId: interaction.guildId }, update: data, create: { guildId: interaction.guildId, ...data } });
      return interaction.reply({ content: `Welcome messages ${data.enabled ? 'enabled' : 'disabled'}.`, ephemeral: true });
    }
    const [automod, welcome] = await Promise.all([
      prisma.autoModConfig.findUnique({ where: { guildId: interaction.guildId } }),
      prisma.welcomeConfig.findUnique({ where: { guildId: interaction.guildId } }),
    ]);
    return interaction.reply({ ephemeral: true, embeds: [new EmbedBuilder().setTitle('Server settings').addFields(
      { name: 'Automod', value: automod?.enabled ? 'Enabled' : 'Disabled', inline: true },
      { name: 'Welcome', value: welcome?.enabled ? 'Enabled' : 'Disabled', inline: true },
    ).setColor(0x5865f2)] });
  },
};
