import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { LATEST_PROTOCOL_VERSION } from '@modelcontextprotocol/sdk/types.js';
import { createMcpServer } from '../src/mcp/server.js';
import { EXPAND_MODES } from '../src/expand.js';
import { SKILL_SECTIONS, discoverSkills } from '../src/mcp/skills.js';

/**
 * These are protocol-level tests: a real client is linked to a real server over
 * an in-memory transport, so `initialize`, schema validation, and structured
 * output all execute exactly as they would over stdio. Calling the tool
 * callbacks directly would skip precisely the layer most likely to break.
 */
let client: Client;

beforeAll(async () => {
  const server = createMcpServer();
  client = new Client({ name: 'tokenmaxxingman-test-client', version: '0.0.0' });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
});

afterAll(async () => {
  await client.close();
});

describe('handshake', () => {
  it('negotiates the latest protocol revision', () => {
    expect(LATEST_PROTOCOL_VERSION).toBe('2025-11-25');
  });

  it('advertises full implementation metadata', () => {
    const info = client.getServerVersion();
    expect(info?.name).toBe('tokenmaxxingman');
    expect(info?.title).toBe('tokenmaxxingman');
    expect(info?.version).toMatch(/^\d+\.\d+\.\d+/);
    expect(info?.description).toContain('token');
    expect(info?.websiteUrl).toContain('github.com/KangaZero/tokenmaxxingman');
    expect(info?.icons?.[0]?.mimeType).toBe('image/svg+xml');
  });

  it('declares tools, resources, prompts and completions', () => {
    const caps = client.getServerCapabilities();
    expect(caps?.tools).toBeDefined();
    expect(caps?.resources).toBeDefined();
    expect(caps?.prompts).toBeDefined();
    expect(caps?.completions).toBeDefined();
  });

  it('does not advertise logging, which it never emits', () => {
    // Declaring `logging` without ever calling sendLoggingMessage hands a client
    // an empty log pane it waits on forever.
    expect(client.getServerCapabilities()?.logging).toBeUndefined();
  });

  it('sends instructions that state the measure-do-not-estimate rule', () => {
    const instructions = client.getInstructions() ?? '';
    expect(instructions).toContain('Do not estimate what this server can measure');
    expect(instructions).toContain('count_tokens');
    expect(instructions).toContain('NEVER EXPAND');
  });
});

describe('tools/list', () => {
  it('exposes exactly the documented tool set', async () => {
    const { tools } = await client.listTools();
    expect(tools.map((tool) => tool.name).sort()).toEqual([
      'benchmark_languages',
      'count_tokens',
      'expand_text',
      'get_skill',
      'list_modes',
      'maxx_text',
      'plan_speedrun',
    ]);
  });

  it('annotates every tool as a read-only, closed-world call', async () => {
    const { tools } = await client.listTools();
    for (const tool of tools) {
      expect(tool.annotations, tool.name).toEqual({
        readOnlyHint: true,
        openWorldHint: false,
      });
      // `destructiveHint` and `idempotentHint` are documented by the 2025-11-25
      // schema as meaningful only when readOnlyHint is false, and a duplicate
      // annotations.title would shadow the top-level title on some clients.
      expect(tool.annotations?.destructiveHint, tool.name).toBeUndefined();
      expect(tool.annotations?.idempotentHint, tool.name).toBeUndefined();
      expect(tool.annotations?.title, tool.name).toBeUndefined();
    }
  });

  it('carries a title, description, output schema and namespaced _meta on every tool', async () => {
    const { tools } = await client.listTools();
    for (const tool of tools) {
      expect(tool.title, tool.name).toBeTruthy();
      expect(tool.description?.length ?? 0, tool.name).toBeGreaterThan(80);
      expect(tool.outputSchema, tool.name).toBeDefined();
      const meta = tool._meta ?? {};
      // Namespace asserts control of a path the project actually owns.
      expect(meta['io.github.kangazero.tokenmaxxingman/determinism'], tool.name).toBe(
        'deterministic',
      );
      expect(meta['io.github.kangazero.tokenmaxxingman/offline'], tool.name).toBe(true);
      expect(meta['io.github.kangazero.tokenmaxxingman/category'], tool.name).toBeTruthy();
      expect(meta['io.github.kangazero.tokenmaxxingman/costHint'], tool.name).toBeTruthy();
    }
  });
});

