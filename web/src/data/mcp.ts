// MCP (Model Context Protocol) server surface, mirrored from the npm package's
// `tmm-mcp` entrypoint — built on @modelcontextprotocol/sdk v1.30.0 over stdio.
// Kept as a static module so the site never imports the server itself.

import { SKILLS } from './benchmark';

export interface McpParam {
  readonly name: string;
  readonly optional: boolean;
}

export interface McpTool {
  readonly name: string;
  readonly params: readonly McpParam[];
  readonly summary: string;
  /** A constraint the parameter list alone cannot express. */
  readonly note?: string;
}

export interface McpResource {
  readonly uri: string;
  readonly detail: string;
}

/** Compact literal form for a parameter list: a trailing `?` marks it optional. */
function params(...spec: readonly string[]): readonly McpParam[] {
  return spec.map((entry) =>
    entry.endsWith('?')
      ? { name: entry.slice(0, -1), optional: true }
      : { name: entry, optional: false },
  );
}

export const MCP_TOOLS: readonly McpTool[] = [
  {
    name: 'expand_text',
    params: params('text', 'mode', 'encoding?'),
    summary:
      'Runs the expansion pipeline for a named mode and returns the expanded text alongside its measured token count.',
  },
  {
    name: 'maxx_text',
    params: params('text', 'targetLanguage?', 'paddingMultiplier?', 'passes?', 'encoding?'),
    summary:
      'Applies every transformation in sequence, optionally over repeated passes, then renders the result into the target language.',
  },
  {
    name: 'count_tokens',
    params: params('text', 'encoding?'),
    summary:
      'Counts tokens against the bundled tokenizer vocabulary. Not an estimate. Not a heuristic. A count.',
  },
  {
    name: 'benchmark_languages',
    params: params('encoding?', 'limit?', 'format?'),
    summary:
      'Reproduces the language ranking from the bundled corpus. Returns Inuktitut at rank 1, as it has every previous time.',
  },
  {
    name: 'plan_speedrun',
    params: params('tier?', 'durationMs?', 'encoding?'),
    summary:
      'Plans a time-budgeted token speedrun and returns the token target with its stage breakdown.',
    note: 'Supply exactly one of tier or durationMs.',
  },
  {
    name: 'list_modes',
    params: params(),
    summary:
      'Enumerates every expansion mode the server accepts, deprecated aliases included, so nothing has to be guessed.',
  },
  {
    name: 'get_skill',
    params: params('name', 'section?'),
    summary: 'Returns a bundled skill document, whole or narrowed to one section.',
  },
];

export const MCP_RESOURCES: readonly McpResource[] = [
  {
    uri: 'skill://<name>/SKILL.md',
    detail: `The skill document itself — one per bundled skill, so ${SKILLS.length} of them.`,
  },
  {
    uri: 'skill://<name>/EXAMPLES.md',
    detail: `The worked examples for the same skill. Also ${SKILLS.length}. The symmetry was not negotiated.`,
  },
  {
    uri: 'benchmark://cl100k_base',
    detail: 'The complete 18-variant ranking under cl100k_base, as data rather than prose.',
  },
  {
    uri: 'benchmark://o200k_base',
    detail: 'The same ranking under o200k_base, which is what makes the comparison possible.',
  },
];

/** One MCP prompt per bundled skill, named after the skill. */
export const MCP_PROMPT_NAMES: readonly string[] = SKILLS.map((skill) => skill.name);

export const MCP_REGISTER_CLI = 'claude mcp add tokenmaxxingman -- npx -y tokenmaxxingman tmm-mcp';

export const MCP_REGISTER_JSON = `{
  "mcpServers": {
    "tokenmaxxingman": {
      "command": "npx",
      "args": ["-y", "tokenmaxxingman", "tmm-mcp"]
    }
  }
}`;
