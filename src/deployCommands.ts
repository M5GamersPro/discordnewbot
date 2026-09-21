import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { config } from './config.js';
import { commandData } from './commands/index.js';

const rest = new REST({ version: '10' }).setToken(config.token);
const route = config.guildId ? Routes.applicationGuildCommands(config.clientId, config.guildId) : Routes.applicationCommands(config.clientId);
await rest.put(route, { body: commandData() });
console.log(config.guildId ? 'Guild commands registered.' : 'Global commands registered.');