describe('count_tokens', () => {
  it('returns structured measurements', async () => {
    const result = await client.callTool({
      name: 'count_tokens',
      arguments: { text: 'The sun rises in the east.' },
    });
    expect(result.isError).toBeFalsy();
    const structured = result.structuredContent as Record<string, number | string>;
    expect(structured['encoding']).toBe('cl100k_base');
    expect(structured['tokens']).toBeGreaterThan(0);
    expect(structured['words']).toBe(6);
    expect(structured['tokensPerWord']).toBeCloseTo((structured['tokens'] as number) / 6, 10);
  });

  it('honours the o200k_base encoding', async () => {
    const result = await client.callTool({
      name: 'count_tokens',
      arguments: { text: 'The sun rises in the east.', encoding: 'o200k_base' },
    });
    expect((result.structuredContent as Record<string, string>)['encoding']).toBe('o200k_base');
  });

  it('rejects empty text at the schema boundary', async () => {
    // The SDK validates arguments against the advertised input schema before
    // dispatch and reports the failure as a tool error, not a transport reject.
    const result = await client.callTool({ name: 'count_tokens', arguments: { text: '' } });
    expect(result.isError).toBe(true);
    expect((result.content as { text: string }[])[0]?.text).toContain('validation');
  });
});

describe('expand_text', () => {
  it('inflates text and measures the inflation', async () => {
    const result = await client.callTool({
      name: 'expand_text',
      arguments: { text: 'Fix the bug.', mode: 'verbose-ultra' },
    });
    expect(result.isError).toBeFalsy();
    const structured = result.structuredContent as {
      output: string;
      before: { tokens: number };
      after: { tokens: number };
      inflation: { tokenRatio: number; tokensAdded: number };
      canonicalMode: string;
    };
    expect(structured.after.tokens).toBeGreaterThan(structured.before.tokens);
    expect(structured.inflation.tokenRatio).toBeGreaterThan(1);
    expect(structured.inflation.tokensAdded).toBe(
      structured.after.tokens - structured.before.tokens,
    );
    expect(structured.canonicalMode).toBe('verbose-ultra');
  });

  it('resolves the deprecated anti-wenyan alias to maxlang and says so', async () => {
    const result = await client.callTool({
      name: 'expand_text',
      arguments: { text: 'The sun rises in the east.', mode: 'anti-wenyan' },
    });
    const structured = result.structuredContent as { canonicalMode: string; output: string };
    expect(structured.canonicalMode).toBe('maxlang');
    const text = (result.content as { type: string; text: string }[])[0]?.text ?? '';
    expect(text).toContain('deprecated alias');
  });

  it('produces identical output for maxlang and anti-wenyan', async () => {
    const [canonical, alias] = await Promise.all(
      (['maxlang', 'anti-wenyan'] as const).map((mode) =>
        client.callTool({
          name: 'expand_text',
          arguments: { text: 'The sun rises in the east.', mode },
        }),
      ),
    );
    const left = (canonical?.structuredContent as { output: string }).output;
    const right = (alias?.structuredContent as { output: string }).output;
    expect(left).toBe(right);
  });

  it('accepts every mode the library exposes', async () => {
    for (const mode of EXPAND_MODES) {
      const result = await client.callTool({
        name: 'expand_text',
        arguments: { text: 'Hello.', mode },
      });
      expect(result.isError, mode).toBeFalsy();
    }
  });

  it('rejects an unknown mode', async () => {
    const result = await client.callTool({
      name: 'expand_text',
      arguments: { text: 'x', mode: 'verbose-cosmic' },
    });
    expect(result.isError).toBe(true);
    expect((result.content as { text: string }[])[0]?.text).toContain('validation');
  });
});

