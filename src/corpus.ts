import { readFileSync } from 'node:fs';
import type { Corpus } from './corpus-types.js';
import { corpusPath } from './paths.js';

function isCorpus(value: unknown): value is Corpus {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    record['version'] === '1' &&
    Array.isArray(record['languages']) &&
    Array.isArray(record['sentences'])
  );
}

/**
 * Parsed once per process. The corpus ships inside the package and cannot change
 * at runtime, so re-reading and re-parsing it on every `benchmark_languages`
 * call and every `benchmark://` resource read was pure waste — the MCP server is
 * long-lived and calls this on most requests.
 */
let cached: Corpus | null = null;

/**
 * Load and validate the bundled benchmark corpus.
 *
 * Throws rather than exiting, so library and MCP callers can surface a protocol
 * error instead of killing the host process. The CLI wraps this and exits.
 */
export function loadCorpus(): Corpus {
  if (cached !== null) {
    return cached;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(corpusPath, 'utf-8'));
  } catch (err) {
    // The absolute path goes to stderr, not into the thrown message: this loads
    // for the MCP server too, where the message reaches a remote model and would
    // disclose the install location, username, and directory layout.
    process.stderr.write(
      `tokenmaxxingman: failed to read corpus at ${corpusPath}: ${
        err instanceof Error ? err.message : String(err)
      }\n`,
    );
    throw new Error('failed to read the bundled benchmark corpus', { cause: err });
  }
  if (!isCorpus(parsed)) {
    process.stderr.write(`tokenmaxxingman: malformed corpus at ${corpusPath}\n`);
    throw new Error('the bundled benchmark corpus has an unexpected structure (expected version "1")');
  }
  cached = parsed;
  return parsed;
}
