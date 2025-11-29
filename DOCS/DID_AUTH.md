# DID-based Tokenless CI Authentication

This document explains the tokenless CI pattern used in this repository.

## Overview
- GitHub Actions supports OIDC and allows a workflow to request an OIDC ID token at runtime (short-lived). This pattern avoids storing long-lived secrets in GitHub.
- A Web5/DID agent or resolver accepts the OIDC proof and exchanges it for a short-lived, DID-bound capability (session token) that the CI pipeline can use.

## Key files
- `config/identity.web5.json` - contains DID anchor and runtime configuration (resolver endpoint). It stores no secrets.
- `scripts/did-auth-exchange.js` - CI-side exchange script:
  - Reads `config/identity.web5.json`.
  - Reads `ACTIONS_ID_TOKEN_REQUEST_URL` and `ACTIONS_ID_TOKEN_REQUEST_TOKEN` from the environment (populated by GitHub Actions when `id-token: write` permission is enabled).
  - Requests an OIDC ID token and exchanges it with the configured `resolver_endpoint` under `/exchange`.
  - On success, writes the short-lived token to `$GITHUB_ENV` as `DID_WEB5_SESSION_TOKEN` for consumption by downstream steps.
  - The script never prints secret tokens to logs and exits non-zero if the exchange fails.
- `scripts/did-auth-local.js` - development helper that can use `LOCAL_OIDC_TOKEN` or mock flows and writes the session token only to a `.did-session.tmp` file (gitignored). It supports `--print-status` to check whether a session exists.

## Workflow integration
- The GitHub Actions workflow (`.github/workflows/ci.yml`) has `id-token: write` permission and an explicit `did-auth-bootstrap` job which runs before main steps.
- `did-auth-bootstrap` runs `scripts/did-auth-exchange.js` and sets a job output `did_token`. The build job depends on `did-auth-bootstrap` and uses `needs.did-auth-bootstrap.outputs.did_token` as `DID_WEB5_SESSION_TOKEN`.
- Downstream steps should use the `DID_WEB5_SESSION_TOKEN` environment variable and include the DID anchor as `X-DID-Identity` header for any resolver calls or API requests.

## Security notes
- This repo stores only the DID anchor (`did_identity_anchor`) and paths to the config. No private keys, long-lived secrets, or tokens are stored.
- The real credential resolution and signing should be implemented in an external Web5/DID agent; CI scripts only demonstrate the exchange pattern and do not perform signing.

## Operator tasks
1. Replace `resolver_endpoint` in `config/identity.web5.json` with your Web5 resolver URL.
2. Configure your Web5 agent to trust GitHub's OIDC issuer and map the GitHub actions run to the configured DID anchor.
3. Ensure your resolver accepts and verifies OIDC-proof claims from GitHub and returns a short-lived capability token.
4. Optionally wire the `did-auth-bootstrap` job to produce a job output or store secrets in-memory only (never in the repo).
