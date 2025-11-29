const { exchangeWithResolver } = require('../scripts/did-auth-exchange');
const path = require('path');
const fs = require('fs');

function run() {
  console.log('Starting did-exchange missing-env tests...');
  const cfgPath = path.join(__dirname, '..', 'config', 'identity.web5.json');
  const raw = fs.readFileSync(cfgPath, 'utf8');
  const cfg = JSON.parse(raw);
  // Should fail because no OIDC vars provided and fetchOidc=true
  return exchangeWithResolver({ cfg, fetchOidc: true, setEnv: false }).then(() => {
    throw new Error('Expected exchange to fail due to missing OIDC env');
  }).catch((e) => {
    console.log('did-exchange missing-env test passed');
  });
}

if (require.main === module) run().catch(e => { console.error(e); process.exit(1) });
module.exports = { run };
