const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

function runPublishRelease(tempDir, tag, cb) {
  const node = process.execPath;
  const script = path.resolve(__dirname, '..', 'scripts', 'publish-release.js');
  const env = Object.assign({}, process.env, {
    PUBLISH_DRY_RUN: '1',
    GITHUB_REPOSITORY: 'Doctor0Evil/DID'
  });
  const args = [script, '--tag', tag, '--dry-run', '--skip-ci'];
  const proc = spawn(node, args, { cwd: tempDir, env, stdio: ['ignore', 'pipe', 'pipe'] });
  let stdout = '';
  let stderr = '';
  proc.stdout.on('data', (d) => (stdout += d.toString()));
  proc.stderr.on('data', (d) => (stderr += d.toString()));
  proc.on('close', (code) => cb(null, { code, stdout, stderr }));
}

function setupTempRepo() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'publish-release-test-'));
  // Init a git repo
  fs.writeFileSync(path.join(tmp, 'README.md'), '# tmp repo\n');
  fs.writeFileSync(path.join(tmp, 'CHANGELOG.md'), '## v1.0.0\n\n- Initial test release.\n');
  const prevCwd = process.cwd();
  try {
    process.chdir(tmp);
    require('child_process').execSync('git init -b main');
    require('child_process').execSync('git add .');
    require('child_process').execSync('git commit -m "chore: initial commit for tests"');
  } finally {
    process.chdir(prevCwd);
  }
  return tmp;
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'Assertion failed');
}

async function runTest() {
  const tempDir = setupTempRepo();
  return new Promise((resolve, reject) => {
    runPublishRelease(tempDir, 'v1.0.0-dryrun', (err, res) => {
      if (err) return reject(err);
      try {
        // Exit code 0
        assert(res.code === 0, `Expected exit code 0, got ${res.code}. stderr: ${res.stderr}`);
        // Dry-run message present
        assert(/DRY RUN/i.test(res.stdout), 'Expected DRY RUN message in stdout');
        assert(/DRY RUN: publishing actions will be simulated/i.test(res.stdout), 'Expected DRY RUN: publishing actions message');
        // No release file was created in dry-run mode
        const targetFile = path.join(tempDir, 'release-notes-v1.0.0-dryrun.md');
        assert(!fs.existsSync(targetFile), 'Release notes file should not be written in dry-run mode');
        // No tokens in output
        assert(!/token|Bearer|ACTIONS_ID_TOKEN_REQUEST_TOKEN|DID_WEB5_SESSION_TOKEN/i.test(res.stdout + res.stderr), 'Output must not include tokens');
        console.log('publish-release dry-run test passed');
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  });
}

module.exports = { run: runTest };

if (require.main === module) runTest();
