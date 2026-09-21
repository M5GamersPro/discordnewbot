# Discord System Bot

A modular Node.js + TypeScript all-in-one Discord bot with tickets, moderation, AutoMod, XP leveling, music, verification, reaction roles, giveaways, logging, anti-raid controls, announcements, and premium feature flags.

## Paid customer deployment model

The premium product is for customers who have paid **20,000,000 ProBot credits** and want their own bot deployed on the same host.

Each paid customer gets:

- A separate `deployments/<customer-id>/.env` file
- A separate `deployments/<customer-id>/data.db` SQLite database
- A separate bot process
- Their own Discord application and token
- Premium features enabled only after you verify payment

The customer deployment files are ignored by Git. Tokens are not stored in Prisma, GitHub, Discord messages, or logs.

### Create a customer deployment

Run this privately on the host after verifying payment:

```bash
npm install
npm run customer:create -- customer-name
npm run customer:start -- customer-name
```

The setup asks for the customer token and application ID locally. It writes the token only to `deployments/customer-name/.env` with owner-only file permissions. Never paste a token into Discord, commit it, or put it in a command argument.

You can run multiple customer processes on the same host, but use a process manager such as PM2 and resource limits in production.

## Premium access control

Set the owner ID in `.env`:

```env
BOT_OWNER_ID=your_discord_user_id
PROBOT_CREDITS_REQUIRED=20000000
```

After privately verifying payment, the bot owner can run:

```text
/premium grant guild-id:<customer-server-id> payment-reference:<your-private-reference>
/premium revoke guild-id:<customer-server-id>
/premium status
```

The customer does not get a public `/premium activate` flow. Only the configured bot owner can grant or revoke access. The payment reference is stored only as an administrative record; actual credit verification remains your responsibility.

## Features

- Private support tickets with claim, close, add, and remove controls
- Warnings, timeouts, purges, AutoMod, and logs
- XP, levels, rank cards, and leaderboards
- Music queue with play, skip, pause, resume, queue, and stop
- Verification panels, reaction roles, giveaways, and welcome messages
- Anti-raid configuration and scheduled announcements
- Premium feature flags and custom commands

## Setup

Requirements: Node.js 20+, a Discord application, Message Content Intent for XP/AutoMod, and voice permissions for music.

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run register
npm run build
npm start
```

For development, use `npm run dev`.

## Environment

```env
DISCORD_TOKEN=your_private_bot_token
DISCORD_CLIENT_ID=your_application_id
DISCORD_GUILD_ID=optional_test_server_id
DATABASE_URL="file:./dev.db"
BOT_OWNER_ID=your_discord_user_id
PROBOT_CREDITS_REQUIRED=20000000
```

## Security

- Keep every customer `.env` private and use file mode `0600`.
- Never commit `.env`, customer databases, or tokens.
- Do not log environment variables.
- Rotate a token immediately in the Discord Developer Portal if it is exposed.
- Verify payments outside Discord before creating a customer deployment.
- Give each bot only the permissions it needs.

## Useful commands

```bash
npm run customer:create -- customer-name
npm run customer:start -- customer-name
npm run db:generate
npm run db:push
npm run register
npm run build
```