describe('maxx_text', () => {
  it('applies every trick and reports a large ratio', async () => {
    const result = await client.callTool({
      name: 'maxx_text',
      arguments: { text: 'The sun rises in the east.', passes: 1, paddingMultiplier: 3 },
    });
    expect(result.isError).toBeFalsy();
    const structured = result.structuredContent as {
      inflation: { tokenRatio: number };
      targetLanguage: string | null;
      passes: number;
    };
    expect(structured.inflation.tokenRatio).toBeGreaterThan(2);
    expect(structured.targetLanguage).toBeNull();
    expect(structured.passes).toBe(1);
  });

  it('applies a final translation pass when asked', async () => {
    const result = await client.callTool({
      name: 'maxx_text',
      arguments: { text: 'Hello.', targetLanguage: 'iu-cans' },
    });
    const structured = result.structuredContent as { targetLanguage: string; output: string };
    expect(structured.targetLanguage).toBe('iu-cans');
  });

  it('rejects passes above the documented ceiling', async () => {
    const result = await client.callTool({
      name: 'maxx_text',
      arguments: { text: 'x', passes: 6 },
    });
    expect(result.isError).toBe(true);
    expect((result.content as { text: string }[])[0]?.text).toContain('<=5');
  });
});

describe('benchmark_languages', () => {
  it('ranks the corpus and puts Inuktitut Syllabics first', async () => {
    const result = await client.callTool({
      name: 'benchmark_languages',
      arguments: { encoding: 'cl100k_base' },
    });
    expect(result.isError).toBeFalsy();
    const structured = result.structuredContent as {
      corpusVersion: string;
      rowCount: number;
      rows: { rank: number; code: string; tokensPerCharacter: number }[];
    };
    expect(structured.corpusVersion).toBe('1');
    expect(structured.rows[0]?.rank).toBe(1);
    expect(structured.rows[0]?.code).toBe('iu-cans');
    expect(structured.rowCount).toBeGreaterThan(10);
  });

  it('respects the limit and keeps rank order', async () => {
    const result = await client.callTool({
      name: 'benchmark_languages',
      arguments: { limit: 3 },
    });
    const rows = (result.structuredContent as { rows: { rank: number }[] }).rows;
    expect(rows.map((row) => row.rank)).toEqual([1, 2, 3]);
  });

  it('emits JSON text when asked, while keeping structured output', async () => {
    const result = await client.callTool({
      name: 'benchmark_languages',
      arguments: { format: 'json', limit: 2 },
    });
    const text = (result.content as { text: string }[])[0]?.text ?? '';
    expect(() => JSON.parse(text) as unknown).not.toThrow();
    expect(result.structuredContent).toBeDefined();
  });
});

