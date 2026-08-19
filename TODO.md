# TODO

Outstanding items as of 2026-08-19. Grouped by priority. Checkboxes are for
future-you; nothing here blocks what has already shipped.

---

## P1 — worth doing soon

- [ ] **Ship `0.1.0`.** `package.json` reads `0.1.0`, `CHANGELOG.md` has a dated
      `0.1.0` section, and the registry does not: `latest` is still `0.0.21` and
      there is no `v0.1.0` tag. The release is written down and not released.
      Tag it, publish it (`DEPLOY.md` sections 4–5), then re-run
      `npm view tokenmaxxingman@latest version` and confirm it says `0.1.0`.

- [ ] **Decide the provenance question and stop rediscovering it.**
      `publishConfig` in `package.json` contains `access` only. Three documents
      have at various points claimed `provenance: true` was set. Either add it —
      `release.yml` already grants `id-token: write`, so CI publishing would work
      unchanged, and `justfile`'s `publish-live` already passes `--no-provenance`
      for local publishes — or leave it off deliberately. The documentation now
      describes reality either way; what it should not describe is a fourth
      position. See the open decision at the end of `DEPLOY.md`.

- [ ] **Correct the two remaining tokens-per-character labels in `src/`.**
      `src/benchmark.ts` sorts on `tokensPerWord` first and uses
      `tokensPerCharacter` only as a tiebreak, but the comment block in
      `src/expand.ts` (the `MAXLANG_LANG` rationale) and the `benchmark_languages`
      tool description in `src/mcp/schemas.ts` both still tell the reader the
      ranking is by tokens-per-character. The MCP one is user-visible: it is
      served to every client that calls `tools/list`. The numbers are right; only
      the metric names are wrong. `CLAUDE.md` records `tok/word` as settled.

- [ ] **Verify the branch-protection status checks on GitHub.** The required
      checks must read `ci / Node 22` and `ci / Node 26.2`, matching the matrix in
      `.github/workflows/ci.yml`. A required check that no job reports never
      fails — it stays pending, and blocks every pull request indefinitely.
      `GITHUB_SETUP.md` section 2 has the detail.

- [ ] **Commit a snapshot regression test for `expand()`.** Outstanding since the
      initial build (`BUILD-SUMMARY.md`). The transforms are pure and
      deterministic, so a committed snapshot is the cheapest possible guard
      against an unintended change in transform output, and there is currently no
      such guard: nothing under `tests/` calls `toMatchSnapshot`.

- [x] **Verify the npm package is actually published.** ✅ Done 2026-07-23.
      `latest` dist-tag = `0.0.21`, matching `package.json`; published versions
      are `0.0.2` and `0.0.21`; the `0.0.21` tarball resolves. All documented
      install paths (`npm/pnpm/bun install -g`, `npx/pnpm dlx/bunx`) work today.
      Re-run `npm view tokenmaxxingman@latest version` after the next version
      bump to confirm the release landed. As of 2026-08-19 that bump has happened
      locally and not on the registry — see the `0.1.0` item above.

- [ ] **Functionally verify the `prepare` skill-link hook.** `pnpm install`
      now runs `scripts/prepare-skills.sh` → `install-skills.sh`. Confirm the
      symlinks actually appear: run `pnpm install` from a clean state and check
      `ls -l ~/.claude/skills/ | grep tokenmaxxingman`. Also confirm the CI /
      opt-out guards no-op as intended (`CI=1 pnpm install`,
      `TMM_SKIP_SKILLS_INSTALL=1 pnpm install`).

- [ ] **Actually enter the Nix dev shell once** (`nix develop`). The flake's
      git hooks (nix hygiene + the `check-author` pre-push guard) only install
      via the `shellHook` — they are inert until someone runs `nix develop` on
      the repo. Confirm the shell builds and the banner prints.

## P2 — polish (nits from the QA review pass)

- [ ] **Exercise the MCP server from a real client, not a pipe.** The server has
      unit and stdio tests and has been smoke-tested by hand
      (`initialize` → `tools/list` → seven tools, as documented in `DEPLOY.md`).
      What has not been confirmed is the thing the feature exists for: register it
      in Claude Code (`claude mcp add tokenmaxxingman -- npx -y tokenmaxxingman
      tmm-mcp`), invoke a skill that should now be measuring rather than
      estimating, and check that it actually calls the tool. Note that the
      repository's own `.mcp.json` points at `node dist/mcp/bin.js`, so `pnpm
      build` must have run first.

- [ ] **`/auto` off-switch phrase collision.** `"normal mode"` is a shared
      deactivation phrase across `auto`, `tokenmaxxingman`, and `yolo`
      (`skills/auto/SKILL.md`). Defensible (only one mode is active at a time)
      but undocumented. Either add a one-line note that it's intentional or
      give `/auto` a mode-specific off phrase.

- [ ] **`/auto` trigger vs description drift.** The `trigger:` block lists both
      `"reverse mode"` and `"reverse roles"`, but the folded `description`
      prose only mentions `"reverse mode"`. Sibling skills keep these in sync —
      reconcile (`skills/auto/SKILL.md` frontmatter).

- [ ] **Consider a shellcheck pass on `scripts/prepare-skills.sh`.** The review
      verified it by hand (quoted expansions, `${VAR:-}` guards, `set -euo
      pipefail` + `|| echo` non-fatal path) but `shellcheck` was not installed
      in the review environment, so it's a manual verdict, not tool-verified.

## P3 — optional / nice-to-have

- [ ] **Add a Nix check to CI.** `.github/workflows/ci.yml` is Node-only; it
      does not exercise the new flake. A `nix flake check` job (or
      `nix develop --command pnpm test`) would keep the flake honest on every
      push. Weigh CI minutes vs. value.

- [ ] **Trim the copied `nix-systems` wart everywhere.** Done in this repo's
      `flake.nix`; the same dead `systems.inputs.nixpkgs.follows` line still
      exists upstream in `~/Documents/KangaFlow/flake.nix` if you want it
      consistent there too.

---

## Other repos (parked, not in this repo)

- [ ] **odysseus-nix — cut `v0.7.0` re-pin.** Upstream `dev` drifted 29 commits
      (`28d27ee` → `791bed7`); verified **zero flake changes needed**
      (Dockerfile only bumped the Docker-CLI tarball version; apt list +
      requirements + pyproject byte-identical). Byte-identical-apparatus re-pin,
      cut from current `main`. See the `/slave-on` savepoint for the full
      procedure.
- [ ] **odysseus-nix — org-URL bump.** Upstream transferred
      `pewdiepie-archdaemon/odysseus` → `odysseus-dev/odysseus`. The old URL
      still redirects today, but the launcher's default `ODYSSEUS_REPO_URL`
      should be repointed before the redirect lapses.
- [ ] **odysseus-nix — README release-examples are stale** (cite `v0.3.1`, omit
      `v0.4.0`–`v0.6.0`).
