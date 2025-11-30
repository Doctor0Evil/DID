# web5-identity
a safe-for-public GitHub repo that AI chats can read to orchestrate self-only, automated retrieval of personal artifacts and produce compliant, privacy-preserving Web5 DID-based verifiable credentials.

## Minimal Manual Steps
- Run the environment setup: `make init`
- Run tests: `make test`
- For local development, configure your external Web5 identity agent to bind this repo to the DID anchor declared in `config/identity.web5.json`.

## DID/Web5 Identity
This repo includes a runtime identity anchor that references a DID used for provenance and automation. **No private keys or credentials are stored in the repository.** The anchor is stored in `config/identity.web5.json` and should be resolved by an external Web5/DID agent at runtime.

### DID-based Tokenless CI Authentication
This repository demonstrates a tokenless CI authentication pattern where:
- GitHub Actions requests a short-lived OIDC token at runtime (requires `id-token: write` permission on the build job).
- `scripts/did-auth-exchange.js` exchanges that OIDC token with a Web5/DID resolver for a short-lived DID-bound capability.
- The CI workflow runs a `did-auth` step early in the build job that writes the session token as `DID_WEB5_SESSION_TOKEN` to the job environment via `$GITHUB_ENV`. Downstream steps in the same job can use it; it is not echoed to logs.

See `DOCS/DID_AUTH.md` for more details and operator tasks.

Note: This repository includes an automated CI integration test `.github/workflows/did-auth-reusable-ci-test.yml` that invokes the reusable did-auth workflow in dry-run mode on `push` and `pull_request` to `main` to ensure stability before a tag is published.

### Quick Health Check
Run the following to perform a lightweight CI health check (dry-run):

```bash
make ci-check
```

This will run `make init`, force a `did-auth` dry-run (no network call if `resolver_endpoint` is a placeholder or `RESOLVER_DRY_RUN` is `true`), run the secret scan, and run the test suite.

For a concise overview of this pattern, see `DOCS/DID_WEB5_CI_SUMMARY.md`.

### Local Husky setup (optional but recommended)
If `husky` is installed as a devDependency and `.husky/pre-commit` exists, run the following once after cloning to enable hooks:

```bash
npx husky install
```

The pre-commit hook will run `make secret-scan` to help prevent accidental token or secret commits; to bypass (emergency only) run `HUSKY=0 git commit` but then run `make secret-scan` manually prior to pushing.
