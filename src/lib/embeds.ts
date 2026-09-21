import { EmbedBuilder } from 'discord.js';

export const colors = { primary: 0x5865f2, success: 0x57f287, danger: 0xed4245, warning: 0xfee75c };

export function ticketEmbed(title: string, description: string, color = colors.primary) {
  return new EmbedBuilder().setTitle(title).setDescription(description).setColor(color).setTimestamp();
}
