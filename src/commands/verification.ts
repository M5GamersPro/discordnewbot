import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { prisma } from '../database/prisma.js';

export const verificationCommand = {
  data: new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Create a verification panel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(o => o.setName('message').setDescription('Verification prompt').setRequired(true))
    .addRoleOption(o => o.setName('role').setDescription('Role to give after verification').setRequired(true)),
  async execute(interaction: any) {
    const message = interaction.options.getString('message');
    const role = interaction.options.getRole('role');
    const embed = new EmbedBuilder().setTitle('Verification').setDescription(message).setColor(0x57f287);
    const button = { type: 2, custom_id: 'verify:confirm', label: 'Verify me', style: 1 };
    const sent = await interaction.channel.send({ embeds: [embed], components: [{ type: 1, components: [button] }] });
    await prisma.verificationConfig.create({
      data: {
        guildId: interaction.guildId,
        channelId: sent.channel.id,
        messageId: sent.id,
        roleId: role.id,
      },
    });
    await interaction.reply({ content: 'Verification panel created.', ephemeral: true });
  },
};