describe('plan_speedrun', () => {
  it('returns published tier targets without consuming the budget', async () => {
    const started = Date.now();
    const result = await client.callTool({
      name: 'plan_speedrun',
      arguments: { tier: 'sprint-1h' },
    });
    expect(Date.now() - started).toBeLessThan(2_000);
    const plan = result.structuredContent as {
      budgetMs: number;
      targetTokens: number;
      checkpoints: { fraction: number; cumulativeTokens: number }[];
      seedTokens: number | null;
    };
    expect(plan.budgetMs).toBe(3_600_000);
    expect(plan.targetTokens).toBe(1_000_000);
    expect(plan.checkpoints).toHaveLength(4);
    expect(plan.checkpoints.at(-1)?.cumulativeTokens).toBe(1_000_000);
    expect(plan.seedTokens).toBeNull();
  });

  it('estimates iterations when a seed is supplied', async () => {
    const result = await client.callTool({
      name: 'plan_speedrun',
      arguments: { tier: 'sprint-1m', seed: 'Hello, world.' },
    });
    const plan = result.structuredContent as {
      seedTokens: number;
      estimatedIterations: number;
    };
    expect(plan.seedTokens).toBeGreaterThan(0);
    expect(plan.estimatedIterations).toBe(Math.ceil(5_000 / plan.seedTokens));
  });

  it('interpolates a custom duration between the published anchors', async () => {
    const result = await client.callTool({
      name: 'plan_speedrun',
      arguments: { durationMs: 180_000 },
    });
    const plan = result.structuredContent as { tier: string | null; targetTokens: number };
    expect(plan.tier).toBeNull();
    // Exact, not a band: 180_000ms is the midpoint between the sprint-1m anchor
    // (60_000ms, 5_000 tokens) and sprint-5m (300_000ms, 50_000 tokens), so
    // 5_000 + 0.5 * 45_000 = 27_500. The previous `> 5_000 && < 50_000`
    // assertion passed across a 45_000-wide band and could not detect an anchor
    // mix-up, an off-by-one, or a wrong slope.
    expect(plan.targetTokens).toBe(27_500);
  });

  it('reports a tool error when neither tier nor durationMs is given', async () => {
    const result = await client.callTool({ name: 'plan_speedrun', arguments: {} });
    expect(result.isError).toBe(true);
    expect((result.content as { text: string }[])[0]?.text).toContain('tier');
  });

  it('reports a tool error when both tier and durationMs are given', async () => {
    const result = await client.callTool({
      name: 'plan_speedrun',
      arguments: { tier: 'sprint-1m', durationMs: 60_000 },
    });
    expect(result.isError).toBe(true);
    expect((result.content as { text: string }[])[0]?.text).toContain('mutually exclusive');
  });
});

describe('list_modes', () => {
  it('enumerates every enum the server accepts', async () => {
    const result = await client.callTool({ name: 'list_modes', arguments: {} });
    const structured = result.structuredContent as {
      expandModes: string[];
      deprecatedExpandModes: Record<string, string>;
      encodings: string[];
      languageCodes: string[];
      timeTiers: string[];
      skills: { name: string; version: string }[];
    };
    expect(structured.expandModes).toEqual([...EXPAND_MODES]);
    expect(structured.deprecatedExpandModes).toEqual({ 'anti-wenyan': 'maxlang' });
    expect(structured.encodings).toEqual(['cl100k_base', 'o200k_base']);
    expect(structured.languageCodes).toEqual(['my', 'bo', 'iu-cans']);
    expect(structured.timeTiers).toHaveLength(4);
    expect(structured.skills.length).toBe(discoverSkills().length);
  });
});

describe('get_skill', () => {
  it('returns a skill contract verbatim', async () => {
    const result = await client.callTool({
      name: 'get_skill',
      arguments: { name: 'tokenmaxxingman' },
    });
    const structured = result.structuredContent as { content: string; fileName: string };
    expect(structured.fileName).toBe('SKILL.md');
    expect(structured.content.startsWith('---')).toBe(true);
    expect(structured.content).toContain('name: tokenmaxxingman');
  });

  it('returns the examples section on request', async () => {
    const result = await client.callTool({
      name: 'get_skill',
      arguments: { name: 'tokensprint', section: 'examples' },
    });
    expect((result.structuredContent as { fileName: string }).fileName).toBe('EXAMPLES.md');
  });

  it('refuses a path-traversal skill name', async () => {
    const result = await client.callTool({
      name: 'get_skill',
      arguments: { name: '../../package' },
    });
    expect(result.isError).toBe(true);
    expect((result.content as { text: string }[])[0]?.text).toContain('invalid skill name');
  });

  it('reports a tool error for an unknown skill', async () => {
    const result = await client.callTool({ name: 'get_skill', arguments: { name: 'nonexistent' } });
    expect(result.isError).toBe(true);
  });
});

