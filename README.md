# Discord System Bot

Cross-platform Node.js + TypeScript Discord bot with tickets, moderation, AutoMod, XP leveling, music, verification, reaction roles, giveaways, logs, anti-raid protection, scheduled announcements, and premium feature controls.

## Quick start

Requirements: **Node.js 20+**, npm, a Discord application, and a bot token.

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run register
npm run build
npm start
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp`. On Termux, install Node and Git with `pkg install nodejs-lts git` first.

## Environment

```env
DISCORD_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_application_id
DISCORD_GUILD_ID=your_test_server_id
DATABASE_URL="file:./dev.db"
BOT_OWNER_ID=your_user_id
PROBOT_CREDITS_REQUIRED=20000000
```

Keep `.env` private. Enable **Message Content Intent** for XP and AutoMod, and **Guild Members Intent** for welcomes and anti-raid.

## Commands

- `/ticket setup`, `/ticket close`, `/ticket claim`, `/ticket add`, `/ticket remove`
- `/moderation warn`, `/moderation warnings`, `/moderation timeout`, `/moderation purge`
- `/admin automod`, `/admin welcome`, `/admin settings`
- `/rank`, `/leaderboard`
- `/music play`, `/music skip`, `/music pause`, `/music resume`, `/music queue`, `/music stop`
- `/verify`, `/reactionrole`, `/giveaway`, `/logchannel`
- `/anti-raid configure`, `/anti-raid status`
- `/announce`
- `/premium status`, `/premium grant`, `/premium revoke`, `/premium feature`

## Deployment

Register commands in a test server with `DISCORD_GUILD_ID` set. Leave it empty only when you want global commands, which can take longer to appear.

```bash
npm run register
npm run clear
```

For Docker, use `docker compose up -d --build`. Mount persistent storage for `prisma/dev.db`.

## Customer instances

After privately verifying payment, create an isolated customer environment:

```bash
npm run customer:create -- customer-name
npm run customer:start -- customer-name
```

Each customer gets a separate environment file, SQLite database, and process. Customer files are ignored by Git.

## Troubleshooting

- `Missing required environment variable`: ensure `.env` exists in the current working directory.
- `Cannot find module`: run `npm install`, then `npx prisma generate`.
- Commands missing: run `npm run register`; use `DISCORD_GUILD_ID` for immediate updates.
- Database errors: run `npx prisma db push` after schema changes.
- Music errors: ensure the bot has Connect/Speak permissions and the user is in a voice channel.
- Login errors: reset the token in the Discord Developer Portal and update `.env`.
