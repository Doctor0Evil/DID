# Example DID Auth Caller

This example demonstrates how another repository would call the reusable did-auth workflow defined in this repo.

Usage (in another repo):
- Replace relative `uses` with the org repo and tagged version, e.g.:
  - `uses: Doctor0Evil/DID/.github/workflows/did-auth-reusable.yml@v1`
- Provide your own `config/identity.web5.json` in the caller repo.
- Prefer `resolver_dry_run: 'true'` when testing locally or in CI.

Using the published v1.0.0 tag

When referencing the published and released v1.0.0 in a real repo, point to the tag instead of the relative path:

```yaml
uses: <ORG>/<REPO>/.github/workflows/did-auth-reusable.yml@v1.0.0
# Replace `<ORG>/<REPO>` with the publishing org and repository name when you adopt the reusable workflow.
```

In this repository's examples and tests we sometimes use a relative `uses: ./.github/workflows/did-auth-reusable.yml` for in-repo demonstration; real callers should use the org and tag format above.
