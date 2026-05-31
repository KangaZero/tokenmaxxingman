#!/usr/bin/env bash
# Idempotently install the bundled SKILL.md directories into Claude Code's
# user-skills directory by symlink. Symlinks (rather than copies) mean that
# `git pull` on this repo immediately propagates skill updates — no reinstall
# step.
#
# Usage:
#   ./scripts/install-skills.sh                # link into $HOME/.claude/skills
#   CLAUDE_SKILLS_DIR=/custom/path ./scripts/install-skills.sh
#   ./scripts/install-skills.sh --copy         # copy instead of symlink
#   ./scripts/install-skills.sh --force        # overwrite existing skills
#   ./scripts/install-skills.sh --uninstall    # remove installed skills

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILLS_SRC="$REPO_ROOT/skills"
TARGET_DIR="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}"

MODE="symlink"
FORCE=0
UNINSTALL=0

for arg in "$@"; do
  case "$arg" in
    --copy)      MODE="copy" ;;
    --force)     FORCE=1 ;;
    --uninstall) UNINSTALL=1 ;;
    -h|--help)
      sed -n '2,12p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      echo "error: unknown arg '$arg' (try --help)" >&2
      exit 2
      ;;
  esac
done

if [[ ! -d "$SKILLS_SRC" ]]; then
  echo "error: $SKILLS_SRC does not exist — run this script from inside the tokenmaxxingman repo" >&2
  exit 1
fi

mkdir -p "$TARGET_DIR"

for skill_path in "$SKILLS_SRC"/*/; do
  skill_name="$(basename "$skill_path")"
  target="$TARGET_DIR/$skill_name"

  if [[ "$UNINSTALL" == "1" ]]; then
    if [[ -L "$target" ]]; then
      rm "$target"
      echo "removed symlink: $target"
    elif [[ -d "$target" ]]; then
      echo "skipping $skill_name: not a symlink — refusing to delete a directory I might not own (remove manually if intended)"
    else
      echo "skipping $skill_name: nothing to remove at $target"
    fi
    continue
  fi

  if [[ -e "$target" || -L "$target" ]]; then
    if [[ "$FORCE" != "1" ]]; then
      echo "skipping $skill_name: $target already exists (pass --force to replace)"
      continue
    fi
    rm -rf "$target"
  fi

  if [[ "$MODE" == "copy" ]]; then
    cp -R "$skill_path" "$target"
    echo "copied $skill_name → $target"
  else
    ln -s "$skill_path" "$target"
    echo "linked $skill_name → $target"
  fi
done

if [[ "$UNINSTALL" != "1" ]]; then
  echo
  echo "done. installed skills are at: $TARGET_DIR"
  echo "restart Claude Code (or run /restart) for the skills to load."
fi
