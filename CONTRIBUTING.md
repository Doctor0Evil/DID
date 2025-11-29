# Contributing

Thank you for contributing! Please follow these guidelines:

- Branching: Work in feature branches off `main`. Use `feature/<short-topic>` naming style.
- PRs: Open a PR with a clear description and reference any related issue.
- Tests: Add tests for new code paths. All PRs should include tests as applicable.
- Lint: Run `make lint` and `make format` before submitting PRs.
- Reviews: Ensure at least one other maintainer approves changes.

## Coding Style
- Use consistent indentation (2 spaces).
- Use Prettier for JavaScript formatting and ESLint for code quality where applicable.

## CI
- New changes should not cause CI checks to fail. The CI workflow runs quick lint, tests, and formatting checks.

## DID/Web5 CI Auth Rules
- Do not introduce GitHub secrets or long-lived tokens for CI auth; use the existing did-auth pattern.
- If you modify scripts `did-auth-*`, update tests in `tests/test-did-exchange-*.js` and `tests/test-no-artifact-token-leak.js` and ensure they pass.
- Any change that logs OIDC tokens, DID session tokens, or resolver responses is a security regression and must be reverted.
- Use `make ci-check` before opening PRs that touch CI/DID/Web5 auth.

### Husky pre-commit (optional)
- If Husky is installed locally (and the `prepare` script is present), a pre-commit hook will run `make secret-scan` to prevent accidental secret commits.
- Do not bypass this hook; if you must, run `make secret-scan` manually before pushing.

