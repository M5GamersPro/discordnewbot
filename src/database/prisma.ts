import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config.js';

type Row = Record<string, unknown>;
type Where = Record<string, unknown>;

const dbPath = config.databaseUrl.startsWith('file:')
  ? path.resolve(process.cwd(), config.databaseUrl.slice(5))
  : path.resolve(process.cwd(), 'data/bot.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

type TableDefinition = { name: string; columns: string };
const tables: TableDefinition[] = [
  { name: 'GuildConfig', columns: 'id TEXT PRIMARY KEY, guildId TEXT UNIQUE NOT NULL, supportRoleId TEXT, ticketCategoryId TEXT, ticketLogChannelId TEXT, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL' },
  { name: 'Ticket', columns: 'id TEXT PRIMARY KEY, guildId TEXT NOT NULL, channelId TEXT UNIQUE NOT NULL, creatorId TEXT NOT NULL, claimedById TEXT, status TEXT NOT NULL, closeReason TEXT, closedAt TEXT, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL' },
  { name: 'Warning', columns: 'id TEXT PRIMARY KEY, guildId TEXT NOT NULL, userId TEXT NOT NULL, moderatorId TEXT NOT NULL, reason TEXT NOT NULL, createdAt TEXT NOT NULL' },
  { name: 'AutoModConfig', columns: 'id TEXT PRIMARY KEY, guildId TEXT UNIQUE NOT NULL, enabled INTEGER NOT NULL, antiInvite INTEGER NOT NULL, antiLinks INTEGER NOT NULL, bannedWords TEXT NOT NULL, logChannelId TEXT, updatedAt TEXT NOT NULL' },
  { name: 'WelcomeConfig', columns: 'id TEXT PRIMARY KEY, guildId TEXT UNIQUE NOT NULL, enabled INTEGER NOT NULL, channelId TEXT, message TEXT NOT NULL' },
  { name: 'ReactionRole', columns: 'id TEXT PRIMARY KEY, guildId TEXT NOT NULL, channelId TEXT NOT NULL, messageId TEXT NOT NULL, emoji TEXT NOT NULL, roleId TEXT NOT NULL, createdAt TEXT NOT NULL, UNIQUE(guildId, messageId, emoji)' },
  { name: 'VerificationConfig', columns: 'id TEXT PRIMARY KEY, guildId TEXT UNIQUE NOT NULL, channelId TEXT NOT NULL, messageId TEXT NOT NULL, roleId TEXT NOT NULL' },
  { name: 'Giveaway', columns: 'id TEXT PRIMARY KEY, guildId TEXT NOT NULL, channelId TEXT NOT NULL, messageId TEXT NOT NULL, prize TEXT NOT NULL, winners INTEGER NOT NULL, endsAt TEXT NOT NULL, createdAt TEXT NOT NULL' },
  { name: 'LogChannel', columns: 'id TEXT PRIMARY KEY, guildId TEXT UNIQUE NOT NULL, channelId TEXT NOT NULL' },
  { name: 'PremiumEntitlement', columns: 'id TEXT PRIMARY KEY, guildId TEXT UNIQUE NOT NULL, plan TEXT NOT NULL, active INTEGER NOT NULL, paymentRef TEXT UNIQUE, purchaserId TEXT, creditsRequired INTEGER NOT NULL, activatedAt TEXT, expiresAt TEXT, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL' },
  { name: 'PremiumFeature', columns: 'id TEXT PRIMARY KEY, guildId TEXT NOT NULL, feature TEXT NOT NULL, enabled INTEGER NOT NULL, settings TEXT, updatedAt TEXT NOT NULL, UNIQUE(guildId, feature)' },
  { name: 'CustomCommand', columns: 'id TEXT PRIMARY KEY, guildId TEXT NOT NULL, name TEXT NOT NULL, response TEXT NOT NULL, enabled INTEGER NOT NULL, createdAt TEXT NOT NULL, UNIQUE(guildId, name)' },
  { name: 'ScheduledAnnouncement', columns: 'id TEXT PRIMARY KEY, guildId TEXT NOT NULL, channelId TEXT NOT NULL, content TEXT NOT NULL, runAt TEXT NOT NULL, sentAt TEXT, createdAt TEXT NOT NULL' },
  { name: 'AntiRaidConfig', columns: 'id TEXT PRIMARY KEY, guildId TEXT UNIQUE NOT NULL, enabled INTEGER NOT NULL, joinThreshold INTEGER NOT NULL, windowSeconds INTEGER NOT NULL, action TEXT NOT NULL, updatedAt TEXT NOT NULL' },
  { name: 'AuditLog', columns: 'id TEXT PRIMARY KEY, guildId TEXT NOT NULL, actorId TEXT, action TEXT NOT NULL, metadata TEXT, createdAt TEXT NOT NULL' },
  { name: 'UserLevel', columns: 'id TEXT PRIMARY KEY, guildId TEXT NOT NULL, userId TEXT NOT NULL, xp INTEGER NOT NULL, level INTEGER NOT NULL, lastXpAt TEXT, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL, UNIQUE(guildId, userId)' },
];
for (const table of tables) db.exec(`CREATE TABLE IF NOT EXISTS "${table.name}" (${table.columns})`);

const now = () => new Date().toISOString();
const id = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
const encode = (value: unknown) => value instanceof Date ? value.toISOString() : typeof value === 'boolean' ? (value ? 1 : 0) : value && typeof value === 'object' ? JSON.stringify(value) : value;
const decode = (row: Row | undefined): Row | null => {
  if (!row) return null;
  const result: Row = { ...row };
  for (const key of Object.keys(result)) {
    if (key.endsWith('At') && typeof result[key] === 'string') result[key] = new Date(result[key] as string);
    if (['enabled', 'active', 'antiInvite', 'antiLinks'].includes(key)) result[key] = Boolean(result[key]);
    if (key === 'settings' || key === 'metadata') {
      try { result[key] = result[key] ? JSON.parse(result[key] as string) : null; } catch { /* keep string */ }
    }
  }
  return result;
};
const flatten = (where: Where): Where => Object.fromEntries(Object.entries(where).flatMap(([key, value]) => {
  if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date) && !('gt' in value) && !('gte' in value) && !('lt' in value) && !('lte' in value)) return Object.entries(value as Where);
  return [[key, value]];
}));

