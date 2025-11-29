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
- The GitHub Actions workflow (`.github/workflows/ci.yml`) sets `id-token: write` permission at the build job level.
- The CI workflow includes a `did-auth` step early in the `build` job that runs `scripts/did-auth-exchange.js` and writes `DID_WEB5_SESSION_TOKEN` into the job environment via `$GITHUB_ENV` (no token printed to logs).
- Downstream steps in the same job can access `DID_WEB5_SESSION_TOKEN` from the environment without exposing it to job outputs or logs.
- Downstream steps should use the `DID_WEB5_SESSION_TOKEN` environment variable and include the DID anchor as `X-DID-Identity` header for any resolver calls or API requests.

## Operator Runbook

After changing `resolver_endpoint`, perform these runtime checks:

1. Confirm `did-auth` step in CI succeeds (no token printed in the logs).
2. Confirm downstream steps can read `DID_WEB5_SESSION_TOKEN` from the environment and the token is not logged anywhere.
3. Confirm the resolver's runtime logs show the OIDC token was validated and mapped to the DID, and that the resolver generated a short-lived capability token.

Incident response: If a compromise is suspected, rotate the Web5 agent keys, revoke issued capabilities at the resolver, and temporarily disable CI runs containing `did-auth` until the environment is recovered.

## Credential & Token Rotation Runbook

When to rotate:
- Suspected compromise
- Routine security policy intervals or key expiry
- Moving to a new resolver host or operator

High level steps for rotation:
1. Rotate signing keys / credentials in the external Web5 resolver (do not store private keys in this repo).
2. Update any resolver policy mappings or trusted audience settings for the DID and GitHub OIDC issuer as needed.
3. If moving resolvers, update `resolver_endpoint` in `config/identity.web5.json` to the new HTTPS URL and document the change.
4. Validate the change by running `make ci-check` followed by a CI run:
  - Confirm the did-auth step succeeds and that the `DID_WEB5_SESSION_TOKEN` is created (job-scoped) without being logged.
  - Check resolver logs show OIDC validation and issuance of the short-lived token.
5. If any issue arises, roll back the resolver configuration or disable the did-auth step until the environment is fixed.

Important: No rotation steps should require changing sensitive values in this repository; all secrets remain external to the repo and should be handled by the Web5 resolver or a secret manager.

## Reusable did-auth workflow
- A reusable workflow is available at `.github/workflows/did-auth-reusable.yml` that callers may `workflow_call` from repos with the same DID/Web5 trust boundary.
- The reusable workflow runs a job-scoped did-auth step and sets a boolean output `has-session` to indicate whether a job-scoped token exists. It does NOT expose tokens or allow token values via outputs.
- Callers should perform downstream steps in the same job or perform their own did-auth exchange; do not serialize tokens across jobs or artifacts.

## Security Notes

- `resolver_endpoint` must point to an HTTPS endpoint operated by a trusted Web5 agent; do not use HTTP endpoints in production.
- `identity.web5.json` contains only public metadata (the DID anchor and resolver URL); no secrets or signing keys should ever be stored in this file or the repository.

## Security notes
- This repo stores only the DID anchor (`did_identity_anchor`) and paths to the config. No private keys, long-lived secrets, or tokens are stored.
- The real credential resolution and signing should be implemented in an external Web5/DID agent; CI scripts only demonstrate the exchange pattern and do not perform signing.

## Operator tasks
1. Replace `resolver_endpoint` in `config/identity.web5.json` with your Web5 resolver URL.
2. Configure your Web5 agent to trust GitHub's OIDC issuer and map the GitHub actions run to the configured DID anchor.
3. Ensure your resolver accepts and verifies OIDC-proof claims from GitHub and returns a short-lived capability token.
4. Optionally, if you require passing the token across jobs, use an external secret manager or a secure artifact store. Avoid exposing the raw token as a job output.
