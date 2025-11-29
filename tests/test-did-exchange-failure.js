const http = require('http');
const { exchangeWithResolver } = require('../scripts/did-auth-exchange');
const path = require('path');
const fs = require('fs');

async function run() {
  console.log('Starting did-exchange failure tests...');
  const server = http.createServer((req, res) => {
    if (req.url === '/exchange' && req.method === 'POST') {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'bad request' }));
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
        try {
          await exchangeWithResolver({ cfg: { ...cfg, resolver_endpoint: `http://127.0.0.1:${port}` }, oidcToken: 'dummy', fetchOidc: false, setEnv: false });
          server.close(() => reject(new Error('exchange should have failed but did not')));
        } catch (err) {
          console.log('did-exchange failure test passed');
          server.close(() => resolve());
        }
      } catch (err) {
        server.close(() => reject(err));
      }
    });
  });
}

if (require.main === module) run().catch((e)=>{console.error(e); process.exit(1)});
module.exports = { run };
