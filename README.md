# Discord System Bot

A modular Node.js/TypeScript Discord bot with a persistent private ticket system.

## Setup

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run register
npm run dev
```

The bot needs the **bot** and **applications.commands** scopes. Give it `Manage Channels`, `Send Messages`, `Embed Links`, `Read Message History`, and `Manage Roles` where appropriate.

## Ticket setup

1. Set `SUPPORT_ROLE_ID` and optionally `TICKET_CATEGORY_ID` in `.env`.
2. Start the bot.
3. Run `/ticket setup` in the channel where the panel should be posted.
4. Members can create one open ticket each.

Commands include `/ticket setup`, `/ticket close`, `/ticket claim`, `/ticket add`, `/ticket remove`, `/ping`, and `/serverinfo`.
