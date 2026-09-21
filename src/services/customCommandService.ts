import { Message } from 'discord.js';
import { prisma } from '../database/prisma.js';
import { premiumService } from './premiumService.js';

export async function handleCustomCommands(message: Message) {
  if (!message.guild || message.author.bot) return;
  const trigger = message.content.trim().replace(/^!/, '/');
  const custom = await prisma.customCommand.findUnique({
    where: { guildId_name: { guildId: message.guild.id, name: trigger.replace('/', '') } },
  });
  if (!custom || !custom.enabled) return;
  const premiumReady = await premiumService.isFeatureEnabled(message.guild.id, 'custom-commands');
  if (!premiumReady) return;
  await message.channel.send(custom.response);
}
