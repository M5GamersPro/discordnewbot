import { Client, ActivityType, Events } from 'discord.js';
import { logger } from '../lib/logger.js';

export function registerReady(client: Client) {
  client.once(Events.ClientReady, ready => {
    ready.user.setPresence({ activities: [{ name: 'support tickets', type: ActivityType.Watching }], status: 'online' });
    logger.info(`Logged in as ${ready.user.tag}`);
  });
}
