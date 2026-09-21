import { SlashCommandBuilder } from 'discord.js';
import { ticketCommand } from './ticket.js';
import { moderationCommand } from './moderation.js';
import { adminCommand } from './admin.js';
import { reactionRoleCommand } from './reactionRole.js';
import { verificationCommand } from './verification.js';
import { giveawayCommand } from './giveaway.js';
import { logsCommand } from './logs.js';
import { utilityCommands } from './utility.js';

export const commands = [ticketCommand, moderationCommand, adminCommand, reactionRoleCommand, verificationCommand, giveawayCommand, logsCommand, ...utilityCommands];
export type BotCommand = (typeof commands)[number];
export function commandData() { return commands.map(command => command.data.toJSON()); }
