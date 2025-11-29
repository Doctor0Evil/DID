# Example DID Auth Caller

This example demonstrates how another repository would call the reusable did-auth workflow defined in this repo.

Usage (in another repo):
- Replace relative `uses` with the org repo and tagged version, e.g.:
  - `uses: Doctor0Evil/DID/.github/workflows/did-auth-reusable.yml@v1`
- Provide your own `config/identity.web5.json` in the caller repo.
- Prefer `resolver_dry_run: 'true'` when testing locally or in CI.

This example uses a relative path to the reusable workflow for in-repo demonstrations and should NOT be used across repos directly.
