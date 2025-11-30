# Changelog

All notable changes to this project will be documented in this file.

## Unreleased
- Placeholder for future changes. When preparing a release, move entries to the released version section and tag the repo.
- Added `publish-release.js` dry-run test and optional `make release-draft` helper using GitHub CLI.

## v1.0.0

Initial release of reusable DID/Web5 OIDC did-auth workflow (`did-auth-reusable.yml`) and supporting scripts/tests.

Highlights:
- Introduced `.github/workflows/did-auth-reusable.yml` — a reusable GitHub Actions workflow for secure DID/Web5 CI authentication using GitHub OIDC.
- Added `.github/workflows/did-auth-reusable-ci-test.yml` — an automated CI integration test that runs on push/PR and validates the reusable workflow in dry-run mode (no tokens printed).
- Added example caller in `examples/did-auth-caller/` and updated documentation and tests validating `DID_WEB5_SESSION_TOKEN` behavior.
- Implemented secret-scan patterns, Husky pre-commit guidance, and additional documentation for safe org adoption.
