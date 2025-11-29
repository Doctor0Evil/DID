# Testing Guide

This repository currently includes minimal, essential tests to sanity-check that core scripts are present.

## Run tests locally

1. Install dependencies (if applicable):

```bash
make init
```

2. Run tests:

```bash
make test
```

The `make test` target runs `node tests/run-tests.js` which performs basic checks.

## CI
The CI workflow (created by Raptor-mini) will run `make init`, `make test`, and `make lint` on supported runners.

## Coverage
No coverage tool is configured by default. If you add a package.json and tests framework (like Jest), you can add coverage flags and include a `make test` step to run coverage.
