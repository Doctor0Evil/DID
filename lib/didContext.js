const fs = require('fs');
const path = require('path');

function getDidIdentityContext() {
  const p = path.join(__dirname, '..', 'config', 'identity.web5.json');
  try {
    const raw = fs.readFileSync(p, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (err) {
    return null;
  }
}

module.exports = { getDidIdentityContext };
