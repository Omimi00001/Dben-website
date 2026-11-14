import { Readable } from 'node:stream';
import worker from './worker.mjs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { favicon } = require('./site-config.json');

// This file is copied into the generated Vercel Function, beside worker.mjs.
// Browser app.js is served by that Worker as an asset; it is never imported.
export default async function handler(req, res) {
  try {
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (Array.isArray(value)) value.forEach(item => headers.append(key, item));
      else if (value !== undefined) headers.set(key, value);
    }
    const protocol = (headers.get('x-forwarded-proto') || 'https').split(',')[0].trim();
    const host = (headers.get('x-forwarded-host') || headers.get('host') || 'localhost').split(',')[0].trim();
    const url = new URL(req.url, `${protocol}://${host}`);
    // Preserve the original brand icon for browsers requesting legacy filenames.
    if (url.pathname === '/favicon.ico' || url.pathname === '/favicon.png') url.pathname = favicon;
    const init = { method: req.method, headers };
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      init.body = Readable.toWeb(req);
      init.duplex = 'half';
    }
    const response = await worker.fetch(new Request(url, init));
    res.statusCode = response.status;
    for (const [key, value] of response.headers) res.setHeader(key, value);
    res.end(req.method === 'HEAD' ? undefined : Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    console.error('[dben-runtime]', error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
    }
    res.end('Unable to process this request.');
  }
}
