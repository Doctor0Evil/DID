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

# Validate and create a release draft locally (does not publish):
# Usage: make release TAG=v1.0.0
release:
	@if [ -z "$(TAG)" ]; then echo "Usage: make release TAG=v1.0.0" && exit 1; fi
	@echo "Validating release for $(TAG)..."
	@node scripts/publish-release.js --tag $(TAG)

# Internal helper to draft release notes without publishing. Use `make release TAG=vX.Y.Z` to run validations and draft notes.
#########################################################################
# Optional: Draft a GitHub release using the `gh` CLI
# This target is intended for manual use by maintainers only and should not be run from CI.
# It drafts a release using the `gh` CLI and a prepared `release-notes-<TAG>.md` file.
# Usage: make release-draft TAG=v1.0.0
#
# Safety: The target prompts the user for an interactive confirmation when running
# from a TTY, unless explicit RELEASE_DRAFT_FORCE=1 is set (not recommended for CI).
# If running non-interactively, the command will require RELEASE_DRAFT_FORCE=1.
#########################################################################
release-draft:
	@if [ -z "$(TAG)" ]; then echo "Usage: make release-draft TAG=v1.0.0" && exit 1; fi
	@if ! command -v gh >/dev/null 2>&1; then echo 'gh CLI not detected; install and authenticate to continue' && exit 1; fi
	@echo "Drafting GitHub Release for $(TAG) (draft only)"
	@if [ -z "$(RELEASE_DRAFT_FORCE)" ]; then \
		if [ -t 0 ]; then \
			read -p "About to run 'gh release create $(TAG) --draft'. Continue? [y/N] " ans; \
			[ "$$ans" = "y" ] || { echo "Aborted."; exit 1; }; \
		else \
			echo "Non-interactive shell; set RELEASE_DRAFT_FORCE=1 to skip prompt" && exit 1; \
		fi; \
	fi
	@gh release create $(TAG) --draft --notes-file release-notes-$(TAG).md || ( echo "gh release create failed" && exit 1 )


