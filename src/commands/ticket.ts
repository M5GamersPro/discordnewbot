import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { ticketService } from '../services/ticketService.js';

export const ticketCommand = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Manage the support ticket system.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addSubcommand(sub => sub.setName('setup').setDescription('Post the ticket panel.'))
    .addSubcommand(sub => sub.setName('close').setDescription('Close this ticket.'))
    .addSubcommand(sub => sub.setName('claim').setDescription('Claim this ticket.'))
    .addSubcommand(sub => sub.setName('add').setDescription('Add a member to this ticket.')
      .addUserOption(option => option.setName('user').setDescription('Member to add').setRequired(true)))
    .addSubcommand(sub => sub.setName('remove').setDescription('Remove a member from this ticket.')
      .addUserOption(option => option.setName('user').setDescription('Member to remove').setRequired(true))),
  async execute(interaction: any) {
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === 'setup') return ticketService.postPanel(interaction);
    if (subcommand === 'close') return ticketService.close(interaction, 'Closed by a moderator.');
    if (subcommand === 'claim') return ticketService.claim(interaction);
    if (subcommand === 'add') return ticketService.addMember(interaction, interaction.options.getUser('user'));
    if (subcommand === 'remove') return ticketService.removeMember(interaction, interaction.options.getUser('user'));
  },
};