function matches(where: Where = {}) {
  const flat = flatten(where);
  return Object.entries(flat).filter(([, value]) => value !== undefined).map(([key, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      const op = value as Record<string, unknown>;
      return `${key} ${Object.keys(op)[0] === 'gt' ? '>' : Object.keys(op)[0] === 'gte' ? '>=' : Object.keys(op)[0] === 'lt' ? '<' : '<='} @${key}`;
    }
    return `${key} = @${key}`;
  }).join(' AND ') || '1=1';
}
function params(where: Where = {}) {
  const flat = flatten(where); const output: Row = {};
  for (const [key, value] of Object.entries(flat)) {
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) output[key] = encode(Object.values(value as Where)[0]);
    else output[key] = encode(value);
  }
  return output;
}

class Delegate {
  constructor(private readonly table: string) {}
  findUnique(args: { where: Where }) { return Promise.resolve(decode(db.prepare(`SELECT * FROM "${this.table}" WHERE ${matches(args.where)} LIMIT 1`).get(params(args.where)) as Row)); }
  findFirst(args: { where?: Where; orderBy?: Where; take?: number } = {}) { const order = args.orderBy ? ` ORDER BY ${Object.entries(args.orderBy).map(([key, value]) => `${key} ${String(value).toUpperCase()}`).join(',')}` : ''; return Promise.resolve(decode(db.prepare(`SELECT * FROM "${this.table}" WHERE ${matches(args.where)}${order} LIMIT ${args.take ?? 1}`).get(params(args.where)) as Row)); }
  findMany(args: { where?: Where; orderBy?: Where; take?: number } = {}) { const order = args.orderBy ? ` ORDER BY ${Object.entries(args.orderBy).map(([key, value]) => `${key} ${String(value).toUpperCase()}`).join(',')}` : ''; const rows = db.prepare(`SELECT * FROM "${this.table}" WHERE ${matches(args.where)}${order}${args.take ? ` LIMIT ${args.take}` : ''}`).all(params(args.where)) as Row[]; return Promise.resolve(rows.map(row => decode(row)) as Row[]); }
  count(args: { where?: Where } = {}) { return Promise.resolve((db.prepare(`SELECT COUNT(*) as count FROM "${this.table}" WHERE ${matches(args.where)}`).get(params(args.where)) as { count: number }).count); }
  create(args: { data: Row }) { const data = { id: id(), createdAt: now(), updatedAt: now(), ...args.data }; const entries = Object.entries(data).filter(([, value]) => value !== undefined); db.prepare(`INSERT INTO "${this.table}" (${entries.map(([key]) => key).join(',')}) VALUES (${entries.map(([key]) => `@${key}`).join(',')})`).run(Object.fromEntries(entries.map(([key, value]) => [key, encode(value)]))); return Promise.resolve(decode(data)); }
  update(args: { where: Where; data: Row }) { const data = { ...args.data, updatedAt: now() }; const entries = Object.entries(data).filter(([, value]) => value !== undefined); db.prepare(`UPDATE "${this.table}" SET ${entries.map(([key]) => `${key}=@set_${key}`).join(',')} WHERE ${matches(args.where)}`).run({ ...params(args.where), ...Object.fromEntries(entries.map(([key, value]) => [`set_${key}`, encode(value)])) }); return this.findUnique({ where: args.where }); }
  updateMany(args: { where: Where; data: Row }) { const data = { ...args.data, updatedAt: now() }; const entries = Object.entries(data).filter(([, value]) => value !== undefined); const result = db.prepare(`UPDATE "${this.table}" SET ${entries.map(([key]) => `${key}=@set_${key}`).join(',')} WHERE ${matches(args.where)}`).run({ ...params(args.where), ...Object.fromEntries(entries.map(([key, value]) => [`set_${key}`, encode(value)])) }); return Promise.resolve({ count: result.changes }); }
  upsert(args: { where: Where; update: Row; create: Row }) { const existing = db.prepare(`SELECT * FROM "${this.table}" WHERE ${matches(args.where)} LIMIT 1`).get(params(args.where)) as Row | undefined; return existing ? this.update({ where: args.where, data: args.update }) : this.create({ data: args.create }); }
  deleteMany(args: { where: Where }) { const result = db.prepare(`DELETE FROM "${this.table}" WHERE ${matches(args.where)}`).run(params(args.where)); return Promise.resolve({ count: result.changes }); }
}

export const prisma = new Proxy<Record<string, Delegate>>({}, { get: (_target, property) => new Delegate(String(property)) });
export async function disconnectDatabase() { db.close(); }
