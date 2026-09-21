export const logger = {
  info(message: string, meta?: unknown) { console.log(JSON.stringify({ level: 'info', time: new Date().toISOString(), message, meta })); },
  warn(message: string, meta?: unknown) { console.warn(JSON.stringify({ level: 'warn', time: new Date().toISOString(), message, meta })); },
  error(message: string, meta?: unknown) { console.error(JSON.stringify({ level: 'error', time: new Date().toISOString(), message, meta })); },
};
