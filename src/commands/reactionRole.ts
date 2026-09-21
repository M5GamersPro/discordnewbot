import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { prisma } from '../database/prisma.js';

export const reactionRoleCommand = {
  data: new SlashCommandBuilder()
    .setName('reactionrole')
    .setDescription('Create a reaction role message.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(o => o.setName('emoji').setDescription('Emoji to use').setRequired(true))
    .addRoleOption(o => o.setName('role').setDescription('Role to assign').setRequired(true))
    .addStringOption(o => o.setName('message').setDescription('Embed text to show').setRequired(true)),
  async execute(interaction: any) {
    const emoji = interaction.options.getString('emoji');
    const role = interaction.options.getRole('role');
    const message = interaction.options.getString('message');
    const embed = new EmbedBuilder().setTitle('Reaction Role').setDescription(message).setColor(0x5865f2);
    const sent = await interaction.channel.send({ embeds: [embed] });
    await sent.react(emoji);
    await prisma.reactionRole.create({
      data: {
        guildId: interaction.guildId,
        channelId: sent.channel.id,
        messageId: sent.id,
        emoji,
        roleId: role.id,
      },
    });
    await interaction.reply({ content: 'Reaction role created.', ephemeral: true });
  },
};
