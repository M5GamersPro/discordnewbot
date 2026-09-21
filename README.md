# Discord System Bot

A modular **Node.js + TypeScript Discord bot** for communities that need support, moderation, automation, leveling, and music in one place.

> This is an original utility bot implementation. It is not affiliated with or a copy of Nova, ProBot, DealerBot, or any other Discord bot.

## Features

### Support and administration

- Private ticket channels
- Ticket claim, close, add, and remove controls
- Persistent SQLite configuration through Prisma
- Server logs for joins, leaves, and deleted messages
- Verification panels and reaction roles
- Giveaways

### Moderation and safety

- Warnings and warning history
- Member timeouts
- Message purge
- AutoMod invite and link protection
- Configurable banned words
- Permission-gated administration commands

### XP leveling

- Earn XP from messages
- One-minute anti-spam XP cooldown
- Automatic level calculation
- Level-up announcements
- `/rank [user]`
- `/leaderboard`

XP is stored locally per server and user. The level formula uses `level² × 100` as the next-level threshold.

### Music

- `/music play query:<song or URL>`
- `/music skip`
- `/music pause`
- `/music resume`
- `/music queue`
- `/music stop`

Music uses `@discordjs/voice` and `play-dl`. The bot needs **Connect**, **Speak**, and **View Channel** permissions in the voice channel. Music queues are held in memory and are cleared when the bot restarts.

## Requirements

- Node.js 20 or newer
- A Discord application and bot token
- Message Content Intent enabled for AutoMod and XP messages
- A free local SQLite database

## Installation

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run register
npm run build
npm start
```

For development:

```bash
npm run dev
```

## Environment variables

```env
DISCORD_TOKEN=your_private_bot_token
DISCORD_CLIENT_ID=your_application_id
DISCORD_GUILD_ID=your_test_server_id
DATABASE_URL="file:./dev.db"
SUPPORT_ROLE_ID=optional_support_role_id
LOGS_CHANNEL_ID=optional_logs_channel_id
TICKET_CATEGORY_ID=optional_ticket_category_id
BOT_OWNER_ID=optional_owner_id
PROBOT_CREDITS_REQUIRED=2000000
```

`DISCORD_GUILD_ID` makes command registration immediate for one test server. Leave it empty for global commands, which can take time to appear.

## Database

SQLite is free, local, and requires no MongoDB account or paid database hosting. The file is created at `prisma/dev.db` by Prisma and is ignored by Git. Back it up before moving the bot to another machine.

SQLite is ideal for one bot process and small-to-medium communities. If you later need multiple bot instances, high availability, or a web dashboard with concurrent traffic, migrate the Prisma datasource to PostgreSQL.

## Security

- Never commit `.env` or expose `DISCORD_TOKEN`.
- Never ask users to send bot tokens through Discord commands or DMs.
- Payment references must be verified server-to-server before premium access is activated.
- Give the bot only the permissions and intents it needs.
- Keep the bot's role below roles it should not manage.

## Project structure

```text
prisma/schema.prisma
src/
├── commands/       Slash commands
├── database/       Prisma client
├── events/         Discord event handlers
├── lib/            Logging and embeds
└── services/       Tickets, moderation, leveling, music, and premium logic
```

## Useful commands

```bash
npm run db:generate   # Generate Prisma client
npm run db:push      # Apply schema to SQLite
npm run db:studio    # Browse local data
npm run register     # Register slash commands
npm run build        # Type-check and compile
```

## License

Use and modify this project for your own bot. Review third-party package licenses and Discord's developer policies before deploying publicly.
