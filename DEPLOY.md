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

Expected output (exact text may vary by version):

```
Usage: tokenmaxxingman [options] [command]

Deterministic, composable token maximisation tooling.

Options:
  -V, --version            output the version number
  -h, --help               display help for command

Commands:
  expand [options] [file]  Expand text using a verbosity or translation pipeline.
  benchmark [options]      Run the tokenisation benchmark against the bundled corpus.
  speedrun [options]       Run the token-generation speedrun for a given time budget.
  help [command]           display help for command
```

### `benchmark --format markdown`

```bash
node dist/cli.js benchmark --format markdown | head -20
```

Expected: a Markdown table headed `# tokenmaxxingman benchmark` with ranked
language rows starting with `iu-cans` (Inuktitut) at rank 1.

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
git tag -a v0.1.0 -m "Initial release"
git push origin v0.1.0
```

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

The workflow runs: `pnpm install --frozen-lockfile` → `pnpm run typecheck` → `pnpm run lint` → `pnpm test` → `pnpm run build` → `pnpm publish` (with `publishConfig.provenance: true` and `publishConfig.access: public` set in `package.json`).

Provenance attestation is automatic because `release.yml` sets:

```yaml
permissions:
  contents: read
  id-token: write
```

### Option B — Manual publish (local machine)

Requires Node >= 24 for `--provenance` to work locally.

```bash
pnpm login --registry=https://registry.npmjs.org
pnpm publish --provenance
```

`access: public` and `provenance: true` are set in `publishConfig` in
`package.json`, so no flag is needed. If your Node version does not support
provenance, omit it:

```bash
pnpm publish --no-provenance
```

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
pnpm deprecate tokenmaxxingman@0.0.1 "Critical bug — use 0.1.1 instead"
```

To undo a deprecation (clear the message):

```bash
pnpm deprecate tokenmaxxingman@0.0.1 ""
```

If the package is within the 72-hour window and unpublishing is truly
necessary:

```bash
npm unpublish tokenmaxxingman@0.0.1
```

**Do not use `npm unpublish tokenmaxxingman` (no version) — that removes the
entire package.**

---

## Workflow changes made during deploy setup

The following file was modified from its original state:

| File | Change | Reason |
|------|--------|--------|
| `.github/workflows/release.yml` | Added top-level `permissions: { contents: read, id-token: write }` | Required for npm provenance attestation. Without `id-token: write`, the OIDC token needed by `--provenance` is not issued and the publish step fails. |

`package.json` was also updated (by the project's formatter) to fix:
- `files` array: was `["dist"]` only; now includes `data`, `skills`, `README.md`, `LICENSE`
- `repository.url`: corrected to `KangaZero/tokenmaxxingman`
- Added `publishConfig.access: "public"` and `publishConfig.provenance: true`
