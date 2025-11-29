const fs = require('fs');
const os = require('os');
const path = require('path');
const { exchangeWithResolver } = require('../scripts/did-auth-exchange');

async function run() {
  console.log('Starting did-exchange env-write tests...');
  const tmpEnvPath = path.join(os.tmpdir(), `gh_env_${Date.now()}.txt`);
  process.env.GITHUB_ENV = tmpEnvPath;
  const cfg = require('../config/identity.web5.json');
  const res = await exchangeWithResolver({ cfg, fetchOidc: false, oidcToken: 'dummy', setEnv: true });
  const content = fs.readFileSync(tmpEnvPath, 'utf8');
  if (!content.includes('DID_WEB5_SESSION_TOKEN=')) throw new Error('GITHUB_ENV not written with token');
  console.log('did-exchange env-write test passed');
  fs.unlinkSync(tmpEnvPath);
}

if (require.main === module) run().catch(e => { console.error(e); process.exit(1) });
module.exports = { run };
