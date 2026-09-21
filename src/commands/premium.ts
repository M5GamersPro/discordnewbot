import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { config } from '../config.js';
import { premiumService } from '../services/premiumService.js';

export const premiumCommand = {
  data: new SlashCommandBuilder()
    .setName('premium')
    .setDescription('Manage the premium bot tier.')
    .addSubcommand(s => s.setName('status').setDescription('Show premium status.'))
    .addSubcommand(s => s.setName('activate').setDescription('Activate a verified payment reference.')
      .addStringOption(o => o.setName('payment-reference').setDescription('Reference returned by your payment provider').setRequired(true)))
    .addSubcommand(s => s.setName('feature').setDescription('Enable or disable a premium feature.')
      .addStringOption(o => o.setName('name').setDescription('Feature name').setRequired(true))
      .addBooleanOption(o => o.setName('enabled').setDescription('Whether the feature is enabled').setRequired(true))),
  async execute(interaction: any) {
    const sub = interaction.options.getSubcommand();
    if (sub === 'status') {
      const entitlement = await premiumService.getStatus(interaction.guildId);
      const active = premiumService.isActive(entitlement);
      return interaction.reply({ ephemeral: true, embeds: [new EmbedBuilder().setTitle('Premium status').setDescription(active ? 'Premium is active.' : 'Premium is not active.')
        .addFields({ name: 'Plan', value: entitlement?.plan ?? 'None', inline: true }, { name: 'Required credits', value: config.premiumCreditsRequired.toLocaleString(), inline: true })
        .setColor(active ? 0xf1c40f : 0x95a5a6)] });
    }
    if (!interaction.guildId) return interaction.reply({ content: 'This command must be used in a server.', ephemeral: true });
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) return interaction.reply({ content: 'Manage Server permission required.', ephemeral: true });
    if (sub === 'activate') {
      const ref = interaction.options.getString('payment-reference');
      const result = await premiumService.activate(interaction.guildId, interaction.user.id, ref);
      return interaction.reply({ content: result.message, ephemeral: true });
    }
    const feature = interaction.options.getString('name');
    const enabled = interaction.options.getBoolean('enabled');
    if (!(await premiumService.requireActive(interaction.guildId))) return interaction.reply({ content: 'This server needs an active premium entitlement.', ephemeral: true });
    await premiumService.setFeature(interaction.guildId, feature, enabled);
    return interaction.reply({ content: `${feature} is now ${enabled ? 'enabled' : 'disabled'}.`, ephemeral: true });
  },
};
