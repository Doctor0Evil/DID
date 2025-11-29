#!/usr/bin/env node
// Local DID auth helper (for development): do not hardcode secrets
// Usage: LOCAL_OIDC_TOKEN=xxx node scripts/did-auth-local.js --print-status

const fs = require('fs');
const path = require('path');
const { exchangeWithResolver, readIdentityConfig } = require('./did-auth-exchange');

function writeSessionToTmp(token) {
  const p = path.join(__dirname, '..', '.did-session.tmp');
  try {
    fs.writeFileSync(p, token, { encoding: 'utf8', flag: 'w' });
    return p;
  } catch (err) {
    return null;
  }
}

async function main() {
  const cfg = readIdentityConfig();
  if (!cfg) {
    console.error('Missing identity config');
    process.exit(1);
  }
  try {
    const resp = await exchangeWithResolver({ fetchOidc: false });
    if (resp && resp.token) {
      const p = writeSessionToTmp(resp.token);
      if (p) {
        console.log(`Session written to ${p}`);
        process.exit(0);
      }
      console.log('Session obtained');
      process.exit(0);
    }
    console.error('No token returned');
    process.exit(2);
  } catch (err) {
    console.error('Exchange failed - local helper');
    process.exit(1);
  }
}

if (require.main === module) {
  if (process.argv.includes('--print-status')) {
    const p = path.join(__dirname, '..', '.did-session.tmp');
    if (fs.existsSync(p)) {
      console.log('Session file exists');
      process.exit(0);
    }
    console.log('No session file present');
    process.exit(2);
  }
  main();
}

module.exports = { writeSessionToTmp };
