const { getDidIdentityContext } = require('./didContext');

function getLogger() {
  const didCtx = getDidIdentityContext() || { did_identity_anchor: 'unknown' };

  function _format(level, msg, extra) {
    const payload = {
      level,
      message: msg,
      timestamp: new Date().toISOString(),
      identity_did_anchor: didCtx.did_identity_anchor,
      ...extra
    };
    console.log(JSON.stringify(payload));
  }

  return {
    info: (m, extra) => _format('info', m, extra),
    warn: (m, extra) => _format('warn', m, extra),
    error: (m, extra) => _format('error', m, extra)
  };
}

module.exports = { getLogger };
