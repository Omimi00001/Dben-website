const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const { once } = require('node:events');

(async () => {
  const config = JSON.parse(fs.readFileSync('.vercel/output/config.json'));
  assert.equal(config.version, 3);
  const functionConfig = JSON.parse(fs.readFileSync('.vercel/output/functions/index.func/.vc-config.json'));
  assert.equal(functionConfig.handler, 'index.mjs');
  assert.equal(functionConfig.runtime, 'nodejs22.x');
  // A cold Node import must work without document, window or matchMedia.
  assert.equal(typeof globalThis.matchMedia, 'undefined');
  const handler = (await import('./.vercel/output/functions/index.func/index.mjs')).default;
  assert.equal(typeof handler, 'function');
  const server = http.createServer(handler);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const origin = `http://127.0.0.1:${server.address().port}`;
  const request = (route, init = {}) => fetch(origin + route, {
    ...init, redirect: 'manual', headers: { 'x-forwarded-proto': 'http', ...init.headers }
  });
  let requests = 0;
  try {
    const routes = JSON.parse(fs.readFileSync('routes.json'));
    for (const [route, expected] of Object.entries(routes)) {
      if (route === '/404') continue;
      const response = await request(route);
      assert.equal(response.status, 200, route);
      assert.equal(await response.text(), expected, `Unchanged page HTML: ${route}`);
      requests++;
    }
    for (const asset of ['/app.js', '/style.css', '/favicon.ico', '/favicon.png']) {
      const response = await request(asset);
      assert.equal(response.status, 200, asset);
      assert((await response.arrayBuffer()).byteLength > 0);
      requests++;
    }
    const favicon = await request('/favicon.ico');
    assert.equal(favicon.headers.get('content-type'), 'image/webp');
    const logo = require('./data.json').logo;
    assert.deepEqual(Buffer.from(await favicon.arrayBuffer()), Buffer.from(await (await request(logo)).arrayBuffer()));
    const head = await request('/', { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), '');
    const missing = await request('/not-a-real-page');
    assert.equal(missing.status, 404);
    const login = await request('/login');
    assert.equal(login.status, 302);
    assert.equal(login.headers.get('location'), 'https://www.dbengroup.com/login');
    // Invalid submissions stop locally: no enquiry or subscription is sent.
    for (const endpoint of ['/api/enquiry', '/api/newsletter']) {
      const response = await request(endpoint, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: '{}' });
      assert.equal(response.status, 400, endpoint);
      assert.equal((await response.json()).success, false);
    }
    const rejectedOrigin = await request('/api/enquiry', { method: 'POST', headers: { Origin: 'https://other.invalid' }, body: '{}' });
    assert.equal(rejectedOrigin.status, 403);
    const result = { node: process.version, coldStart: 'passed without browser globals', renderedPagesUnchanged: requests - 4, assetRequestsPassed: 4, favicon: 200, head: 200, missing: 404, invalidFormValidation: 'passed', realSubmissionsSent: 0 };
    console.log(JSON.stringify(result, null, 2));
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
