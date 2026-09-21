## Command deployment

With Node.js 22 or newer, commands can be deployed directly:

```bash
node deploy-commands.ts
```

To remove the commands from the configured scope:

```bash
node clear-commands.ts
```

If `DISCORD_GUILD_ID` is set, the scripts manage commands for that server and updates are immediate. If it is empty, they manage global application commands; global changes can take longer to appear.

You can also use the npm aliases:

```bash
npm run register
npm run clear
```

Never commit `.env` or your bot token. The included `.gitignore` excludes secrets, dependencies, build output, and the local SQLite database.
