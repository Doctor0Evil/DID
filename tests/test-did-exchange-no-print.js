const { exec } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

function run() {
  console.log('Starting did-exchange output safety test...');
  return new Promise((resolve, reject) => {
    // Run the script with RESOLVER_DRY_RUN so it does not make network calls
    const cmd = `node scripts/did-auth-exchange.js`;
    const env = Object.assign({}, process.env, { RESOLVER_DRY_RUN: 'true' });
    exec(cmd, { env, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
      // Ensure stdout/stderr do not contain tokens or raw values
      const out = `${stdout || ''}\n${stderr || ''}`;
      if (out.includes('DID_DRYRUN_TOKEN_PLACEHOLDER') || out.includes('DID_WEB5_SESSION_TOKEN=')) {
        return reject(new Error('Token or sensitive content printed to stdout/stderr'));
      }
      console.log('did-exchange output safety test passed');
      return resolve();
    });
  });
}

if (require.main === module) run().catch((e) => { console.error(e); process.exit(1); });
module.exports = { run };
