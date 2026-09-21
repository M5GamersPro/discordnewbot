import { Events, GuildMember } from 'discord.js';
import { prisma } from '../database/prisma.js';

export function registerGuildMemberAdd(client: any) {
  client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
    const config = await prisma.welcomeConfig.findUnique({ where: { guildId: member.guild.id } });
    if (!config?.enabled || !config.channelId) return;
    const channel: any = member.guild.channels.cache.get(config.channelId);
    if (!channel?.isTextBased()) return;
    await channel.send(config.message.replaceAll('{user}', `<@${member.id}>`).replaceAll('{server}', member.guild.name));
  });
}
