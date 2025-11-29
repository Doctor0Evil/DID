const fs = require('fs');
const path = require('path');

function loadDidConfig() {
  const p = path.join(__dirname, '..', 'config', 'identity.web5.json');
  try {
    const raw = fs.readFileSync(p, 'utf8');
    const cfg = JSON.parse(raw);
    // Basic checks (no sensitive info returned)
    if (!cfg.did_identity_anchor || typeof cfg.did_identity_anchor !== 'string') throw new Error('Missing or invalid did_identity_anchor');
    if (!cfg.resolver_endpoint || typeof cfg.resolver_endpoint !== 'string') throw new Error('Missing or invalid resolver_endpoint');
    if (!cfg.capability_audience) cfg.capability_audience = 'github-actions';
    if (!Array.isArray(cfg.usage)) cfg.usage = [];
    return cfg;
  } catch (err) {
    throw new Error('Failed to load identity.web5.json: ' + (err.message || err));
  }
}

module.exports = { loadDidConfig };
