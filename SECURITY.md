# Security

If you discover a security vulnerability in this repository, please report it to the maintainer at security@placeholder.invalid (replace with the project's security contact). Do not raise issues on the public issue tracker for vulnerabilities.

- Do not commit secrets, credentials, or private keys to this repository.
- This repository uses a DID/Web5 identity anchor (see `config/identity.web5.json`) as a non-secret identity anchor for automation. Real credentials are resolved at runtime by an external Web5 agent and are not stored in this repository.

