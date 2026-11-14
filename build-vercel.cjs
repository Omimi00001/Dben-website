const fs = require('node:fs');
const path = require('node:path');
const output = path.resolve('.vercel/output');
const functionDir = path.join(output, 'functions/index.func');
fs.mkdirSync(functionDir, { recursive: true });
fs.mkdirSync(path.join(output, 'static'), { recursive: true });
fs.copyFileSync('dist/server/index.js', path.join(functionDir, 'worker.mjs'));
fs.copyFileSync('vercel-handler.mjs', path.join(functionDir, 'index.mjs'));
fs.writeFileSync(path.join(functionDir, 'site-config.json'), JSON.stringify({ favicon: require('./data.json').logo }));
fs.writeFileSync(path.join(functionDir, '.vc-config.json'), JSON.stringify({
  runtime: 'nodejs22.x', handler: 'index.mjs', launcherType: 'Nodejs', maxDuration: 60
}, null, 2));
fs.writeFileSync(path.join(output, 'config.json'), JSON.stringify({
  version: 3, routes: [{ src: '/(.*)', dest: '/index' }]
}, null, 2));
console.log('Vercel Build Output API v3: Node.js 22 function -> index.mjs -> generated worker.mjs');
