import { prisma } from '../database/prisma.js';

const joinBuckets = new Map<string, number[]>();

export const antiRaidService = {
  async getConfig(guildId: string) {
    return prisma.antiRaidConfig.findUnique({ where: { guildId } });
  },
  async check(guildId: string) {
    const config = await this.getConfig(guildId);
    if (!config?.enabled) return false;
    const now = Date.now();
    const windowMs = config.windowSeconds * 1000;
    const bucket = joinBuckets.get(guildId) ?? [];
    const recent = bucket.filter(timestamp => now - timestamp < windowMs);
    recent.push(now);
    joinBuckets.set(guildId, recent);
    return recent.length >= config.joinThreshold;
  },
  async clear(guildId: string) {
    joinBuckets.delete(guildId);
  },
};
