# Cross-platform setup

This bot works in **Termux**, Windows Terminal/PowerShell, macOS Terminal, Linux shells, Docker, and most Node.js hosting providers.

## Requirements

- Node.js **20 or newer**
- npm
- A Discord application and bot token
- Message Content Intent enabled for XP and AutoMod
- Connect, Speak, and View Channel permissions for music

Check your versions:

```bash
node --version
npm --version
```

## Windows Terminal / PowerShell

```powershell
git clone https://github.com/M5GamersPro/discordnewbot.git
cd discordnewbot
npm install
Copy-Item .env.example .env
notepad .env
npx prisma generate
npx prisma db push
npm run register
npm run build
npm start
```

For development, use `npm run dev`. In Command Prompt, use `copy .env.example .env` instead of `Copy-Item`.

## macOS / Linux / Termux

```bash
git clone https://github.com/M5GamersPro/discordnewbot.git
cd discordnewbot
npm install
cp .env.example .env
nano .env
npx prisma generate
npx prisma db push
npm run register
npm run build
npm start
```

Termux installation:

```bash
pkg update && pkg upgrade
pkg install nodejs-lts git
```

Then run the macOS/Linux commands above. Keep Termux awake with `termux-wake-lock` if you need the bot to run while the screen is off. Android may stop background processes; a real host is more reliable for production.

## Hosting providers

Set the environment variables in the provider dashboard instead of uploading `.env`. Run these build/start commands:

```text
Build: npm install && npx prisma generate && npx prisma db push && npm run build
Start: npm start
```

If the provider uses a persistent disk, set `DATABASE_URL=file:./dev.db` and keep that disk mounted. Without persistent storage, the SQLite database can be lost on restart or redeploy.

## Customer deployments on one host

After verifying payment privately:

```bash
npm run customer:create -- customer-name
npm run customer:start -- customer-name
```

The command works across Windows, macOS, Linux, and Termux because it uses Node path APIs rather than shell-specific commands. Each customer receives a separate ignored `.env` and SQLite database.

## Command management

```bash
npm run register  # register commands in DISCORD_GUILD_ID, or globally
npm run clear     # remove all commands from that same scope
```

Use `npm run ...` rather than `node file.ts`; Node does not run TypeScript files on every supported Node version. The repository uses `tsx` for TypeScript scripts.

## Security

Never commit `.env`, customer deployment files, tokens, or SQLite databases. On Windows use hosting secrets or a protected folder; on Unix-like systems keep deployment environment files owner-readable only. Rotate a Discord token immediately if it is exposed.
