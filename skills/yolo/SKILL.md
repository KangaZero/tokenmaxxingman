---
name: yolo
version: "0.0.1"
description: >
  Opt-in auto-accept ("YOLO") setup for agent CLIs. On invocation it detects
  the agent CLI you are CURRENTLY running inside (via env vars) plus every
  supported agent CLI installed on PATH (Claude Code, Gemini CLI, Codex,
  Aider), then ASKS before disabling that tool's confirmation/permission
  prompts. Defaults to no. Refuses to run without an interactive terminal.
  Fires ONLY on explicit invocation — never auto-enables, never persists.
trigger:
  - "/yolo"
  - "yolo mode"
  - "enable yolo"
  - "auto accept all edits"
  - "skip permission prompts"
  - "bypass permissions"
---

## What This Is

A consent-gated installer that flips an agent CLI into auto-accept mode, so
edits and command confirmations are approved automatically. It does the
detection and config-writing; the human supplies the yes/no.

The script lives beside this file: `enable-yolo.sh`.

## What "Auto-Accept" Maps To Per CLI

| CLI | Mechanism the script applies |
|-----|------------------------------|
| **Claude Code** | `~/.claude/settings.json` → `permissions.defaultMode = "bypassPermissions"` (persistent, jq-patched, backed up first) |
| **Gemini CLI** | shell alias `gemini='gemini --yolo'` |
| **Codex** | shell alias `codex='codex --dangerously-bypass-approvals-and-sandbox'` |
| **Aider** | shell alias `aider='aider --yes-always'` |

Flag-based CLIs (Gemini/Codex/Aider) have no persistent "yolo" config key, so
the flag is baked into a shell alias in `~/.bashrc` (or `~/.zshrc` under zsh).

## How To Fire (the required flow)

On invocation, DO NOT silently run anything. Follow this exactly:

1. **Run detection, read-only:**
   `bash skills/yolo/enable-yolo.sh --status`
   Report which CLI the user is running inside and which are installed.

2. **Ask the user**, plainly, naming the security trade-off:
   > "This disables confirmation prompts — the agent will run destructive
   > commands (`rm -rf`, force-push) without asking. Enable YOLO for
   > `<detected CLI>`? Only on this CLI, or all detected ones?"

3. **Only after an explicit yes**, run the installer interactively so its
   own `read` prompts reach the user's terminal:
   - current CLI only → `bash skills/yolo/enable-yolo.sh --current`
   - all detected      → `bash skills/yolo/enable-yolo.sh`

4. Tell the user aliases need a new shell or `source ~/.bashrc` (`~/.zshrc`).

## Hard Rules

- **Never** enable without an explicit yes in the same turn. No remembered
  consent, no defaults-to-yes.
- **Never** run the installer from a non-interactive hook/automation — the
  script's `-t 0` guard refuses this on purpose, and so do you.
- The script **defaults to NO** and **backs up** `settings.json` before
  editing. Do not bypass those by hand-editing config yourself.
- This skill does NOT persist across turns. Re-invoke to run again.

## Reverting

- Claude Code: set `permissions.defaultMode` back to `"default"` in
  `~/.claude/settings.json` (a timestamped `.bak.*` backup sits beside it).
- Alias CLIs: delete the `alias …` line from `~/.bashrc` / `~/.zshrc`.

## Caveat

Auto-accept removes the last guardrail between an agent and your filesystem,
credentials, and remotes. It is a convenience for personal throwaway/dev
boxes. Never enable on shared machines, anything with prod credentials in the
environment, or CI.
