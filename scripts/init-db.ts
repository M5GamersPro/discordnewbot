import 'dotenv/config';
import { prisma } from '../src/database/prisma.js';

await prisma.guildConfig.findMany();
console.log('SQLite database initialized successfully.');
