import { SlashCommandBuilder } from 'discord.js';
import { ticketCommand } from './ticket.js';
import { utilityCommands } from './utility.js';

export const commands = [ticketCommand, ...utilityCommands];
export type BotCommand = (typeof commands)[number];

export function commandData() { return commands.map(command => command.data.toJSON()); }
