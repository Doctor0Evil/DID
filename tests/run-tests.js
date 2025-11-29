const { run, runFacade } = require('./test-config');
const { runTests } = require('./test-did-exchange');
const { run: runNoPrint } = require('./test-did-exchange-no-print');
const { run: runOidc } = require('./test-did-exchange-oidc');
const { run: runFailure } = require('./test-did-exchange-failure');
const { run: runLocal } = require('./test-did-local');
const { run: runMissing } = require('./test-did-exchange-missing-env');
const { run: runEnvWrite } = require('./test-did-exchange-env-write');

async function runAll() {
  try {
      run(); 
      runFacade();
    console.log('Config test passed');
      await runTests();
      await runNoPrint();
      await runOidc();
      await runEnvWrite();
    runLocal();
      await runFailure();
      await runMissing();
    console.log('DID exchange test passed');
    console.log('All tests passed');
  } catch (err) {
    console.error('Tests failed:', err.message || err);
    process.exit(1);
  }
}

if (require.main === module) runAll();
