import { SlashCommandBuilder } from 'discord.js';
import { moderationCommand } from './moderation.js';
import { adminCommand } from './admin.js';
import { ticketCommand } from './ticket.js';
import { utilityCommands } from './utility.js';

export const commands = [ticketCommand, moderationCommand, adminCommand, ...utilityCommands];
export type BotCommand = (typeof commands)[number];
export function commandData() { return commands.map(command => command.data.toJSON()); }
