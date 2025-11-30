#!/usr/bin/env node
/*
 * publish-release.js
 * Internal helper for operators to validate and draft GitHub release notes
 * - Validates tag format
 * - Ensures working tree is clean
 * - Runs CI checks (`make ci-check`)
 * - Extracts release notes from CHANGELOG.md and writes a draft file
 * - Prints suggested `git` and `gh` commands for operator use (does not auto-publish)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function die(msg) {
  console.error('ERROR: ' + msg);
  process.exit(1);
}

function run(cmd, opts = {}) {
  try {
    console.log(`> ${cmd}`);
    return execSync(cmd, { stdio: opts.inherit ? 'inherit' : 'pipe' }).toString().trim();
  } catch (err) {
    throw err;
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--tag' || a === '-t') {
      out.tag = args[i + 1];
      i++;
    } else if (a === '--help' || a === '-h') {
      out.help = true;
    } else if (a === '--skip-ci') {
      out.skipCi = true;
    } else if (a === '--dry-run') {
      out.dryRun = true;
    }
  }
  return out;
}

function ensureTagFormat(tag) {
  if (!/^v\d+\.\d+\.\d+$/.test(tag)) die('Tag must be in semantic form vMAJOR.MINOR.PATCH (e.g., v1.0.0)');
}

function getChangelogSection(tag) {
  const changelogPath = path.resolve(process.cwd(), 'CHANGELOG.md');
  if (!fs.existsSync(changelogPath)) return null;
  const txt = fs.readFileSync(changelogPath, 'utf8');
  const lines = txt.split(/\r?\n/);
  const header = `## ${tag}`;
  const startIdx = lines.findIndex((l) => l.trim() === header);
  if (startIdx === -1) return null;
  // find next section header '## ' after startIdx
  let endIdx = lines.length;
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (lines[i].startsWith('## ')) { endIdx = i; break; }
  }
  const section = lines.slice(startIdx, endIdx).join('\n').trim();
  return section;
}

function writeDraftFile(tag, notes) {
  const fname = `release-notes-${tag}.md`;
  const content = `# Release ${tag}\n\n${notes}\n`;
  fs.writeFileSync(path.resolve(process.cwd(), fname), content, 'utf8');
  return fname;
}

async function main() {
  const argv = parseArgs();
  if (argv.help || !argv.tag) {
    console.log('Usage: node scripts/publish-release.js --tag v1.0.0');
    process.exit(0);
  }
  const tag = argv.tag;
  const isDry = argv.dryRun || process.env.PUBLISH_DRY_RUN === '1' || process.env.PUBLISH_DRY_RUN === 'true';
  if (isDry) console.log('DRY RUN: publishing actions will be simulated, no files will be written');
  ensureTagFormat(tag);
  console.log(`Validating release tag ${tag}`);

  // Check working tree clean (read-only check - ok in dry-run)
  try {
    const status = run('git status --porcelain');
    if (status) die('Working tree is not clean; commit or stash changes before creating a release.');
  } catch (err) {
    die('Could not check git status - ensure this is run in a git repo');
  }

  // Check tag existence (read-only - ok in dry-run)
  try {
    const existing = run(`git rev-parse --verify ${tag}`);
    if (existing) {
      console.warn(`WARNING: tag ${tag} already exists locally. Consider bumping the version or deleting the existing tag before continuing.`);
    }
  } catch (err) {
    // tag doesn't exist, ok
  }

  // Run CI health checks
  if (!argv.skipCi && !isDry) {
    try {
      console.log('Running local CI checks (make ci-check) -- this may be noisy, consider running in a local shell');
      run('make ci-check', { inherit: true });
    } catch (err) {
      die('CI health checks failed. Fix issues before tagging and publishing.');
    }
  } else {
    console.log('Skipping CI checks (--skip-ci specified)');
  }

  // Find release notes in CHANGELOG.md
  const notes = getChangelogSection(tag) || '(No release notes found in CHANGELOG.md for this tag)';
  const fname = `release-notes-${tag}.md`;
  if (isDry) {
    console.log(`DRY RUN: would extract release notes for ${tag} -> ${fname}`);
  } else {
    const written = writeDraftFile(tag, notes);
    console.log('Wrote release draft: ' + written);
  }

  console.log('\nRelease draft created: ' + fname);
  console.log('\nSuggested operator steps:');
  console.log('1) Create an annotated tag locally:');
  console.log(`   git tag -a ${tag} -m "DID/Web5 did-auth reusable workflow ${tag}"`);
  console.log('2) Push the tag to the origin:');
  console.log(`   git push origin ${tag}`);
  console.log('3) Open GitHub → Releases → Draft a new release and paste the contents of the generated draft file. Or use the GitHub CLI:');
  console.log(`   gh release create ${tag} -t "DID/Web5 did-auth ${tag}" -F ${fname} --repo <ORG>/<REPO> --draft`);
  console.log('\nNote: Replace <ORG>/<REPO> with your publishing organization and repository.');
  console.log('\nOperator reminder: Verify CI (including the reusable CI test) is green before recommending other repos adopt the tag.');
}

main().catch((e) => {
  console.error('Unexpected error:', e);
  process.exit(1);
});
