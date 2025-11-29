// TODO:RAPTOR-SEC-REVIEW: This script should check credential revocation status. Avoid network calls and
// do not leak any private/verifiable data. This is a dry-run stub for static checks.

const fs = require('fs');
const path = require('path');
const { getLogger } = require('../lib/logger');
const logger = getLogger();

function checkRevocationStub() {
	// Check that expected credential files exist and have schema-like structure, without exposing secrets.
	const credPath = path.join(__dirname, '..', 'credentials', 'over-21.vc.jsonld');
	if (!fs.existsSync(credPath)) {
		logger.warn('Credential file missing', { file: credPath });
		return false;
	}
	const raw = fs.readFileSync(credPath, 'utf8');
	try {
		const parsed = JSON.parse(raw);
		logger.info('Credential looks valid (basic JSON check)', { type: parsed['@type'] || 'unknown' });
		return true;
	} catch (err) {
		logger.error('Credential JSON malformed');
		return false;
	}
}

if (require.main === module) {
	const ok = checkRevocationStub();
	process.exit(ok ? 0 : 1);
}

module.exports = { checkRevocationStub };

