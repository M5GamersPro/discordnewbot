import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const config = {
  token: required('DISCORD_TOKEN'),
  clientId: required('DISCORD_CLIENT_ID'),
  guildId: process.env.DISCORD_GUILD_ID,
  databaseUrl: required('DATABASE_URL'),
  supportRoleId: process.env.SUPPORT_ROLE_ID,
  ticketCategoryId: process.env.TICKET_CATEGORY_ID,
  logsChannelId: process.env.LOGS_CHANNEL_ID,
  ownerId: process.env.BOT_OWNER_ID,
  premiumCreditsRequired: Number(process.env.PROBOT_CREDITS_REQUIRED ?? 2_000_000),
};
