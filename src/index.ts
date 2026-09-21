import { Client, GatewayIntentBits } from 'discord.js';
import { config } from './config.js';
import { handleInteraction } from './events/interactionCreate.js';
import { registerReady } from './events/ready.js';
import { logger } from './lib/logger.js';
import { disconnectDatabase } from './database/prisma.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
registerReady(client);
client.on('interactionCreate', handleInteraction);

process.on('SIGINT', async () => { await disconnectDatabase(); client.destroy(); process.exit(0); });
process.on('SIGTERM', async () => { await disconnectDatabase(); client.destroy(); process.exit(0); });
process.on('unhandledRejection', reason => logger.error('Unhandled rejection', { reason }));

await client.login(config.token);
