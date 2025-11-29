# ALN / Web5 Integration Notes

This repository was not explicitly an ALN or AI_full_Bootstrap project, however it contains DID artifacts which could be used with ALN primitives.

## How to use ALN / Web5 for identity and access
- The `config/identity.web5.json` file contains a DID identity anchor (owner and DID).
- An ALN/Web5 integration could resolve this anchor at runtime using an external agent (for example via `@web5/api`).
- Use an ALN-provided wallet or agent to sign actions or produce verifiable credentials.

## Example mapping
- DID (config/identity.web5.json) => ALN identity anchor
- Verifiable Credentials (credentials/*.vc.jsonld) => ALN-compatible VC artifacts

## Disclaimer
No network calls are performed by default; the examples here are stubs to be wired into a real Web5 agent during runtime.
