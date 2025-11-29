#!/usr/bin/env node
// TODO:RAPTOR-SEC-REVIEW: Validate OIDC values and HTTP headers carefully in a real implementation. This
// script is a CI-side example; real deployments should use a hardened Web5/DID agent and enforce strict
// validation policies. This script deliberately avoids network calls unless resolver_endpoint is non-placeholder.
// DID Auth Exchange Script
// Exports functions for use in tests and runs as CLI in CI.

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { loadDidConfig } = require('./did-auth-config');

// Contractual: load DID config via the config facade to centralize validation
function readIdentityConfig() { return loadDidConfig(); }

// Do NOT log or persist the OIDC token; it must only live in memory for this exchange.

function fetchOidcTokenFromGitHub(oidcUrl, oidcToken, audience) {
  return new Promise((resolve, reject) => {
    if (!oidcUrl || !oidcToken) return reject(new Error('Missing OIDC request URL or token'));
    const lib = oidcUrl.startsWith('https') ? https : http;
    // Append audience if provided
    const urlObj = new URL(oidcUrl);
    if (audience) {
      if (!urlObj.searchParams.get('audience')) urlObj.searchParams.append('audience', audience);
    }
    const opts = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + (urlObj.search || ''),
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      method: 'GET',
      headers: {
        Authorization: `Bearer ${oidcToken}`
      }
    };
    // Contractual: Do not log or persist the raw OIDC token. It should only live in-memory for the duration
    // of the exchangeWithResolver and must not be written to logs, files, or outputs.
    const req = lib.request(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`OIDC fetch failed - status ${res.statusCode}`));
        }
        try {
          const parsed = JSON.parse(data.toString());
          // GitHub Action's endpoint returns JSON with a 'value' property containing the token
          if (typeof parsed.value === 'string') return resolve(parsed.value);
          // Fall back to raw string if parsing doesn't match expectations
          return resolve(data.toString());
        } catch (err) {
          return resolve(data.toString());
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function postToResolver(resolverUrl, payload) {
  return new Promise((resolve, reject) => {
    if (!resolverUrl) return reject(new Error('Missing resolver URL'));
    const lib = resolverUrl.startsWith('https') ? https : http;
    const url = new URL(resolverUrl + '/exchange');
    const body = JSON.stringify(payload);
    const opts = {
      hostname: url.hostname,
      path: url.pathname + (url.search || ''),
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = lib.request(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`Resolver POST failed - status ${res.statusCode}`));
        }
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (err) {
          reject(new Error('Failed to parse resolver JSON response'));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function writeToGithubEnv(name, value) {
  // Only write if GITHUB_ENV is defined, otherwise don't print secrets.
  const envPath = process.env.GITHUB_ENV;
  if (envPath) {
    try {
      fs.appendFileSync(envPath, `${name}=${value}\n`);
      return true;
    } catch (err) {
      // Not fatal for local runs; just return false
      return false;
    }
  }
  return false;
}

async function exchangeWithResolver(opts = {}) {
  const cfg = opts.cfg || readIdentityConfig();
  if (!cfg) throw new Error('Missing identity config');
  const oidcUrl = opts.oidcUrl || process.env.ACTIONS_ID_TOKEN_REQUEST_URL;
  const oidcToken = opts.oidcToken || process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN || process.env.LOCAL_OIDC_TOKEN;

  if (!oidcUrl || !oidcToken) {
    throw new Error('Missing ACTIONS_ID_TOKEN_REQUEST_URL or ACTIONS_ID_TOKEN_REQUEST_TOKEN (OIDC env)');
  }

  // Fetch the OIDC token if we were given a URL (in GH Actions) or use local token.
  let idToken = oidcToken;
  if (opts.fetchOidc && oidcUrl) {
    const raw = await fetchOidcTokenFromGitHub(oidcUrl, oidcToken, cfg.capability_audience || 'github-actions');
    idToken = raw.toString();
  }

  // If resolver endpoint contains 'example' or is a placeholder, don't make a network call; just return dry run token.
  const resolverEndpoint = opts.resolverEndpoint || cfg.resolver_endpoint || cfg.resolverEndpoint;
  if (!resolverEndpoint) throw new Error('Missing resolver endpoint');
  const forceDry = (process.env.RESOLVER_DRY_RUN === 'true') || opts.forceDry;
  if (forceDry || resolverEndpoint.includes('example') || resolverEndpoint.includes('placeholder') || resolverEndpoint.includes('local')) {
    // Dry run mode: return a masked token without network call. In CI we will still write an ephemeral marker.
    const dryToken = 'DID_DRYRUN_TOKEN_PLACEHOLDER';
    if (opts.setEnv !== false) writeToGithubEnv('DID_WEB5_SESSION_TOKEN', dryToken);
    return { token: dryToken };
  }

  // Construct payload
  const payload = {
    did: cfg.did_identity_anchor,
    id_token: idToken,
    purpose: 'ci-authentication',
    capability_audience: cfg.capability_audience || 'github-actions'
  };

  // Contractual: Resolver must return short-lived tokens; long-lived or reusable keys are forbidden and should be rejected by the resolver.
  const resp = await postToResolver(resolverEndpoint, payload);
  // Expecting { token: '...' }
  if (!resp || !resp.token) throw new Error('Resolver returned no token');
  // Contractual: this is the only place the DID session token is stored in the runner; do not add any other sinks.
  if (opts.setEnv !== false) writeToGithubEnv('DID_WEB5_SESSION_TOKEN', resp.token);
  return resp;
}

// CLI wrapper
if (require.main === module) {
  (async () => {
    try {
      const dry = process.env.RESOLVER_DRY_RUN || 'true';
      const cfg = readIdentityConfig();
      if (!cfg) {
        console.error('Missing config/identity.web5.json');
        process.exit(1);
      }
      // By default in CI, try to fetch OIDC and do actual exchange if resolver is not a placeholder
      const result = await exchangeWithResolver({ fetchOidc: true, setEnv: true });
      console.log('DID auth exchange success');
      process.exit(0);
    } catch (err) {
      console.error('DID auth exchange failed: ' + (err.message || err));
      process.exit(1);
    }
  })();
}

module.exports = { exchangeWithResolver, fetchOidcTokenFromGitHub, postToResolver, writeToGithubEnv };
