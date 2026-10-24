import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.env.HS_PROJECT_ROOT;
if (!root) throw new Error('HS_PROJECT_ROOT is required');
const api = await import(pathToFileURL(path.join(root, 'npm/http-server/index.mjs')).href);
const config = {
  root: process.env.HS_ROOT || 'data/public',
  port: Number(process.env.PORT || '18080'),
  silent: true,
};
if (process.env.HS_TLS === '1') {
  config.cert_file = process.env.HS_CERT || 'state/certs/server.crt';
  config.key_file = process.env.HS_KEY || 'state/certs/server.key';
}
const server = api.createServer(config);
let stopped = false;
const keepAlive = setInterval(() => {}, 2 ** 31 - 1);
function shutdown(code = 0) {
  if (stopped) return;
  stopped = true;
  clearInterval(keepAlive);
  try { server.stop(); } finally { process.exit(code); }
}
process.once('SIGINT', () => shutdown());
process.once('SIGTERM', () => shutdown());
console.log(`LISTENING ${process.env.HS_TLS === '1' ? 'https' : 'http'}://127.0.0.1:${config.port}`);
