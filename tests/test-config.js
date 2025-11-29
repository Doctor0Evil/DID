const fs = require('fs');
const path = require('path');
const { loadDidConfig } = require('../scripts/did-auth-config');
function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'Assertion failed');
}
function run() {
  const cfgPath = path.join(__dirname, '..', 'config', 'identity.web5.json');
  assert(fs.existsSync(cfgPath), 'identity.web5.json is missing');
  const raw = fs.readFileSync(cfgPath, 'utf8');
  const cfg = JSON.parse(raw);
  assert(cfg.did_identity_anchor && cfg.did_identity_anchor.startsWith('did:'), 'Missing or invalid did_identity_anchor');
  assert(cfg.owner_name, 'Missing owner_name');
  assert(cfg.runtime_resolver, 'Missing runtime_resolver');
  assert(cfg.resolver_endpoint, 'Missing resolver_endpoint');
  assert(cfg.capability_audience, 'Missing capability_audience');
  assert(Array.isArray(cfg.usage) && cfg.usage.length > 0, 'Missing usage array');
  console.log('test-config OK');
}
// Additional test for config facade
function runFacade() {
  const cfg = loadDidConfig();
  if (!cfg || !cfg.did_identity_anchor) throw new Error('loadDidConfig did not return a valid config');
  console.log('test-config facade OK');
}

module.exports = { run, runFacade };
if (require.main === module) run();
module.exports = { run };
