import 'dotenv/config';
import { existsSync } from 'node:fs';
import { config as loadEnv } from 'dotenv';

const customerId = process.argv[2]?.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
if (!customerId) throw new Error('Usage: npm run customer:start -- customer-id');
const envPath = `deployments/${customerId}/.env`;
if (!existsSync(envPath)) throw new Error(`Missing ${envPath}. Create it with customer:create first.`);
loadEnv({ path: envPath, override: true });
await import('../src/index.ts');
