import { describe, it, expect, beforeAll } from 'vitest';
import { execFileSync, execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const CLI = resolve(PROJECT_ROOT, 'dist/cli.js');
const PKG_VERSION = (
  JSON.parse(readFileSync(resolve(PROJECT_ROOT, 'package.json'), 'utf-8')) as { version: string }
).version;

beforeAll(() => {
  execSync(`npm run build --prefix "${PROJECT_ROOT}"`, { stdio: 'inherit' });
}, 60_000);

function cli(args: string[], opts: { input?: string } = {}): { stdout: string; stderr: string; status: number } {
  try {
    const stdout = execFileSync(process.execPath, [CLI, ...args], {
      input: opts.input,
      encoding: 'utf-8',
      timeout: 30_000,
    });
    return { stdout, stderr: '', status: 0 };
  } catch (err) {
    const e = err as NodeJS.ErrnoException & { stdout?: string; stderr?: string; status?: number };
    return {
      stdout: e.stdout ?? '',
      stderr: e.stderr ?? '',
      status: e.status ?? 1,
    };
  }
}

describe('CLI', () => {
  it('--version prints the package version and exits 0', () => {
    const { stdout, status } = cli(['--version']);
    expect(status).toBe(0);
    expect(stdout.trim()).toBe(PKG_VERSION);
  });

  it('--help includes all three subcommands', () => {
    const { stdout, status } = cli(['--help']);
    expect(status).toBe(0);
    expect(stdout).toContain('expand');
    expect(stdout).toContain('benchmark');
    expect(stdout).toContain('speedrun');
  });

  it('expand via stdin exits 0 and contains "Utilize"', () => {
    const { stdout, status } = cli(['expand'], { input: 'Use this.' });
    expect(status).toBe(0);
    expect(stdout.toLowerCase()).toContain('utiliz');
  });

  it('expand - -m verbose-ultra output is longer than 2× input', () => {
    const input = 'Use this.';
    const { stdout, status } = cli(['expand', '-', '-m', 'verbose-ultra'], { input });
    expect(status).toBe(0);
    expect(stdout.length).toBeGreaterThan(input.length * 2);
  });

  it('benchmark --format json --pretty exits 0 with valid JSON containing 18 rows', () => {
    const { stdout, status } = cli(['benchmark', '--format', 'json', '--pretty']);
    expect(status).toBe(0);
    const parsed = JSON.parse(stdout) as { rows: unknown[] };
    expect(parsed.rows).toHaveLength(18);
  });

  it('speedrun -t 50ms --mode verbose-ultra exits 0 and includes tokens/sec', () => {
    const { stdout, status } = cli(['speedrun', '-t', '50ms', '--mode', 'verbose-ultra']);
    expect(status).toBe(0);
    expect(stdout).toContain('tokens/sec');
  });

  it('invalid mode --mode bogus exits 2 with an error mentioning valid modes', () => {
    const { stderr, status } = cli(['expand', '-m', 'bogus'], { input: 'test' });
    expect(status).toBe(2);
    expect(stderr).toContain('bogus');
    expect(stderr).toContain('verbose-lite');
  });

  it('expand --mode anti-wenyan accepts the new mode and exits 0', () => {
    const { stdout, status } = cli(['expand', '-', '-m', 'anti-wenyan'], { input: 'Use this.' });
    expect(status).toBe(0);
    // anti-wenyan resolves to verbose-ultra + Inuktitut translate; the iu-cans
    // phrasebook does not contain the expanded form, so we expect the fallback.
    expect(stdout).toContain('[no translation available: iu-cans]');
  });

  it('--help for expand lists anti-wenyan as a valid mode', () => {
    const { stdout, status } = cli(['expand', '--help']);
    expect(status).toBe(0);
    expect(stdout).toContain('anti-wenyan');
  });

  it('speedrun --tier sprint-1m --max-iterations 1 exits 0 and reports 1 iteration', () => {
    const { stdout, status } = cli(['speedrun', '--tier', 'sprint-1m', '--max-iterations', '1']);
    expect(status).toBe(0);
    expect(stdout).toContain('iterations : 1');
  });
});
