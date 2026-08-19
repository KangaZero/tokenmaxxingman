# Deploy instructions

**Target:** npm package (public)
**Artifact:** `tokenmaxxingman@<version>` via `pnpm publish`
**Repo:** https://github.com/KangaZero/tokenmaxxingman
**Workspace:** pnpm (root + `web/`, pinned via `packageManager` field)

---

## 1. Prerequisites

| Tool | Required version | Check |
|------|-----------------|-------|
| Node.js | >= 22 LTS (CI runs 22 + 26.2) | `node --version` |
| pnpm | matches `packageManager` field — auto via corepack | `pnpm --version` |
| Git | any recent | `git --version` |
| npm registry account | publish rights on `tokenmaxxingman` | `pnpm whoami --registry=https://registry.npmjs.org` |

Enable pnpm via corepack (ships with Node):

```bash
corepack enable
corepack prepare pnpm@11.5.0 --activate
```

The `NPM_TOKEN` repository secret must be configured before dispatching the
GitHub Actions release workflow. See `GITHUB_SETUP.md` for exact steps.

---

## 2. Local verification

Run every command from the project root. Each must exit 0 before proceeding.

```bash
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run lint
pnpm test
pnpm run build
```

Or use the single `just` recipe that runs the full CI gate:

```bash
just ci
```

---

## 3. Pre-publish smoke test

After `pnpm run build` succeeds, confirm the CLI entry point is functional.

### `--help`

```bash
node dist/cli.js --help
```

Expected output. Captured verbatim from `commander` v15 at `0.1.0`; re-capture it
rather than editing it by hand, because the wrapping is the library's decision and
not ours:

```
Usage: tokenmaxxingman [options] [command]

Deterministic, composable token maximisation tooling.

Options:
  -V, --version            output the version number
  -h, --help               display help for command

Commands:
  expand [options] [file]  Expand text using a verbosity or translation
                           pipeline.
  benchmark [options]      Run the tokenisation benchmark against the bundled
                           corpus.
  speedrun [options]       Run the token-generation speedrun for a given time
                           budget.
  maxxer [options] [file]  Apply EVERY token-burning trick to input text.
  mcp|tmm-mcp              Run the Model Context Protocol server on stdio.
  help [command]           display help for command
```

### `benchmark --format markdown`

```bash
node dist/cli.js benchmark --format markdown | head -20
```

Expected: a Markdown table headed `# tokenmaxxingman benchmark` with ranked
language rows starting with `iu-cans` (Inuktitut) at rank 1.

### MCP server

The server speaks JSON-RPC over stdio, so it can be smoke-tested with a pipe. Two
frames are required before any request: `initialize`, then the
`notifications/initialized` acknowledgement.

```bash
printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"0.0.0"}}}' \
  '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' \
  | node dist/mcp/bin.js
```

Expected: two JSON-RPC responses on stdout, the second listing seven tools —
`expand_text`, `maxx_text`, `count_tokens`, `benchmark_languages`,
`plan_speedrun`, `list_modes`, `get_skill`. The process exits when stdin closes;
nothing is left running. If the parameter list has changed, the README tool table
needs re-capturing in the same commit.

### `speedrun -t 100ms`

```bash
node dist/cli.js speedrun -t 100ms
```

Expected: a summary block containing `mode`, `encoding`, `time`, `iterations`,
`tokens`, `tokens/sec`, `chars/sec`, and `preview` fields. Example:

```
tokenmaxxingman speedrun
  mode       : verbose-ultra
  encoding   : cl100k_base
  time       : 100.1ms / budget 100ms
  iterations : 527
  tokens     : 505321
  tokens/sec : 5049374.6
  chars/sec  : 20504914.9
  preview    : It is, of course, important to note that it is ...
```

---

## 4. Tagging a release

Create and push an annotated tag. The tag triggers nothing automatically — the
release workflow is manual-dispatch only.

```bash
git tag -a v0.1.0 -m "v0.1.0 — MCP server"
git push origin v0.1.0
```

Annotate the tag with what the release contains. `0.0.1` through `0.0.21` have
already shipped, so no tag cut from here is an initial release, and a message
claiming otherwise survives in the repository indefinitely.

To list existing tags:

```bash
git tag -l
```

**Note:** `release.yml` is `workflow_dispatch` only. Pushing the tag does NOT
auto-publish. You must manually trigger the workflow in the GitHub Actions UI
after pushing the tag (see section 5).

