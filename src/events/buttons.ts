import { ButtonInteraction, Interaction } from 'discord.js';
import { prisma } from '../database/prisma.js';

export async function handleButton(interaction: Interaction) {
  if (!interaction.isButton() || !interaction.guildId) return;
  if (interaction.customId !== 'verify:confirm') return;
  const row = await prisma.verificationConfig.findFirst({ where: { guildId: interaction.guildId, messageId: interaction.message.id } });
  if (!row || !interaction.guild) return;
  const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
  if (!member) return;
  await member.roles.add(row.roleId).catch(() => undefined);
  if (!interaction.replied && !interaction.deferred) await interaction.reply({ content: 'You have been verified!', ephemeral: true });
}
