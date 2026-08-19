import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const CLI = resolve(PROJECT_ROOT, 'dist/cli.js');

function cli(
  args: string[],
  opts: { input?: string } = {},
): { stdout: string; stderr: string; status: number } {
  try {
    const stdout = execFileSync(process.execPath, [CLI, ...args], {
      input: opts.input,
      encoding: 'utf-8',
      timeout: 30_000,
    });
    return { stdout, stderr: '', status: 0 };
  } catch (err) {
    const e = err as NodeJS.ErrnoException & {
      stdout?: string;
      stderr?: string;
      status?: number;
    };
    return {
      stdout: e.stdout ?? '',
      stderr: e.stderr ?? '',
      status: e.status ?? 1,
    };
  }
}

describe('CLI maxxer subcommand', () => {
  it('maxxer subcommand appears in --help', () => {
    const { stdout, status } = cli(['--help']);
    expect(status).toBe(0);
    expect(stdout).toContain('maxxer');
  });

  it('stdin input exits 0 and output is much longer than input (>50×)', () => {
    const input = 'hello world';
    const { stdout, status } = cli(['maxxer'], { input });
    expect(status).toBe(0);
    expect(stdout.length).toBeGreaterThan(input.length * 50);
  });

  it('--passes 2 produces longer output than --passes 1 for the same input', () => {
    const input = 'The sun rises in the east.';
    const { stdout: out1, status: s1 } = cli(['maxxer', '--passes', '1'], { input });
    const { stdout: out2, status: s2 } = cli(['maxxer', '--passes', '2'], { input });
    expect(s1).toBe(0);
    expect(s2).toBe(0);
    expect(out2.length).toBeGreaterThan(out1.length);
  });

  it('--passes 6 exits 2 (out of range)', () => {
    const { status, stderr } = cli(['maxxer', '--passes', '6'], { input: 'test' });
    expect(status).toBe(2);
    expect(stderr).toContain('--passes');
  });

  it('--passes 0 exits 2 (out of range)', () => {
    const { status, stderr } = cli(['maxxer', '--passes', '0'], { input: 'test' });
    expect(status).toBe(2);
    expect(stderr).toContain('--passes');
  });

  it('--target-language my produces Burmese-script characters', () => {
    // Was an OR against the fallback marker, so it passed while the translate
    // pass was doing nothing. A phrasebook sentence must come back in Burmese.
    const { stdout, status } = cli(['maxxer', '--target-language', 'my'], {
      input: 'The sun rises in the east.',
    });
    expect(status).toBe(0);
    expect(stdout).toMatch(/\p{Script=Myanmar}/u);
    expect(stdout).not.toContain('no translation available');
  });

  it('--parallel exits 0 and produces output', () => {
    const input = 'The quick brown fox jumps over the lazy dog.';
    const { stdout, status } = cli(['maxxer', '--parallel'], { input });
    expect(status).toBe(0);
    expect(stdout.length).toBeGreaterThan(input.length);
  });

  it('--target-language bogus exits 2', () => {
    const { status, stderr } = cli(['maxxer', '--target-language', 'bogus'], { input: 'test' });
    expect(status).toBe(2);
    expect(stderr).toContain('bogus');
  });
});
