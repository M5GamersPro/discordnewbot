import { ButtonInteraction, Interaction } from 'discord.js';
import { prisma } from '../database/prisma.js';

export async function handleButton(interaction: Interaction) {
  if (!interaction.isButton()) return;
  if (interaction.customId !== 'verify:confirm') return;
  const config = await prisma.verificationConfig.findFirst({ where: { guildId: interaction.guildId, messageId: interaction.message.id } });
  if (!config) return;
  const member = interaction.member;
  if (!member || !('roles' in member)) return;
  await member.roles.add(config.roleId).catch(() => undefined);
  await interaction.reply({ content: 'You have been verified!', ephemeral: true });
}
