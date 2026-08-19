import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The name this package publishes under. The package-root walk below matches on
 * it, so a fork that renames the package must update this constant too.
 */
const PACKAGE_NAME = 'tokenmaxxingman';

export interface PackageManifest {
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly homepage: string;
}

function isManifest(value: unknown): value is PackageManifest {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record['name'] === 'string' &&
    typeof record['version'] === 'string' &&
    typeof record['description'] === 'string' &&
    typeof record['homepage'] === 'string'
  );
}

/** The `name` of a manifest, or `undefined` if the file is absent or unreadable as JSON. */
function readManifestName(manifestPath: string): string | undefined {
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  } catch {
    // Absent, unreadable, or not JSON — indistinguishable for our purposes, and
    // in every case this directory is not our package root. Keep walking.
    return undefined;
  }
  if (typeof parsed !== 'object' || parsed === null) {
    return undefined;
  }
  const name = (parsed as Record<string, unknown>)['name'];
  return typeof name === 'string' ? name : undefined;
}

interface ResolvedPackage {
  readonly root: string;
  readonly manifestPath: string;
}

/**
 * Resolve *this* package's root by walking up from a compiled module until a
 * `package.json` whose `name` is `tokenmaxxingman` is found.
 *
 * WHY not a hardcoded `../` count: entry points live at different depths in
 * `dist/` (`dist/cli.js` vs `dist/mcp/bin.js`), and a relative-hop constant
 * silently breaks the moment a file moves. Walking up is depth-agnostic and
 * behaves identically for a local checkout, an npm install and a pnpm install.
 *
 * WHY the name check: stopping at the *first* `package.json` found is only correct
 * when nothing else sits between the module and our own manifest. Vendor `dist/`
 * into a consumer project and the walk stops on the consumer's manifest instead —
 * `readManifest()` then reports the consumer's name and version (`tmm --version`
 * printed `9.9.9`), and `corpusPath`/`skillsRoot` point at directories that do not
 * exist. Standard npm and pnpm layouts were verified unaffected, so this is a
 * robustness guard: it turns a silently-wrong answer into a loud one.
 */
function findPackageRoot(startDir: string): ResolvedPackage {
  const searched: string[] = [];
  let dir = startDir;
  for (;;) {
    const manifestPath = resolve(dir, 'package.json');
    if (readManifestName(manifestPath) === PACKAGE_NAME) {
      return { root: dir, manifestPath };
    }
    searched.push(dir);
    const parent = dirname(dir);
    if (parent === dir) {
      throw new Error(
        `${PACKAGE_NAME}: could not locate this package's own package.json (a manifest with ` +
          `"name": "${PACKAGE_NAME}") in or above ${startDir}. Searched: ${searched.join(', ')}. ` +
          `This usually means the compiled dist/ was copied into another project without the ` +
          `package.json, data/ and skills/ directories that ship alongside it. Install the ` +
          `package instead (npm i ${PACKAGE_NAME}) or keep dist/ next to the package manifest.`,
      );
    }
    dir = parent;
  }
}

// WHY these stay eagerly-evaluated `string` constants rather than lazy accessors:
// `corpusPath` and `skillsRoot` are consumed as plain strings by `corpus.ts` and
// `mcp/skills.ts`, and `packageRoot` is part of the module's published surface, so
// changing their shape would be a breaking change for every importer. The cost is
// that a failed resolution throws while this module is being evaluated, i.e. at
// import time, which aborts the process before any subcommand runs — hence the
// deliberately actionable message above. That failure is unrecoverable anyway:
// every entry point needs either the corpus, the skills or the version string.
const resolved: ResolvedPackage = findPackageRoot(dirname(fileURLToPath(import.meta.url)));

export const packageRoot: string = resolved.root;
export const corpusPath: string = resolve(packageRoot, 'data/corpus.json');
export const skillsRoot: string = resolve(packageRoot, 'skills');

/**
 * Read this package's manifest. Throws with a readable message rather than a raw
 * JSON error. The file is read once and cached: it cannot change under a running
 * process in any supported layout, and re-reading it invites the two callers
 * (`--version` and the MCP server banner) to disagree.
 */
let cachedManifest: PackageManifest | undefined;

export function readManifest(): PackageManifest {
  if (cachedManifest !== undefined) {
    return cachedManifest;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(resolved.manifestPath, 'utf-8'));
  } catch (err) {
    throw new Error(
      `failed to parse ${resolved.manifestPath}: ${err instanceof Error ? err.message : String(err)}`,
      { cause: err },
    );
  }
  if (!isManifest(parsed)) {
    throw new Error(
      `${resolved.manifestPath} is missing one of: name, version, description, homepage`,
    );
  }
  cachedManifest = parsed;
  return parsed;
}
