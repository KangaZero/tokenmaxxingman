#!/usr/bin/env bash
# Best-effort skill linker, invoked by the package.json "prepare" lifecycle
# script.
#
# WHY "prepare" (not "postinstall"):
#   - "prepare" runs on a local `pnpm install` inside this repo (what we want:
#     auto-link the bundled skills into ~/.claude/skills for the dev).
#   - It does NOT run when the package is installed as a registry dependency,
#     so a consumer running `npm i tokenmaxxingman` never has their home dir
#     touched. ("postinstall" would fire there — wrong.)
#   - It DOES run during `pnpm pack`/`publish` and in CI, where symlinking into
#     ~/.claude is pointless or wrong. The guards below handle those cases:
#     `npm_command` covers pack/publish, `CI` covers runners.
#
# This hook must never break `pnpm install` or a release: linking failures are
# swallowed and reported, not propagated.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Decide whether to skip auto-linking for the current context.
# Return 0 to skip (no-op), non-zero to proceed with linking.
should_skip() {
  # CI runners get a throwaway ~/.claude; linking skills there is pointless
  # and would run on every `pnpm pack`/publish job.
  if [[ -n "${CI:-}" ]]; then
    echo "prepare: CI detected — skipping skill link"
    return 0
  fi
  # Packing or publishing on a dev box must not mutate ~/.claude/skills. npm and
  # pnpm both export npm_command for the lifecycle they are running.
  case "${npm_command:-}" in
    pack | publish)
      echo "prepare: npm_command=${npm_command} — skipping skill link"
      return 0
      ;;
  esac
  # Explicit opt-out for anyone who does not want their ~/.claude touched.
  if [[ -n "${TMM_SKIP_SKILLS_INSTALL:-}" ]]; then
    echo "prepare: TMM_SKIP_SKILLS_INSTALL set — skipping skill link"
    return 0
  fi
  # No usable home to link into (sandboxed / minimal publish environments).
  if [[ -z "${HOME:-}" || ! -d "${HOME}" ]]; then
    echo "prepare: no usable \$HOME — skipping skill link"
    return 0
  fi
  return 1
}

if should_skip; then
  exit 0
fi

# Idempotent: install-skills.sh skips skills that already exist. The `|| echo`
# keeps a symlink failure from aborting the surrounding install/publish.
"$DIR/install-skills.sh" || echo "prepare: skill link skipped (non-fatal)"
