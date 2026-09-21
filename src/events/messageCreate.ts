import { Message } from 'discord.js';
import { prisma } from '../database/prisma.js';
import { levelingService } from '../services/levelingService.js';

const invitePattern = /(discord\.gg\/|discord\.com\/invite\/)/i;
const urlPattern = /https?:\/\/\S+/i;

export async function handleMessage(message: Message) {
  if (!message.guild || message.author.bot) return;
  const gained = await levelingService.awardMessageXp(message.guild.id, message.author.id).catch(() => null);
  if (gained?.leveledUp) await message.channel.send(`🎉 ${message.author}, you reached **level ${gained.level}**!`).catch(() => undefined);
  const config = await prisma.autoModConfig.findUnique({ where: { guildId: message.guild.id } });
  if (!config?.enabled) return;
  const blocked = (config.antiInvite && invitePattern.test(message.content)) || (config.antiLinks && urlPattern.test(message.content));
  const words = config.bannedWords.split(',').map(word => word.trim().toLowerCase()).filter(Boolean);
  if (!blocked && !words.some(word => message.content.toLowerCase().includes(word))) return;
  if (message.member?.moderatable) await message.delete().catch(() => undefined);
  const notice = await message.channel.send({ content: `${message.author}, that message was removed by AutoMod.`, allowedMentions: { users: [message.author.id] } }).catch(() => null);
  if (notice) setTimeout(() => notice.delete().catch(() => undefined), 5000);
}
