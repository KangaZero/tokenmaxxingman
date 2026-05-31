# GitHub repository setup

**Repo:** https://github.com/KangaZero/tokenmaxxingman

---

## 1. Adding the `NPM_TOKEN` secret

The release workflow reads `secrets.NPM_TOKEN`. Without it, the publish step
fails with an authentication error.

### Get an npm Automation token

1. Go to: https://www.npmjs.com/settings/YOUR_NPM_USERNAME/tokens
   (replace `YOUR_NPM_USERNAME` with your npm account username)
2. Click **"Generate New Token"** → **"Automation"**.
   - Use **Automation** type, not Publish. Automation tokens bypass 2FA
     prompts in CI and are required for `--provenance` to work correctly.
3. Copy the token immediately — it is shown only once.

### Add the secret to the repository

1. Go to: https://github.com/KangaZero/tokenmaxxingman/settings/secrets/actions
   (Settings → Secrets and variables → Actions)
2. Click **"New repository secret"**.
3. Fill in:
   - **Name:** `NPM_TOKEN`
   - **Secret:** paste the Automation token you copied above
4. Click **"Add secret"**.

The secret is now available to the release workflow as
`${{ secrets.NPM_TOKEN }}`.

---

## 2. Default branch and branch strategy

Currently `feat/initial-build` is the only branch pushed to the remote.
There are two paths forward:

### Path A — Open a PR into main (recommended)

Once a `main` branch exists on the remote:

1. Open the PR: https://github.com/KangaZero/tokenmaxxingman/pull/new/feat/initial-build
2. Have the PR reviewed and merged via the UI.
3. `main` becomes the stable base for all future work.

The git-keeper agent does not commit directly to protected branches, so all
changes must flow through PRs.

### Path B — Promote `feat/initial-build` as the default branch temporarily

1. Go to: https://github.com/KangaZero/tokenmaxxingman/settings/branches
2. Under **"Default branch"**, click the switch icon next to the current
   default.
3. Select `feat/initial-build` from the dropdown and confirm.

This is a temporary measure. Switch the default back to `main` once that
branch exists and is stable.

---

## 3. Branch protection for `main` (recommended)

Once `main` exists, protect it to prevent accidental direct pushes.

1. Go to: https://github.com/KangaZero/tokenmaxxingman/settings/branches
2. Click **"Add branch protection rule"** (or edit the existing rule).
3. Set **Branch name pattern:** `main`
4. Enable the following:
   - **Require a pull request before merging**
     - Require at least 1 approval
   - **Require status checks to pass before merging**
     - Search for and add: `Node 22` and `Node 24`
       (these are the job names from `ci.yml` — the matrix expands to
       `ci / Node 22` and `ci / Node 24`)
   - **Do not allow bypassing the above settings**
   - **Allow force pushes:** leave OFF
   - **Allow deletions:** leave OFF
5. Click **"Save changes"**.

With this in place, every PR must pass the full CI matrix (typecheck + lint +
test on Node 22 and 24) before it can be merged.

---

## 4. Opening the first PR

The branch `feat/initial-build` is already pushed. Open the PR directly at:

https://github.com/KangaZero/tokenmaxxingman/pull/new/feat/initial-build

If `main` does not yet exist on the remote, GitHub will prompt you to create
it during the PR flow, or you can push a `main` branch first:

```bash
git push origin feat/initial-build:main
```

Then open the PR from `feat/initial-build` into `main` as usual.

---

## 5. Triggering the release workflow

After merging to `main` and tagging a release (see `DEPLOY.md` section 4):

1. Go to: https://github.com/KangaZero/tokenmaxxingman/actions/workflows/release.yml
2. Click **"Run workflow"** (top right of the workflow list).
3. Select the branch or ref to publish from.
4. Click the green **"Run workflow"** button.

The workflow runs `pnpm install --frozen-lockfile` → `pnpm run typecheck` →
`pnpm run lint` → `pnpm test` → `pnpm run build` → `pnpm publish`.
Provenance attestation is automatic via `publishConfig.provenance: true`
in `package.json` plus the `id-token: write` permission already set in
`release.yml`. No extra steps needed beyond the `NPM_TOKEN` secret.