describe('resources', () => {
  it('lists a contract and an examples resource for every skill', async () => {
    const { resources } = await client.listResources();
    const skillResources = resources.filter((resource) => resource.uri.startsWith('skill://'));
    // Derived, not hardcoded: a literal count breaks on any skill added or
    // removed while asserting nothing about the resources themselves.
    expect(skillResources.length).toBe(discoverSkills().length * SKILL_SECTIONS.length);
    for (const resource of skillResources) {
      expect(resource.mimeType).toBe('text/markdown');
      expect(resource.title).toBeTruthy();
      expect(resource.annotations?.audience).toEqual(['assistant']);
      expect(resource.annotations?.priority).toBeGreaterThan(0);
      expect((resource._meta ?? {})['io.github.kangazero.tokenmaxxingman/skill']).toBeTruthy();
    }
  });

  it('lists one benchmark resource per encoding', async () => {
    const { resources } = await client.listResources();
    const uris = resources.filter((r) => r.uri.startsWith('benchmark://')).map((r) => r.uri);
    expect(uris.sort()).toEqual(['benchmark://cl100k_base', 'benchmark://o200k_base']);
  });

  it('reads a skill resource', async () => {
    const result = await client.readResource({ uri: 'skill://politician/SKILL.md' });
    expect(result.contents[0]?.mimeType).toBe('text/markdown');
    expect(String(result.contents[0]?.text)).toContain('name: politician');
  });

  it('reads a benchmark resource as a markdown table', async () => {
    const result = await client.readResource({ uri: 'benchmark://o200k_base' });
    expect(String(result.contents[0]?.text)).toContain('|');
  });

  it('rejects an unknown encoding in a benchmark URI', async () => {
    await expect(client.readResource({ uri: 'benchmark://p50k_base' })).rejects.toThrow();
  });

  it('completes skill names', async () => {
    const result = await client.complete({
      ref: { type: 'ref/resource', uri: 'skill://{name}/{file}' },
      argument: { name: 'name', value: 'token' },
    });
    expect(result.completion.values.sort()).toEqual(['tokenmaxxingman', 'tokensprint']);
  });
});

describe('prompts', () => {
  it('exposes one prompt per bundled skill', async () => {
    const { prompts } = await client.listPrompts();
    expect(prompts).toHaveLength(discoverSkills().length);
    expect(prompts.map((prompt) => prompt.name).sort()).toEqual([
      'auto',
      'consultant',
      'hallucinatemaxx',
      'okay-boomer',
      'politician',
      'tokenmaxxingman',
      'tokensprint',
      'yolo',
    ]);
    for (const prompt of prompts) {
      expect(prompt.title, prompt.name).toBeTruthy();
      expect(prompt.description?.length ?? 0, prompt.name).toBeGreaterThan(40);
    }
  });

  it('ships the contract inline and points at the MCP tools', async () => {
    const result = await client.getPrompt({ name: 'tokenmaxxingman', arguments: {} });
    expect(result.messages).toHaveLength(1);
    const text = String((result.messages[0]?.content as { type: string; text: string }).text);
    expect(text).toContain('Adopt the "tokenmaxxingman" mode');
    expect(text).toContain('count_tokens');
    expect(text).toContain('name: tokenmaxxingman');
  });

  it('appends the caller input as a second message', async () => {
    const result = await client.getPrompt({
      name: 'politician',
      arguments: { intensity: 'filibuster', input: 'Should we ship on Friday?' },
    });
    expect(result.messages).toHaveLength(2);
    expect(String((result.messages[0]?.content as { text: string }).text)).toContain(
      'intensity: filibuster',
    );
    expect(String((result.messages[1]?.content as { text: string }).text)).toBe(
      'Should we ship on Friday?',
    );
  });
});
