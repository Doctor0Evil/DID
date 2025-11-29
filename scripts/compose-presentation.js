// TODO:RAPTOR-SEC-REVIEW: This script handles composing verifiable presentations in memory. Ensure
// any data used here is validated and sanitized before usage.

const { getLogger } = require('../lib/logger');
const logger = getLogger();

// Example: Create a stubbed presentation object, write to stdout as JSON.
function composePresentation(sampleCreds) {
	logger.info('Composing presentation', { count: sampleCreds ? sampleCreds.length : 0 });
	const presentation = {
		context: ['https://www.w3.org/2018/credentials/v1'],
		type: ['VerifiablePresentation'],
		verifiableCredential: sampleCreds || []
	};
	logger.info('Presentation created', { size: presentation.verifiableCredential.length });
	return presentation;
}

if (require.main === module) {
	// Running as a script - no network calls, just a dry-run.
	const presentation = composePresentation([]);
	console.log(JSON.stringify(presentation, null, 2));
}

module.exports = { composePresentation };

