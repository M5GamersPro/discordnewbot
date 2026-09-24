import { Client, GatewayIntentBits } from 'discord.js';
import { config } from './config.js';
import { handleInteraction } from './events/interactionCreate.js';
import { registerReady } from './events/ready.js';
import { handleMessage } from './events/messageCreate.js';
import { registerGuildMemberAdd } from './events/guildMemberAdd.js';
import { handleButton } from './events/buttons.js';
import { handleReactionAdd, handleReactionRemove } from './events/reactionRoles.js';
import { handleMessageDelete } from './events/messageDelete.js';
import { handleMemberLeave } from './events/guildMemberRemove.js';
import { logger } from './lib/logger.js';
import { disconnectDatabase } from './database/prisma.js';
import { handleScheduledAnnouncements } from './services/announcementService.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.DirectMessages,
  ],
});

registerReady(client);
registerGuildMemberAdd(client);
client.on('interactionCreate', interaction => { void handleInteraction(interaction); });
client.on('interactionCreate', interaction => { void handleButton(interaction); });
client.on('messageCreate', message => { void handleMessage(message); });
client.on('messageDelete', message => { void handleMessageDelete(message); });
client.on('guildMemberRemove', member => { void handleMemberLeave(member); });
client.on('messageReactionAdd', (reaction, user) => { void handleReactionAdd(reaction, user); });
client.on('messageReactionRemove', (reaction, user) => { void handleReactionRemove(reaction, user); });

const announcementTimer = setInterval(() => { void handleScheduledAnnouncements(); }, 30_000);

async function shutdown() {
  clearInterval(announcementTimer);
  await disconnectDatabase();
  client.destroy();
  process.exit(0);
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
process.on('unhandledRejection', reason => logger.error('Unhandled rejection', { reason }));
await client.login(config.token);
