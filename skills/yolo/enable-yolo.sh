#!/usr/bin/env bash
#
# enable-yolo.sh — opt-in auto-accept ("YOLO") setup for agent CLIs.
#
# Disables confirmation/permission prompts so an agent runs unattended.
# Detects (a) the CLI you are CURRENTLY running inside via env vars, and
# (b) every supported agent CLI installed on PATH. Prompts before touching
# anything. Defaults to NO. Refuses to run non-interactively (no tty).
#
# Usage:
#   bash enable-yolo.sh            # interactive, prompts per CLI
#   bash enable-yolo.sh --current  # only offer the CLI you're running in
#   bash enable-yolo.sh --status   # report state, change nothing
#
set -euo pipefail

readonly CLAUDE_SETTINGS="${HOME}/.claude/settings.json"

# ---- detection ------------------------------------------------------------

# Best-effort: which agent CLI is this script running INSIDE right now?
detect_current_cli() {
  if [[ -n "${CLAUDECODE:-}" || -n "${CLAUDE_CODE_ENTRYPOINT:-}" ]]; then
    echo claude
  elif [[ -n "${GEMINI_CLI:-}" || -n "${GEMINI_API_KEY:-}" && "${TERM_PROGRAM:-}" == gemini* ]]; then
    echo gemini
  elif [[ -n "${CODEX_SANDBOX:-}" || -n "${CODEX_HOME:-}" ]]; then
    echo codex
  elif [[ -n "${AIDER_MODEL:-}" || "${0##*/}" == aider* ]]; then
    echo aider
  else
    echo ""
  fi
}

# Every supported agent CLI found on PATH.
detect_installed_clis() {
  local cli
  for cli in claude gemini codex aider; do
    command -v "$cli" >/dev/null 2>&1 && echo "$cli"
  done
}

# ---- prompting ------------------------------------------------------------

confirm() {
  local reply
  if [[ ! -t 0 ]]; then
    echo "Refusing: no interactive terminal (consent required for YOLO)." >&2
    return 1
  fi
  read -r -p "$1 [y/N] " reply
  [[ "${reply,,}" == y || "${reply,,}" == yes ]]
}

# ---- enablers (one per CLI; each idempotent + backs up before mutating) ---

enable_claude() {
  if ! command -v jq >/dev/null 2>&1; then
    echo "  ! jq not found — install jq to safely patch settings.json. Skipping Claude." >&2
    return 1
  fi
  mkdir -p "$(dirname "$CLAUDE_SETTINGS")"
  [[ -f "$CLAUDE_SETTINGS" ]] || echo '{}' >"$CLAUDE_SETTINGS"
  cp "$CLAUDE_SETTINGS" "${CLAUDE_SETTINGS}.bak.$(date +%s)"
  local tmp
  tmp="$(mktemp)"
  jq '.permissions.defaultMode = "bypassPermissions"' "$CLAUDE_SETTINGS" >"$tmp"
  mv "$tmp" "$CLAUDE_SETTINGS"
  echo "  ✓ Claude Code → permissions.defaultMode = \"bypassPermissions\" ($CLAUDE_SETTINGS)"
}

# Flag-based CLIs have no persistent "yolo" config key — bake the flag into a
# shell alias so every future invocation is auto-accept.
write_alias() {
  local name="$1" cmd="$2" rc="${HOME}/.bashrc"
  [[ -n "${ZSH_VERSION:-}" ]] && rc="${HOME}/.zshrc"
  if grep -qF "alias ${name}=" "$rc" 2>/dev/null; then
    echo "  · ${name} alias already present in $rc — left untouched"
    return 0
  fi
  printf '\nalias %s=%q\n' "$name" "$cmd" >>"$rc"
  echo "  ✓ ${name} → alias added to $rc  (\`${cmd}\`)"
}

enable_gemini() { write_alias gemini "gemini --yolo"; }
enable_codex()  { write_alias codex "codex --dangerously-bypass-approvals-and-sandbox"; }
enable_aider()  { write_alias aider "aider --yes-always"; }

# ---- status ---------------------------------------------------------------

print_status() {
  echo "Current agent CLI : $(detect_current_cli || true)"
  echo "Installed on PATH : $(detect_installed_clis | paste -sd' ' -)"
  if command -v jq >/dev/null 2>&1 && [[ -f "$CLAUDE_SETTINGS" ]]; then
    echo "Claude defaultMode: $(jq -r '.permissions.defaultMode // "default"' "$CLAUDE_SETTINGS")"
  fi
}

# ---- main -----------------------------------------------------------------

main() {
  local mode="${1:-}"

  if [[ "$mode" == "--status" ]]; then
    print_status
    exit 0
  fi

  echo "=============================================================="
  echo " Agent CLI auto-accept (YOLO) setup"
  echo " WARNING: disables confirmation prompts. Destructive commands"
  echo " (rm -rf, force-push, etc.) will run WITHOUT asking. Use only"
  echo " on a personal/throwaway dev box, never shared or prod-adjacent."
  echo "=============================================================="

  local current targets
  current="$(detect_current_cli || true)"
  [[ -n "$current" ]] && echo "Detected you are running inside: ${current}"

  if [[ "$mode" == "--current" ]]; then
    [[ -z "$current" ]] && { echo "Could not detect current CLI. Re-run without --current."; exit 1; }
    targets="$current"
  else
    targets="$(detect_installed_clis)"
  fi

  [[ -z "$targets" ]] && { echo "No supported agent CLI detected. Nothing to do."; exit 0; }

  confirm "Proceed with YOLO setup?" || { echo "Aborted. No changes made."; exit 0; }

  local cli
  while IFS= read -r cli; do
    [[ -z "$cli" ]] && continue
    if confirm "  Enable auto-accept for '${cli}'?"; then
      "enable_${cli}" || true
    else
      echo "  · skipped ${cli}"
    fi
  done <<<"$targets"

  echo
  echo "Done. Shell aliases need a new shell or: source ~/.bashrc (or ~/.zshrc)."
}

main "$@"
