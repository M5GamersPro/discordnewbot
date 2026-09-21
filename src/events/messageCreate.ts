import { Message } from 'discord.js';
import { prisma } from '../database/prisma.js';

const invitePattern = /(discord\.gg\/|discord\.com\/invite\/)/i;
const urlPattern = /https?:\/\/\S+/i;

export async function handleMessage(message: Message) {
  if (!message.guild || message.author.bot) return;
  const config = await prisma.autoModConfig.findUnique({ where: { guildId: message.guild.id } });
  if (!config?.enabled) return;
  const blocked = (config.antiInvite && invitePattern.test(message.content)) || (config.antiLinks && urlPattern.test(message.content));
  const words = config.bannedWords.split(',').map(word => word.trim().toLowerCase()).filter(Boolean);
  const bannedWord = words.some(word => message.content.toLowerCase().includes(word));
  if (!blocked && !bannedWord) return;
  if (message.member?.moderatable) await message.delete().catch(() => undefined);
  await message.channel.send({ content: `${message.author}, that message was removed by AutoMod.`, allowedMentions: { users: [message.author.id] } }).then(sent => setTimeout(() => sent.delete().catch(() => undefined), 5000)).catch(() => undefined);
}
