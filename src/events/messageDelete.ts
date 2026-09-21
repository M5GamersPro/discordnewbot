import { GuildMember, Message } from 'discord.js';
import { prisma } from '../database/prisma.js';

export async function handleMessageDelete(message: Message) {
  const config = await prisma.logChannel.findUnique({ where: { guildId: message.guildId ?? '' } });
  if (!config || !message.guild) return;
  const channel = message.guild.channels.cache.get(config.channelId);
  if (!channel || !channel.isTextBased()) return;
  await channel.send(`🗑️ Message deleted in <#${message.channel.id}> by ${message.author?.tag ?? 'unknown'}: ${message.content.slice(0, 200) || '(embed or attachment)'}`);
}
