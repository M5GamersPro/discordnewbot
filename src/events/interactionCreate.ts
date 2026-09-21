import { Interaction } from 'discord.js';
import { commands } from '../commands/index.js';
import { ticketService } from '../services/ticketService.js';
import { logger } from '../lib/logger.js';

export async function handleInteraction(interaction: Interaction) {
  try {
    if (interaction.isChatInputCommand()) {
      const command = commands.find(item => item.data.name === interaction.commandName);
      if (command) await command.execute(interaction);
      return;
    }
    if (!interaction.isButton()) return;
    if (interaction.customId === 'ticket:create') return ticketService.create(interaction);
    if (interaction.customId === 'ticket:claim') return ticketService.claim(interaction);
    if (interaction.customId === 'ticket:close') return ticketService.close(interaction);
  } catch (error) {
    logger.error('Interaction failed', { error: String(error) });
    const response = { content: 'Something went wrong. Please try again later.', ephemeral: true };
    if (interaction.replied || interaction.deferred) await interaction.followUp(response);
    else await interaction.reply(response);
  }
}
