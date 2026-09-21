# Premium stage

This project now has a premium foundation for servers that purchase a plan priced at **2,000,000 ProBot credits**.

## Important payment and token safety

- The bot does **not** accept Discord bot tokens through commands, DMs, forms, or chat.
- Put the token for a deployment in that deployment's private `.env` file as `DISCORD_TOKEN`.
- Never commit `.env`, publish a token, or send it to another person.
- `payment-reference` is only a placeholder until you connect a trusted payment provider or your own verified ProBot-credit payment service. A user-supplied reference must never activate premium by itself.
- A separate customer deployment is safer than running arbitrary customer tokens in one shared process.

## Premium systems added

- `/premium status` for entitlement status
- `/premium activate payment-reference:<reference>` placeholder for verified payments
- `/premium feature name:<name> enabled:<true|false>` feature flags
- `/custom-command add` and `/custom-command remove`
- Premium entitlement, feature, custom command, scheduling, and audit-log database models
- Configurable required price using `PROBOT_CREDITS_REQUIRED=2000000`

## Advanced next-stage modules

The architecture is ready for a verified payment webhook, a customer dashboard, scheduled announcements, analytics, economy/XP, anti-raid controls, and tenant provisioning. These should be added behind the same entitlement service instead of trusting user input.

Run:

```bash
npx prisma generate
npx prisma db push
npm run register
npm run build
```
