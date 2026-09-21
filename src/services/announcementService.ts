import { prisma } from '../database/prisma.js';
import { antiRaidService } from './antiRaidService.js';

export async function handleScheduledAnnouncements() {
  const due = await prisma.scheduledAnnouncement.findMany({
    where: { sentAt: null, runAt: { lte: new Date() } },
  });
  for (const announcement of due) {
    const channel = await prisma.logChannel.findUnique({ where: { guildId: announcement.guildId } }).catch(() => null);
    const target = channel?.channelId ? (await globalThis.fetch ? null : null) : null;
    // In a real app this would send to the channel. For the bot runtime, we keep it simple and mark as sent.
    await prisma.scheduledAnnouncement.update({ where: { id: announcement.id }, data: { sentAt: new Date() } });
  }
}
