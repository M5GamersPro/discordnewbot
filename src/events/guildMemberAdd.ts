import { Events, GuildMember } from 'discord.js';
import { prisma } from '../database/prisma.js';
import { antiRaidService } from '../services/antiRaidService.js';

export function registerGuildMemberAdd(client: any) {
  client.on(Events.GuildMemberAdd, handleMemberJoin);
}

export async function handleMemberJoin(member: GuildMember) {
  const logConfig = await prisma.logChannel.findUnique({ where: { guildId: member.guild.id } }).catch(() => null);
  if (logConfig) {
    const channel = member.guild.channels.cache.get(logConfig.channelId);
    if (channel?.isTextBased()) await channel.send(`👋 **${member.user.tag}** joined the server.`).catch(() => undefined);
  }

  const raidTriggered = await antiRaidService.check(member.guild.id);
  if (!raidTriggered) return;

  const raidConfig = await antiRaidService.getConfig(member.guild.id);
  if (raidConfig?.action === 'ban' && member.bannable) await member.ban({ reason: 'Anti-raid protection triggered.' });
  else if (raidConfig?.action === 'timeout' && member.moderatable) await member.timeout(10 * 60_000, 'Anti-raid protection triggered.');
  else if (member.kickable) await member.kick('Anti-raid protection triggered.');

  if (logConfig) {
    const channel = member.guild.channels.cache.get(logConfig.channelId);
    if (channel?.isTextBased()) await channel.send(`🚨 Anti-raid action applied to **${member.user.tag}**.`).catch(() => undefined);
  }
  await antiRaidService.clear(member.guild.id);
}
