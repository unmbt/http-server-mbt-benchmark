import http from 'node:http';
import https from 'node:https';
import { once } from 'node:events';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.env.HS_PROJECT_ROOT;
if (!root) throw new Error('HS_PROJECT_ROOT is required');
const api = await import(pathToFileURL(path.join(root, 'target/wasm/index.mjs')).href);
const config = JSON.parse(process.env.HS_CONFIG || '{}');
config.root = process.env.HS_ROOT || config.root || 'data/public';
const engine = await api.createEngine(config);
const tls = process.env.HS_TLS === '1';
const port = Number(process.env.PORT || '18080');

const handler = async (req, res) => {
  const controller = new AbortController();
  const abort = () => { if (!res.writableFinished) controller.abort(); };
  req.once('aborted', abort);
  res.once('close', abort);
  let body;
  try {
    const headers = [];
    for (let i = 0; i < req.rawHeaders.length; i += 2) headers.push([req.rawHeaders[i], req.rawHeaders[i + 1]]);
    const result = await engine.handle({ method: req.method, target: req.url, headers, signal: controller.signal });
    if (result.kind === 'next') { res.writeHead(404); res.end('Not found'); return; }
    body = result.body;
    for await (const bytes of body) {
      if (!res.headersSent) {
        res.statusCode = result.status;
        for (const [name, value] of result.headers) res.appendHeader(name, value);
      }
      if (!res.write(bytes)) await once(res, 'drain', { signal: controller.signal });
    }
    if (!res.headersSent) {
      res.statusCode = result.status;
      for (const [name, value] of result.headers) res.appendHeader(name, value);
    }
    res.end();
  } catch (error) {
    if (res.headersSent || res.destroyed) res.destroy(error);
    else {
      const status = { HS_FILE_CHANGED: 409, HS_FORBIDDEN: 403, HS_INVALID_REQUEST: 400, HS_OVERLOADED: 503, HS_CLOSED: 503 }[error.code] || 500;
      res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(error.code || 'HS_IO');
    }
  } finally {
    body?.destroy();
    req.removeListener('aborted', abort);
    res.removeListener('close', abort);
  }
};

const server = tls
  ? https.createServer({ key: readFileSync(process.env.HS_KEY || 'state/certs/server.key'), cert: readFileSync(process.env.HS_CERT || 'state/certs/server.crt') }, handler)
  : http.createServer(handler);
await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(port, '127.0.0.1', resolve);
});
console.log(`LISTENING ${tls ? 'https' : 'http'}://127.0.0.1:${port}`);
let closing;
async function shutdown(code = 0) {
  if (closing) return closing;
  closing = (async () => {
    await engine.close();
    await new Promise(resolve => server.close(() => resolve()));
    process.exit(code);
  })();
  return closing;
}
process.once('SIGINT', () => shutdown());
process.once('SIGTERM', () => shutdown());
setInterval(() => {}, 2 ** 31 - 1);