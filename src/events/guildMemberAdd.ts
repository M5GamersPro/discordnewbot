import { GuildMember, Message } from 'discord.js';
import { prisma } from '../database/prisma.js';
import { antiRaidService } from '../services/antiRaidService.js';
import { customCommandService } from '../services/customCommandService.js';

export async function handleMemberJoin(member: GuildMember) {
  const config = await prisma.logChannel.findUnique({ where: { guildId: member.guild.id } });
  if (config) {
    const channel = member.guild.channels.cache.get(config.channelId);
    if (channel && 'isTextBased' in channel && channel.isTextBased()) {
      await channel.send(`👋 **${member.user.tag}** joined the server.`);
    }
  }
  const raidTriggered = await antiRaidService.check(member.guild.id);
  if (raidTriggered) {
    await member.kick('Anti-raid protection triggered.');
    const modLog = member.guild.channels.cache.get(config?.channelId ?? '');
    if (modLog && 'isTextBased' in modLog && modLog.isTextBased()) {
      await modLog.send(`🚨 Anti-raid protection triggered for **${member.user.tag}**.`);
    }
    await antiRaidService.clear(member.guild.id);
  }
}

export async function handleMessage(message: Message) {
  if (!message.guild || message.author.bot) return;
  const customCommand = await prisma.customCommand.findUnique({
    where: { guildId_name: { guildId: message.guild.id, name: message.content.trim().replace(/^!/, '').toLowerCase() } },
  });
  if (customCommand && customCommand.enabled) {
    await message.reply(customCommand.response);
  }
}
