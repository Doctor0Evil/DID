const fs = require('fs');
const path = require('path');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

console.log('Running basic sanity tests...');

const scripts = [
  'scripts/resolve-did.js',
  'scripts/compose-presentation.js',
  'scripts/check-revocation.js'
];

scripts.forEach((s) => {
  const p = path.join(__dirname, '..', s);
  assert(fs.existsSync(p), `Expected ${s} to exist`);
  console.log(`Found ${s}`);
});

console.log('Sanity tests completed successfully.');
