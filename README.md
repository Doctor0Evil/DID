# web5-identity
a safe-for-public GitHub repo that AI chats can read to orchestrate self-only, automated retrieval of personal artifacts and produce compliant, privacy-preserving Web5 DID-based verifiable credentials.

## Minimal Manual Steps
- Run the environment setup: `make init`
- Run tests: `make test`
- For local development, configure your external Web5 identity agent to bind this repo to the DID anchor declared in `config/identity.web5.json`.

## DID/Web5 Identity
This repo includes a runtime identity anchor that references a DID used for provenance and automation. **No private keys or credentials are stored in the repository.** The anchor is stored in `config/identity.web5.json` and should be resolved by an external Web5/DID agent at runtime.
