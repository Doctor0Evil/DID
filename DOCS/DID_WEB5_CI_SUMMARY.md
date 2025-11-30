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

## Reusable did-auth workflow
- This repository provides `.github/workflows/did-auth-reusable.yml` as a reusable workflow that callers can `workflow_call` to perform a job-scoped did-auth exchange.
- The reusable workflow sets a boolean output `has-session` indicating whether a session token was created in `$GITHUB_ENV` for the job; it does NOT expose the token value.
- Callers should perform downstream steps that need the token in the same job, or run their own did-auth step in their job; Do NOT pass tokens as artifacts or job outputs.

## Versioning & tags

To publish stable versions of this reusable workflow for use across an organization, tag a commit with semantic tags (for example: `v1` or `v1.0.0`).
Consumers should reference pinned tags in `uses:` statements (for example, `uses: org/repo/.github/workflows/did-auth-reusable.yml@v1.0.0`) to avoid accidental breaking changes when the reusable workflow is updated on `main`.
When making a non-backward-compatible change, bump the major tag (e.g., `v2`) and document the change in `CHANGELOG.md` as necessary.

### Tagging and usage example

To create an annotated, local tag for release (do not run these commands in automation; operator-guided step):

```bash
git tag -a v1.0.0 -m "DID/Web5 did-auth reusable workflow v1.0.0"
git push origin v1.0.0
```

After tagging, consumer repos can reference the published release using a `uses:` statement in their workflows such as:

```yaml
uses: <ORG>/<REPO>/.github/workflows/did-auth-reusable.yml@v1.0.0
# Replace <ORG>/<REPO> with the publishing org/repository once published
```

> Note: In this repository and examples we sometimes use a relative path for in-repo tests and examples. For real callers, replace that with `uses: <ORG>/<REPO>/.github/workflows/did-auth-reusable.yml@v1.0.0`.

### GitHub release (manual operator steps)

After tagging and pushing `v1.0.0`, create a GitHub Release as follows:

1. Open the repository settings on GitHub → Releases → `Draft a new release`.
2. Set `Tag version` to `v1.0.0` and `Release title` to something like `DID/Web5 did-auth v1.0.0`.
3. Paste the `v1.0.0` section of `CHANGELOG.md` into the release description and publish the release.

This process is manual and is the recommended operator flow for publishing stable tags; the repository itself does not automate release drafting.

Operator helpers
----------------

This repository contains a `Makefile` target to validate and draft release notes before tagging:

```bash
# Run release validations and draft a release notes file for TAG
make release TAG=v1.0.0
```

This runs `make ci-check` and uses an internal helper script (`scripts/publish-release.js`) to extract the `v1.0.0` section of `CHANGELOG.md` and write a `release-notes-v1.0.0.md` file for operator review. The helper does not publish the tag or the release; it only assists with the draft and basic validations.

Alternative via npm:

```bash
npm run publish-release -- --tag v1.0.0
```

The generated file `release-notes-v1.0.0.md` is intended to be used as the Release Notes body in the GitHub UI when drafting a new release.

Tip: Use `--skip-ci` to skip running local CI checks if you only want to generate draft notes quickly:

```bash
npm run publish-release -- --tag v1.0.0 --skip-ci
```

### Automated CI integration test

This repository includes a CI workflow that is automatically run on `push` and `pull_request` to `main` that calls the reusable workflow in dry-run mode and validates that a job-scoped session is present. The workflow is defined in `.github/workflows/did-auth-reusable-ci-test.yml` and ensures that changes to the reusable workflow are validated in CI before tagging and publishing.

Operator reminder: After cutting or updating a tag like `v1.0.0`, always ensure all CI workflows (including the reusable CI test) are green before recommending other repos update their `uses: ...@v1.0.0` references.

### Release helper script & dry-run CI

The repository includes `scripts/publish-release.js` as an operator helper that validates and drafts releases (it does not publish by default). The script supports a dry-run mode and a `--skip-ci` option for draft-only behavior.

- A CI job is available at `.github/workflows/release-dryrun.yml` to validate `publish-release.js` in dry-run mode against `main`. This job runs `node scripts/publish-release.js --tag v0.0.0-test --dry-run` and ensures the helper script exits successfully (without publishing anything).
 - For maintainers, a `Makefile` helper `make release-draft TAG=v1.0.0` will call the GitHub CLI (`gh`) to draft a release using the generated `release-notes-<tag>.md` file. This Makefile target is optional and must be invoked manually by a maintainer with a proper authenticated `gh` context. The `release-draft` target prompts interactively by default for confirmation in TTYs; set `RELEASE_DRAFT_FORCE=1` to skip the prompt (not recommended for CI).

Operator note: The CI job is a dry-run validation only; maintainers must manually create and publish releases via `git tag` and `gh release create` to remain in secure control of releases.

