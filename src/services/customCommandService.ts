import { Message } from 'discord.js';
import { prisma } from '../database/prisma.js';

export async function handleMessage(message: Message) {
  if (!message.guild || message.author.bot || !message.channel.isSendable()) return;
  const name = message.content.trim().replace(/^!/, '').toLowerCase();
  const custom = await prisma.customCommand.findUnique({ where: { guildId_name: { guildId: message.guild.id, name } } }).catch(() => null);
  if (custom?.enabled) await message.channel.send(custom.response).catch(() => undefined);
}
