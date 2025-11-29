# Project Overview - DID repository

## Detected Stack
- Languages: JSON, JavaScript (ES6)
- Frameworks: None detected (scripts are simple Node.js-based scripts)
- Package Managers: None detected (no package.json present)
- Additional files: DID assets (JSON-LD credentials), policies, scripts for cryptographic/credential operations

## Entry Points
- `scripts/resolve-did.js` - utility to resolve DID (likely Node.js script)
- `scripts/compose-presentation.js` - compose verifiable presentations
- `scripts/check-revocation.js` - check revocation status
 - `scripts/did-auth-exchange.js` - DID auth exchange script used by CI to exchange GitHub OIDC token for a short-lived DID capability
 - `scripts/did-auth-local.js` - local helper for developer flows that requests a dry-run token and stores it locally
*Note:* The CI job includes an early `did-auth` step that runs `scripts/did-auth-exchange.js` and writes `DID_WEB5_SESSION_TOKEN` to the job environment (`$GITHUB_ENV`) so that downstream steps can use it without job output exposure.
- `README.md` - descriptive guide for the repository

## Build / Run Commands
- There is no global build step defined. Suggested run commands:
  - `node scripts/resolve-did.js`
  - `node scripts/compose-presentation.js`
  - `node scripts/check-revocation.js`

## Tests
- No tests detected.
- Raptor-mini setup created a recommended `Makefile` and basic `tests/` scaffolding (if needed) to add tests and coverage later.

## DID/Web5 Identity Integration
- DID Owner: Doctor Jacob Scott Farmer
- DID Anchor: `did:ion:EiD8J2b3K8k9Q8x9L7m2n4p1q5r6s7t8u9v0w1x2y3z4A5B6C7D8E9F0`
- The project uses a runtime identity configuration (`config/identity.web5.json`) which contains only metadata referencing the DID anchor. No private keys or secrets are stored in the repository.
- At runtime, an external Web5/DID agent is expected to resolve credentials and perform secure operations. See `README.md` and `DOCS/PROJECT_OVERVIEW.md` for additional notes.

## Recommendations
- If you intend to build a Node.js project around the scripts, add a `package.json` and a script entry for `start`, `test`, and `lint`.
- Add `Makefile` tasks for `init`, `test`, `build`, `lint`, and `format` for CI parity.
- Add a `devcontainer` for reproducible development environments (created by Raptor-mini).

---

## Raptor-mini Changes Applied
- Created `.devcontainer/devcontainer.json` with base image and essential VS Code extensions.
- Created `config/identity.web5.json` with DID anchor metadata and owner.
- Created `DOCS/PROJECT_OVERVIEW.md` with detected stack, entry points, and DID notes.
- Added `Makefile` placeholder and initial CI & README improvements (if not present).
- Hardened DID/Web5 CI Authentication: This repository now includes a hardened, DID/Web5-based, tokenless CI authentication flow. See `DOCS/DID_WEB5_CI_SUMMARY.md` and `DOCS/DID_AUTH.md` for details.

