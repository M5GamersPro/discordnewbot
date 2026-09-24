import { prisma } from '../database/prisma.js';

export async function handleScheduledAnnouncements(client?: any) {
  const due = await prisma.scheduledAnnouncement.findMany({ where: { sentAt: null, runAt: { lte: new Date() } } });
  for (const announcement of due) {
    const channel = client?.channels?.cache?.get(announcement.channelId);
    if (channel?.isTextBased()) {
      await channel.send(announcement.content).catch(() => undefined);
    }
    await prisma.scheduledAnnouncement.update({ where: { id: announcement.id }, data: { sentAt: new Date() } });
  }
}
