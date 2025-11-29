// TODO:RAPTOR-SEC-REVIEW: This script should resolve DIDs but must avoid leaking or storing secrets.
// This is a non-networked stub that reads the local DID anchor and prints metadata.

const fs = require('fs');
const path = require('path');
const { getLogger } = require('../lib/logger');
const logger = getLogger();

function readLocalDid() {
	const p = path.join(__dirname, '..', 'did', 'did.json');
	try {
		const raw = fs.readFileSync(p, 'utf8');
		return JSON.parse(raw);
	} catch (err) {
		return null;
	}
}

if (require.main === module) {
	const did = readLocalDid();
	if (!did) {
		logger.error('No local DID file found.');
		process.exit(1);
	}
	logger.info('Local DID loaded', { id: did.id });
	console.log(JSON.stringify(did, null, 2));
}

module.exports = { readLocalDid };

