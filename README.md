# Premium Discord System Bot

A Node.js + TypeScript Discord utility bot with tickets, moderation, AutoMod, verification, reaction roles, giveaways, logs, premium feature flags, and custom commands.

## Free database: SQLite

This project uses **SQLite**, not MongoDB and not a paid database service. SQLite is free, requires no account, and stores the database in a local file.

The default configuration is:

```env
DATABASE_URL="file:./dev.db"
```

Prisma creates the database file when you run the setup commands. For a single bot process or small deployment, SQLite is simple and reliable. If you later run multiple bot instances or need high availability, migrate to a managed PostgreSQL provider such as Neon or Supabase.

## Setup

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run register
npm run dev
```

Never commit `.env`, `prisma/dev.db`, or a Discord token. Use a private environment variable for `DISCORD_TOKEN`.

## Main features

- Private tickets with claim, close, add, and remove controls
- Warnings, warning history, timeouts, and message purge
- AutoMod for invites, links, and banned words
- Welcome messages and verification panels
- Reaction roles, giveaways, and event logging
- Premium entitlement and feature flags
- Premium custom commands
- SQLite persistence through Prisma

## Premium payments and customer tokens

The bot does not accept tokens through Discord commands or DMs. A customer deployment should receive its token through a private hosting provider secret or `.env` file. Payment activation must use a trusted, server-to-server payment verification flow; a user-entered reference must never activate premium by itself.
