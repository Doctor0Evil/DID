const { getDidIdentityContext } = require('./didContext');

// TODO:RAPTOR-REFACTOR: Consider replacing this primitive logger with a structured logging library
// (e.g., pino, bunyan, or winston), and make identity injection pluggable/middleware-based.
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
