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
- GitHub Actions requests a short-lived OIDC token at runtime (requires `id-token: write` permission).
- `scripts/did-auth-exchange.js` exchanges that OIDC token with a Web5/DID resolver for a short-lived DID-bound capability.
- The resolver returns a short-lived session token which is set as `DID_WEB5_SESSION_TOKEN` in the runner environment and used by downstream steps.

See `DOCS/DID_AUTH.md` for more details and operator tasks.
