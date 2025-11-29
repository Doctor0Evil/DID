// This file exists as documentation-style test to show only session_token is consumed
// by the did-auth-exchange script. The live tests already check behavior; this file is a commented
// form of the same test and not executed in CI. See tests/test-did-exchange.js for actual run.

/*
Example resolver response:
{
  "session_token": "short-lived-token",
  "expires_in": 60,
  "debug_info": "not to be stored",
  "internal_id": "opaque"
}

The did-auth-exchange script must only read the 'session_token' field and ignore other fields.
*/
