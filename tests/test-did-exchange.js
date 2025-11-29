const http = require('http');
const { exchangeWithResolver } = require('../scripts/did-auth-exchange');
const path = require('path');
const fs = require('fs');

function runTests() {
  console.log('Starting did-exchange tests...');
  // Start a fake resolver server
  const server = http.createServer((req, res) => {
    if (req.url === '/exchange' && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        res.setHeader('Content-Type', 'application/json');
        // Return a mock token
        res.end(JSON.stringify({ session_token: 'mock-session-token' }));
      });
    } else {
      res.statusCode = 404;
      res.end();
    }
  });
  return new Promise((resolve, reject) => {
    server.listen(0, async () => {
      const { port } = server.address();
      try {
        const cfgPath = path.join(__dirname, '..', 'config', 'identity.web5.json');
        const raw = fs.readFileSync(cfgPath, 'utf8');
        const cfg = JSON.parse(raw);
        // Replace resolver endpoint with our test server
        const result = await exchangeWithResolver({
          cfg: { ...cfg, resolver_endpoint: `http://127.0.0.1:${port}` },
          oidcUrl: 'http://127.0.0.1/dummy',
          oidcToken: 'dummy-token',
          fetchOidc: false,
          setEnv: false
        });
        // Resolver returns 'session_token' in this mock to demonstrate only consuming the dedicated field.
        if (!result || !(result.token === 'mock-session-token' || result.session_token === 'mock-session-token')) throw new Error('Unexpected token');
        console.log('did-exchange success');
        server.close(() => resolve());
      } catch (err) {
        server.close(() => reject(err));
      }
    });
  });
}

if (require.main === module) {
  runTests().then(() => console.log('test-did-exchange OK')).catch((e) => { console.error('test-did-exchange failed:', e); process.exit(1); });
}

module.exports = { runTests };
