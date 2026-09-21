import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { premiumService } from '../services/premiumService.js';

export const premiumCommand = {
  data: new SlashCommandBuilder()
    .setName('premium')
    .setDescription('Manage premium settings.')
    .addSubcommand(sub => sub.setName('status').setDescription('Check premium status.'))
    .addSubcommand(sub => sub.setName('feature').setDescription('Toggle a premium feature.')
      .addStringOption(o => o.setName('name').setDescription('Feature name').setRequired(true))
      .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable').setRequired(true)))
    .addSubcommand(sub => sub.setName('activate').setDescription('Activate premium with a verified payment reference.')
      .addStringOption(o => o.setName('payment-reference').setDescription('Verified reference').setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction: any) {
    const sub = interaction.options.getSubcommand();
    if (sub === 'status') {
      const ent = await premiumService.getStatus(interaction.guildId);
      const active = premiumService.isActive(ent);
      return interaction.reply({ ephemeral: true, embeds: [new EmbedBuilder().setTitle('Premium status').setDescription(active ? 'Premium is active.' : 'Premium is not active.').addFields(
        { name: 'Plan', value: ent?.plan ?? 'none', inline: true },
        { name: 'Required credits', value: String(process.env.PROBOT_CREDITS_REQUIRED ?? 2000000), inline: true },
      ).setColor(active ? 0xf1c40f : 0x95a5a6)] });
    }
    if (sub === 'activate') {
      const ref = interaction.options.getString('payment-reference');
      const result = await premiumService.activate(interaction.guildId, interaction.user.id, ref);
      return interaction.reply({ content: result.message, ephemeral: true });
    }
    if (sub === 'feature') {
      const feature = interaction.options.getString('name');
      const enabled = interaction.options.getBoolean('enabled');
      const active = await premiumService.requireActive(interaction.guildId);
      if (!active) return interaction.reply({ content: 'This server needs an active premium plan.', ephemeral: true });
      await premiumService.setFeature(interaction.guildId, feature, enabled);
      return interaction.reply({ content: `${feature} is now ${enabled ? 'enabled' : 'disabled'}.`, ephemeral: true });
    }
  },
};
