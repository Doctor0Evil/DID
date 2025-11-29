const { exec } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

function run() {
  console.log('Starting no-artifact-token-leak test...');
  return new Promise((resolve, reject) => {
    const tmpEnvPath = path.join(os.tmpdir(), `gh_env_${Date.now()}.txt`);
    // Pass a fake OIDC url/token but ensure DRY_RUN so no network access
    const env = Object.assign({}, process.env, {
      RESOLVER_DRY_RUN: 'true',
      ACTIONS_ID_TOKEN_REQUEST_URL: 'http://127.0.0.1/oidc-token',
      ACTIONS_ID_TOKEN_REQUEST_TOKEN: 'fake-token',
      GITHUB_ENV: tmpEnvPath
    });
    exec('node scripts/did-auth-exchange.js', { env, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
      // Dry-run should succeed
      if (err && err.code) return reject(new Error('did-auth CLI returned non-zero in dry-run'));
      const output = `${stdout || ''}\n${stderr || ''}`;
      // Check the output doesn't contain token indicators
      const suspicious = /DID_WEB5_SESSION_TOKEN=|DID_DRYRUN_TOKEN_PLACEHOLDER|token=/i;
      if (suspicious.test(output)) return reject(new Error('Token appeared in CLI output')); 
      // Now check tmp env file exists and includes the token line
      if (!fs.existsSync(tmpEnvPath)) return reject(new Error('GITHUB_ENV file not written')); 
      const content = fs.readFileSync(tmpEnvPath, 'utf8');
      if (!/DID_WEB5_SESSION_TOKEN=/.test(content)) return reject(new Error('GITHUB_ENV does not contain DID_WEB5_SESSION_TOKEN')); 
      // Ensure the token value is not printed anywhere (same check) and that the only sink is the file
      // Clean up
      try { fs.unlinkSync(tmpEnvPath); } catch (e) {}
      console.log('no-artifact-token-leak test passed');
      return resolve();
    });
  });
}

if (require.main === module) run().catch((e) => { console.error(e); process.exit(1); });
module.exports = { run };
