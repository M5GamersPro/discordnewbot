import { mkdir, chmod, writeFile } from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const customerId = process.argv[2]?.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
if (!customerId) throw new Error('Usage: npm run customer:create -- customer-id');

const rl = readline.createInterface({ input, output });
const token = await rl.question('Customer bot token (input is not logged): ');
const clientId = await rl.question('Customer application/client ID: ');
const guildId = await rl.question('Customer test guild ID (optional): ');
rl.close();
if (!token || !clientId) throw new Error('A bot token and client ID are required.');

const deploymentDir = path.resolve('deployments', customerId);
await mkdir(deploymentDir, { recursive: true });
const databasePath = path.resolve(deploymentDir, 'data.db').replaceAll('\\', '/');
const env = [
  '# Private customer deployment. Never commit or share this file.',
  `DISCORD_TOKEN=${token}`,
  `DISCORD_CLIENT_ID=${clientId}`,
  `DISCORD_GUILD_ID=${guildId}`,
  `DATABASE_URL="file:${databasePath}"`,
  'PROBOT_CREDITS_REQUIRED=20000000',
  'PREMIUM_PLAN=premium',
  '',
].join('\n');
const envPath = path.join(deploymentDir, '.env');
await writeFile(envPath, env, { mode: 0o600 });
await chmod(envPath, 0o600);
console.log(`Created private deployment environment: deployments/${customerId}/.env`);
console.log('The token was not written to logs. Start it only after payment has been verified.');
