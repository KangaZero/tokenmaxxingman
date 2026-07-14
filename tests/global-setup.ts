import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Build the CLI once for the whole test run.
 *
 * Previously each CLI-spawning test file rebuilt in `beforeAll` via
 * `rm -rf dist && tsc`. Vitest runs files in parallel workers, so one worker's
 * `rm -rf dist` could wipe `dist/` while another was spawning `dist/cli.js`,
 * which then imported a half-written module (a flaky
 * "does not provide an export named 'passive'" SyntaxError). Building once here,
 * before any worker starts, removes the race.
 */
export default function setup(): void {
  execSync('npm run build', { cwd: PROJECT_ROOT, stdio: 'inherit' });
}
