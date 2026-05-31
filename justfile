# tokenmaxxingman — task runner
#
# Install `just` once (https://github.com/casey/just):
#   macOS:    brew install just
#   Linux:    cargo install just  (or your package manager)
#
# Then from the repo root:
#   just              # show this list
#   just <recipe>     # run a recipe
#
# Recipes are grouped: SETUP / DEV / TEST / WEB / RELEASE / SKILLS.

set shell := ["bash", "-eu", "-c"]
set dotenv-load := false

# Default recipe — show available commands.
default:
    @just --list --unsorted

# ───── SETUP ────────────────────────────────────────────────────────────────

# Install all project + web dependencies.
install: install-cli install-web
    @echo "✓ all dependencies installed"

# Install CLI dependencies only.
install-cli:
    npm install

# Install web dependencies only.
install-web:
    cd web && npm install

# ───── DEV / BUILD ──────────────────────────────────────────────────────────

# Compile TypeScript → dist/.
build:
    npm run build

# Type-check without emitting.
typecheck:
    npm run typecheck

# Lint with ESLint.
lint:
    npm run lint

# Auto-format with Prettier.
format:
    npm run format

# Full pre-commit gate: typecheck + lint + tests + build.
check: typecheck lint test build
    @echo "✓ all checks passed"

# Alias for `check` — what CI does on every PR.
ci: check web-build
    @echo "✓ CI gates green (CLI + web)"

# ───── TEST ─────────────────────────────────────────────────────────────────

# Run the full vitest suite.
test:
    npm test

# Run tests with coverage report.
test-coverage:
    npm run test:coverage

# Run a single test file (pass path as arg: `just test-one tests/expand.test.ts`).
test-one path:
    npx vitest run {{path}}

# ───── CLI SHORTCUTS ────────────────────────────────────────────────────────

# Run the benchmark (markdown output).
benchmark *args:
    node dist/cli.js benchmark {{args}}

# Run the benchmark under both encodings side by side.
benchmark-all:
    @echo "=== cl100k_base ==="
    @node dist/cli.js benchmark --encoding cl100k_base
    @echo
    @echo "=== o200k_base ==="
    @node dist/cli.js benchmark --encoding o200k_base

# Expand text from stdin or a file.
expand *args:
    node dist/cli.js expand {{args}}

# Apply every trick to input via the maxxer pipeline.
maxxer *args:
    node dist/cli.js maxxer {{args}}

# Run the time-budgeted token speedrun.
speedrun *args:
    node dist/cli.js speedrun {{args}}

# ───── WEB / SITE ───────────────────────────────────────────────────────────

# Run the website dev server (http://localhost:5173/tokenmaxxingman/).
web-dev:
    cd web && npm run dev

# Build the website for production (output: web/dist/).
web-build: build
    cd web && npm run build

# Preview the production build locally.
web-preview: web-build
    cd web && npm run preview

# ───── SKILLS ───────────────────────────────────────────────────────────────

# Symlink all skills into ~/.claude/skills/ (idempotent).
install-skills:
    ./scripts/install-skills.sh

# Copy skills instead of symlinking.
install-skills-copy:
    ./scripts/install-skills.sh --copy

# Remove installed skill symlinks.
uninstall-skills:
    ./scripts/install-skills.sh --uninstall

# ───── RELEASE ──────────────────────────────────────────────────────────────

# Tag a new release (usage: `just tag 0.0.2`).
tag version:
    git tag -a v{{version}} -m "v{{version}}"
    @echo "tag v{{version}} created locally. push with: just push-tag {{version}}"

# Push a release tag to origin.
push-tag version:
    git push origin v{{version}}

# Open the GitHub Release-creation page for a tag.
release-page version:
    @open "https://github.com/KangaZero/tokenmaxxingman/releases/new?tag=v{{version}}" || \
     xdg-open "https://github.com/KangaZero/tokenmaxxingman/releases/new?tag=v{{version}}"

# Trigger the npm publish workflow on GitHub (requires gh CLI + auth).
publish-npm:
    gh workflow run release.yml --repo KangaZero/tokenmaxxingman
    @echo "watching workflow run — Ctrl-C to detach"
    gh run watch --repo KangaZero/tokenmaxxingman

# Show the deployed site URL.
site-url:
    @echo "https://kangazero.github.io/tokenmaxxingman/"

# Manually re-deploy the site (push to main is the normal trigger).
deploy-site:
    gh workflow run deploy-pages.yml --repo KangaZero/tokenmaxxingman
    gh run watch --repo KangaZero/tokenmaxxingman
