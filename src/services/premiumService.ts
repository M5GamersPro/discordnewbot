import { prisma } from '../database/prisma.js';
import { config } from '../config.js';

export const premiumService = {
  async getStatus(guildId: string) {
    return prisma.premiumEntitlement.findUnique({ where: { guildId } });
  },
  isActive(entitlement: { active: boolean; expiresAt: Date | null } | null) {
    return Boolean(entitlement?.active && (!entitlement.expiresAt || entitlement.expiresAt > new Date()));
  },
  async requireActive(guildId: string) {
    return this.isActive(await this.getStatus(guildId));
  },
  async setFeature(guildId: string, feature: string, enabled: boolean) {
    return prisma.premiumFeature.upsert({
      where: { guildId_feature: { guildId, feature } },
      update: { enabled },
      create: { guildId, feature, enabled },
    });
  },
  async isFeatureEnabled(guildId: string, feature: string) {
    const ent = await this.getStatus(guildId);
    const featureRow = await prisma.premiumFeature.findUnique({ where: { guildId_feature: { guildId, feature } } });
    return this.isActive(ent) && (featureRow?.enabled ?? true);
  },
  async activate(guildId: string, purchaserId: string, paymentRef: string) {
    if (!paymentRef || paymentRef.length < 8) return { ok: false, message: 'Invalid payment reference.' };
    const required = Number(process.env.PROBOT_CREDITS_REQUIRED ?? config.premiumCreditsRequired ?? 2000000);
    return {
      ok: false,
      message: `Payment reference received and queued for validation. Verified premium activation requires a trusted server-side payment provider. Required credits: ${required.toLocaleString()}.`,
    };
  },
};
