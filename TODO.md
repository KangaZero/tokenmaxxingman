# TODO

Outstanding items as of 2026-07-23. Grouped by priority. Checkboxes are for
future-you; nothing here blocks what has already shipped.

---

## P1 — worth doing soon

- [ ] **Verify the npm package is actually published.** The README (path B) and
      the site install card now advertise `npm/pnpm/bun install -g` and
      `npx/pnpm dlx/bunx tokenmaxxingman`. All of these fail identically until
      the package is live on the registry. Check:
      `npm view tokenmaxxingman version` — if it errors or lags behind
      `package.json` (`0.0.21`), cut a release via the `justfile`
      (`just publish-dry` then `just publish-npm`, or the CI `release.yml`
      workflow). Publishing needs an OTP / automation token — non-interactive
      terminal can't do it, so this is a run-it-yourself step.

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
