import { GuildMember, MessageReaction, PartialMessageReaction, PartialUser, User } from 'discord.js';
import { prisma } from '../database/prisma.js';

export async function handleReactionAdd(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) {
  if (user.bot || !reaction.message.guildId) return;
  const emoji = reaction.emoji.name ?? reaction.emoji.id ?? reaction.emoji.toString();
  const row = await prisma.reactionRole.findFirst({ where: { guildId: reaction.message.guildId, messageId: reaction.message.id, emoji } }).catch(() => null);
  if (!row) return;
  const guild = reaction.message.guild;
  if (!guild) return;
  const member = await guild.members.fetch(user.id).catch(() => null);
  const role = guild.roles.cache.get(row.roleId);
  if (member && role) await member.roles.add(role).catch(() => undefined);
}

export async function handleReactionRemove(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) {
  if (user.bot || !reaction.message.guildId) return;
  const emoji = reaction.emoji.name ?? reaction.emoji.id ?? reaction.emoji.toString();
  const row = await prisma.reactionRole.findFirst({ where: { guildId: reaction.message.guildId, messageId: reaction.message.id, emoji } }).catch(() => null);
  if (!row) return;
  const guild = reaction.message.guild;
  if (!guild) return;
  const member = await guild.members.fetch(user.id).catch(() => null);
  const role = guild.roles.cache.get(row.roleId);
  if (member && role) await member.roles.remove(role).catch(() => undefined);
}
