import { SlashCommandBuilder } from 'discord.js';
import { premiumCommand } from './premium.js';
import { customCommand } from './customCommand.js';
import { ticketCommand } from './ticket.js';
import { moderationCommand } from './moderation.js';
import { adminCommand } from './admin.js';
import { reactionRoleCommand } from './reactionRole.js';
import { verificationCommand } from './verification.js';
import { giveawayCommand } from './giveaway.js';
import { logsCommand } from './logs.js';
import { antiRaidCommand } from './antiRaid.js';
import { announcementCommand } from './announcement.js';
import { utilityCommands } from './utility.js';
import { levelingCommands } from './leveling.js';
import { musicCommand } from './music.js';

export const commands = [
  premiumCommand,
  customCommand,
  ticketCommand,
  moderationCommand,
  adminCommand,
  reactionRoleCommand,
  verificationCommand,
  giveawayCommand,
  logsCommand,
  antiRaidCommand,
  announcementCommand,
  musicCommand,
  ...levelingCommands,
  ...utilityCommands,
];

export type BotCommand = (typeof commands)[number];
export function commandData() { return commands.map(command => command.data.toJSON()); }
