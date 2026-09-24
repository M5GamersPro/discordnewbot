import { Client } from 'discord.js';
import { config } from './config.js';
import { commandData } from './commands/index.js';

export async function registerCommands(client: Client) {
  if (!client.user) throw new Error('Client is not ready.');
  await client.application.commands.set(commandData(), config.guildId);
}
