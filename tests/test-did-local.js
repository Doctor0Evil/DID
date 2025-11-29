const fs = require('fs');
const path = require('path');
const { writeSessionToTmp } = require('../scripts/did-auth-local');

function run() {
  const p = path.join(__dirname, '..', '.did-session.tmp');
  if (fs.existsSync(p)) fs.unlinkSync(p);
  const token = 'dummy-session-token';
  const out = writeSessionToTmp(token);
  if (!fs.existsSync(out)) throw new Error('Session file not written');
  console.log('test-did-local OK');
}

if (require.main === module) run();
module.exports = { run };
