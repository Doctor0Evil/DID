const http = require('http');
const { exchangeWithResolver } = require('../scripts/did-auth-exchange');
const path = require('path');
const fs = require('fs');

async function run() {
  console.log('Starting did-exchange OIDC fetch tests...');
  const server = http.createServer((req, res) => {
    if (req.url.startsWith('/oidc-token') && req.method === 'GET') {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ value: 'mock-oidc-token' }));
      return;
    }
    if (req.url === '/exchange' && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ token: 'mock-session-token-oidc' }));
      });
      return;
    }
    res.statusCode = 404; res.end();
  });
  return new Promise((resolve, reject) => {
    server.listen(0, async () => {
      const { port } = server.address();
      try {
        const cfgPath = path.join(__dirname, '..', 'config', 'identity.web5.json');
        const raw = fs.readFileSync(cfgPath, 'utf8');
        const cfg = JSON.parse(raw);
        const oidcUrl = `http://127.0.0.1:${port}/oidc-token`;
        const result = await exchangeWithResolver({
          cfg: { ...cfg, resolver_endpoint: `http://127.0.0.1:${port}` },
          oidcUrl,
          oidcToken: 'dummy-token',
          fetchOidc: true,
          setEnv: false
        });
        if (!result || result.token !== 'mock-session-token-oidc') throw new Error('Unexpected token');
        console.log('did-exchange OIDC fetch success');
        server.close(() => resolve());
      } catch (err) {
        server.close(() => reject(err));
      }
    });
  });
}

if (require.main === module) run().catch(e => { console.error(e); process.exit(1) });
module.exports = { run };
