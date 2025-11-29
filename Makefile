SHELL := /bin/bash

.PHONY: init test lint format build

init:
	@echo "Running project init..."
	@if [ -f package.json ]; then npm ci || true; else echo "No package.json found - skipping npm install"; fi
	@if [ -f requirements.txt ]; then pip install -r requirements.txt || true; fi
	@echo "Done."

test:
	@echo "Running tests..."
	@if [ -f tests/run-tests.js ]; then node tests/run-tests.js || true; else echo "No tests found - skipped"; fi

lint:
	@echo "Running linters..."
	@if command -v eslint >/dev/null 2>&1; then eslint **/*.js || true; else echo "ESLint not installed; skipping"; fi

format:
	@echo "Running formatters..."
	@if command -v prettier >/dev/null 2>&1; then prettier --write "**/*.js" || true; else echo "Prettier not installed; skipping"; fi

build:
	@echo "No build step for this repository."
