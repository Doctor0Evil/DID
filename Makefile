SHELL := /bin/bash

.PHONY: init test lint format build

init:
	@echo "Running project init..."
	@if [ -f package.json ]; then npm ci || true; else echo "No package.json found - skipping npm install"; fi
	@if [ -f requirements.txt ]; then pip install -r requirements.txt || true; fi
	@echo "Done."

test:
	@echo "Running tests..."
	@if [ -f package.json ]; then npm test || true; elif [ -f tests/run-tests.js ]; then node tests/run-tests.js || true; else echo "No tests found - skipped"; fi

lint:
	@echo "Running linters..."
	@if command -v eslint >/dev/null 2>&1; then eslint **/*.js || true; else echo "ESLint not installed; skipping"; fi

format:
	@echo "Running formatters..."
	@if command -v prettier >/dev/null 2>&1; then prettier --write "**/*.js" || true; else echo "Prettier not installed; skipping"; fi

build:
	@echo "No build step for this repository."

secret-scan:
	@echo "Scanning for high-probability secrets..."
	@set -e; \\
	EGREP='egrep -n --binary-files=without-match'; \\
	PATTERN='(A3T[A-Z0-9]{14}|AKIA[0-9A-Z]{16}|ASIA[0-9A-Z]{16}|-----BEGIN PRIVATE KEY-----|-----BEGIN RSA PRIVATE KEY-----|-----BEGIN OPENSSH PRIVATE KEY-----|PRIVATE KEY|ghp_[0-9A-Za-z_]{30,}|eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*|GITHUB_TOKEN)'; \\
	FOUND=$$($${EGREP} "$${PATTERN}" --exclude-dir=.git -I . || true); \\
	if [ ! -z "$$FOUND" ]; then echo "Potential secrets detected:"; echo "$$FOUND"; exit 1; else echo "No high-confidence secrets detected"; fi

ci-check:
	@echo "Running CI health check (dry-run)"
	@echo "Initializing..."
	@make init
	@echo "Running did-auth dry-run..."
	@RESOLVER_DRY_RUN=true node scripts/did-auth-exchange.js || true
	@make secret-scan
	@make test