---

## 5. Publishing to npm

### Option A — GitHub Actions (recommended)

1. Ensure the `NPM_TOKEN` secret is set (see `GITHUB_SETUP.md`).
2. Go to: https://github.com/KangaZero/tokenmaxxingman/actions/workflows/release.yml
3. Click **"Run workflow"**.
4. Select the branch or tag you want to publish from.
5. Click the green **"Run workflow"** button.

The workflow runs: `pnpm install --frozen-lockfile` → `pnpm run typecheck` → `pnpm run lint` → `pnpm test` → `pnpm run build` → `pnpm publish`. The only `publishConfig` field currently set in `package.json` is `access: "public"`.

**Provenance is not currently produced.** `release.yml` grants the permission that
provenance requires:

```yaml
permissions:
  contents: read
  id-token: write
```

— but the permission alone attests nothing. Provenance is opt-in per publish: it
needs either `"provenance": true` in `publishConfig` or an explicit
`--provenance` flag on the publish command, and neither is presently in place.
The published tarballs therefore carry no attestation. This is a one-line
decision nobody has made rather than a technical obstacle; see the note at the
end of this document.

### Option B — Manual publish (local machine)

```bash
pnpm login --registry=https://registry.npmjs.org
pnpm publish
```

`access: "public"` is set in `publishConfig`, so no access flag is needed.

Do not pass `--provenance` here. Provenance has nothing to do with your local
Node version: an attestation is signed against an OIDC token issued by a
supported CI provider — GitHub Actions or GitLab CI — and a laptop cannot
produce one, on any Node version. A local `--provenance` publish fails by
design. `justfile` states this correctly and its `publish-live` recipe passes
`--no-provenance` for exactly this reason. If you want an attested release, use
Option A.

---

## 6. Post-publish verification

Allow 30–60 seconds for the registry to propagate, then:

```bash
pnpm view tokenmaxxingman
```

Expected: package metadata including `version: '0.1.0'`, `dist-tags.latest`,
and `dist.tarball` URL.

```bash
npx tokenmaxxingman --version
```

Expected: `0.1.0`

---

## 7. Rollback

npm does not allow unpublishing packages that have been public for more than
72 hours. The correct rollback is deprecation:

```bash
pnpm deprecate tokenmaxxingman@0.1.0 "Critical bug — use 0.1.1 instead"
```

Deprecate the version that is broken and point at the version that is not. Both
sides of that sentence are load-bearing: a deprecation notice naming a version
that never contained the bug is worse than no notice, because it teaches
consumers to ignore the next one.

To undo a deprecation (clear the message):

```bash
pnpm deprecate tokenmaxxingman@0.1.0 ""
```

If the package is within the 72-hour window and unpublishing is truly
necessary:

```bash
npm unpublish tokenmaxxingman@0.1.0
```

**Do not use `npm unpublish tokenmaxxingman` (no version) — that removes the
entire package.**

---

## Workflow changes made during deploy setup

The following file was modified from its original state:

| File | Change | Reason |
|------|--------|--------|
| `.github/workflows/release.yml` | Added top-level `permissions: { contents: read, id-token: write }` | Prerequisite for npm provenance attestation. Without `id-token: write` the OIDC token that `--provenance` signs against is never issued, and a provenance publish fails. The permission is in place; provenance itself is not enabled — see the open decision below. |

`package.json` was also updated (by the project's formatter) to fix:
- `files` array: was `["dist"]` only; now includes `data`, `skills`, `README.md`, `LICENSE`
- `repository.url`: corrected to `KangaZero/tokenmaxxingman`
- Added `publishConfig.access: "public"`

**Open decision — provenance.** `DEPLOY.md`, `GITHUB_SETUP.md`, and `justfile`
have at various points described provenance attestation as configured. It is
not: `publishConfig` contains `access` only. The documentation above now
describes the registry as it actually behaves. Two ways to close this out, and
either is defensible:

1. Add `"provenance": true` to `publishConfig` in `package.json` and publish only
   from `release.yml`, which already grants `id-token: write`. Consumers get a
   verifiable link from tarball to commit. Local publishing then requires
   `--no-provenance`, which `justfile` already does.
2. Leave it off and stop mentioning it. Perfectly reasonable for a package whose
   supply-chain threat model is "somebody might tamper with the joke".

What is not defensible is the third state, which is the one we were in: documented
as attested, shipped unattested.
