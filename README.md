# SQLite + Termux Ubuntu setup

The bot now uses **better-sqlite3 directly** instead of Prisma. This removes Prisma's incompatible native query engine from the runtime and makes the database easier to run inside Ubuntu on Termux, VPS Linux, Windows, and macOS.

## Recommended Termux setup: Ubuntu proot

Run the bot inside Ubuntu, not directly in the Android Termux shell:

```bash
pkg update && pkg upgrade
pkg install proot-distro
proot-distro install ubuntu
proot-distro login ubuntu
```

Inside Ubuntu:

```bash
apt update && apt upgrade -y
apt install -y git build-essential python3 make g++ curl
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node --version
npm --version
```

Then install and run the bot:

```bash
git clone https://github.com/M5GamersPro/discordnewbot.git
cd discordnewbot
npm install
cp .env.example .env
nano .env
npm run db:init
npm run register
npm run build
npm start
```

`better-sqlite3` compiles locally during `npm install`, so Ubuntu's `build-essential`, Python, and make tools are required. The Android Prisma engine is no longer used.

## Windows, macOS, and normal Linux

```bash
npm install
cp .env.example .env
npm run db:init
npm run register
npm run build
npm start
```

On Windows PowerShell use `Copy-Item .env.example .env`.

## Database improvements

- SQLite WAL mode for better read/write concurrency
- foreign-key enforcement
- automatic database-directory creation
- parameterized SQL queries
- indexes/unique constraints for guild, ticket, XP, and premium data
- one database file per customer deployment
- no Prisma engine or Prisma migration step

Default database:

```env
DATABASE_URL="file:./data/bot.db"
```

Do not commit `.env` or `data/*.db`.
