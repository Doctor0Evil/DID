# DID/Web5 Tokenless CI Authentication — Summary

## Architecture overview
This repository implements a tokenless CI authentication pattern that uses GitHub Actions' built-in OIDC support combined with a Web5/DID resolver to obtain short-lived session tokens bound to a DID anchor.

Flow (short): GitHub Actions OIDC → `scripts/did-auth-exchange.js` → External Web5/DID resolver → short-lived DID session token set in `$GITHUB_ENV` for CI (or `.did-session.tmp` locally).

## Security properties
- No long-lived secrets or private keys are stored in this repository or in GitHub Actions workflows; only public DID anchors and config metadata are stored.
- Tokens are job-scoped and only stored in ephemeral job environment files (CI) or gitignored temporary files (local). Tokens are never committed to the repository or written to artifacts.
- `did-auth` scripts and exchange logic never print token values, raw resolver responses, or OIDC secrets to stdout/stderr or logs.
- Resolver responses are consumed minimally; only a dedicated `session_token` or `token` value may be used and stored. Other fields are ignored to prevent accidental leakage.

## Tests & validation (names only)
- `test-config.js` (config validation)
- `test-did-exchange.js` (exchange happy path)
- `test-did-exchange-oidc.js` (OIDC fetch + exchange)
- `test-did-exchange-failure.js` (non-2xx responses)
- `test-did-exchange-missing-env.js` (missing env handling)
- `test-did-exchange-env-write.js` (writes DID_WEB5_SESSION_TOKEN to GITHUB_ENV)
- `test-did-exchange-no-print.js` (no printing tokens to logs)
- `test-no-artifact-token-leak.js` (verifies tokens only in GITHUB_ENV, not outputs)
- `test-did-local.js` (local helper behavior)

All tests are run via `make test` (or `npm test`) and `make ci-check` performs a dry-run of the did-auth flow without requiring real resolver endpoints or secrets.

## Operational Runbook (quick)
1. Replace `resolver_endpoint` in `config/identity.web5.json` with your Web5 resolver URL (HTTPS). Do not store any private keys in the repository.
2. Configure your resolver to trust GitHub's OIDC issuer and ensure it accepts and verifies the short-lived OIDC tokens issued by GitHub Actions.
3. Use `make ci-check` to validate did-auth in your environment (this runs `make init`, a dry-run did-auth, `make secret-scan`, and `make test`).
4. If compromise is suspected, rotate Web5 agent keys externally, revoke tokens from resolver, and disable CI did-auth runs until triage completes.

For detailed procedures, diagnostics, and rotation guidance, see `DOCS/DID_AUTH.md`.
