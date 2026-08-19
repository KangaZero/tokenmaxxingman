# Security Policy

## Reporting a Vulnerability

Email **samuelyongw@gmail.com** with:

1. A description of the vulnerability.
2. Step-by-step reproduction instructions (input, exact command, observed behavior).
3. Assessed impact (data exposure, denial of service, etc.).

Do NOT open a public GitHub issue for security reports. Public disclosure before a fix is coordinated will be treated as a violation of responsible disclosure norms.

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | Yes       |
| < 0.1   | n/a       |

## Scope

tokenmaxxingman processes user-supplied text through deterministic, in-process transforms. Realistic attack surfaces:

**Regex denial-of-service (ReDoS)**
The `passive.ts` and `nominalizations.ts` transforms use regex patterns to match sentence structures. A carefully crafted input with deeply nested or highly repetitive patterns may cause catastrophic backtracking, blocking the Node.js event loop. Inputs with thousands of repeated words followed by a partial match are the most likely trigger.

**Prototype pollution via corpus JSON parsing**
`data/corpus.json` is loaded with `JSON.parse`. If the corpus file is replaced or tampered with (e.g. by a supply-chain attack), a payload containing a `__proto__` or `constructor` key would pollute `Object.prototype` for the entire process. This is a risk for any downstream application that imports tokenmaxxingman as a library and trusts the corpus path.

**Unbounded loop in speedrun**
`src/speedrun.ts` iterates until a time budget is exhausted. If `--max-iterations` is set to a very large value and the time budget is also large, the process will consume CPU and memory for the full duration without yielding. The default cap of 10,000 iterations mitigates this, but a caller that explicitly passes `maxIterations: Infinity` creates an uninterruptible loop.

## Out of Scope

Anything that involves social-engineering the joke itself is not a security vulnerability. For example: "your skill makes me write verbose code" is the intended behavior, not a bug. Prompt-injection attacks that merely change verbosity level are not in scope.

## Response Time

- Acknowledgement within **7 days** of receipt.
- Fix or coordinated public disclosure within **90 days**.
