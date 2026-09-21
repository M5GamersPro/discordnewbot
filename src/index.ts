import { Client, GatewayIntentBits } from 'discord.js';
import { config } from './config.js';
import { handleInteraction } from './events/interactionCreate.js';
import { registerReady } from './events/ready.js';
import { handleMessage } from './events/messageCreate.js';
import { registerGuildMemberAdd } from './events/guildMemberAdd.js';
import { logger } from './lib/logger.js';
import { disconnectDatabase } from './database/prisma.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
registerReady(client);
registerGuildMemberAdd(client);
client.on('interactionCreate', handleInteraction);
client.on('messageCreate', handleMessage);
process.on('SIGINT', async () => { await disconnectDatabase(); client.destroy(); process.exit(0); });
process.on('SIGTERM', async () => { await disconnectDatabase(); client.destroy(); process.exit(0); });
process.on('unhandledRejection', reason => logger.error('Unhandled rejection', { reason }));
await client.login(config.token);
