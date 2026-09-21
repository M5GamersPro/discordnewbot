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
    const [entitlement, featureRow] = await Promise.all([
      this.getStatus(guildId),
      prisma.premiumFeature.findUnique({ where: { guildId_feature: { guildId, feature } } }),
    ]);
    return this.isActive(entitlement) && (featureRow?.enabled ?? true);
  },
  async grant(guildId: string, purchaserId: string, paymentRef: string) {
    if (!paymentRef.trim()) throw new Error('A privately verified payment reference is required.');
    return prisma.premiumEntitlement.upsert({
      where: { guildId },
      update: { active: true, plan: 'premium', paymentRef, purchaserId, creditsRequired: config.premiumCreditsRequired, activatedAt: new Date(), expiresAt: null },
      create: { guildId, active: true, plan: 'premium', paymentRef, purchaserId, creditsRequired: config.premiumCreditsRequired, activatedAt: new Date() },
    });
  },
  async revoke(guildId: string, actorId: string) {
    await prisma.auditLog.create({ data: { guildId, actorId, action: 'premium.revoke' } });
    return prisma.premiumEntitlement.updateMany({ where: { guildId }, data: { active: false } });
  },
};
