import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { moderationService } from '../services/moderationService.js';

export const moderationCommand = {
  data: new SlashCommandBuilder()
    .setName('moderation').setDescription('Moderation tools.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addSubcommand(s => s.setName('warn').setDescription('Warn a member.')
      .addUserOption(o => o.setName('user').setDescription('Member').setRequired(true))
      .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(true)))
    .addSubcommand(s => s.setName('warnings').setDescription('View a member\'s warnings.')
      .addUserOption(o => o.setName('user').setDescription('Member').setRequired(true)))
    .addSubcommand(s => s.setName('timeout').setDescription('Timeout a member.')
      .addUserOption(o => o.setName('user').setDescription('Member').setRequired(true))
      .addIntegerOption(o => o.setName('minutes').setDescription('Duration in minutes').setMinValue(1).setMaxValue(40320).setRequired(true))
      .addStringOption(o => o.setName('reason').setDescription('Reason')))
    .addSubcommand(s => s.setName('purge').setDescription('Delete recent messages.')
      .addIntegerOption(o => o.setName('amount').setDescription('1-100 messages').setMinValue(1).setMaxValue(100).setRequired(true))),
  async execute(interaction: any) {
    const sub = interaction.options.getSubcommand();
    if (sub === 'warn') return moderationService.warn(interaction, interaction.options.getMember('user'), interaction.options.getString('reason'));
    if (sub === 'warnings') return moderationService.listWarnings(interaction, interaction.options.getUser('user'));
    if (sub === 'timeout') return moderationService.timeout(interaction, interaction.options.getMember('user'), interaction.options.getInteger('minutes'), interaction.options.getString('reason'));
    if (sub === 'purge') return moderationService.purge(interaction, interaction.options.getInteger('amount'));
  },
};
