import { GuildMember } from 'discord.js';
import { prisma } from '../database/prisma.js';

export async function handleMemberLeave(member: GuildMember) {
  const config = await prisma.logChannel.findUnique({ where: { guildId: member.guild.id } });
  if (!config) return;
  const channel = member.guild.channels.cache.get(config.channelId);
  if (!channel || !channel.isTextBased()) return;
  await channel.send(`👋 **${member.user.tag}** left the server.`);
}
