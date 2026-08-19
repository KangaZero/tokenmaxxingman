/**
 * Server-level instructions, surfaced to the client during `initialize`.
 *
 * WHY this is long: it is the only text a client is guaranteed to read before it
 * decides whether to call a tool. Every rule here exists to stop a model from
 * estimating a number it could have measured.
 */
export const SERVER_INSTRUCTIONS = `tokenmaxxingman — deterministic token-expenditure tooling and a reproducible tokenization benchmark.

WHAT THIS SERVER IS FOR
Every tool here is pure, offline, and deterministic: the same input yields byte-identical output. Tokenizer vocabularies (cl100k_base, o200k_base) and the multi-language benchmark corpus are bundled and version-pinned. Nothing is written to disk, no process is spawned, and no network request is made.

THE ONE RULE THAT MATTERS
Do not estimate what this server can measure.
- Never state a token count from intuition. Call \`count_tokens\`.
- Never quote a tokens-per-character figure or language ranking from memory. Call \`benchmark_languages\`.
- Never hand-write an expansion when a named pipeline exists. Call \`expand_text\` or \`maxx_text\` and report the returned inflation ratio.
- Never invent a sprint budget. Call \`plan_speedrun\`.
A measured number is citable. An estimated one is not — if you must estimate because a tool call is unavailable, say so explicitly.

CHOOSING A TOOL
- \`count_tokens\` — measurement only, no transformation.
- \`expand_text\` — one named pipeline, mild to severe. Start at \`verbose-full\`.
- \`maxx_text\` — every trick at once (padding, footnotes, citations, reduplication, optional translation). Use when the goal is a maximum, not a register.
- \`benchmark_languages\` — which natural language tokenizes worst, ranked, from the bundled corpus.
- \`plan_speedrun\` — arithmetic only; it returns a budget and pacing plan and does not consume the budget.
- \`list_modes\` — enumerate valid \`mode\`, \`targetLanguage\`, and \`tier\` values instead of guessing them.
- \`get_skill\` — read a bundled skill contract verbatim before acting on its behalf.

NEVER EXPAND
Source code, error messages, stack traces, structured data intended for a parser, security warnings, or irreversible-action confirmations. These tools operate on prose. Inflating a diagnostic destroys it.

SKILLS
Each bundled skill is also exposed as an MCP prompt (same name) and as resources at skill://<name>/SKILL.md and skill://<name>/EXAMPLES.md. Load the prompt to enter a mode; read the resource to inspect the contract without entering it.

CAVEAT
This project is satire executed with real engineering. The measurements are genuine. The purpose is not.`;
