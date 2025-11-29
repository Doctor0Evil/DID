/*
 Example ALN/Web5 integration stub.
 Reads the local identity config (identity.web5.json) and returns a typed object.
 Does not perform network calls or attempt to resolve credentials.
*/

const { getDidIdentityContext } = require('../lib/didContext');

function getDidIdentityContextStub() {
  const ctx = getDidIdentityContext();
  return {
    did: ctx ? ctx.did_identity_anchor : null,
    owner: ctx ? ctx.owner_name : null,
    usage: ctx ? ctx.usage : []
  };
}

module.exports = { getDidIdentityContextStub };
