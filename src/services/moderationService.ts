import { EmbedBuilder } from 'discord.js';
import { prisma } from '../database/prisma.js';

export const moderationService = {
  async warn(interaction: any, member: any, reason: string) {
    if (!member) return interaction.reply({ content: 'That member could not be found.', ephemeral: true });
    await prisma.warning.create({ data: { guildId: interaction.guildId, userId: member.id, moderatorId: interaction.user.id, reason } });
    await member.send(`You were warned in **${interaction.guild.name}**: ${reason}`).catch(() => undefined);
    return interaction.reply({ content: `${member.user.tag} has been warned.`, ephemeral: true });
  },
  async listWarnings(interaction: any, user: any) {
    const warnings = await prisma.warning.findMany({ where: { guildId: interaction.guildId, userId: user.id }, orderBy: { createdAt: 'desc' }, take: 10 });
    const text = warnings.length ? warnings.map((w: any, i: number) => `**${i + 1}.** ${w.reason} — <@${w.moderatorId}>`).join('\n') : 'No warnings found.';
    return interaction.reply({ ephemeral: true, embeds: [new EmbedBuilder().setTitle(`Warnings for ${user.tag}`).setDescription(text).setColor(0xfee75c)] });
  },
  async timeout(interaction: any, member: any, minutes: number, reason: string | null) {
    if (!member?.moderatable) return interaction.reply({ content: 'I cannot timeout that member.', ephemeral: true });
    await member.timeout(minutes * 60_000, reason ?? 'No reason provided');
    return interaction.reply({ content: `${member.user.tag} was timed out for ${minutes} minute(s).` });
  },
  async purge(interaction: any, amount: number) {
    if (!interaction.channel?.isTextBased() || !interaction.channel.bulkDelete) return interaction.reply({ content: 'This is not a text channel.', ephemeral: true });
    await interaction.deferReply({ ephemeral: true });
    const deleted = await interaction.channel.bulkDelete(amount, true);
    return interaction.editReply(`Deleted ${deleted.size} message(s).`);
  },
};
