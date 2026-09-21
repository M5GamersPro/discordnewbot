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
    return prisma.premiumFeature.upsert({ where: { guildId_feature: { guildId, feature } }, update: { enabled }, create: { guildId, feature, enabled } });
  },
  async activate(guildId: string, purchaserId: string, paymentRef: string) {
    // This intentionally does not trust a user-supplied claim. Connect this method to your
    // payment provider's server-to-server verification before setting active=true in production.
    if (!paymentRef || paymentRef.length < 8) return { ok: false, message: 'Invalid payment reference.' };
    return { ok: false, message: `Payment reference received, but it must be verified by the payment provider before premium can be activated. Required amount: ${config.premiumCreditsRequired.toLocaleString()} credits.` };
  },
};
