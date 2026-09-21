import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { config } from '../config.js';
import { premiumService } from '../services/premiumService.js';

export const premiumCommand = {
  data: new SlashCommandBuilder()
    .setName('premium')
    .setDescription('Manage verified premium access.')
    .addSubcommand(sub => sub.setName('status').setDescription('Check this server\'s premium status.'))
    .addSubcommand(sub => sub.setName('grant').setDescription('Owner-only: grant verified premium access.')
      .addStringOption(o => o.setName('guild-id').setDescription('Server ID to activate').setRequired(true))
      .addStringOption(o => o.setName('payment-reference').setDescription('Your privately verified payment reference').setRequired(true)))
    .addSubcommand(sub => sub.setName('revoke').setDescription('Owner-only: revoke premium access.')
      .addStringOption(o => o.setName('guild-id').setDescription('Server ID to deactivate').setRequired(true)))
    .addSubcommand(sub => sub.setName('feature').setDescription('Toggle a premium feature.')
      .addStringOption(o => o.setName('name').setDescription('Feature name').setRequired(true))
      .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable').setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction: any) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'status') {
      const ent = await premiumService.getStatus(interaction.guildId);
      const active = premiumService.isActive(ent);
      return interaction.reply({ ephemeral: true, embeds: [new EmbedBuilder()
        .setTitle('Premium status')
        .setDescription(active ? 'Premium is active.' : 'Premium is not active.')
        .addFields(
          { name: 'Plan', value: ent?.plan ?? 'none', inline: true },
          { name: 'Price', value: `${config.premiumCreditsRequired.toLocaleString()} ProBot credits`, inline: true },
        )
        .setColor(active ? 0xf1c40f : 0x95a5a6)] });
    }

    if (sub === 'grant' || sub === 'revoke') {
      if (!config.ownerId || interaction.user.id !== config.ownerId) {
        return interaction.reply({ content: 'Only the bot owner can grant or revoke premium access.', ephemeral: true });
      }
      const guildId = interaction.options.getString('guild-id', true);
      if (sub === 'grant') {
        const reference = interaction.options.getString('payment-reference', true);
        await premiumService.grant(guildId, interaction.user.id, reference);
        return interaction.reply({ content: `Premium access granted for ${guildId}. Create or start that customer deployment separately.`, ephemeral: true });
      }
      await premiumService.revoke(guildId, interaction.user.id);
      return interaction.reply({ content: `Premium access revoked for ${guildId}.`, ephemeral: true });
    }

    const feature = interaction.options.getString('name', true);
    const enabled = interaction.options.getBoolean('enabled', true);
    if (!(await premiumService.requireActive(interaction.guildId))) {
      return interaction.reply({ content: 'This server needs an active premium plan.', ephemeral: true });
    }
    await premiumService.setFeature(interaction.guildId, feature, enabled);
    return interaction.reply({ content: `${feature} is now ${enabled ? 'enabled' : 'disabled'}.`, ephemeral: true });
  },
};
