# Expanded Discord system bot

This project now includes a foundation similar to an all-in-one utility bot:

- Private ticket system with setup, claim, close, add, and remove controls
- Moderation: warnings, warning history, timeouts, and bulk message deletion
- AutoMod: Discord invite blocking, link blocking, and configurable banned words
- Welcome messages with `{user}` and `{server}` placeholders
- Server settings command
- Persistent PostgreSQL storage through Prisma
- Modular `src/commands`, `src/services`, and `src/events` architecture

## Setup

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run register
npm run dev
```

Enable the **Message Content Intent** in the Discord Developer Portal for AutoMod. The bot needs `Manage Channels`, `Manage Messages`, `Moderate Members`, `Manage Guild`, `Send Messages`, and `Embed Links` as appropriate.

## Commands

- `/ticket setup|close|claim|add|remove`
- `/moderation warn|warnings|timeout|purge`
- `/admin automod|welcome|settings`
- `/ping`, `/serverinfo`

This is an original implementation inspired by common utility-bot functionality; it does not copy proprietary code or branding from other bots.
