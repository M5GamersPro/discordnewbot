import 'dotenv/config';
import { REST, Routes } from 'discord.js';

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token || !clientId) {
  throw new Error('DISCORD_TOKEN and DISCORD_CLIENT_ID are required in .env');
}

const rest = new REST({ version: '10' }).setToken(token);
const route = guildId
  ? Routes.applicationGuildCommands(clientId, guildId)
  : Routes.applicationCommands(clientId);

const commands = await rest.get(route) as Array<{ id: string; name: string }>;
for (const command of commands) {
  await rest.delete(`${route}/${command.id}`);
  console.log(`Cleared /${command.name}`);
}
console.log(commands.length ? `Cleared ${commands.length} command(s).` : 'No commands to clear.');
