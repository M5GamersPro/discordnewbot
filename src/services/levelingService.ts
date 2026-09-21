import { prisma } from '../database/prisma.js';

const XP_COOLDOWN_MS = 60_000;

export const levelingService = {
  xpForLevel(level: number) { return level * level * 100; },
  levelForXp(xp: number) { return Math.floor(Math.sqrt(xp / 100)); },

  async awardMessageXp(guildId: string, userId: string) {
    const current = await prisma.userLevel.findUnique({ where: { guildId_userId: { guildId, userId } } });
    if (current?.lastXpAt && Date.now() - current.lastXpAt.getTime() < XP_COOLDOWN_MS) return null;
    const amount = 15 + Math.floor(Math.random() * 11);
    const xp = (current?.xp ?? 0) + amount;
    const level = this.levelForXp(xp);
    const result = await prisma.userLevel.upsert({
      where: { guildId_userId: { guildId, userId } },
      update: { xp, level, lastXpAt: new Date() },
      create: { guildId, userId, xp, level, lastXpAt: new Date() },
    });
    return { ...result, leveledUp: level > (current?.level ?? 0) };
  },

  async getStats(guildId: string, userId: string) {
    return prisma.userLevel.upsert({
      where: { guildId_userId: { guildId, userId } },
      update: {},
      create: { guildId, userId },
    });
  },

  async getRank(guildId: string, xp: number) {
    return (await prisma.userLevel.count({ where: { guildId, xp: { gt: xp } } })) + 1;
  },

  leaderboard(guildId: string, take = 10) {
    return prisma.userLevel.findMany({ where: { guildId }, orderBy: { xp: 'desc' }, take });
  },
};
