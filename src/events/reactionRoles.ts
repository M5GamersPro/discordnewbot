import { Message, PartialMessage, User } from 'discord.js';
import { prisma } from '../database/prisma.js';

export async function handleReactionAdd(reaction: any, user: User) {
  if (user.bot) return;
  const config = await prisma.reactionRole.findFirst({ where: { guildId: reaction.message.guildId, messageId: reaction.message.id, emoji: reaction.emoji.name ?? reaction.emoji.id ?? reaction.emoji.toString() } });
  if (!config) return;
  const guild = reaction.message.guild;
  if (!guild) return;
  const role = guild.roles.cache.get(config.roleId);
  if (!role) return;
  const member = guild.members.cache.get(user.id) ?? await guild.members.fetch(user.id).catch(() => null);
  if (!member) return;
  await member.roles.add(role).catch(() => undefined);
}

export async function handleReactionRemove(reaction: any, user: User) {
  if (user.bot) return;
  const config = await prisma.reactionRole.findFirst({ where: { guildId: reaction.message.guildId, messageId: reaction.message.id, emoji: reaction.emoji.name ?? reaction.emoji.id ?? reaction.emoji.toString() } });
  if (!config) return;
  const guild = reaction.message.guild;
  if (!guild) return;
  const role = guild.roles.cache.get(config.roleId);
  if (!role) return;
  const member = guild.members.cache.get(user.id) ?? await guild.members.fetch(user.id).catch(() => null);
  if (!member) return;
  await member.roles.remove(role).catch(() => undefined);
}
