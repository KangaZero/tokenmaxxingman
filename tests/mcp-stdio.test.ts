import { beforeAll, describe, expect, it } from 'vitest';
import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const INITIALIZE = JSON.stringify({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2025-11-25',
    capabilities: {},
    clientInfo: { name: 'tokenmaxxingman-stdio-test', version: '0.0.0' },
  },
});
const INITIALIZED = JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' });

interface StdioRun {
  stdoutLines: string[];
  stderr: string;
}

/**
 * Drive a built entry point over real stdio and collect every line it writes.
 *
 * The in-memory transport tests cover behaviour; this covers wiring — argv
 * routing, the shebang bin, and the invariant that a process hosts exactly one
 * server.
 */
function runStdio(args: readonly string[]): Promise<StdioRun> {
  return new Promise<StdioRun>((resolvePromise, reject) => {
    const child = spawn(process.execPath, [...args], { cwd: PROJECT_ROOT });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf-8');
    child.stderr.setEncoding('utf-8');
    child.stdout.on('data', (chunk: string) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk: string) => {
      stderr += chunk;
    });
    child.on('error', reject);
    child.on('close', () => {
      resolvePromise({
        stdoutLines: stdout.split('\n').filter((line) => line.trim() !== ''),
        stderr,
      });
    });
    child.stdin.write(`${INITIALIZE}\n${INITIALIZED}\n`);
    child.stdin.end();
  });
}

const ENTRY_POINTS: readonly { label: string; args: readonly string[] }[] = [
  { label: 'tmm-mcp bin', args: ['dist/mcp/bin.js'] },
  { label: 'cli mcp subcommand', args: ['dist/cli.js', 'mcp'] },
  { label: 'cli tmm-mcp alias', args: ['dist/cli.js', 'tmm-mcp'] },
];

/**
 * Spawning a Node process per assertion made this file the slowest in the suite
 * and flaky under parallel load. Each entry point is exercised once in
 * `beforeAll` and the three assertions read the same captured transcript.
 */
describe.each(ENTRY_POINTS)('MCP over stdio via $label', ({ args }) => {
  let run: StdioRun;

  beforeAll(async () => {
    run = await runStdio(args);
    // A generous ceiling: this spawns node, loads the SDK, and reads the corpus,
    // which is comfortably slower than vitest's 5s default on a loaded machine.
  }, 60_000);

  it('answers initialize exactly once', () => {
    // Regression: `bin.ts` starts a server as an import side effect. When the
    // CLI subcommand imported it *and* called its exported main(), two servers
    // shared one stdout and every request received two responses.
    const responses = run.stdoutLines
      .map((line) => JSON.parse(line) as { id?: number })
      .filter((message) => message.id === 1);
    expect(responses).toHaveLength(1);
  });

  it('negotiates 2025-11-25 and reports the tokenmaxxingman implementation', () => {
    const first = JSON.parse(run.stdoutLines[0] ?? '{}') as {
      result?: { protocolVersion?: string; serverInfo?: { name?: string }; instructions?: string };
    };
    expect(first.result?.protocolVersion).toBe('2025-11-25');
    expect(first.result?.serverInfo?.name).toBe('tokenmaxxingman');
    expect(first.result?.instructions).toContain('Do not estimate');
  });

  it('keeps diagnostics on stderr so stdout stays valid JSON-RPC', () => {
    expect(run.stderr).toContain('listening on stdio');
    for (const line of run.stdoutLines) {
      expect(() => JSON.parse(line) as unknown).not.toThrow();
    }
  });
});
