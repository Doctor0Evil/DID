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

